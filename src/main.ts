import './style.css';
import { timer } from 'd3-timer';
import { easeCubicOut } from 'd3-ease';
import { buildControl, loadData } from './geo';
import { WarMap, SITE_GLYPH, SITE_KIND_NAME, type ArrowState } from './map';
import { Overview } from './overview';
import { Timeline } from './timeline';
import { parseDate, phaseAt, phaseBefore, phaseAfter } from './phase-logic';
import { renderEvent, renderPhase } from './panel';
import { EVENTS } from './data/events';
import { PHASES } from './data/phases';
import { placeById } from './data/places';
import { setupSupport } from './support';
import type { Phase, WarEvent } from './types';

const THEATRE: [number, number, number, number] = [44.2, 29.6, 50.2, 37.3];

const events = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));

type SideFilter = 'all' | 'iran' | 'iraq';
// An event belongs to a side if that side started it or won it (Iraq "wins" the Iranian
// offensives it stopped). MEK operations count as Iraqi-backed; shared diplomacy shows under both.
const involves = (e: WarEvent, f: SideFilter) =>
  f === 'all' || e.side === f || e.outcome === f || e.side === 'both' ||
  (e.kind === 'political' && !e.side) || (f === 'iraq' && e.side === 'other' && e.kind === 'operation');
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
  const overview = new Overview(document.getElementById('overview')!, geo, (p) => map.panTo(p));
  map.onView = (b) => overview.setView(b);
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
    overview.setPhase(p, control.get(p.id)!.features, control.get(p.id)!);
    map.setHistoricBorder(p.border);
    document.getElementById('phase-label')!.textContent = `${p.label} · ${parseDate(p.date).getUTCFullYear()}`;
  };

  // Phones get a bottom sheet: 'peek' shows just the title bar over the map, 'true' slides the card up.
  const isPhone = () => window.matchMedia('(max-width: 900px)').matches;
  const openPanel = (open: boolean) => {
    panel.dataset.open = open ? (isPhone() ? 'peek' : 'true') : 'false';
    mapEl.dataset.panel = open ? 'open' : 'closed';
  };
  const setPeek = (title: string, sub: string) => {
    document.getElementById('peek-title')!.textContent = title;
    document.getElementById('peek-sub')!.textContent = sub;
  };
  document.getElementById('panel-peek')!.onclick = () => {
    panel.dataset.open = panel.dataset.open === 'true' ? 'peek' : 'true';
  };
  // phones: overview, legend and the support links each sit behind a map button, one open at a time
  const sheets = { overview: 'show-overview', legend: 'show-legend', support: 'show-support' } as const;
  const toggleSheet = (name: keyof typeof sheets) => {
    const on = !document.body.classList.contains(sheets[name]);
    for (const [k, cls] of Object.entries(sheets)) {
      document.body.classList.toggle(cls, on && k === name);
      document.getElementById(`toggle-${k}`)!.setAttribute('aria-pressed', String(on && k === name));
    }
  };
  for (const k of Object.keys(sheets) as (keyof typeof sheets)[]) document.getElementById(`toggle-${k}`)!.onclick = () => toggleSheet(k);
  setupSupport();
  // tapping the map puts the legend / overview away again
  mapEl.addEventListener('pointerdown', () => {
    if (!isPhone()) return;
    document.body.classList.remove(...Object.values(sheets));
    document.querySelectorAll('.map-controls [aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  });

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
      map.setDate(d.toISOString().slice(0, 10));
      const p = phaseAt(d);
      setPhase(p);
      renderPhase(card, p, control.get(p.id)!, d);
      setPeek(p.label, d.toISOString().slice(0, 10));
      openPanel(true);
      history.replaceState(null, '', ' ');
    },
  });

  function animateArrows(e: WarEvent, after: Phase) {
    anim?.stop();
    const arrows: ArrowState[] = (e.arrows ?? []).map((arrow) => ({ arrow, t: 0 }));
    map.setArrows(arrows, e.areas);
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
    setPeek(e.name, e.end && e.end !== e.date ? `${e.date} → ${e.end}` : e.date);
    renderEvent(card, e, wiki, { phaseBefore: before, phaseAfter: after, statsAfter: control.get(after.id)!, index: i, total: events.length });
    card.scrollTop = 0;
    card.querySelector('.replay')?.addEventListener('click', () => {
      setPhase(before, false);
      animateArrows(e, after);
    });
    map.setHighlighted(e.places ?? [], e.sites);
    map.setDate(e.date);
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
  document.getElementById('close-panel')!.onclick = () => (isPhone() && panel.dataset.open === 'true' ? (panel.dataset.open = 'peek') : openPanel(false));
  const compare = document.getElementById('compare') as HTMLInputElement;
  compare.onchange = () => map.setCompare(compare.checked);
  const showSites = document.getElementById('show-sites') as HTMLInputElement;
  showSites.onchange = () => map.setShowSites(showSites.checked);
  const LEGEND_SITES: [keyof typeof SITE_GLYPH, string, string][] = [
    ['airbase', 'iran', 'Air base'], ['oil', 'iran', 'Oil field, refinery or terminal'], ['port', 'iran', 'Port'], ['nuclear', 'iraq', 'Nuclear site'],
    ['dam', 'iran', 'Dam'], ['pass', 'iran', 'Mountain pass'], ['garrison', 'iran', 'Army division base'], ['command', 'iraq', 'Corps sector / command'],
  ];
  document.getElementById('legend-sites')!.innerHTML = LEGEND_SITES.map(([k, side, text]) =>
    `<li><svg class="lg-site" viewBox="-11 -9 22 18"><g class="site k-${k} side-${side}"><g class="glyph">${SITE_GLYPH[k].replace(/V15/, 'V9')}</g></g></svg>${text}</li>`).join('');
  // the legend and the overview share the left column; on short screens the legend starts folded
  if (!isPhone() && window.innerHeight < 960) document.getElementById('legend')!.classList.add('collapsed');
  document.getElementById('legend-toggle')!.onclick = () => document.getElementById('legend')!.classList.toggle('collapsed');
  window.addEventListener('keydown', (ev) => {
    if ((ev.target as HTMLElement).tagName === 'INPUT') return;
    if (ev.key === 'ArrowRight') (stop(), step(1));
    if (ev.key === 'ArrowLeft') (stop(), step(-1));
    if (ev.key === ' ') (ev.preventDefault(), document.getElementById('play')!.click());
  });

  const showTip = (html: string, x: number, y: number) => {
    const tip = document.getElementById('tip')!;
    tip.innerHTML = html;
    tip.style.left = `${Math.max(8, Math.min(x + 12, window.innerWidth - 290))}px`;
    tip.style.top = `${y + 12}px`;
    tip.hidden = false;
    setTimeout(() => window.addEventListener('pointerdown', () => (tip.hidden = true), { once: true }), 0);
  };
  const escHtml = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  map.onSiteClick = (s, x, y) =>
    showTip(`<b>${escHtml(s.name)}</b>${s.fa ? ` <span dir="rtl" lang="fa" class="tip-fa">${escHtml(s.fa)}</span>` : ''}<br><span>${SITE_KIND_NAME[s.kind]} · ${s.side === 'iran' ? 'Iran' : 'Iraq'}</span><p>${escHtml(s.note)}</p>`, x, y);
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
    map.setDate(p.date);
    timeline.setCursor(parseDate(p.date));
    renderPhase(card, p, control.get(p.id)!, parseDate(p.date));
    setPeek(p.label, p.date);
    openPanel(true);
  }
  document.body.classList.add('ready');
}

main();
