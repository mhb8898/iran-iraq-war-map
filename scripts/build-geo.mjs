// Clips Natural Earth 10m layers to the war theatre and writes public/data/base.json.
// Inputs: Natural Earth GeoJSON in scripts/.cache (see scripts/fetch-data.sh).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import bboxClip from '@turf/bbox-clip';

export const BBOX = [40.5, 28.3, 52.0, 38.2]; // [w, s, e, n]

const cache = new URL('./.cache/', import.meta.url);
const load = (name) => JSON.parse(readFileSync(new URL(`${name}.geojson`, cache), 'utf8'));

const round = (c) => (typeof c[0] === 'number' ? [+c[0].toFixed(4), +c[1].toFixed(4)] : c.map(round));

function intersects(f) {
  const [w, s, e, n] = BBOX;
  let hit = false;
  const walk = (c) => {
    if (hit) return;
    if (typeof c[0] === 'number') {
      if (c[0] >= w && c[0] <= e && c[1] >= s && c[1] <= n) hit = true;
    } else c.forEach(walk);
  };
  walk(f.geometry.coordinates);
  return hit;
}

function clip(features, props) {
  return features
    .filter((f) => f.geometry && intersects(f))
    .map((f) => {
      const g = f.geometry.type === 'Point' ? f.geometry : bboxClip(f, BBOX).geometry;
      // clipping leaves empty polygons/rings for parts outside the box
      if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map((p) => p.filter((r) => r.length >= 4)).filter((p) => p.length);
      if (g.type === 'Polygon') g.coordinates = g.coordinates.filter((r) => r.length >= 4);
      if (g.type === 'MultiLineString') g.coordinates = g.coordinates.filter((l) => l.length >= 2);
      return { type: 'Feature', properties: props(f.properties), geometry: { type: g.type, coordinates: round(g.coordinates) } };
    })
    .filter((f) => f.geometry.coordinates.length);
}

const countries = clip(load('ne_10m_admin_0_countries').features, (p) => ({ iso: p.ADM0_A3, name: p.NAME_EN, fa: p.NAME_FA }));

const provinces = clip(
  load('ne_10m_admin_1_states_provinces').features.filter((f) => ['IRN', 'IRQ'].includes(f.properties.adm0_a3)),
  (p) => ({ iso: p.adm0_a3, name: p.name_en || p.name, fa: p.name_fa }),
);

const borders = clip(load('ne_10m_admin_0_boundary_lines_land').features, (p) => ({
  left: p.ADM0_LEFT,
  right: p.ADM0_RIGHT,
  iranIraq: /Iran/.test(`${p.ADM0_LEFT}${p.ADM0_RIGHT}`) && /Iraq/.test(`${p.ADM0_LEFT}${p.ADM0_RIGHT}`),
}));

const rivers = clip(load('ne_10m_rivers_lake_centerlines').features, (p) => ({ name: p.name_en || p.name, fa: p.name_fa, rank: p.scalerank }));
const lakes = clip(load('ne_10m_lakes').features, (p) => ({ name: p.name_en || p.name }));

const places = clip(
  load('ne_10m_populated_places_simple').features.filter((f) => ['IRN', 'IRQ', 'KWT'].includes(f.properties.adm0_a3)),
  (p) => ({ name: p.name, iso: p.adm0_a3, pop: p.pop_max, rank: p.scalerank, capital: p.adm0cap === 1 }),
);

mkdirSync(new URL('../public/data/', import.meta.url), { recursive: true });
const out = {
  bbox: BBOX,
  countries: { type: 'FeatureCollection', features: countries },
  provinces: { type: 'FeatureCollection', features: provinces },
  borders: { type: 'FeatureCollection', features: borders },
  rivers: { type: 'FeatureCollection', features: rivers },
  lakes: { type: 'FeatureCollection', features: lakes },
  places: { type: 'FeatureCollection', features: places },
};
writeFileSync(new URL('../public/data/base.json', import.meta.url), JSON.stringify(out));
for (const [k, v] of Object.entries(out)) if (v.features) console.log(k, v.features.length);
console.log('rivers:', [...new Set(rivers.map((r) => r.properties.name))].join(', '));
console.log('borders:', borders.map((b) => `${b.properties.left}|${b.properties.right}`).join(', '));

// --- OpenStreetMap extras (Overpass dumps in .cache): rivers NE lacks, and the marshes.
const osm = ['osm_rivers', 'osm_extra'].flatMap((n) => JSON.parse(readFileSync(new URL(`${n}.json`, cache), 'utf8')).elements);
const line = (geom) => geom.map((p) => [p.lon, p.lat]);
const RIVER_EN = { 'رودخانه بهمنشیر': 'Bahmanshir River' };
const RIVER_FA = { 'Karun River': 'کارون', 'Karkheh River': 'کرخه', Dez: 'دز', 'Shatt al-Arab': 'اروندرود', 'Bahmanshir River': 'بهمنشیر', 'Tigris River': 'دجله', Euphrates: 'فرات' };

const osmRivers = [];
for (const e of osm) {
  if (e.tags.waterway !== 'river') continue;
  const name = e.tags['name:en'] || RIVER_EN[e.tags.name] || e.tags.name;
  const parts = e.type === 'way' ? [line(e.geometry)] : e.members.filter((m) => m.type === 'way' && m.geometry && m.role !== 'tributary').map((m) => line(m.geometry));
  if (osmRivers.some((r) => r.properties.osm === e.id)) continue;
  const f = { type: 'Feature', properties: { name, fa: e.tags['name:fa'] || RIVER_FA[name], osm: e.id }, geometry: { type: 'MultiLineString', coordinates: chain(parts) } };
  const g = bboxClip(f, BBOX).geometry;
  // ~250 m precision is plenty at theatre scale and keeps the file small
  f.geometry = { type: 'MultiLineString', coordinates: (g.type === 'LineString' ? [g.coordinates] : g.coordinates).map((l) => thin(l, 0.0025)) };
  osmRivers.push(f);
}

// Join a relation's ways end-to-end so a river is one line where OSM has it in pieces
// (zones in src/data/zones.ts trace front lines along rivers).
function chain(parts) {
  const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const segs = parts.map((p) => p.slice());
  const out = [];
  while (segs.length) {
    let cur = segs.shift();
    for (let grew = true; grew; ) {
      grew = false;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        if (eq(cur.at(-1), s[0])) cur = cur.concat(s.slice(1));
        else if (eq(cur.at(-1), s.at(-1))) cur = cur.concat(s.slice(0, -1).reverse());
        else if (eq(cur[0], s.at(-1))) cur = s.concat(cur.slice(1));
        else if (eq(cur[0], s[0])) cur = s.slice().reverse().concat(cur.slice(1));
        else continue;
        segs.splice(i, 1);
        grew = true;
        break;
      }
    }
    out.push(cur);
  }
  return out;
}

function thin(l, tol) {
  const out = [l[0]];
  for (const p of l.slice(1)) {
    const q = out[out.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= tol) out.push(p);
  }
  if (out.length < 2) out.push(l[l.length - 1]);
  return round(out);
}

// Stitch a multipolygon relation's outer ways into closed rings.
function rings(ways) {
  const segs = ways.map((w) => w.slice());
  const out = [];
  while (segs.length) {
    let ring = segs.shift();
    let grew = true;
    while (grew && (ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1])) {
      grew = false;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
        if (eq(ring.at(-1), s[0])) ring = ring.concat(s.slice(1));
        else if (eq(ring.at(-1), s.at(-1))) ring = ring.concat(s.slice(0, -1).reverse());
        else continue;
        segs.splice(i, 1);
        grew = true;
        break;
      }
    }
    if (ring.length > 3) out.push(thin(ring, 0.004));
  }
  return out;
}

const marshes = osm
  .filter((e) => e.tags.natural === 'wetland' && e.type === 'relation')
  .map((e) => ({
    type: 'Feature',
    properties: { name: e.tags['name:en'], ar: e.tags.name },
    geometry: { type: 'MultiPolygon', coordinates: rings(e.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => line(m.geometry))).map((r) => [r]) },
  }));

out.rivers.features = out.rivers.features.filter((f) => !/Tigris|Dicle|Euphrates|Furat|Karkheh|Shatt al Arab/.test(f.properties.name)).concat(osmRivers);
out.marshes = { type: 'FeatureCollection', features: marshes };
writeFileSync(new URL('../public/data/base.json', import.meta.url), JSON.stringify(out));
console.log('osm rivers', osmRivers.map((r) => `${r.properties.name}:${r.geometry.coordinates.flat().length}`).join(' '));
console.log('marshes', marshes.map((m) => `${m.properties.name}:${m.geometry.coordinates.length}`).join(' '));
