import { geoGraticule, geoMercator, geoPath, type GeoProjection } from 'd3-geo';
import { select, type Selection } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { line, curveCatmullRom, curveCatmullRomClosed } from 'd3-shape';
import 'd3-transition';
import { easeCubicInOut } from 'd3-ease';
import type { LineString, MultiLineString } from 'geojson';
import type { Base, Relief, ZoneFeature } from './geo';
import { PLACES } from './data/places';
import { SITES } from './data/sites';
import type { Arrow, BattleArea, LonLat, Place, Site, SiteKind } from './types';

const NS = 'http://www.w3.org/2000/svg';
type G = Selection<SVGGElement, unknown, null, undefined>;

export const COLORS = { iran: '#1d7a52', iraq: '#b3262c', other: '#6a4c9c', contested: '#7d7a74' };
const HATCH = { iraqHeld: 'hatch-iraq', iranHeld: 'hatch-iran', contested: 'hatch-gray' } as const;

// Labels for rivers are placed on the river line itself (midpoint of its longest part).
const RIVERS_LABELLED: Record<string, string> = {
  'Karun River': 'Karun · کارون', 'Karkheh River': 'Karkheh · کرخه', 'Tigris River': 'Tigris · دجله', Euphrates: 'Euphrates · فرات',
  'Shatt al-Arab': 'Shatt al-Arab · اروندرود', Dez: 'Dez · دز', 'Diyala River': 'Diyala · سیروان', 'Little Zab River': 'Little Zab',
  'Great Zab River': 'Great Zab', 'Bahmanshir River': 'Bahmanshir · بهمنشیر',
};
const MAJOR_RIVERS = /Tigris|Euphrates|Shatt|Karun|Karkheh/;

/** Site symbols, drawn around (0,0) at a fixed screen size. Military formations use a NATO-style frame. */
export const SITE_GLYPH: Record<SiteKind, string> = {
  airbase: '<circle r="7.5" class="frame"/><text class="ico" y="0.5">✈</text>',
  oil: '<path class="solid" d="M0,-7.5C3.5,-3 5.5,0 5.5,2.5A5.5,5.5 0 1 1 -5.5,2.5C-5.5,0 -3.5,-3 0,-7.5Z"/>',
  port: '<circle r="7.5" class="frame"/><text class="ico" y="0.5">⚓</text>',
  nuclear: '<circle r="7.5" class="frame"/><text class="ico" y="0.5">☢</text>',
  dam: '<path class="dam" d="M-7,-3.5H7L5,4.5H-5Z"/><path class="wave" d="M-8,-6q2,-2 4,0t4,0t4,0t4,0"/>',
  pass: '<path class="pass" d="M-6,-7Q-1,0 -6,7M6,-7Q1,0 6,7"/>',
  garrison: '<rect class="frame" x="-9" y="-6" width="18" height="12"/><path class="mark" d="M-9,-6L9,6M9,-6L-9,6"/>',
  command: '<path class="mark" d="M-9,6V15"/><rect class="frame" x="-9" y="-6" width="18" height="12"/><path class="mark" d="M-5,0H5"/>',
};
const SITE_KIND_NAME: Record<SiteKind, string> = {
  airbase: 'Air base', oil: 'Oil installation', port: 'Port', nuclear: 'Nuclear site', dam: 'Dam', pass: 'Mountain pass',
  garrison: 'Division base', command: 'Corps / command sector',
};
export { SITE_KIND_NAME };
// corps names are set in spaced italic capitals, wider than the plain labels
const siteLabelW = (s: Site) => s.name.length * (s.kind === 'command' ? 8.6 : 6.1) + 6;

export interface ArrowState {
  arrow: Arrow;
  t: number; // 0..1 drawn
}

export class WarMap {
  readonly svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private projection!: GeoProjection;
  private width = 0;
  private height = 0;
  private transform: ZoomTransform = zoomIdentity;
  private zoomer: ZoomBehavior<SVGSVGElement, unknown>;
  private layers: { base: G; controlClip: G; control: G; top: G; overlay: G; arrows: G; places: G; sites: G; labels: G; ui: G };
  private controlFeatures: ZoneFeature[] = [];
  private historic?: '1937';
  private minK = 1;
  private highlighted = new Set<string>();
  private highlightedSites = new Set<string>();
  private date = '';
  private showSites = true;
  arrows: ArrowState[] = [];
  private areas: BattleArea[] = [];
  /** screen boxes of the site symbols and labels just placed; arrow labels steer around them */
  private siteBoxes: [number, number, number, number][] = [];
  /** camera moves under way (a fly-to, a wheel zoom, a drag): tiles wait for it to stop, labels only drop out, never pop in */
  private moving = 0;
  private get flying() {
    return this.moving > 0;
  }
  private lastShown = new Set<string>();
  private compareX: number | null = null;
  private riverAnchors: { text: string; a: LonLat; b: LonLat }[] = [];
  onZoneClick?: (z: ZoneFeature, x: number, y: number) => void;
  onSiteClick?: (s: Site, x: number, y: number) => void;
  /** visible area as [west, south, east, north], after every zoom/pan */
  onView?: (bounds: [number, number, number, number]) => void;

  constructor(
    private host: HTMLElement,
    private geo: Base,
    private relief: Relief,
  ) {
    this.svg = select(host).append('svg').attr('class', 'map-svg') as never;
    this.defs();
    const root = this.svg.append('g');
    this.layers = {
      base: root.append('g').attr('class', 'base'),
      controlClip: root.append('g').attr('clip-path', 'url(#swipe)'),
      control: undefined as never,
      top: root.append('g').attr('class', 'top'),
      overlay: root.append('g').attr('class', 'overlay'),
      arrows: undefined as never,
      places: undefined as never,
      sites: undefined as never,
      labels: undefined as never,
      ui: undefined as never,
    };
    this.layers.control = this.layers.controlClip.append('g').attr('class', 'control');
    this.layers.labels = this.layers.overlay.append('g').attr('class', 'labels');
    this.layers.sites = this.layers.overlay.append('g').attr('class', 'sites');
    this.layers.places = this.layers.overlay.append('g').attr('class', 'places');
    this.layers.arrows = this.layers.overlay.append('g').attr('class', 'arrows');
    this.layers.ui = this.layers.overlay.append('g').attr('class', 'ui');

    this.zoomer = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .on('start', () => {
        this.moving++;
      })
      .on('zoom', (e) => {
        this.transform = e.transform;
        this.applyTransform();
      })
      .on('end', () => {
        // settle tiles and labels once where the camera came to rest
        this.moving = Math.max(0, this.moving - 1);
        if (!this.moving) this.applyTransform();
      });
    this.svg.call(this.zoomer).on('dblclick.zoom', null);

    this.prepareRiverLabels();
    new ResizeObserver(() => this.resize()).observe(host);
    this.resize();
  }

  // ── setup ──────────────────────────────────────────────────────────────────────
  private defs() {
    const d = this.svg.append('defs');
    const hatch = (id: string, color: string, angle: number, gap = 7, w = 2.2, bg = 0.16) => {
      const p = d.append('pattern').attr('id', id).attr('patternUnits', 'userSpaceOnUse').attr('width', gap).attr('height', gap).attr('patternTransform', `rotate(${angle})`).attr('data-gap', gap).attr('data-angle', angle);
      p.append('rect').attr('width', gap).attr('height', gap).attr('fill', color).attr('opacity', bg);
      p.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', gap).attr('stroke', color).attr('stroke-width', w).attr('opacity', 0.75);
    };
    hatch(HATCH.iraqHeld, COLORS.iraq, 45);
    hatch(HATCH.iranHeld, COLORS.iran, -45);
    const g = d.append('pattern').attr('id', HATCH.contested).attr('patternUnits', 'userSpaceOnUse').attr('width', 6).attr('height', 6).attr('data-gap', 6).attr('data-angle', 0);
    g.append('rect').attr('width', 6).attr('height', 6).attr('fill', COLORS.contested).attr('opacity', 0.34);
    g.append('circle').attr('cx', 3).attr('cy', 3).attr('r', 1).attr('fill', '#4b4842').attr('opacity', 0.55);

    // reeds for marshes
    const m = d.append('pattern').attr('id', 'marsh').attr('patternUnits', 'userSpaceOnUse').attr('width', 14).attr('height', 9).attr('data-gap', 14).attr('data-angle', 0).attr('data-grow', '');
    m.append('rect').attr('width', 14).attr('height', 9).attr('fill', '#9fbfb0').attr('opacity', 0.55);
    m.append('path').attr('d', 'M2 7h5M4.5 7V3.5M3 7l-1-2.5M6 7l1-2.5').attr('stroke', '#3f6f62').attr('stroke-width', 0.8).attr('fill', 'none');

    // engraved sea
    const s = d.append('pattern').attr('id', 'sea').attr('patternUnits', 'userSpaceOnUse').attr('width', 40).attr('height', 6).attr('data-gap', 40).attr('data-angle', 0);
    s.append('rect').attr('width', 40).attr('height', 6).attr('fill', '#c3d3d1');
    s.append('path').attr('d', 'M0 3q5 -2 10 0t10 0t10 0t10 0').attr('stroke', '#a9bfbd').attr('stroke-width', 0.7).attr('fill', 'none');

    d.append('clipPath').attr('id', 'swipe').attr('clipPathUnits', 'userSpaceOnUse').append('rect').attr('id', 'swipe-rect');

    const glow = d.append('filter').attr('id', 'paper').attr('x', 0).attr('y', 0).attr('width', 1).attr('height', 1);
    glow.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', 0.9).attr('numOctaves', 2).attr('result', 'n');
    glow.append('feColorMatrix').attr('type', 'matrix').attr('values', '0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0.09 0');
  }

  private resize() {
    const r = this.host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const first = !this.width;
    this.width = r.width;
    this.height = r.height;
    this.svg.attr('viewBox', `0 0 ${r.width} ${r.height}`);
    const [w, s, e, n] = this.geo.bbox;
    // fit to the corner points: a polygon would be read as the sphere minus the box if wound the wrong way
    this.projection = geoMercator().fitExtent([[0, 0], [r.width, r.height]], { type: 'MultiPoint', coordinates: [[w, s], [w, n], [e, n], [e, s]] });
    this.drawBase();
    this.drawControl(this.controlFeatures, false);
    // never zoom or pan past the edge of the mapped area
    const [bx0, by0] = this.projection([w, n])!;
    const [bx1, by1] = this.projection([e, s])!;
    this.minK = Math.max(r.width / (bx1 - bx0), r.height / (by1 - by0));
    // Allow panning past the map edge by the width of the floating panels (left column, detail card),
    // so places near the edge — like the far end of the H-3 raid — can be brought out from under them.
    const desktop = r.width > 900;
    const [ml, mr, mt, mb] = (desktop ? [300, 420, 0, 0] : [0, 0, 50, 70]).map((m) => m / this.minK);
    this.zoomer.extent([[0, 0], [r.width, r.height]]).scaleExtent([this.minK, 40]).translateExtent([[bx0 - ml, by0 - mt], [bx1 + mr, by1 + mb]]);
    if (first) this.flyTo([44.2, 29.6, 50.2, 37.3], 0);
    this.applyTransform();
  }

  private get path() {
    return geoPath(this.projection);
  }

  private tileLayer?: G;
  private tilesShown = '';
  private sparse = new Map<string, Set<string>>();

  /** Relief tiles: pick the zoom that matches the screen, draw it over its parent so there are no holes while loading. */
  private updateTiles() {
    if (!this.tileLayer || this.flying) return;
    const z0 = Math.log2((2 * Math.PI * this.projection.scale()) / 256);
    const zooms = Object.keys(this.relief.zooms).map(Number).sort((a, b) => a - b);
    const want = Math.round(z0 + Math.log2(this.transform.k) + 0.25);
    const zt = Math.max(zooms[0], Math.min(zooms[zooms.length - 1], want));
    const [a, b] = [this.transform.invert([0, 0]), this.transform.invert([this.width, this.height])];
    const nw = this.projection.invert!(a)!, se = this.projection.invert!(b)!;
    const levels = zt > zooms[0] ? [zt - 1, zt] : [zt];
    const key = `${levels}|${nw.map((v) => v.toFixed(2))}|${se.map((v) => v.toFixed(2))}`;
    if (key === this.tilesShown) return;
    this.tilesShown = key;
    const tiles: { z: number; x: number; y: number }[] = [];
    for (const z of levels) {
      const info = this.relief.zooms[z];
      const n = 2 ** z;
      const fx = (lon: number) => Math.floor(((lon + 180) / 360) * n);
      const fy = (lat: number) => Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n);
      let [x0, x1, y0, y1] = [fx(nw[0]), fx(se[0]), fy(Math.min(85, nw[1])), fy(Math.max(-85, se[1]))];
      if (info.range) [x0, x1, y0, y1] = [Math.max(x0, info.range[0]), Math.min(x1, info.range[1]), Math.max(y0, info.range[2]), Math.min(y1, info.range[3])];
      if (info.tiles && !this.sparse.has(String(z))) this.sparse.set(String(z), new Set(info.tiles));
      const only = this.sparse.get(String(z));
      if ((x1 - x0 + 1) * (y1 - y0 + 1) > 400) continue;
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (!only || only.has(`${x}/${y}`)) tiles.push({ z, x, y });
    }
    const lon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;
    const lat = (y: number, z: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))) * 180) / Math.PI;
    const proj = (p: [number, number]) => this.projection(p)!;
    // new tiles fade in once loaded; the ones they replace stay underneath a moment so nothing blinks
    const layer = this.tileLayer;
    layer.selectAll<SVGImageElement, (typeof tiles)[number]>('image:not(.stale)').data(tiles, (t) => `${t.z}/${t.x}/${t.y}`)
      .join(
        (enter) => enter.append('image').attr('class', 'tile').attr('preserveAspectRatio', 'none')
          .on('load', function () { this.classList.add('in'); })
          .attr('href', (t) => `${import.meta.env.BASE_URL}relief/${t.z}/${t.x}/${t.y}.webp`),
        (update) => update,
        (exit) => exit.classed('stale', true).lower().each(function () { setTimeout(() => this.remove(), 900); }),
      )
      .each(function (t) {
        const p0 = proj([lon(t.x, t.z), lat(t.y, t.z)]), p1 = proj([lon(t.x + 1, t.z), lat(t.y + 1, t.z)]);
        // overlap by a hair so seams don't show
        this.setAttribute('x', String(p0[0]));
        this.setAttribute('y', String(p0[1]));
        this.setAttribute('width', String(p1[0] - p0[0] + 0.02));
        this.setAttribute('height', String(p1[1] - p0[1] + 0.02));
      })
      .sort((p, q) => p.z - q.z);
  }

  private drawBase() {
    const b = this.layers.base.html('');
    const path = this.path;
    const [w, s, e, n] = this.geo.bbox;
    const [x0, y0] = this.projection([w, n])!;
    const [x1, y1] = this.projection([e, s])!;
    b.append('rect').attr('x', x0).attr('y', y0).attr('width', x1 - x0).attr('height', y1 - y0).attr('fill', 'url(#sea)');
    // relief is baked in Web Mercator pixel space, so a straight rectangle lines up
    const [rw, rs, re, rn] = this.relief.bounds;
    const [rx0, ry0] = this.projection([rw, rn])!;
    const [rx1, ry1] = this.projection([re, rs])!;

    const clipId = 'land-clip';
    const cp = b.append('defs').append('clipPath').attr('id', clipId);
    cp.selectAll('path').data(this.geo.countries.features).join('path').attr('d', path as never);
    const land = b.append('g').attr('clip-path', `url(#${clipId})`);
    land.append('image').attr('href', `${import.meta.env.BASE_URL}${this.relief.overview}`).attr('x', rx0).attr('y', ry0).attr('width', rx1 - rx0).attr('height', ry1 - ry0).attr('preserveAspectRatio', 'none');
    this.tileLayer = land.append('g').attr('class', 'tiles');
    this.tilesShown = '';

    // wash the two belligerents faintly in their colours, fade the neighbours
    b.append('g').selectAll('path').data(this.geo.countries.features).join('path')
      .attr('d', path as never)
      .attr('class', (f) => `country c-${f.properties.iso}`);

    b.append('path').attr('class', 'graticule').attr('d', path(geoGraticule().step([1, 1]).extent([[w, s], [e + 0.01, n + 0.01]])()) ?? '');

    b.append('g').selectAll('path').data(this.geo.provinces.features).join('path').attr('class', 'province').attr('d', path as never);
    b.append('g').selectAll('path').data(this.geo.marshes.features).join('path').attr('class', 'marsh').attr('d', path as never);
    b.append('g').selectAll('path').data(this.geo.lakes.features).join('path').attr('class', 'lake').attr('d', path as never);
    b.append('g').selectAll('path').data(this.geo.rivers.features).join('path')
      .attr('class', (f) => (MAJOR_RIVERS.test(f.properties.name) ? 'river major' : 'river'))
      .attr('d', path as never);
    b.append('g').selectAll('path').data(this.geo.countries.features).join('path').attr('class', 'coast').attr('d', path as never);

    const t = this.layers.top.html('');
    const other = this.geo.borders.features.filter((f) => !f.properties.iranIraq);
    const ii = this.geo.borders.features.filter((f) => f.properties.iranIraq);
    t.append('g').selectAll('path').data(other).join('path').attr('class', 'border-other').attr('d', path as never);
    t.append('g').selectAll('path').data(ii).join('path').attr('class', 'border-halo').attr('d', path as never);
    t.append('g').selectAll('path').data(ii).join('path').attr('class', 'border-intl').attr('d', path as never);
    this.historicLayer = t.append('g').attr('class', 'historic');
    this.drawHistoric();
    b.append('rect').attr('x', x0).attr('y', y0).attr('width', x1 - x0).attr('height', y1 - y0).attr('filter', 'url(#paper)').attr('pointer-events', 'none');
  }

  private historicLayer?: G;

  setHistoricBorder(b?: '1937') {
    if (b === this.historic) return;
    this.historic = b;
    this.drawHistoric();
  }

  /** The 1937 line: today's thalweg border shifted onto the Iranian (north-east) bank of the Shatt. */
  private drawHistoric() {
    const g = this.historicLayer?.html('');
    if (!g || this.historic !== '1937') return;
    const shatt = this.geo.borders.features
      .filter((f) => f.properties.iranIraq)
      .flatMap((f) => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.type === 'MultiLineString' ? f.geometry.coordinates : []))
      .map((l) => (l as LonLat[]).filter((p) => p[1] < 30.47 && p[0] > 48.0))
      .filter((l) => l.length > 1);
    const OFFSET = 0.0045; // ≈ 450 m, half the river's width
    const lines = shatt.map((l) =>
      l.map((p, i) => {
        const a = l[Math.max(0, i - 1)], b = l[Math.min(l.length - 1, i + 1)];
        let nx = -(b[1] - a[1]), ny = b[0] - a[0];
        const len = Math.hypot(nx, ny) || 1;
        if (nx + ny < 0) (nx = -nx), (ny = -ny); // pick the north-east side
        return [p[0] + (nx / len) * OFFSET, p[1] + (ny / len) * OFFSET] as LonLat;
      }),
    );
    const path = this.path;
    g.selectAll('path').data(lines).join('path').attr('class', 'border-1937').attr('d', (l) => path({ type: 'LineString', coordinates: l }));
  }

  private prepareRiverLabels() {
    for (const f of this.geo.rivers.features) {
      const text = RIVERS_LABELLED[f.properties.name];
      if (!text || this.riverAnchors.some((r) => r.text === text)) continue;
      const g = f.geometry as LineString | MultiLineString;
      const parts = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
      const longest = parts.reduce((a, p) => (p.length > a.length ? p : a), parts[0]);
      if (longest.length < 6) continue;
      const i = Math.floor(longest.length * (f.properties.name === 'Tigris River' ? 0.78 : 0.5));
      this.riverAnchors.push({ text, a: longest[i - 2] as LonLat, b: longest[i + 2] as LonLat });
    }
  }

  // ── control layer ──────────────────────────────────────────────────────────────
  drawControl(features: ZoneFeature[], animate = true, changed: Set<string> = new Set()) {
    this.controlFeatures = features;
    if (!this.projection) return;
    const path = this.path;
    // Fades are CSS animations on top of a final state that is always fully visible:
    // d3 opacity transitions got interrupted by the next phase change and left zones at opacity 0.
    const sel = this.layers.control
      .selectAll<SVGPathElement, ZoneFeature>('path.zone')
      .data(features, (f) => `${f.properties.id}:${f.properties.kind}`);
    sel.exit().each(function () {
      if (!animate) return;
      const ghost = this.cloneNode() as SVGPathElement;
      // its own class, so the next data join (selectAll('path.zone')) never picks it up
      ghost.setAttribute('class', `zone-ghost ${ghost.getAttribute('class')!.replace(/\bzone\b/, '').replace('flash', '').replace('enter', '')}`);
      this.parentNode!.appendChild(ghost);
      setTimeout(() => ghost.remove(), 800);
    }).remove();
    const entered = sel.enter().append('path');
    entered.merge(sel)
      .attr('class', (f) => `zone ${f.properties.kind}${changed.has(f.properties.id) ? ' flash' : ''}`)
      .attr('d', path as never)
      .attr('fill', (f) => `url(#${HATCH[f.properties.kind]})`)
      .attr('opacity', null)
      .on('click', (ev: MouseEvent, f) => this.onZoneClick?.(f, ev.clientX, ev.clientY));
    if (animate) entered.classed('enter', true);
    this.drawLabels();
  }

  // ── overlay (screen space) ─────────────────────────────────────────────────────
  private screen(p: LonLat): [number, number] {
    return this.transform.apply(this.projection(p)!) as [number, number];
  }

  setHighlighted(ids: string[], sites: string[] = []) {
    this.highlighted = new Set(ids);
    this.highlightedSites = new Set(sites);
    this.drawPlaces();
  }

  /** The date the map shows (ISO); sites that did not exist yet, or any more, are hidden. */
  setDate(iso: string) {
    if (iso === this.date) return;
    this.date = iso;
    this.drawPlaces();
  }

  setShowSites(on: boolean) {
    this.showSites = on;
    this.drawPlaces();
  }

  /** Towns and strategic sites share one greedy placement pass so their labels never overlap. */
  private drawPlaces() {
    if (!this.projection) return;
    const k = this.transform.k;
    const hlP = (p: Place) => this.highlighted.has(p.id);
    const hlS = (s: Site) => this.highlightedSites.has(s.id);
    const towns = PLACES.filter((p) => hlP(p) || p.rank === 1 || (p.rank === 2 && k >= 1.5) || (p.rank === 3 && k >= 2.6));
    const live = (s: Site) => (!s.from || !this.date || s.from <= this.date) && (!s.to || !this.date || s.to >= this.date);
    const sites = SITES.filter((s) => live(s) && (hlS(s) || (this.showSites && (s.rank === 1 ? k >= 1.4 : k >= 2.4))));
    // highlighted towns, highlighted sites, other towns by rank, other sites
    type C = { p?: Place; s?: Site; hl: boolean; order: number };
    const cands: C[] = [
      ...towns.map((p) => ({ p, hl: hlP(p), order: hlP(p) ? 0 : 2 + p.rank })),
      ...sites.map((s) => ({ s, hl: hlS(s), order: hlS(s) ? 1 : 6 + s.rank })),
    ].sort((a, b) => a.order - b.order);
    // phones with an operation on screen: sites show as symbols only, the arrows need the room
    const quiet = this.width <= 900 && this.arrows.length > 0;
    const boxes: [number, number, number, number][] = [];
    const hit = (box: [number, number, number, number]) => boxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
    const visible: Place[] = [];
    const shownSites: { s: Site; label: boolean }[] = [];
    const key = (c: C) => (c.p ? `p:${c.p.id}` : `s:${c.s!.id}`);
    for (const c of cands) {
      // mid-flight nothing new appears; it would only blink in and out as the view sweeps past
      if (this.flying && !c.hl && !this.lastShown.has(key(c))) continue;
      const [x, y] = this.screen((c.p ?? c.s)!.at);
      if (x < -50 || y < -20 || x > this.width + 50 || y > this.height + 20) continue;
      if (c.p) {
        const w = 12 + Math.max(c.p.name.length * 6.6, c.p.fa.length * 5.2);
        const box: [number, number, number, number] = [x - 4, y - 12, x + w, y + 15];
        if (hit(box)) continue;
        boxes.push(box);
        visible.push(c.p);
        continue;
      }
      const s = c.s!;
      const glyph: [number, number, number, number] = [x - 10, y - 9, x + 10, y + (s.kind === 'command' ? 16 : 9)];
      const wantLabel = c.hl || (!quiet && (s.kind === 'command' || k >= (s.rank === 1 ? 2.4 : 3.4)));
      const lw = siteLabelW(s);
      const withLabel: [number, number, number, number] = [glyph[0], glyph[1], x + 13 + lw, glyph[3]];
      if (wantLabel && !hit(withLabel)) {
        boxes.push(withLabel);
        shownSites.push({ s, label: true });
      } else if (c.hl || !hit(glyph)) {
        boxes.push(glyph);
        shownSites.push({ s, label: false });
      }
    }
    if (!this.flying) this.lastShown = new Set([...visible.map((p) => `p:${p.id}`), ...shownSites.map(({ s }) => `s:${s.id}`)]);
    this.siteBoxes = shownSites.map(({ s, label }) => {
      const [x, y] = this.screen(s.at);
      return [x - 10, y - 9, label ? x + 13 + siteLabelW(s) : x + 10, y + 9] as [number, number, number, number];
    });
    this.drawSites(shownSites);
    const g = this.layers.places.selectAll<SVGGElement, (typeof PLACES)[number]>('g.place').data(visible, (p) => p.id);
    g.exit().remove();
    const e = g.enter().append('g').attr('class', 'place');
    e.append('circle');
    e.append('text').attr('class', 'en');
    e.append('text').attr('class', 'fa');
    const all = e.merge(g)
      .attr('transform', (p) => `translate(${this.screen(p.at)})`)
      .classed('hl', (p) => this.highlighted.has(p.id))
      .classed('capital', (p) => p.rank === 1);
    all.select('circle').attr('r', (p) => (p.rank === 1 ? 4.5 : this.highlighted.has(p.id) ? 4 : 2.8));
    all.select('text.en').attr('x', 7).attr('y', -1).text((p) => p.name);
    all.select('text.fa').attr('x', 7).attr('y', 11).text((p) => p.fa);
  }

  private drawSites(shown: { s: Site; label: boolean }[]) {
    const g = this.layers.sites.selectAll<SVGGElement, { s: Site; label: boolean }>('g.site').data(shown, (d) => d.s.id);
    g.exit().remove();
    const e = g.enter().append('g')
      .attr('class', (d) => `site k-${d.s.kind} side-${d.s.side}`)
      .on('click', (ev: MouseEvent, d) => {
        ev.stopPropagation();
        this.onSiteClick?.(d.s, ev.clientX, ev.clientY);
      });
    e.append('g').attr('class', 'glyph').html((d) => SITE_GLYPH[d.s.kind]);
    e.append('text').attr('class', 'site-label').attr('x', 13).attr('y', 4);
    e.merge(g)
      .attr('transform', (d) => `translate(${this.screen(d.s.at)})`)
      .classed('hl', (d) => this.highlightedSites.has(d.s.id))
      .select('text.site-label').text((d) => (d.label ? d.s.name : ''));
  }

  private drawLabels() {
    if (!this.projection) return;
    const k = this.transform.k;
    const L = this.layers.labels.html('');
    for (const r of this.riverAnchors) {
      const a = this.screen(r.a), b = this.screen(r.b);
      let ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
      if (ang > 90) ang -= 180;
      if (ang < -90) ang += 180;
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (k < 1.8 && !/Tigris|Euphrates|Karun/.test(r.text)) continue;
      L.append('text').attr('class', 'river-label').attr('transform', `translate(${m}) rotate(${ang})`).attr('dy', -4).text(r.text);
    }
    // phones: arrow labels win over zone names (zones still name themselves on tap)
    if (k >= 2.2 && !(this.width <= 900 && this.arrows.length)) {
      const path = geoPath(this.projection);
      for (const f of this.controlFeatures) {
        const [cx, cy] = this.transform.apply(path.centroid(f));
        const area = path.area(f) * k * k;
        if (area < 2500) continue;
        L.append('text').attr('class', `zone-label ${f.properties.kind}`).attr('x', cx).attr('y', cy).text(f.properties.label);
      }
    }
    const COUNTRY_LABELS: [string, string, LonLat][] = [['IRAN', 'ایران', [49.6, 33.4]], ['IRAQ', 'عراق', [43.6, 32.6]], ['KUWAIT', '', [47.55, 29.5]], ['SAUDI ARABIA', '', [44.5, 29.0]], ['TURKEY', '', [42.8, 37.8]], ['PERSIAN GULF', 'خلیج فارس', [50.4, 28.7]]];
    for (const [en, fa, at] of COUNTRY_LABELS) {
      const [x, y] = this.screen(at);
      const t = L.append('text').attr('class', `country-label${en === 'PERSIAN GULF' ? ' sea' : ''}`).attr('x', x).attr('y', y);
      t.append('tspan').text(en);
      if (fa) t.append('tspan').attr('class', 'fa').attr('x', x).attr('dy', '1.25em').text(fa);
    }
  }

  setArrows(arrows: ArrowState[], areas: BattleArea[] = []) {
    this.arrows = arrows;
    this.areas = areas;
    this.drawPlaces();
    this.drawArrows();
    this.drawLabels();
  }

  drawArrows() {
    const A = this.layers.arrows.html('');
    const k = this.transform.k;
    const w = Math.max(5, Math.min(13, 4 + 2.4 * Math.log2(k + 1)));
    const smooth = line().curve(curveCatmullRom.alpha(0.5));
    const labelBoxes: [number, number, number, number][] = [...this.siteBoxes];
    // labels go in their own group, raised over every arrow body once all are drawn
    const tags = A.append('g').attr('class', 'arrow-tags');
    // kill zones, dug-in lines and flooded barriers fade in as the first arrows start moving
    const shown = Math.min(1, Math.max(0, ...this.arrows.map((a) => a.t)) * 2.5);
    if (this.areas.length && shown > 0) {
      const ring = line().curve(curveCatmullRomClosed.alpha(0.5));
      const G = A.append('g').attr('class', 'areas').attr('opacity', shown);
      for (const area of this.areas) {
        const pts = area.shape.map((p) => this.screen(p));
        const color = area.side === 'iran' ? COLORS.iran : area.side === 'iraq' ? COLORS.iraq : COLORS.other;
        G.append('path').attr('class', `area ${area.kind}`).attr('d', ring(pts)!).style('--c', color);
        // label just under the area: arrows converge on its middle
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = Math.max(...pts.map((p) => p[1])) + 10;
        const text = area.kind === 'trap' ? `⚠ ${area.label}` : area.label;
        G.append('text').attr('class', `area-label ${area.kind}`).attr('x', cx).attr('y', cy + 4).style('--c', color).text(text);
        labelBoxes.push([cx - text.length * 3.4, cy - 8, cx + text.length * 3.4, cy + 8]);
      }
    }
    for (const { arrow, t } of this.arrows) {
      if (t <= 0) continue;
      const pts = arrow.path.map((p) => this.screen(p));
      const color = arrow.side === 'iran' ? COLORS.iran : arrow.side === 'iraq' ? COLORS.iraq : COLORS.other;
      const kind = arrow.kind ?? 'attack';
      const ballistic = kind === 'air' || kind === 'missile';
      let d: string;
      if (ballistic && !arrow.route) {
        // great sweeping arc between the end points, bulging to the left of travel
        const [a, b] = [pts[0], pts[pts.length - 1]];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const c = [(a[0] + b[0]) / 2 + dy * 0.18, (a[1] + b[1]) / 2 - dx * 0.18];
        d = `M${a}Q${c} ${b}`;
      } else d = smooth(pts)!;

      const g = A.append('g').attr('class', `arrow ${kind} side-${arrow.side}`);
      const probe = g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', 'none');
      const len = (probe.node() as SVGPathElement).getTotalLength();
      const drawn = len * t;
      const bw = ballistic ? 2.2 : kind === 'retreat' ? w * 0.45 : w;
      const headLen = ballistic ? 9 : bw * 1.7;
      const bodyLen = Math.max(0, drawn - headLen * 0.6);
      const dash = (extra = '') => `${bodyLen} ${len + 10}${extra}`;

      if (!ballistic) {
        g.append('path').attr('d', d).attr('class', 'casing').attr('stroke-width', bw + 3.2).attr('stroke-dasharray', dash());
      }
      const node = probe.node() as SVGPathElement;
      if (ballistic || kind === 'retreat') {
        // dashed lines can't use the dash trick to grow, so sample the curve up to the drawn length
        const steps = Math.max(2, Math.ceil(drawn / 6));
        const pts2 = Array.from({ length: steps + 1 }, (_, i) => node.getPointAtLength((drawn * i) / steps));
        g.append('path').attr('class', 'body').attr('d', `M${pts2.map((p) => `${p.x},${p.y}`).join('L')}`).attr('stroke', color).attr('stroke-width', bw);
      } else {
        g.append('path').attr('d', d).attr('class', 'body').attr('stroke', color).attr('stroke-width', bw).attr('stroke-dasharray', dash());
      }
      if (kind === 'counter') g.append('path').attr('d', d).attr('class', 'counter-core').attr('stroke-width', bw * 0.42).attr('stroke-dasharray', dash());

      // head
      const tip = node.getPointAtLength(drawn);
      const back = node.getPointAtLength(Math.max(0, drawn - 4));
      const ang = (Math.atan2(tip.y - back.y, tip.x - back.x) * 180) / Math.PI;
      const hw = ballistic ? 5 : bw * 1.25;
      const head = kind === 'retreat'
        ? `M${-headLen},${-hw} L0,0 L${-headLen},${hw}`
        : `M0,0 L${-headLen},${-hw} L${-headLen * 0.72},0 L${-headLen},${hw} Z`;
      g.append('path').attr('class', `head ${kind}`).attr('d', head).attr('transform', `translate(${tip.x},${tip.y}) rotate(${ang})`)
        .attr('fill', kind === 'retreat' ? 'none' : kind === 'counter' ? '#fffaf0' : color)
        .attr('stroke', kind === 'retreat' ? color : '#1d1a17')
        .attr('stroke-width', kind === 'retreat' ? 2 : kind === 'counter' ? 2.4 : 1);
      if (kind === 'counter') g.select('path.head').attr('stroke', color);
      if (kind === 'air') g.append('text').attr('class', 'glyph').attr('transform', `translate(${tip.x},${tip.y}) rotate(${ang + 45})`).text('✈');

      if (arrow.offMap && t > 0.97) {
        // tag at the map edge: "→ H-3 air base" pointing on along the arrow's heading
        // the tag sits on the map side of the tip (beyond it is the edge or a floating panel);
        // its arrow glyph points the way the flight continues
        const westward = Math.cos((ang * Math.PI) / 180) < 0;
        const tag = g.append('g').attr('class', 'offmap').attr('transform', `translate(${tip.x},${tip.y})`);
        tag.append('text').attr('x', westward ? 12 : -12).attr('y', 18).attr('text-anchor', westward ? 'start' : 'end')
          .text(westward ? `◀ ${arrow.offMap}` : `${arrow.offMap} ▶`);
      }
      // the unit tag rides under the axis label (or alone, smaller, when the axis has no name);
      // on phones it waits until zoomed in, where there is room for it
      const unit = arrow.unit && (this.width > 900 || k >= 2.5) ? arrow.unit : undefined;
      if ((arrow.label || unit) && t > 0.55) {
        // try a few spots along and either side of the arrow until the label doesn't collide
        const tw = Math.max(arrow.label ? arrow.label.length * 6.8 + 6 : 0, unit ? unit.length * 5.9 + 14 : 0);
        const extra = arrow.label && unit ? 13 : 0; // second line
        for (const [along, side] of [[0.5, -1], [0.5, 1], [0.3, -1], [0.7, -1], [0.3, 1], [0.7, 1], [0.5, -2.2], [0.5, 2.2]] as const) {
          const p = node.getPointAtLength(len * along * t);
          // y is the first line's baseline; above the arrow the block grows upward, below it downward
          const y = p.y + side * (bw + 8) + (side > 0 ? 6 : -extra);
          const box: [number, number, number, number] = [p.x - tw / 2, y - 11, p.x + tw / 2, y + 3 + extra];
          if (labelBoxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
          labelBoxes.push(box);
          if (arrow.label) tags.append('text').attr('class', 'arrow-label').attr('x', p.x).attr('y', y).attr('fill', color).text(arrow.label);
          if (unit) tags.append('text').attr('class', 'arrow-unit').attr('x', p.x).attr('y', arrow.label ? y + 13 : y).attr('fill', color).text(`⚑ ${unit}`);
          break;
        }
      }
      probe.remove();
    }
    tags.raise();
  }

  // ── transform & camera ─────────────────────────────────────────────────────────
  private applyTransform() {
    const { k } = this.transform;
    const tr = this.transform.toString();
    this.layers.base.attr('transform', tr);
    this.layers.control.attr('transform', tr);
    this.layers.top.attr('transform', tr);
    // keep hatch spacing constant on screen
    this.svg.selectAll<SVGPatternElement, unknown>('pattern[data-gap]').each(function () {
      const angle = this.getAttribute('data-angle');
      // reeds grow a little as you zoom (up to 1.8x on screen); hatches stay the same size
      const grow = this.hasAttribute('data-grow') ? Math.min(1.8, Math.pow(k, 0.3)) : 1;
      this.setAttribute('patternTransform', `scale(${grow / k}) rotate(${angle})`);
    });
    this.updateTiles();
    if (this.onView) {
      const nw = this.projection.invert!(this.transform.invert([0, 0]))!, se = this.projection.invert!(this.transform.invert([this.width, this.height]))!;
      this.onView([nw[0], se[1], se[0], nw[1]]);
    }
    this.host.style.setProperty('--ks', String(Math.min(2.2, Math.pow(k, 0.3))));
    this.drawPlaces();
    this.drawLabels();
    this.drawArrows();
    this.drawUi();
  }

  flyTo(bbox: [number, number, number, number], duration = 1300) {
    const [w, s, e, n] = bbox;
    const [x0, y0] = this.projection([w, n])!;
    const [x1, y1] = this.projection([e, s])!;
    const pad = Math.min(this.width, this.height) * 0.06;
    // keep the target clear of the floating legend (left) and the detail panel (right / bottom sheet)
    const desktop = this.width > 900;
    const column = document.querySelector('.left-col');
    const leftInset = desktop && column ? column.getBoundingClientRect().right - this.host.getBoundingClientRect().left : 0;
    const rightInset = desktop && this.host.dataset.panel === 'open' ? 400 : 0;
    // phones: slim title bar on top, the sheet's title strip (or the whole sheet) at the bottom
    const sheet = document.getElementById('panel')?.dataset.open;
    const topInset = desktop ? 0 : 48;
    const bottomInset = desktop ? 0 : sheet === 'peek' ? 64 : sheet === 'true' ? this.height * 0.7 : 0;
    const vw = this.width - leftInset - rightInset - pad * 2, vh = this.height - topInset - bottomInset - pad * 2;
    const k = Math.max(this.minK, Math.min(40, vw / (x1 - x0), vh / (y1 - y0)));
    const tx = leftInset + pad + vw / 2 - (k * (x0 + x1)) / 2;
    const ty = topInset + pad + vh / 2 - (k * (y0 + y1)) / 2;
    const target = zoomIdentity.translate(tx, ty).scale(k);
    return new Promise<void>((resolve) => {
      if (!duration) {
        this.svg.call(this.zoomer.transform, target);
        resolve();
        return;
      }
      this.svg.transition().duration(duration).ease(easeCubicInOut).call(this.zoomer.transform, target).on('end', () => resolve()).on('interrupt', () => resolve());
    });
  }

  /** Centre the map on a point, keeping the zoom. */
  panTo(p: LonLat) {
    const [x, y] = this.projection(p)!;
    const k = this.transform.k;
    this.svg.transition().duration(700).ease(easeCubicInOut).call(this.zoomer.transform, zoomIdentity.translate(this.width / 2 - k * x, this.height / 2 - k * y).scale(k));
  }

  // ── compare swipe & furniture ──────────────────────────────────────────────────
  setCompare(on: boolean) {
    this.compareX = on ? this.width * 0.5 : null;
    this.drawUi();
  }

  private drawUi() {
    const ui = this.layers.ui.html('');
    const rect = this.svg.select('#swipe-rect');
    if (this.compareX == null) {
      rect.attr('x', -1e5).attr('y', -1e5).attr('width', 2e5).attr('height', 2e5);
    } else {
      const x = this.compareX;
      rect.attr('x', 0).attr('y', 0).attr('width', x).attr('height', this.height);
      ui.append('rect').attr('class', 'today-wash').attr('x', x).attr('y', 0).attr('width', this.width - x).attr('height', this.height);
      ui.append('line').attr('class', 'swipe-line').attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', this.height);
      ui.append('text').attr('class', 'swipe-tag').attr('x', x - 12).attr('y', 92).attr('text-anchor', 'end').text('◀ SELECTED DATE');
      ui.append('text').attr('class', 'swipe-tag today').attr('x', x + 12).attr('y', 92).text('TODAY — 1975 BORDER ▶');
      const handle = ui.append('g').attr('class', 'swipe-handle').attr('transform', `translate(${x},${this.height / 2})`);
      handle.append('circle').attr('r', 17);
      handle.append('path').attr('d', 'M-6,-5 L-11,0 L-6,5 M6,-5 L11,0 L6,5');
      const drag = (ev: PointerEvent) => {
        const r = this.host.getBoundingClientRect();
        this.compareX = Math.max(40, Math.min(this.width - 40, ev.clientX - r.left));
        this.drawUi();
      };
      handle.on('pointerdown', (ev: PointerEvent) => {
        ev.stopPropagation();
        const up = () => {
          window.removeEventListener('pointermove', drag);
          window.removeEventListener('pointerup', up);
        };
        window.addEventListener('pointermove', drag);
        window.addEventListener('pointerup', up);
      });
    }
    this.drawScaleBar(ui);
  }

  private drawScaleBar(ui: G) {
    if (!this.projection) return;
    const lat = this.projection.invert!(this.transform.invert([this.width / 2, this.height / 2]))![1];
    const a = this.screen([47, lat]), b = this.screen([48, lat]);
    const kmPerPx = (111.32 * Math.cos((lat * Math.PI) / 180)) / (b[0] - a[0]);
    const nice = [5, 10, 20, 25, 50, 100, 200, 250, 500].find((v) => v / kmPerPx > 70) ?? 500;
    const px = nice / kmPerPx;
    const lift = this.width <= 900 && this.host.dataset.panel === 'open' ? 62 : 0; // clear the phone sheet's title strip
    const g = ui.append('g').attr('class', 'scalebar').attr('transform', `translate(${18},${this.height - 24 - lift})`);
    g.append('rect').attr('width', px / 2).attr('height', 5).attr('class', 'sb-dark');
    g.append('rect').attr('x', px / 2).attr('width', px / 2).attr('height', 5).attr('class', 'sb-light');
    g.append('text').attr('y', -5).text('0');
    g.append('text').attr('x', px).attr('y', -5).attr('text-anchor', 'middle').text(`${nice} km`);
    const nArrow = ui.append('g').attr('class', 'north').attr('transform', `translate(${30},${this.height - 70 - lift})`);
    nArrow.append('path').attr('d', 'M0,-16 L7,8 L0,3 L-7,8 Z');
    nArrow.append('text').attr('y', -20).attr('text-anchor', 'middle').text('N');
  }
}

export { NS };
