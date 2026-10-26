# Iran–Iraq War Map · جنگ ایران و عراق

An interactive, hand-styled SVG map of the Iran–Iraq War (1980–1988), from the 1937 frontier
treaty to the 1990 return to the Algiers line. Pick any operation on the timeline and the map
flies to it, draws the axes of attack, and redraws the lines of control as they stood afterwards.

**[Open the map →](https://mhb8898.github.io/iran-iraq-war-map/)** · If you find it useful, please ⭐ star the repo and share it.
Spotted a mistake? [Open an issue](https://github.com/mhb8898/iran-iraq-war-map/issues/new/choose) — or fix it yourself with a pull request ([how to contribute](CONTRIBUTING.md)).

- **Lines of control vs. today's border.** The international border (fixed by the 1975 Algiers
  Agreement and still in force) is always drawn. Iraqi-held Iranian soil is hatched red,
  Iranian-held Iraqi soil hatched green, and areas that neither side fully controlled
  (Kurdish insurgencies, the Hawizeh marshes, no-man's-land belts) are gray. *Compare with
  today's border* adds a swipe divider; the panel shows the occupied area in km².
- **Operations as movement.** 73 events from both sides: invasions, offensives and the defensive battles that stopped them, air and missile campaigns, deep raids (H-3, Osirak, Kharg, Seawise Giant) and the tanker war at sea,
  naval strikes, atrocities and diplomacy, each with Persian names, dates, outcome, a lead
  photo and extract from Wikipedia (English and Persian links), and book/UN references. Iraqi
  operations carry their Arabic code names (Ramadan Mubarak, Tawakalna ala Allah…), and a
  Both / Iran / Iraq switch on the timeline shows one side's war at a time.
- **Terrain.** Shaded relief rendered in Blender from open elevation data, sliced into
  zoom tiles so it stays sharp down to individual ridgelines.

Front lines are hand-drawn approximations (roughly ±5–10 km) from the cited histories; edges
along the Karun and Karkheh trace the real rivers, and every edge on a border is clipped to
the actual border. Areas in km² are measured from these drawings, not official figures.

## Run

```bash
npm install
npm run dev
```

## Checking the data

```bash
npm run check          # errors and warnings
npm run check -- --all # plus notes
```

`scripts/check-events.ts` tests every event against the map it is shown on and against its
Wikipedia summary: attack arrows start on their own side's ground and end on enemy or contested
ground; a won attack's target is held afterwards and a lost one's is not; wartime fighting never
falls back to a pre-war map; dates agree with the article; every zone survives clipping to the
real border; cameras frame their arrows. Front lines are approximate, so it probes within ~10 km.
Flags that have been reviewed and accepted are listed, with reasons, in `ACCEPTED` at the top.

## Data pipeline

All generated data is committed under `public/`; rebuild only when changing it.

| step | script | output |
| --- | --- | --- |
| raw inputs | `scripts/fetch-data.sh` | `scripts/.cache/` (Natural Earth + Overpass) |
| base geography | `node scripts/build-geo.mjs` | `public/data/base.json` — Natural Earth 10m countries, provinces, borders, places; OSM rivers & marshes |
| heightmap | `node scripts/build-relief.mjs` | `scripts/.cache/{height,tint,relief-node}.png` from AWS Terrain Tiles (z9) |
| 3D relief | `Blender -b -P scripts/render-relief.py -- 5200 20` (tiled Cycles; bigger renders swap hard on 16 GB) | `scripts/.cache/relief-blender.png` |
| tiles | `node scripts/slice-tiles.mjs scripts/.cache/relief-blender.png` | `public/relief/{z}/{x}/{y}.webp`, `public/data/relief.json` |
| Wikipedia | `node scripts/fetch-wiki.mjs` | `public/data/wiki.json` (+ checks place coordinates) |

Run `scripts/fetch-data.sh` first: it downloads the Natural Earth GeoJSON and the two
OpenStreetMap Overpass extracts (`osm_rivers.json`, `osm_extra.json`) that `build-geo.mjs` reads.

The historical content lives in `src/data/`: `events.ts` (operations and arrows), `zones.ts`
(drawn areas of control), `phases.ts` (which zones are held/contested at each date),
`places.ts`, `refs.ts`.

## Contributing

Corrections with a source, new events and fixes are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Sources & credits

- Elevation: [Terrain Tiles on AWS](https://registry.opendata.aws/terrain-tiles/) (SRTM, GMTED and others).
- Vector geography: [Natural Earth](https://www.naturalearthdata.com/) (public domain);
  rivers and marshes © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).
- Text extracts and photos: Wikipedia / Wikimedia Commons, linked per item; see each file page for its licence.
- Histories: Razoux (2015), Murray & Woods (2014), Woods et al. (2009), Cordesman & Wagner (1990),
  Pollack (2002), Karsh (2002), Hiro (1991); UN Security Council resolutions 479 and 598; HRW (1993).
