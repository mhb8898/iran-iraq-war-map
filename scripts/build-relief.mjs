// Bakes a shaded-relief backdrop for the theatre from AWS Terrain Tiles (Terrarium encoding,
// open data: https://registry.opendata.aws/terrain-tiles/). Output is in Web Mercator pixel
// space, so the SVG (d3.geoMercator) can place it as one <image> with no reprojection.
//   public/relief.webp      tinted hillshade shown in the app
//   scripts/.cache/height.png  16-bit heightmap (metres + 1000) for the Blender render
//   public/data/relief.json   lon/lat bounds of both images
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const Z = 8;
const [W, S, E, N] = JSON.parse(readFileSync(new URL('../public/data/base.json', import.meta.url))).bbox;
const tilesDir = new URL('./.cache/terrarium/', import.meta.url);
mkdirSync(tilesDir, { recursive: true });

const n = 2 ** Z;
const tx = (lon) => ((lon + 180) / 360) * n;
const ty = (lat) => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n;
const x0 = Math.floor(tx(W)), x1 = Math.floor(tx(E)), y0 = Math.floor(ty(N)), y1 = Math.floor(ty(S));
const cols = x1 - x0 + 1, rows = y1 - y0 + 1, w = cols * 256, h = rows * 256;

const elev = new Float32Array(w * h);
for (let y = y0; y <= y1; y++)
  for (let x = x0; x <= x1; x++) {
    const file = new URL(`${Z}-${x}-${y}.png`, tilesDir);
    if (!existsSync(file)) {
      const res = await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`);
      if (!res.ok) throw new Error(`tile ${x}/${y}: ${res.status}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
    const { data } = await sharp(file.pathname).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let j = 0; j < 256; j++)
      for (let i = 0; i < 256; i++) {
        const k = (j * 256 + i) * 3;
        elev[((y - y0) * 256 + j) * w + (x - x0) * 256 + i] = data[k] * 256 + data[k + 1] + data[k + 2] / 256 - 32768;
      }
  }

// Crop to the exact bbox.
const px = (lon) => Math.round((tx(lon) - x0) * 256), py = (lat) => Math.round((ty(lat) - y0) * 256);
const cx = px(W), cy = py(N), cw = px(E) - cx, ch = py(S) - cy;
const at = (i, j) => elev[Math.min(h - 1, Math.max(0, j + cy)) * w + Math.min(w - 1, Math.max(0, i + cx))];

// Hypsometric stops (metres → rgb): muted "staff map" palette, sand plains to umber peaks.
const STOPS = [
  [-50, [196, 205, 196]], [0, [226, 220, 196]], [60, [232, 222, 190]], [250, [226, 210, 172]],
  [700, [212, 190, 150]], [1400, [190, 164, 126]], [2200, [168, 142, 112]], [3200, [196, 184, 170]], [4200, [240, 236, 230]],
];
const tint = (e) => {
  for (let s = 1; s < STOPS.length; s++)
    if (e <= STOPS[s][0]) {
      const [e0, c0] = STOPS[s - 1], [e1, c1] = STOPS[s], t = Math.max(0, (e - e0) / (e1 - e0));
      return c0.map((c, k) => c + (c1[k] - c) * t);
    }
  return STOPS.at(-1)[1];
};

const rgb = Buffer.alloc(cw * ch * 3);
const height16 = Buffer.alloc(cw * ch * 2);
const az = (315 * Math.PI) / 180, alt = (40 * Math.PI) / 180, zf = 3.2;
for (let j = 0; j < ch; j++) {
  const lat = N - ((N - S) * j) / ch; // close enough for the cell size
  const cell = (40075016 * Math.cos((lat * Math.PI) / 180)) / (n * 256);
  for (let i = 0; i < cw; i++) {
    const e = at(i, j);
    const dzdx = ((at(i + 1, j - 1) + 2 * at(i + 1, j) + at(i + 1, j + 1)) - (at(i - 1, j - 1) + 2 * at(i - 1, j) + at(i - 1, j + 1))) / (8 * cell);
    const dzdy = ((at(i - 1, j + 1) + 2 * at(i, j + 1) + at(i + 1, j + 1)) - (at(i - 1, j - 1) + 2 * at(i, j - 1) + at(i + 1, j - 1))) / (8 * cell);
    const slope = Math.atan(zf * Math.hypot(dzdx, dzdy));
    const aspect = Math.atan2(dzdy, -dzdx);
    // ESRI hillshade; flat ground ≈ sin(alt) ≈ 0.64, which maps to brightness 1.0
    const shade = Math.max(0, Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(Math.PI / 2 - az - aspect));
    const c = tint(e);
    const k = (j * cw + i) * 3;
    for (let q = 0; q < 3; q++) rgb[k + q] = Math.max(0, Math.min(255, c[q] * (0.46 + 0.84 * shade)));
    height16.writeUInt16BE(Math.max(0, Math.min(65535, Math.round(e + 1000))), (j * cw + i) * 2);
  }
}

await sharp(rgb, { raw: { width: cw, height: ch, channels: 3 } }).webp({ quality: 82 }).toFile(new URL('../public/relief.webp', import.meta.url).pathname);
await sharp(height16, { raw: { width: cw, height: ch, channels: 1 } }).toColourspace('grey16').png().toFile(new URL('./.cache/height.png', import.meta.url).pathname);
writeFileSync(new URL('../public/data/relief.json', import.meta.url), JSON.stringify({ bounds: [W, S, E, N], width: cw, height: ch }));
console.log(`relief ${cw}x${ch} from ${cols * rows} tiles`);
