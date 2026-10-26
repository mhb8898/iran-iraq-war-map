// Cuts a relief image (Web Mercator pixel space, see relief.json) into a tile pyramid:
//   public/relief/{z}/{x}/{y}.webp   z6–9 for the whole theatre, z10 only near the front
//   public/relief/overview.webp       one small image drawn underneath while tiles load
//   public/data/relief.json           manifest the map reads
// usage: node scripts/slice-tiles.mjs [source.png]   (default: scripts/.cache/relief-node.png)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

sharp.concurrency(4);
const cache = (f) => new URL(`./.cache/${f}`, import.meta.url).pathname;
const pub = (f) => new URL(`../public/${f}`, import.meta.url).pathname;
const src = process.argv[2] ?? cache('relief-node.png');
const meta = JSON.parse(readFileSync(cache('relief.json'), 'utf8'));
const [W, S, E, N] = meta.bounds;
const zs = meta.z;
const { width: sw, height: sh } = await sharp(src).metadata();
// a render may be a different size than the heightmap; scale to the heightmap's pixel grid
const zSrcEff = zs + Math.log2(sw / meta.width);

const tx = (lon, z) => ((lon + 180) / 360) * 2 ** z * 256;
const ty = (lat, z) => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z * 256;
const lonOf = (px, z) => (px / (2 ** z * 256)) * 360 - 180;
const latOf = (py, z) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * py) / (2 ** z * 256)))) * 180) / Math.PI;

// z10 tiles only where the fighting was: within ~1.6° of the Iran–Iraq border
const base = JSON.parse(readFileSync(pub('data/base.json'), 'utf8'));
const borderPts = base.borders.features.filter((f) => f.properties.iranIraq).flatMap((f) => (f.geometry.type === 'LineString' ? f.geometry.coordinates : f.geometry.coordinates.flat()));
const nearFront = (lon, lat) => borderPts.some(([x, y]) => Math.abs(x - lon) < 1.6 && Math.abs(y - lat) < 1.6);

const SEA = [195, 211, 209];
const ZOOMS = [6, 7, 8, 9, 10];
rmSync(pub('relief'), { recursive: true, force: true });
const manifest = { bounds: meta.bounds, zooms: {}, overview: 'relief/overview.webp' };

for (const z of ZOOMS) {
  const f = 2 ** (z - zSrcEff);
  const rw = Math.round(sw * f), rh = Math.round(sh * f);
  const img = await sharp(src, { limitInputPixels: false }).removeAlpha().resize(rw, rh, { kernel: f > 1 ? 'lanczos3' : 'mitchell' }).raw().toBuffer();
  const ox = tx(W, z), oy = ty(N, z); // global pixel of image's top-left
  const x0 = Math.floor(ox / 256), x1 = Math.floor((ox + rw - 1) / 256);
  const y0 = Math.floor(oy / 256), y1 = Math.floor((oy + rh - 1) / 256);
  const list = [];
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++) {
      if (z === 10 && !nearFront(lonOf((x + 0.5) * 256, z), latOf((y + 0.5) * 256, z))) continue;
      const tile = Buffer.alloc(256 * 256 * 3);
      for (let j = 0; j < 256; j++) {
        const sy = Math.round(y * 256 + j - oy);
        for (let i = 0; i < 256; i++) {
          const sx = Math.round(x * 256 + i - ox);
          const o = (j * 256 + i) * 3;
          if (sx < 0 || sy < 0 || sx >= rw || sy >= rh) (tile[o] = SEA[0]), (tile[o + 1] = SEA[1]), (tile[o + 2] = SEA[2]);
          else img.copy(tile, o, (sy * rw + sx) * 3, (sy * rw + sx) * 3 + 3);
        }
      }
      mkdirSync(pub(`relief/${z}/${x}`), { recursive: true });
      await sharp(tile, { raw: { width: 256, height: 256, channels: 3 } }).webp({ quality: z >= 9 ? 78 : 82 }).toFile(pub(`relief/${z}/${x}/${y}.webp`));
      list.push(`${x}/${y}`);
    }
  manifest.zooms[z] = z === 10 ? { tiles: list } : { range: [x0, x1, y0, y1] };
  console.log(`z${z}: ${list.length} tiles`);
}

await sharp(src, { limitInputPixels: false }).resize(1600).webp({ quality: 80 }).toFile(pub('relief/overview.webp'));
writeFileSync(pub('data/relief.json'), JSON.stringify(manifest));
rmSync(pub('relief.webp'), { force: true });
