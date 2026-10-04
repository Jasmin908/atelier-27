// Builds optimized, art-directed derivatives from the master images.
// Masters in assets/ are opened read-only and never written to.
// Run manually with `npm run images`; output is written to public/img/
// and described in src/data/images.json.

import { mkdir, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'assets');
const outDir = path.join(root, 'public', 'img');
const manifestPath = path.join(root, 'src', 'data', 'images.json');

const MASTERS = {
  hausAmHang: 'Professional-architectural-exterior-phot.png', // 2752 × 1536
  hof08: '...png', // 2528 × 1696
  casaLinea: 'REFERENCE-USE-The-attached-image-is-a-p.png', // 2752 × 1536
};

// region: { left, top, width, height } in master pixels; omitted = full frame.
// widths never exceed the region width (no upscaling).
const CROPS = [
  { name: 'haus-am-hang-wide', master: 'hausAmHang', widths: [1280, 1920, 2752], jpeg: 1920 },
  {
    name: 'haus-am-hang-portrait',
    master: 'hausAmHang',
    region: { left: 1156, top: 0, width: 1152, height: 1536 },
    widths: [640, 1152],
    jpeg: 1152,
  },
  {
    name: 'haus-am-hang-detail',
    master: 'hausAmHang',
    region: { left: 1500, top: 300, width: 976, height: 1220 },
    widths: [640, 976],
    jpeg: 976,
  },
  { name: 'hof-08-wide', master: 'hof08', widths: [960, 1600, 2528], jpeg: 1600 },
  {
    name: 'hof-08-portrait',
    master: 'hof08',
    region: { left: 960, top: 0, width: 1357, height: 1696 },
    widths: [640, 1100],
    jpeg: 1100,
  },
  { name: 'casa-linea-wide', master: 'casaLinea', widths: [1280, 1920, 2752], jpeg: 1920 },
  {
    name: 'casa-linea-portrait',
    master: 'casaLinea',
    region: { left: 743, top: 0, width: 1229, height: 1536 },
    widths: [640, 1229],
    jpeg: 1229,
  },
];

const present = new Set(await readdir(srcDir));
for (const file of Object.values(MASTERS)) {
  if (!present.has(file)) throw new Error(`Missing master image: assets/${file}`);
}

await mkdir(outDir, { recursive: true });
await mkdir(path.dirname(manifestPath), { recursive: true });

const manifest = {};

for (const crop of CROPS) {
  const input = path.join(srcDir, MASTERS[crop.master]);
  const meta = await sharp(input).metadata();
  const region = crop.region ?? { left: 0, top: 0, width: meta.width, height: meta.height };
  const ratio = region.height / region.width;
  const entry = { width: region.width, height: region.height, avif: [], webp: [], jpeg: null };

  for (const width of crop.widths) {
    if (width > region.width) throw new Error(`${crop.name}: ${width}px would upscale`);
    const height = Math.round(width * ratio);
    const base = () => sharp(input).extract(region).resize({ width, height, fit: 'fill' });

    const avifFile = `${crop.name}-${width}.avif`;
    await base().avif({ quality: 56, effort: 6 }).toFile(path.join(outDir, avifFile));
    entry.avif.push({ src: `/img/${avifFile}`, width });

    const webpFile = `${crop.name}-${width}.webp`;
    await base().webp({ quality: 78, effort: 5 }).toFile(path.join(outDir, webpFile));
    entry.webp.push({ src: `/img/${webpFile}`, width });

    if (width === crop.jpeg) {
      const jpegFile = `${crop.name}-${width}.jpg`;
      await base().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(outDir, jpegFile));
      entry.jpeg = { src: `/img/${jpegFile}`, width, height };
    }
    console.log(`${crop.name} ${width}×${height}`);
  }
  manifest[crop.name] = entry;
}

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Manifest written: ${path.relative(root, manifestPath)}`);
