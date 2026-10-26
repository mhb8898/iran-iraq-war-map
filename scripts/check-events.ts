// Consistency checks for the historical data: `npm run check`.
//
// Each event is tested against the map it is shown on (the control snapshot before and after it),
// against its own Wikipedia summary, and for plain data mistakes. Findings are warnings for a human
// to judge — front lines are approximate, so a flag means "look at this", not "this is wrong".
import { readFileSync } from 'node:fs';
import { geoArea, geoContains } from 'd3-geo';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { buildControl, rewind, type Base, type Wiki } from '../src/geo';
import { EVENTS } from '../src/data/events';
import { PHASES } from '../src/data/phases';
import { ZONES } from '../src/data/zones';
import { placeById } from '../src/data/places';
import { SITES, siteById } from '../src/data/sites';
import { refById } from '../src/data/refs';
import { phaseAfter, phaseBefore, parseDate } from '../src/phase-logic';
import type { Arrow, LonLat, Phase, WarEvent } from '../src/types';

const geo = JSON.parse(readFileSync(new URL('../public/data/base.json', import.meta.url), 'utf8')) as Base;
const wiki = JSON.parse(readFileSync(new URL('../public/data/wiki.json', import.meta.url), 'utf8')) as Wiki;
for (const fc of [geo.countries]) fc.features.forEach(rewind);
const control = buildControl(geo);

type Side = 'iran' | 'iraq';
type Owner = Side | 'contested' | 'other' | 'sea';
const enemy = (s: Side): Side => (s === 'iran' ? 'iraq' : 'iran');
const KM_DEG = 111.32;

/** Who controls a point in a given snapshot: contested zones first, then held zones, then the country itself. */
function owner(p: LonLat, phase: Phase): Owner {
  const fs = control.get(phase.id)!.features;
  for (const kind of ['contested', 'iraqHeld', 'iranHeld'] as const)
    for (const f of fs) if (f.properties.kind === kind && geoContains(f, p)) return kind === 'contested' ? 'contested' : kind === 'iraqHeld' ? 'iraq' : 'iran';
  for (const c of geo.countries.features)
    if (geoContains(c as Feature<Polygon | MultiPolygon>, p)) return c.properties.iso === 'IRN' ? 'iran' : c.properties.iso === 'IRQ' ? 'iraq' : 'other';
  return 'sea';
}

/** True if any point within `km` of p is controlled by one of `want` (front lines are drawn to ±5–10 km). */
function near(p: LonLat, want: Owner[], phase: Phase, km = 10) {
  const probes: LonLat[] = [p];
  for (const r of [km / 2, km])
    for (let a = 0; a < 360; a += 45) {
      const rad = (a * Math.PI) / 180;
      probes.push([p[0] + (Math.cos(rad) * r) / (KM_DEG * Math.cos((p[1] * Math.PI) / 180)), p[1] + (Math.sin(rad) * r) / KM_DEG]);
    }
  return probes.some((q) => want.includes(owner(q, phase)));
}

interface Finding {
  level: 'error' | 'warn' | 'info';
  event?: WarEvent;
  msg: string;
}
const findings: Finding[] = [];
const flag = (level: Finding['level'], event: WarEvent | undefined, msg: string) => {
  if (event && ACCEPTED.some(([id, frag]) => id === event.id && msg.includes(frag))) return;
  findings.push({ level, event, msg });
};
const fmt = (p: LonLat) => `[${p[0].toFixed(2)}, ${p[1].toFixed(2)}]`;
const arrowName = (a: Arrow, i: number) => `arrow ${i + 1}${a.label ? ` "${a.label}"` : ''}`;
const isGround = (a: Arrow) => !a.kind || a.kind === 'attack' || a.kind === 'counter' || a.kind === 'retreat';
const WAR = ['1980-09-22', '1988-08-20'];

// Flags a human has looked at and accepted, with the reason. Keyed by event id and a fragment of the message.
const ACCEPTED: [string, string, string][] = [
  ['ceasefire', "don't match Wikipedia", 'the UNIIMOG article dates the resolution that created it (9 Aug); the ceasefire itself was 20 Aug'],
  ['h3', 'focus box', 'the camera frames the low-level leg; Hamadan, where the route starts, is deliberately off-screen'],
];

// ── per-event checks ────────────────────────────────────────────────────────────
const wikiUse = new Map<string, number>();
for (const e of EVENTS) if (e.wiki) wikiUse.set(e.wiki, (wikiUse.get(e.wiki) ?? 0) + 1);
const ids = new Set<string>();

for (const e of EVENTS) {
  if (ids.has(e.id)) flag('error', e, `duplicate id`);
  ids.add(e.id);
  const before = phaseBefore(e), after = phaseAfter(e);
  const held = (p: Phase) => p.iraqHeld.length + p.iranHeld.length;

  // dates
  if (Number.isNaN(parseDate(e.date).getTime()) || (e.end && Number.isNaN(parseDate(e.end).getTime()))) flag('error', e, `bad date`);
  if (e.end && e.end < e.date) flag('error', e, `ends (${e.end}) before it starts (${e.date})`);

  // references and places
  for (const r of e.refs ?? []) if (!refById[r]) flag('error', e, `unknown reference "${r}"`);
  for (const id of e.places ?? []) if (!placeById[id]) flag('error', e, `unknown place "${id}"`);
  for (const id of e.sites ?? []) {
    const s = siteById[id];
    if (!s) flag('error', e, `unknown site "${id}"`);
    else if ((s.from && (e.end ?? e.date) < s.from) || (s.to && e.date > s.to)) flag('warn', e, `site "${id}" is highlighted but only exists ${s.from ?? '…'} to ${s.to ?? '…'}`);
  }
  e.arrows?.forEach((a, i) => { if (a.unit !== undefined && !a.unit.trim()) flag('error', e, `${arrowName(a, i)}: empty unit`); });
  for (const f of e.forces ?? []) if (!f.unit.trim()) flag('error', e, `empty force entry`);
  for (const ar of e.areas ?? []) if (ar.shape.length < 3) flag('error', e, `area "${ar.label}" needs at least 3 points`);
  if (e.wiki && !wiki[e.wiki]) flag('error', e, `Wikipedia title "${e.wiki}" not in wiki.json (run scripts/fetch-wiki.mjs)`);

  // the map has context for fighting
  const fighting = (e.kind === 'operation' || e.kind === 'battle') && e.date >= WAR[0] && e.date <= WAR[1];
  // the map must not fall back to a pre-war snapshot for wartime fighting (the Dezful bug)
  if (fighting && before.date < WAR[0] && e.date > '1980-09-28')
    flag('warn', e, `fighting on ${e.date}, but the map before it is the pre-war snapshot "${before.label}" (${before.date}) — add a snapshot`);
  if (fighting && e.arrows?.some(isGround) && !held(before) && !held(after))
    flag('info', e, `neither the before (${before.id}) nor after (${after.id}) map shows occupied territory — fine for attacks across the border`);
  if (fighting && (e.outcome === 'iran' || e.outcome === 'iraq') && e.side === e.outcome && before.id === after.id && e.arrows?.some((a) => a.side === e.side && isGround(a) && a.kind !== 'counter'))
    flag('info', e, `${e.outcome} succeeds, but the map is the same before and after (${before.id}) — fine for raids, worth a look for offensives`);

  // arrows vs. the map they are drawn on
  // an arrow that starts where an earlier arrow of the same side ended is a later stage of the same push
  const stageStarts = new Set((e.arrows ?? []).map((a) => `${a.side}:${a.path[a.path.length - 1].join()}`));
  e.arrows?.forEach((a, i) => {
    const name = arrowName(a, i);
    const start = a.path[0], end = a.path[a.path.length - 1];
    const chained = stageStarts.has(`${a.side}:${start.join()}`);
    for (const p of a.path) {
      const [w, s, ea, n] = geo.bbox;
      if (p[0] < w - 0.01 || p[0] > ea + 0.01 || p[1] < s - 0.01 || p[1] > n + 0.01) flag('error', e, `${name}: point ${fmt(p)} outside the map${a.offMap ? '' : ' (use offMap for targets beyond the edge)'}`);
    }
    if (a.side !== 'iran' && a.side !== 'iraq') return;
    const side = a.side, foe = enemy(side);

    if (a.kind === 'air' || a.kind === 'missile') {
      if (!near(start, [side, 'contested'], before, 25)) flag('warn', e, `${name}: ${side} ${a.kind} launches from ${fmt(start)}, which the map shows as ${owner(start, before)} ground`);
      return;
    }
    if (a.kind === 'naval') return;
    if (!isGround(a)) return;

    if (!chained && !near(start, [side, 'contested'], before)) flag('warn', e, `${name}: ${side} ${a.kind ?? 'attack'} starts at ${fmt(start)}, ${owner(start, before)}-held on the "${before.label}" map`);
    if (a.kind === 'retreat') {
      if (!near(end, [side, 'contested'], after)) flag('warn', e, `${name}: retreat ends at ${fmt(end)}, not on ${side}-held ground after`);
      return;
    }
    if (a.kind === 'counter') return; // counter-attacks often strike into their own lost ground
    if (!near(end, [foe, 'contested'], before)) flag('warn', e, `${name}: ${side} attack ends at ${fmt(end)} on its own ground (${owner(end, before)}) — target isn't enemy-held before`);
    if (e.side === side && e.outcome === side && fighting && !near(end, [side, 'contested'], after, 6))
      flag('warn', e, `${name}: ${side} wins, yet the arrow's target ${fmt(end)} is still ${owner(end, after)}-held on the after map ("${after.label}")`);
    if (e.side === side && e.outcome === foe && owner(end, after) === side)
      flag('warn', e, `${name}: ${side} loses, yet the target ${fmt(end)} shows as ${side}-held afterwards ("${after.label}")`);
  });

  // camera
  if (e.focus) {
    const [w, s, ea, n] = e.focus;
    const pts = [...(e.arrows ?? []).flatMap((a) => (a.offMap ? a.path : a.path)), ...(e.places ?? []).map((id) => placeById[id]?.at).filter(Boolean)] as LonLat[];
    const out = pts.filter((p) => p[0] < w - 0.05 || p[0] > ea + 0.05 || p[1] < s - 0.05 || p[1] > n + 0.05);
    // air strikes may launch from off-screen; ground arrows should be fully in view
    const groundPts = (e.arrows ?? []).filter((a) => a.kind !== 'air' && a.kind !== 'missile').flatMap((a) => a.path);
    const airPts = (e.arrows ?? []).filter((a) => a.kind === 'air' || a.kind === 'missile').flatMap((a) => a.path.slice(1));
    const groundOut = out.filter((p) => groundPts.includes(p) || airPts.includes(p));
    if (groundOut.length) flag('warn', e, `focus box leaves ${groundOut.length} arrow point(s) off-screen, e.g. ${fmt(groundOut[0])}`);
  }

  // dates vs. Wikipedia's summary (only when the article is about this event alone)
  const w = e.wiki && wiki[e.wiki];
  if (w && wikiUse.get(e.wiki!) === 1 && (e.kind !== 'political' || /\d{4}/.test(w.extract))) {
    const found = extractDates(w.extract);
    if (found.length) {
      const lo = parseDate(e.date).getTime() - 3 * 864e5, hi = parseDate(e.end ?? e.date).getTime() + 3 * 864e5;
      const hit = found.some((d) => d.getTime() >= lo && d.getTime() <= hi);
      const sameYear = found.some((d) => d.getUTCFullYear() === parseDate(e.date).getUTCFullYear());
      if (!hit) flag(sameYear ? 'warn' : 'info', e, `dates ${e.date}${e.end ? `–${e.end}` : ''} don't match Wikipedia's summary, which mentions ${found.map((d) => d.toISOString().slice(0, 10)).join(', ')}`);
    }
  }

  // name vs. article title
  if (w && wikiUse.get(e.wiki!) === 1) {
    const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const a = norm(e.name), b = norm(w.title);
    if (!a.includes(b) && !b.includes(a)) flag('info', e, `named "${e.name}" here but Wikipedia's article is "${w.title}"`);
  }
}

function extractDates(text: string): Date[] {
  const M = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const out: Date[] = [];
  const add = (d: string, m: string, y: string) => {
    const mi = M.indexOf(m.toLowerCase());
    if (mi >= 0 && +y > 1900 && +y < 2030) out.push(new Date(Date.UTC(+y, mi, +d)));
  };
  for (const m of text.matchAll(/\b(\d{1,2})(?:\s*[–-]\s*\d{1,2})?\s+([A-Z][a-z]+),?\s+(\d{4})/g)) add(m[1], m[2], m[3]);
  for (const m of text.matchAll(/\b([A-Z][a-z]+)\s+(\d{1,2})(?:\s*[–-]\s*\d{1,2})?,\s+(\d{4})/g)) add(m[2], m[1], m[3]);
  return out;
}

// ── strategic sites ─────────────────────────────────────────────────────────────
const siteIds = new Set<string>();
for (const s of SITES) {
  if (siteIds.has(s.id)) flag('error', undefined, `duplicate site id "${s.id}"`);
  siteIds.add(s.id);
  const [w, so, ea, n] = geo.bbox;
  if (s.at[0] < w || s.at[0] > ea || s.at[1] < so || s.at[1] > n) flag('error', undefined, `site ${s.id} at ${fmt(s.at)} is outside the map`);
  if (s.from && s.to && s.from > s.to) flag('error', undefined, `site ${s.id}: from ${s.from} is after to ${s.to}`);
}

// ── zones and phases ────────────────────────────────────────────────────────────
const used = new Set(PHASES.flatMap((p) => [...p.iraqHeld, ...p.iranHeld, ...p.contested]));
for (const p of PHASES) {
  for (const id of [...p.iraqHeld, ...p.iranHeld, ...p.contested]) if (!ZONES.some((z) => z.id === id)) flag('error', undefined, `phase ${p.id}: unknown zone "${id}"`);
  for (const f of control.get(p.id)!.features) {
    const km2 = geoArea(f) * 6371.0088 ** 2;
    if (km2 < 1) flag('error', undefined, `phase ${p.id}: zone ${f.properties.id} is empty after clipping (check its "on" country)`);
  }
}
for (const z of ZONES) if (!used.has(z.id)) flag('info', undefined, `zone ${z.id} is never used by any phase`);
for (let i = 1; i < PHASES.length; i++) if (PHASES[i].date <= PHASES[i - 1].date) flag('error', undefined, `phases out of order: ${PHASES[i - 1].id} → ${PHASES[i].id}`);

// ── report ──────────────────────────────────────────────────────────────────────
const order = { error: 0, warn: 1, info: 2 } as const;
const icon = { error: '✗', warn: '!', info: '·' } as const;
const only = process.argv.includes('--all') ? ['error', 'warn', 'info'] : ['error', 'warn'];
const shown = findings.filter((f) => only.includes(f.level)).sort((a, b) => order[a.level] - order[b.level] || (a.event?.date ?? '').localeCompare(b.event?.date ?? ''));
let last = '';
for (const f of shown) {
  const head = f.event ? `${f.event.date}  ${f.event.id} — ${f.event.name}` : 'zones & phases';
  if (head !== last) console.log(`\n${head}`);
  last = head;
  console.log(`  ${icon[f.level]} ${f.msg}`);
}
const count = (l: Finding['level']) => findings.filter((f) => f.level === l).length;
console.log(`\n${EVENTS.length} events, ${PHASES.length} phases, ${ZONES.length} zones: ${count('error')} errors, ${count('warn')} warnings, ${count('info')} notes${only.includes('info') ? '' : ' (--all to show notes)'}`);
process.exit(count('error') ? 1 : 0);
