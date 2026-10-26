import { geoArea } from 'd3-geo';
import polygonClipping, { type MultiPolygon as PCMulti } from 'polygon-clipping';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from 'geojson';
import { ZONES } from './data/zones';
import { PHASES } from './data/phases';
import type { Phase, WikiEntry } from './types';

export interface Base {
  bbox: [number, number, number, number];
  countries: FeatureCollection<Polygon | MultiPolygon, { iso: string; name: string; fa?: string }>;
  provinces: FeatureCollection<Polygon | MultiPolygon, { iso: string; name: string; fa?: string }>;
  borders: FeatureCollection<Geometry, { left: string; right: string; iranIraq: boolean }>;
  rivers: FeatureCollection<Geometry, { name: string; fa?: string; rank?: number }>;
  lakes: FeatureCollection<Polygon | MultiPolygon, { name: string }>;
  marshes: FeatureCollection<MultiPolygon, { name: string }>;
  places: FeatureCollection;
}

export interface Relief {
  bounds: [number, number, number, number];
  width: number;
  height: number;
}

export type Wiki = Record<string, WikiEntry> & { _places: Record<string, string> };

export async function loadData() {
  const base = import.meta.env.BASE_URL;
  const [geo, relief, wiki] = await Promise.all([
    fetch(`${base}data/base.json`).then((r) => r.json() as Promise<Base>),
    fetch(`${base}data/relief.json`).then((r) => r.json() as Promise<Relief>),
    fetch(`${base}data/wiki.json`).then((r) => r.json() as Promise<Wiki>),
  ]);
  for (const fc of [geo.countries, geo.provinces, geo.lakes, geo.marshes]) fc.features.forEach(rewind);
  return { geo, relief, wiki };
}

/** d3-geo is spherical: a ring wound the "wrong" way covers the rest of the globe. */
export function rewind<F extends Feature>(f: F): F {
  const g = f.geometry as Polygon | MultiPolygon;
  if (g.type !== 'Polygon' && g.type !== 'MultiPolygon') return f;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const p of polys) {
    if (geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI) p.forEach((r) => r.reverse());
  }
  return f;
}

export type ControlKind = 'iraqHeld' | 'iranHeld' | 'contested';
export type ZoneFeature = Feature<MultiPolygon, { id: string; label: string; note?: string; kind: ControlKind }>;

const EARTH_KM2 = 6371.0088 ** 2;

/** Clips every zone sketch to its country once; phases then just pick zones by id. */
export function buildControl(geo: Base) {
  const country = (iso: string) => {
    const g = geo.countries.features.find((f) => f.properties.iso === iso)!.geometry;
    // bbox clipping can leave slivers with < 4 points, which polygon-clipping rejects
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    return polys.map((p) => p.filter((r) => r.length >= 4)).filter((p) => p.length) as PCMulti;
  };
  const clipped = new Map<string, MultiPolygon>();
  for (const z of ZONES) {
    const ring = [...z.shape, z.shape[0]];
    clipped.set(z.id, { type: 'MultiPolygon', coordinates: polygonClipping.intersection([[ring]], country(z.on)) as MultiPolygon['coordinates'] });
  }

  const featuresFor = (phase: Phase): ZoneFeature[] =>
    (['contested', 'iraqHeld', 'iranHeld'] as ControlKind[]).flatMap((kind) =>
      phase[kind].map((id) => {
        const z = ZONES.find((zz) => zz.id === id)!;
        return rewind({ type: 'Feature', properties: { id, label: z.label, note: z.note, kind }, geometry: structuredClone(clipped.get(id)!) } as ZoneFeature);
      }),
    );

  const area = (fs: ZoneFeature[], kind: ControlKind) => fs.filter((f) => f.properties.kind === kind).reduce((s, f) => s + geoArea(f) * EARTH_KM2, 0);

  const byPhase = new Map(
    PHASES.map((p) => {
      const fs = featuresFor(p);
      return [p.id, { features: fs, iraqHeldKm2: area(fs, 'iraqHeld'), iranHeldKm2: area(fs, 'iranHeld'), contestedKm2: area(fs, 'contested') }];
    }),
  );
  return byPhase;
}
