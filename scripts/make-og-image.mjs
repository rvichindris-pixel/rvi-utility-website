import sharp from 'sharp';

const W = 1200, H = 630;

const svg = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="45%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.72"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#fe7316"/>
    <text x="48" y="${H - 42}" font-family="Arial,Helvetica,sans-serif"
      font-size="54" font-weight="700" fill="white" letter-spacing="-1">RVI Utility Ltd</text>
  </svg>`
);

const info = await sharp('images/work-4.jpg')
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .composite([{ input: svg, blend: 'over' }])
  .jpeg({ quality: 90 })
  .toFile('images/og-image.jpg');

console.log(`og-image.jpg — ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB`);
