import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { area, curveStepAfter } from 'd3-shape';
import type { Phase, WarEvent } from './types';
import { COLORS } from './map';

export const parseDate = (s: string) => new Date(`${s}T00:00:00Z`);

interface Opts {
  events: WarEvent[];
  phases: Phase[];
  stats: Map<string, { iraqHeldKm2: number; iranHeldKm2: number }>;
  onSelect: (ev: WarEvent) => void;
  onScrub: (d: Date) => void;
}

// Polylinear time: the war years get most of the width, the long run-up and aftermath are compressed.
const STOPS = ['1936-01-01', '1979-01-01', '1989-01-01', '2004-01-01'].map(parseDate);

export class Timeline {
  private svg;
  private width = 0;
  private cursor: Date = parseDate('1975-03-06');
  private selected?: string;

  constructor(private host: HTMLElement, private o: Opts) {
    this.svg = select(host).append('svg').attr('class', 'timeline-svg');
    new ResizeObserver(() => this.draw()).observe(host);
    this.draw(); // don't wait for the observer: it never fires in a background tab
  }

  private x() {
    const w = this.width;
    return scaleTime().domain(STOPS).range([24, w * 0.13, w * 0.89, w - 24]);
  }

  setCursor(d: Date) {
    this.cursor = d;
    this.drawCursor();
    // keep the cursor in view when the timeline is scrollable
    const xx = this.x()(d), w = this.host.clientWidth;
    if (this.host.scrollWidth > w && (xx < this.host.scrollLeft + 40 || xx > this.host.scrollLeft + w - 40)) this.host.scrollTo({ left: xx - w / 2, behavior: 'smooth' });
  }

  private shown: (e: WarEvent) => boolean = () => true;

  /** Dim events outside the filter; they stay in place so the timeline doesn't reshuffle. */
  setFilter(fn: (e: WarEvent) => boolean) {
    this.shown = fn;
    this.svg.selectAll<SVGGElement, { e: WarEvent }>('g.ev').classed('dim', (l) => !fn(l.e));
  }

  setSelected(id?: string) {
    this.selected = id;
    this.svg.selectAll<SVGGElement, { e: WarEvent }>('g.ev').classed('selected', (l) => l.e.id === id);
  }

  draw() {
    const box = this.host.getBoundingClientRect();
    if (!box.width) return;
    // narrow screens scroll the timeline sideways instead of crushing it
    // phones get a wider strip so events fit in fewer rows
    const r = { width: Math.max(box.width, box.width < 600 ? 1500 : 880), height: box.height - (box.width < 880 ? 6 : 0) };
    const compact = r.height < 120;
    this.width = r.width;
    const H = r.height;
    this.svg.style('width', `${r.width}px`);
    const x = this.x();
    const svg = this.svg.attr('viewBox', `0 0 ${r.width} ${H}`).html('');
    const mid = compact ? 18 : 30;

    // compressed-era shading
    svg.append('rect').attr('class', 'era-out').attr('x', 0).attr('width', x(STOPS[1])).attr('height', H);
    svg.append('rect').attr('class', 'era-out').attr('x', x(STOPS[2])).attr('width', r.width - x(STOPS[2])).attr('height', H);
    svg.append('rect').attr('class', 'war-band').attr('x', x(parseDate('1980-09-22'))).attr('width', x(parseDate('1988-08-20')) - x(parseDate('1980-09-22'))).attr('y', 0).attr('height', 4);

    // occupation stream: Iraqi-held Iranian soil above the axis, Iranian-held Iraqi soil below
    const ph = this.o.phases.map((p) => ({ d: parseDate(p.date), ...this.o.stats.get(p.id)! }));
    ph.push({ ...ph[ph.length - 1], d: STOPS[3] });
    const max = Math.max(...ph.map((p) => Math.max(p.iraqHeldKm2, p.iranHeldKm2)));
    const y = scaleLinear().domain([0, max]).range([0, compact ? 14 : 24]);
    const up = area<(typeof ph)[number]>().curve(curveStepAfter).x((p) => x(p.d)).y0(mid).y1((p) => mid - y(p.iraqHeldKm2));
    const down = area<(typeof ph)[number]>().curve(curveStepAfter).x((p) => x(p.d)).y0(mid).y1((p) => mid + y(p.iranHeldKm2));
    svg.append('path').attr('class', 'stream iraq').attr('d', up(ph));
    svg.append('path').attr('class', 'stream iran').attr('d', down(ph));
    svg.append('line').attr('class', 'axis').attr('x1', 0).attr('x2', r.width).attr('y1', mid).attr('y2', mid);
    // labels sit where the other stream is empty, clear of the cursor's date tag
    if (!compact) {
      svg.append('text').attr('class', 'stream-label').attr('x', x(parseDate('1983-01-01'))).attr('y', mid - 5).text('▲ Iranian soil held by Iraq');
      svg.append('text').attr('class', 'stream-label').attr('x', x(parseDate('1981-01-01'))).attr('y', mid + 13).text('▼ Iraqi soil held by Iran');
    }
    const tickY = compact ? mid + 16 : mid + 26;

    // year ticks
    const years: number[] = [1937, 1975];
    for (let yy = 1980; yy <= 1988; yy++) years.push(yy);
    years.push(1990, 2003);
    const tg = svg.append('g').attr('class', 'ticks');
    for (const yy of years) {
      const xx = x(parseDate(`${yy}-01-01`));
      tg.append('line').attr('x1', xx).attr('x2', xx).attr('y1', tickY).attr('y2', tickY + 6);
      tg.append('text').attr('x', xx + 3).attr('y', tickY + 16).text(yy);
    }

    // events in lanes so markers don't collide
    const laneEnd: number[] = [];
    const lanes = this.o.events.map((e) => {
      const xx = x(parseDate(e.date));
      let lane = laneEnd.findIndex((end) => end < xx - 11);
      if (lane < 0) lane = laneEnd.length;
      laneEnd[lane] = xx;
      return { e, xx, lane };
    });
    const top = tickY + 30;
    const laneH = Math.max(compact ? 8 : 10, Math.min(15, (H - top - 6) / Math.max(1, laneEnd.length)));
    const eg = svg.append('g');
    const sel = eg.selectAll('g.ev').data(lanes).join('g')
      .attr('class', (l) => `ev k-${l.e.kind} s-${l.e.side ?? 'none'}`)
      .attr('transform', (l) => `translate(${l.xx},${top + l.lane * laneH})`)
      .on('click', (_, l) => this.o.onSelect(l.e));
    sel.append('line').attr('class', 'stem').attr('y1', -top + tickY + 6).attr('y2', 0);
    sel.append('path').attr('d', (l) => (l.e.kind === 'political' ? 'M0,-5L5,0L0,5L-5,0Z' : l.e.kind === 'atrocity' ? 'M-4,-4L4,4M4,-4L-4,4' : 'M0,0m-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0'))
      .attr('fill', (l) => sideColor(l.e))
      .attr('stroke', (l) => (l.e.kind === 'atrocity' ? '#111' : '#1d1a17'));
    sel.append('title').text((l) => `${l.e.date} — ${l.e.name}`);
    sel.classed('selected', (l) => l.e.id === this.selected).classed('dim', (l) => !this.shown(l.e));

    // scrubbing
    const cursor = svg.append('g').attr('class', 'cursor');
    cursor.append('line').attr('y1', 0).attr('y2', H);
    cursor.append('rect').attr('class', 'cursor-tag-bg').attr('y', 0).attr('height', 16);
    cursor.append('text').attr('class', 'cursor-tag').attr('y', 12);
    const scrub = (ev: PointerEvent) => {
      const rr = (this.svg.node() as SVGSVGElement).getBoundingClientRect();
      const d = x.invert(Math.max(24, Math.min(r.width - 24, ev.clientX - rr.left)));
      this.setCursor(d);
      this.o.onScrub(d);
    };
    svg.insert('rect', ':first-child').attr('class', 'scrub-area').attr('width', r.width).attr('height', tickY + 20)
      .on('pointerdown', (ev: PointerEvent) => {
        scrub(ev);
        const move = (e: PointerEvent) => scrub(e);
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    this.drawCursor();
  }

  private drawCursor() {
    if (!this.width) return;
    const xx = this.x()(this.cursor);
    const g = this.svg.select('g.cursor').attr('transform', `translate(${xx},0)`);
    const label = this.cursor.toISOString().slice(0, 10);
    const flip = xx > this.width - 90;
    g.select('text').attr('x', flip ? -6 : 6).attr('text-anchor', flip ? 'end' : 'start').text(label);
    g.select('rect').attr('x', flip ? -76 : 2).attr('width', 74);
  }
}

export function sideColor(e: WarEvent) {
  if (e.kind === 'political') return '#e9e1cf';
  if (e.side === 'iran') return COLORS.iran;
  if (e.side === 'iraq') return COLORS.iraq;
  if (e.side === 'both') return '#c48a2c';
  return COLORS.other;
}
