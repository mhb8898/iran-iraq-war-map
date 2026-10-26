import { geoMercator, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import type { Base, ZoneFeature } from './geo';
import { PLACES } from './data/places';
import type { LonLat, Phase } from './types';

const THEATRE: [number, number, number, number] = [43.8, 29.4, 49.6, 37.6];
const KM2 = (n: number) => (n < 50 ? '—' : `${(Math.round(n / 100) * 100).toLocaleString('en')} km²`);

/** Always-visible locator: the whole front at the current date, plus a box for the main map's view. */
export class Overview {
  private svg;
  private zonesG;
  private viewRect;
  private caption: HTMLElement;
  private projection;

  constructor(host: HTMLElement, geo: Base, onPick: (p: LonLat) => void) {
    const W = 250, H = 300;
    host.innerHTML = '<div class="ov-head"><span>Whole front</span><b id="ov-date"></b></div>';
    this.caption = document.createElement('div');
    this.caption.className = 'ov-ledger';
    const [w, s, e, n] = THEATRE;
    this.projection = geoMercator().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'MultiPoint', coordinates: [[w, s], [w, n], [e, n], [e, s]] });
    const path = geoPath(this.projection);
    this.svg = select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'ov-svg');
    this.svg.append('rect').attr('width', W).attr('height', H).attr('class', 'ov-sea');
    this.svg.append('g').selectAll('path').data(geo.countries.features).join('path').attr('d', path as never).attr('class', (f) => `ov-land ov-${f.properties.iso}`);
    this.zonesG = this.svg.append('g');
    this.svg.append('g').selectAll('path').data(geo.borders.features.filter((f) => f.properties.iranIraq)).join('path').attr('d', path as never).attr('class', 'ov-border');
    const cities = PLACES.filter((p) => ['baghdad', 'basra', 'ahvaz', 'kermanshah', 'dezful', 'sulaymaniyah'].includes(p.id));
    const cg = this.svg.append('g').selectAll('g').data(cities).join('g').attr('transform', (p) => `translate(${this.projection(p.at)})`);
    cg.append('circle').attr('r', 1.8).attr('class', 'ov-city');
    cg.append('text').attr('x', 3).attr('y', 3).attr('class', 'ov-city-label').text((p) => p.name);
    this.viewRect = this.svg.append('rect').attr('class', 'ov-view');
    host.append(this.caption);
    this.svg.on('click', (ev: MouseEvent) => {
      const r = (this.svg.node() as SVGSVGElement).getBoundingClientRect();
      const p = this.projection.invert!([((ev.clientX - r.left) / r.width) * W, ((ev.clientY - r.top) / r.height) * H]);
      if (p) onPick(p as LonLat);
    });
  }

  setPhase(phase: Phase, features: ZoneFeature[], stats: { iraqHeldKm2: number; iranHeldKm2: number; contestedKm2: number }) {
    const path = geoPath(this.projection);
    this.zonesG.selectAll('path').data(features).join('path').attr('d', path as never).attr('class', (f) => `ov-zone ${f.properties.kind}`);
    document.getElementById('ov-date')!.textContent = new Date(`${phase.date}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    this.caption.innerHTML = `
      <div><i class="sw iraqHeld"></i>Held by Iraq<b>${KM2(stats.iraqHeldKm2)}</b></div>
      <div><i class="sw iranHeld"></i>Held by Iran<b>${KM2(stats.iranHeldKm2)}</b></div>
      <div><i class="sw contested"></i>Contested<b>${KM2(stats.contestedKm2)}</b></div>`;
  }

  setView([w, s, e, n]: [number, number, number, number]) {
    const [x0, y0] = this.projection([w, n])!, [x1, y1] = this.projection([e, s])!;
    this.viewRect.attr('x', x0).attr('y', y0).attr('width', Math.max(3, x1 - x0)).attr('height', Math.max(3, y1 - y0));
  }
}
