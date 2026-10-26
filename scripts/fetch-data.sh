#!/bin/sh
# Downloads the raw inputs for scripts/build-geo.mjs into scripts/.cache (not committed).
set -e
cd "$(dirname "$0")" && mkdir -p .cache && cd .cache
NE=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
for f in ne_10m_admin_0_countries ne_10m_admin_1_states_provinces ne_10m_rivers_lake_centerlines ne_10m_lakes ne_10m_populated_places_simple ne_10m_admin_0_boundary_lines_land; do
  [ -f $f.geojson ] || curl -sfL -o $f.geojson $NE/$f.geojson
done

UA="iran-iraq-war-map (hobby history map)"
OVERPASS=https://overpass-api.de/api/interpreter
[ -f osm_rivers.json ] || curl -sf -A "$UA" -o osm_rivers.json --data-urlencode 'data=[out:json][timeout:180];(relation["waterway"="river"]["name:en"~"^(Karun|Dez|Karkheh|Diyala|Little Zab|Great Zab|Lesser Zab|Jarrahi|Sirwan|Alwand|Shatt al-Arab|Arvand|Bahmanshir|Tigris|Euphrates|Doveyrich|Kunjancham|Zab)"](29,43,37.5,51.5););out geom;' $OVERPASS
[ -f osm_extra.json ] || curl -sf -A "$UA" -o osm_extra.json --data-urlencode 'data=[out:json][timeout:180];(relation["waterway"="river"]["name"~"بهمنشیر|جراحی|کرخه|کارون|الکرخة"](29,46,33,50.5);way["waterway"="river"]["name"~"بهمنشیر|Bahmanshir"](29.5,48,31,49.5);relation["natural"="wetland"]["name:en"~"Hawizeh|Hoveyzeh|Azim|Hammar|Central"](29.5,45.5,32.5,48.5);way["natural"="wetland"]["name:en"~"Hawizeh|Hoveyzeh|Azim|Hammar|Central"](29.5,45.5,32.5,48.5);relation["natural"="water"]["name:en"~"Hawizeh|Azim|Hammar|Fish"](29.5,45.5,32.5,48.5););out geom;' $OVERPASS
echo "inputs ready in scripts/.cache"
