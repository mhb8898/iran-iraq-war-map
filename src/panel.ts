import type { Force, Phase, WarEvent, WikiEntry } from './types';
import type { Wiki } from './geo';
import { refById } from './data/refs';
import { zoneById } from './data/zones';
import { sideColor } from './timeline';
import { siteById } from './data/sites';
import { COLORS, SITE_GLYPH, SITE_KIND_NAME } from './map';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fmt = (s: string) => new Date(`${s}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const km = (n: number) => (n < 50 ? '—' : `≈ ${(Math.round(n / 100) * 100).toLocaleString('en')} km²`);

const KIND: Record<WarEvent['kind'], string> = { operation: 'Operation', battle: 'Battle', air: 'Air & missile war', naval: 'Naval', political: 'Diplomacy & politics', atrocity: 'Atrocity' };
const OUTCOME = { iran: 'Iranian success', iraq: 'Iraqi success', stalemate: 'Inconclusive' } as const;

export interface PanelCtx {
  phaseBefore: Phase;
  phaseAfter: Phase;
  statsAfter: { iraqHeldKm2: number; iranHeldKm2: number; contestedKm2: number };
  index: number;
  total: number;
}

const SIDE_NAME = { iran: 'Iran', iraq: 'Iraq', other: 'Others' } as const;

/** Order of battle: the units on the arrows (with the axis they took) plus the event's other forces, by side. */
function forcesHtml(ev: WarEvent) {
  const all: Force[] = [
    ...(ev.arrows ?? []).filter((a) => a.unit).map((a) => ({ side: a.side, unit: a.unit!, note: a.label && `axis: ${a.label}` })),
    ...(ev.forces ?? []),
  ];
  const seen = new Set<string>();
  const rows = all.filter((f) => !seen.has(`${f.side}:${f.unit}`) && seen.add(`${f.side}:${f.unit}`));
  if (!rows.length) return '';
  const first = ev.side === 'iraq' || ev.side === 'other' ? ['iraq', 'other', 'iran'] : ['iran', 'iraq', 'other'];
  const groups = first.map((side) => [side, rows.filter((f) => f.side === side)] as const).filter(([, fs]) => fs.length);
  return `<section class="forces">
    <h3>Forces involved</h3>
    ${groups.map(([side, fs]) => `<div class="side" style="--c:${COLORS[side as keyof typeof COLORS]}"><h4>${SIDE_NAME[side as keyof typeof SIDE_NAME]}</h4><ul>${fs.map((f) => `<li><b>${esc(f.unit)}</b>${f.note ? ` <span>— ${esc(f.note)}</span>` : ''}</li>`).join('')}</ul></div>`).join('')}
    <p class="muted small">Formations as named in the cited histories and Wikipedia's orders of battle; tags on the map mark the axis each one took.</p>
  </section>`;
}

function sitesHtml(ev: WarEvent) {
  const sites = (ev.sites ?? []).map((id) => siteById[id]).filter(Boolean);
  if (!sites.length) return '';
  return `<section class="key-sites"><h3>Strategic sites</h3><ul class="sites-list">${sites.map((s) =>
    `<li><svg width="22" height="18" viewBox="-11 -9 22 18" class="lg-site"><g class="site k-${s.kind} side-${s.side}"><g class="glyph">${SITE_GLYPH[s.kind].replace(/V15/, 'V9')}</g></g></svg><span><b>${esc(s.name)}</b> <span class="muted">· ${SITE_KIND_NAME[s.kind]}</span><br>${esc(s.note)}</span></li>`).join('')}</ul></section>`;
}

export function photoFor(ev: WarEvent, wiki: Wiki): { entry: WikiEntry; via?: string } | undefined {
  const own = ev.wiki ? wiki[ev.wiki] : undefined;
  if (own?.thumb) return { entry: own };
  for (const id of ev.places ?? []) {
    const t = wiki._places[id];
    if (t && wiki[t]?.thumb) return { entry: wiki[t], via: wiki[t].title };
  }
}

export function renderEvent(el: HTMLElement, ev: WarEvent, wiki: Wiki, ctx: PanelCtx) {
  const w = ev.wiki ? wiki[ev.wiki] : undefined;
  const photo = photoFor(ev, wiki);
  const dates = ev.end && ev.end !== ev.date ? `${fmt(ev.date)} – ${fmt(ev.end)}` : fmt(ev.date);
  const changed = ctx.phaseBefore.id !== ctx.phaseAfter.id;
  const zones = [...ctx.phaseAfter.iraqHeld.map((z) => ['iraqHeld', z]), ...ctx.phaseAfter.iranHeld.map((z) => ['iranHeld', z]), ...ctx.phaseAfter.contested.map((z) => ['contested', z])];

  el.innerHTML = `
    ${photo ? `<figure class="photo">
      <img src="${esc(photo.entry.thumb!.src)}" alt="${esc(photo.entry.title)}" loading="lazy">
      <figcaption>${photo.via ? `${esc(photo.via)} · ` : ''}Image via <a href="${esc(photo.entry.image ? `https://en.wikipedia.org/wiki/File:${encodeURIComponent(photo.entry.image)}` : photo.entry.url)}" target="_blank" rel="noopener">Wikipedia / Commons</a> — see file page for licence</figcaption>
    </figure>` : ''}
    <div class="card-body">
      <div class="chips">
        <span class="chip kind" style="--c:${sideColor(ev)}">${KIND[ev.kind]}</span>
        ${ev.outcome ? `<span class="chip outcome o-${ev.outcome}">${OUTCOME[ev.outcome]}</span>` : ''}
        <span class="count">${ctx.index + 1} / ${ctx.total}</span>
      </div>
      <h2>${esc(ev.name)}</h2>
      ${ev.fa ? `<div class="fa-title" dir="rtl" lang="fa">${esc(ev.fa)}</div>` : ''}
      ${ev.ar ? `<div class="ar-title"><span>Iraqi name</span><b dir="rtl" lang="ar">${esc(ev.ar)}</b></div>` : ''}
      <div class="dates">${dates}</div>
      <p class="summary">${esc(ev.summary)}</p>
      ${ev.arrows?.length ? `<button class="replay" type="button">↻ Replay the movement</button>` : ''}
      ${forcesHtml(ev)}
      ${sitesHtml(ev)}

      <section class="lines">
        <h3>Lines of control ${changed ? `<span class="arrow">${esc(ctx.phaseBefore.label)} → ${esc(ctx.phaseAfter.label)}</span>` : `· ${esc(ctx.phaseAfter.label)}`}</h3>
        <p>${esc(ctx.phaseAfter.note)}</p>
        <dl class="ledger">
          <div><dt><i class="sw iraqHeld"></i>Iranian soil held by Iraq</dt><dd>${km(ctx.statsAfter.iraqHeldKm2)}</dd></div>
          <div><dt><i class="sw iranHeld"></i>Iraqi soil held by Iran</dt><dd>${km(ctx.statsAfter.iranHeldKm2)}</dd></div>
          <div><dt><i class="sw contested"></i>Contested / not fully controlled</dt><dd>${km(ctx.statsAfter.contestedKm2)}</dd></div>
        </dl>
        ${zones.length ? `<ul class="zones">${zones.map(([k, id]) => `<li><i class="sw ${k}"></i><span><b>${esc(zoneById[id].label)}</b>${zoneById[id].note ? ` — ${esc(zoneById[id].note!)}` : ''}</span></li>`).join('')}</ul>` : '<p class="muted">No territory across the international border is held by either side.</p>'}
        <p class="muted small">Areas are measured from the hand-drawn zones on this map, not from official figures.</p>
      </section>

      ${w ? `<section class="wiki">
        <h3>From Wikipedia</h3>
        <p>${esc(w.extract)}</p>
        <p class="links">
          <a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)} ↗</a>
          ${w.fa ? `<a href="${esc(w.fa.url)}" target="_blank" rel="noopener" dir="rtl" lang="fa">${esc(w.fa.title)} ↗</a>` : ''}
        </p>
      </section>` : ''}

      ${ev.refs?.length ? `<section class="refs"><h3>References</h3><ol>${ev.refs.map((r) => refById[r]).filter(Boolean).map((r) => `<li>${esc(r.cite)}${r.url ? ` <a href="${esc(r.url)}" target="_blank" rel="noopener">link ↗</a>` : ''}</li>`).join('')}</ol></section>` : ''}
    </div>`;
}

export function renderPhase(el: HTMLElement, phase: Phase, stats: PanelCtx['statsAfter'], date: Date) {
  const zones = [...phase.iraqHeld.map((z) => ['iraqHeld', z]), ...phase.iranHeld.map((z) => ['iranHeld', z]), ...phase.contested.map((z) => ['contested', z])];
  el.innerHTML = `<div class="card-body">
    <div class="chips"><span class="chip kind" style="--c:#e9e1cf">Map state</span></div>
    <h2>${esc(phase.label)}</h2>
    <div class="dates">${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })} · snapshot of ${fmt(phase.date)}</div>
    <p class="summary">${esc(phase.note)}</p>
    <dl class="ledger">
      <div><dt><i class="sw iraqHeld"></i>Iranian soil held by Iraq</dt><dd>${km(stats.iraqHeldKm2)}</dd></div>
      <div><dt><i class="sw iranHeld"></i>Iraqi soil held by Iran</dt><dd>${km(stats.iranHeldKm2)}</dd></div>
      <div><dt><i class="sw contested"></i>Contested / not fully controlled</dt><dd>${km(stats.contestedKm2)}</dd></div>
    </dl>
    ${zones.length ? `<ul class="zones">${zones.map(([k, id]) => `<li><i class="sw ${k}"></i><span><b>${esc(zoneById[id].label)}</b>${zoneById[id].note ? ` — ${esc(zoneById[id].note!)}` : ''}</span></li>`).join('')}</ul>` : ''}
    <p class="muted small">Click an event on the timeline to fly to it and watch the operation.</p>
  </div>`;
}
