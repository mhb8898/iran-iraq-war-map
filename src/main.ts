import './style.css';
import { timer } from 'd3-timer';
import { easeCubicOut } from 'd3-ease';
import { buildControl, loadData } from './geo';
import { WarMap, type ArrowState } from './map';
import { Timeline, parseDate } from './timeline';
import { renderEvent, renderPhase } from './panel';
import { EVENTS } from './data/events';
import { PHASES } from './data/phases';
import { placeById } from './data/places';
import type { Phase, WarEvent } from './types';

const THEATRE: [number, number, number, number] = [44.2, 29.6, 50.2, 37.3];
const DAY = 864e5;

const events = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));

type SideFilter = 'all' | 'iran' | 'iraq';
// An event belongs to a side if that side started it or won it (Iraq "wins" the Iranian
// offensives it stopped). MEK operations count as Iraqi-backed; shared diplomacy shows under both.
const involves = (e: WarEvent, f: SideFilter) =>
  f === 'all' || e.side === f || e.outcome === f || e.side === 'both' ||
  (e.kind === 'political' && !e.side) || (f === 'iraq' && e.side === 'other' && e.kind === 'operation');
const phaseAt = (d: Date): Phase => [...PHASES].reverse().find((p) => parseDate(p.date) <= d) ?? PHASES[0];
const phaseBefore = (e: WarEvent) => [...PHASES].reverse().find((p) => p.date < e.date) ?? PHASES[0];
// Ground fighting shows the front once it's over; long air/naval campaigns and political events show it as they began.
const phaseAfter = (e: WarEvent) =>
  (e.phase && PHASES.find((p) => p.id === e.phase)) ||
  (e.kind === 'operation' || e.kind === 'battle' ? phaseAt(new Date(parseDate(e.end ?? e.date).getTime() + 7 * DAY)) : phaseAt(parseDate(e.date)));

function focusOf(e: WarEvent): [number, number, number, number] {
  if (e.focus) return e.focus;
  const pts = [...(e.arrows ?? []).flatMap((a) => a.path), ...(e.places ?? []).map((id) => placeById[id].at)];
  if (!pts.length) return THEATRE;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const pad = 0.35;
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
}

async function main() {
  const { geo, relief, wiki } = await loadData();
  const control = buildControl(geo);

  const mapEl = document.getElementById('map')!;
  const panel = document.getElementById('panel')!;
  const card = document.getElementById('card')!;
  const map = new WarMap(mapEl, geo, relief);
  if (import.meta.env.DEV) Object.assign(window, { __map: map });
  let current: Phase | undefined;
  let selected = -1;
  let anim: ReturnType<typeof timer> | undefined;
  let playing = false;
  let playTimeout: number | undefined;

  const setPhase = (p: Phase, animate = true) => {
    if (current?.id === p.id) return;
    const prev = current;
    current = p;
    const changed = new Set(prev ? [...p.iraqHeld, ...p.iranHeld, ...p.contested].filter((z) => ![...prev.iraqHeld, ...prev.iranHeld, ...prev.contested].includes(z)) : []);
    map.drawControl(control.get(p.id)!.features, animate, changed);
    map.setHistoricBorder(p.border);
    document.getElementById('phase-label')!.textContent = `${p.label} · ${parseDate(p.date).getUTCFullYear()}`;
  };

  const openPanel = (open: boolean) => {
    panel.dataset.open = String(open);
    mapEl.dataset.panel = open ? 'open' : 'closed';
  };

  const timeline = new Timeline(document.getElementById('timeline')!, {
    events,
    phases: PHASES,
    stats: control,
    onSelect: (e) => select(events.indexOf(e)),
    onScrub: (d) => {
      stop();
      anim?.stop();
      selected = -1;
      timeline.setSelected();
      map.setArrows([]);
      map.setHighlighted([]);
      const p = phaseAt(d);
      setPhase(p);
      renderPhase(card, p, control.get(p.id)!, d);
      openPanel(true);
      history.replaceState(null, '', ' ');
    },
  });

  function animateArrows(e: WarEvent, after: Phase) {
    anim?.stop();
    const arrows: ArrowState[] = (e.arrows ?? []).map((arrow) => ({ arrow, t: 0 }));
    map.setArrows(arrows);
    // main thrusts first, then counter-attacks and retreats
    const order = (a: ArrowState) => (a.arrow.kind === 'counter' ? 1 : a.arrow.kind === 'retreat' ? 2 : 0);
    const starts = new Map<ArrowState, number>();
    let i = 0;
    for (const lvl of [0, 1, 2]) for (const a of arrows.filter((x) => order(x) === lvl)) starts.set(a, 250 + i++ * 380 + lvl * 500);
    const dur = (a: ArrowState) => (a.arrow.kind === 'air' || a.arrow.kind === 'missile' ? 1500 : 1700);
    const total = Math.max(0, ...arrows.map((a) => starts.get(a)! + dur(a)));
    return new Promise<void>((resolve) => {
      if (!arrows.length) {
        setPhase(after);
        resolve();
        return;
      }
      anim = timer((elapsed) => {
        for (const a of arrows) a.t = easeCubicOut(Math.max(0, Math.min(1, (elapsed - starts.get(a)!) / dur(a))));
        map.drawArrows();
        if (elapsed >= total) {
          anim!.stop();
          setPhase(after);
          resolve();
        }
      });
    });
  }

  async function select(i: number, fly = true) {
    if (i < 0 || i >= events.length) return;
    selected = i;
    const e = events[i];
    const before = phaseBefore(e), after = phaseAfter(e);
    history.replaceState(null, '', `#${e.id}`);
    timeline.setSelected(e.id);
    timeline.setCursor(parseDate(e.date));
    openPanel(true);
    renderEvent(card, e, wiki, { phaseBefore: before, phaseAfter: after, statsAfter: control.get(after.id)!, index: i, total: events.length });
    card.scrollTop = 0;
    card.querySelector('.replay')?.addEventListener('click', () => {
      setPhase(before, false);
      animateArrows(e, after);
    });
    map.setHighlighted(e.places ?? []);
    map.setArrows([]);
    anim?.stop();
    setPhase(e.arrows?.length ? before : after);
    if (fly) await map.flyTo(focusOf(e));
    if (selected !== i) return;
    await animateArrows(e, after);
  }

  let filter: SideFilter = 'all';
  const nextShown = (from: number, d: number) => {
    for (let i = from + d; i >= 0 && i < events.length; i += d) if (involves(events[i], filter)) return i;
    return -1;
  };
  const step = (d: number) => {
    const i = nextShown(selected < 0 ? (d > 0 ? -1 : events.length) : selected, d);
    if (i >= 0) select(i);
  };
  document.querySelectorAll<HTMLButtonElement>('.side-filter button').forEach((b) => {
    b.onclick = () => {
      filter = b.dataset.side as SideFilter;
      document.querySelectorAll('.side-filter button').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      timeline.setFilter((e) => involves(e, filter));
    };
  });
  function stop() {
    playing = false;
    clearTimeout(playTimeout);
    document.getElementById('play')!.textContent = '▶ Play';
  }
  async function playFrom(i: number) {
    if (!playing || i < 0 || i >= events.length) return stop();
    await select(i);
    if (!playing) return;
    playTimeout = window.setTimeout(() => playFrom(nextShown(i, 1)), 2600);
  }

  document.getElementById('prev')!.onclick = () => (stop(), step(-1));
  document.getElementById('next')!.onclick = () => (stop(), step(1));
  document.getElementById('play')!.onclick = (ev) => {
    if (playing) return stop();
    playing = true;
    (ev.currentTarget as HTMLElement).textContent = '❚❚ Pause';
    const next = nextShown(selected, 1);
    playFrom(next >= 0 ? next : nextShown(-1, 1));
  };
  document.getElementById('home')!.onclick = () => map.flyTo(THEATRE);
  document.getElementById('close-panel')!.onclick = () => openPanel(false);
  const compare = document.getElementById('compare') as HTMLInputElement;
  compare.onchange = () => map.setCompare(compare.checked);
  if (window.innerWidth <= 900) document.getElementById('legend')!.classList.add('collapsed');
  document.getElementById('legend-toggle')!.onclick = () => document.getElementById('legend')!.classList.toggle('collapsed');
  window.addEventListener('keydown', (ev) => {
    if ((ev.target as HTMLElement).tagName === 'INPUT') return;
    if (ev.key === 'ArrowRight') (stop(), step(1));
    if (ev.key === 'ArrowLeft') (stop(), step(-1));
    if (ev.key === ' ') (ev.preventDefault(), document.getElementById('play')!.click());
  });

  map.onZoneClick = (z, x, y) => {
    const tip = document.getElementById('tip')!;
    tip.innerHTML = `<b>${z.properties.label}</b><br><span>${z.properties.kind === 'iraqHeld' ? 'Held by Iraq' : z.properties.kind === 'iranHeld' ? 'Held by Iran' : 'Contested / not fully controlled'}</span>${z.properties.note ? `<p>${z.properties.note}</p>` : ''}`;
    tip.style.left = `${x + 12}px`;
    tip.style.top = `${y + 12}px`;
    tip.hidden = false;
    setTimeout(() => window.addEventListener('pointerdown', () => (tip.hidden = true), { once: true }), 0);
  };

  window.addEventListener('hashchange', () => {
    const i = events.findIndex((e) => e.id === location.hash.slice(1));
    if (i >= 0 && i !== selected) (stop(), select(i));
  });
  const hashed = events.findIndex((e) => e.id === location.hash.slice(1));
  if (hashed >= 0) select(hashed);
  else {
    // open on the moment that shows the most: the furthest Iraqi advance
    const p = PHASES.find((ph) => ph.id === 'invasion-max')!;
    setPhase(p, false);
    timeline.setCursor(parseDate(p.date));
    renderPhase(card, p, control.get(p.id)!, parseDate(p.date));
    openPanel(window.innerWidth > 900);
  }
  document.body.classList.add('ready');
}

main();
