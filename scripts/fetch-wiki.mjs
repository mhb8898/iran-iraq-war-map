// Pulls intro text, lead photo, coordinates and the Persian-language link for every
// Wikipedia title referenced in src/data/events.ts into public/data/wiki.json, then
// cross-checks src/data/places.ts coordinates against Wikipedia's.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const UA = { 'User-Agent': 'iran-iraq-war-map/0.1 (personal history map; contact via GitHub mhb8898)' };
const src = readFileSync(new URL('../src/data/events.ts', import.meta.url), 'utf8');
const titles = [...new Set([...src.matchAll(/wiki: '((?:[^'\\]|\\.)+)'/g)].map((m) => m[1].replace(/\\'/g, "'")))];
const outFile = new URL('../public/data/wiki.json', import.meta.url);
const out = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(params) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  for (const [k, v] of Object.entries({ action: 'query', format: 'json', formatversion: '2', redirects: '1', ...params })) u.searchParams.set(k, v);
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(u, { headers: UA });
    if (res.ok) return res.json();
    if (attempt > 6) throw new Error(`${res.status} ${await res.text()}`);
    await sleep(2000 * 2 ** attempt);
  }
}

// Map requested → canonical titles through normalisation and redirects.
function resolver(q) {
  const m = new Map();
  for (const n of q.normalized ?? []) m.set(n.from, n.to);
  for (const r of q.redirects ?? []) m.set(r.from, r.to);
  return (t) => { let c = t; for (let i = 0; i < 3 && m.has(c); i++) c = m.get(c); return c; };
}

// Town articles double as photo fallbacks for operations whose article has no lead image.
const PLACE_TITLE = { 'Al-Faw': 'Al-Faw', Shush: 'Shush, Iran', Abadan: 'Abadan, Iran', Bostan: 'Bostan, Iran', Mehran: 'Mehran, Iran', Sumar: 'Sumar, Iran', Ilam: 'Ilam, Iran', Badra: 'Badra, Iraq', Musian: 'Musian, Iran', 'Majnoon Islands': 'Majnoon oil field', Penjwen: 'Penjwen District', 'Haj Omran': 'Haji Omaran', Kut: 'Kut' };
const placeRows = [...readFileSync(new URL('../src/data/places.ts', import.meta.url), 'utf8').matchAll(/id: '([^']+)', name: '([^']+)'.*?at: \[([\d.]+), ([\d.]+)\]/g)];
const placeTitles = placeRows.map((m) => PLACE_TITLE[m[2]] ?? m[2]);
titles.push(...placeTitles.filter((t) => !titles.includes(t)));
const todo = titles.filter((t) => !out[t]);
const missing = [];
for (let i = 0; i < todo.length; i += 15) {
  const batch = todo.slice(i, i + 15);
  const j = await api({
    prop: 'extracts|pageimages|coordinates|langlinks|info', inprop: 'url',
    exintro: '1', explaintext: '1', exsentences: '4', exlimit: 'max',
    piprop: 'thumbnail|name', pithumbsize: '640', pilimit: 'max',
    lllang: 'fa', lllimit: 'max', colimit: 'max',
    titles: batch.join('|'),
  });
  const canon = resolver(j.query);
  const pages = Object.fromEntries(j.query.pages.map((p) => [p.title, p]));
  for (const t of batch) {
    const p = pages[canon(t)];
    if (!p || p.missing) { missing.push(t); continue; }
    const fa = p.langlinks?.[0]?.title;
    out[t] = {
      title: p.title,
      url: p.fullurl,
      extract: p.extract ?? '',
      ...(p.thumbnail && { thumb: { src: p.thumbnail.source, width: p.thumbnail.width, height: p.thumbnail.height } }),
      ...(p.pageimage && { image: p.pageimage }),
      ...(p.coordinates && { coords: [p.coordinates[0].lon, p.coordinates[0].lat] }),
      ...(fa && { fa: { title: fa, url: `https://fa.wikipedia.org/wiki/${encodeURIComponent(fa.replace(/ /g, '_'))}` } }),
    };
  }
  await sleep(1500);
}
out._places = Object.fromEntries(placeRows.map((m, i) => [m[1], placeTitles[i]]));
writeFileSync(outFile, JSON.stringify(out, null, 1));
console.log(`wiki: ${Object.keys(out).length} entries, missing: ${missing.length ? missing.join(' | ') : 'none'}`);
for (const t of titles) if (out[t] && !out[t].thumb && !placeTitles.includes(t)) console.log(`  no photo: ${t}`);

// Place coordinate check
const places = placeRows.map((m) => [m[0], m[2], m[3], m[4]]);
const ptitles = placeTitles;
for (let i = 0; i < ptitles.length; i += 40) {
  const j = await api({ prop: 'coordinates', colimit: 'max', titles: ptitles.slice(i, i + 40).join('|') });
  const canon = resolver(j.query);
  const pages = Object.fromEntries(j.query.pages.map((p) => [p.title, p]));
  for (let k = i; k < Math.min(i + 40, ptitles.length); k++) {
    const p = pages[canon(ptitles[k])];
    const c = p?.coordinates?.[0];
    const [lon, lat] = [+places[k][2], +places[k][3]];
    if (!c) { console.log(`  ? ${places[k][1]}: no wiki coords`); continue; }
    const km = Math.hypot((c.lon - lon) * 111 * Math.cos((lat * Math.PI) / 180), (c.lat - lat) * 111);
    if (km > 4) console.log(`  ! ${places[k][1]} off by ${km.toFixed(1)} km → wiki [${c.lon.toFixed(3)}, ${c.lat.toFixed(3)}]`);
  }
  await sleep(1500);
}
