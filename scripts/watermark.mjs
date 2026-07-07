import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'images');
const OUTPUT_DIR = path.join(ROOT, 'images-branded');
const LOGO_PATH = path.join(ROOT, 'new-logo-clean.png');
const MARGIN = 24;
const LOGO_WIDTH_RATIO = 0.12;

if (!existsSync(OUTPUT_DIR)) {
  await mkdir(OUTPUT_DIR, { recursive: true });
}

const files = (await readdir(INPUT_DIR)).filter(f => /\.jpe?g$/i.test(f));

for (const file of files) {
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, file);

  const photo = sharp(inputPath);
  const { width, height } = await photo.metadata();

  const logoWidth = Math.round(width * LOGO_WIDTH_RATIO);

  const logoBuffer = await sharp(LOGO_PATH)
    .resize(logoWidth, null, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  const logoW = logoBuffer.info.width;
  const logoH = logoBuffer.info.height;

  const left = width - logoW - MARGIN;
  const top = height - logoH - MARGIN;

  await photo
    .composite([{ input: logoBuffer.data, left, top }])
    .jpeg({ quality: 92 })
    .toFile(outputPath);

  console.log(`✓ ${file} (${width}×${height}) → logo ${logoW}×${logoH} at [${left},${top}]`);
}

console.log(`\nDone — ${files.length} file(s) written to images-branded/`);
