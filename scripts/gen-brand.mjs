// CaptureFlow brand-asset generator.
//
// Single source of truth for every logo / icon / favicon / OG image.
// Renders an SVG master (blue gradient squircle/circle + the canonical
// arc "C" from captureflow-mark.tsx) to all the raster sizes the web
// app + desktop recorder need, so a future colour change is a one-line
// edit here + `node scripts/gen-brand.mjs` instead of hand-editing ~15
// PNGs. The macOS .icns is rebuilt separately via iconutil (see the
// shell step after this script) from resources/icon.png.
//
// Brand: Royal blue — gradient #3B82F6 -> #2563EB, accent #2563EB.

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WEB = `${ROOT}/apps/web/public`;
const DRES = `${ROOT}/apps/desktop/resources`;
const DASSETS = `${ROOT}/apps/desktop/src/renderer/src/assets`;

// --- Brand colours -------------------------------------------------------
const GRAD_FROM = '#3B82F6'; // top-left  (blue-500)
const GRAD_TO = '#2563EB'; // bottom-right (blue-600)
const C_COLOR = '#ffffff';
const OG_BG = '#0f1320'; // dark navy card background
const OG_TAGLINE = '#94a3b8'; // slate-400

// --- The "C" mark --------------------------------------------------------
// Mirrors apps/web/app/_components/snap/captureflow-mark.tsx: an open arc
// with the gap facing right. Endpoints sit at ±43° off the +x axis (same
// proportion as the 16px brand mark), drawn the long way round.
function cMarkup(cx, cy, R) {
  const th = (43 * Math.PI) / 180;
  const ex = (cx + R * Math.cos(th)).toFixed(2);
  const y1 = (cy - R * Math.sin(th)).toFixed(2);
  const y2 = (cy + R * Math.sin(th)).toFixed(2);
  const sw = (0.48 * R).toFixed(2); // bold stroke ~half the radius
  return `<path d="M ${ex} ${y1} A ${R} ${R} 0 1 0 ${ex} ${y2}" fill="none" stroke="${C_COLOR}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

const gradientDef = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GRAD_FROM}"/><stop offset="1" stop-color="${GRAD_TO}"/></linearGradient>`;

// shape: 'squircle' (rounded-rect, transparent corners),
//        'round' (circle), 'bleed' (full square — for maskable/apple-touch)
function iconSvg(size, shape) {
  const R = shape === 'bleed' ? 26 : 30; // smaller C inside the maskable safe zone
  let bg;
  if (shape === 'round') bg = `<circle cx="50" cy="50" r="50" fill="url(#g)"/>`;
  else if (shape === 'squircle')
    bg = `<rect x="0" y="0" width="100" height="100" rx="23" ry="23" fill="url(#g)"/>`;
  else bg = `<rect x="0" y="0" width="100" height="100" fill="url(#g)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><defs>${gradientDef}</defs>${bg}${cMarkup(50, 50, R)}</svg>`;
}

function ogSvg() {
  const W = 1200;
  const H = 630;
  const sq = 132;
  const sx = (W - sq) / 2;
  const sy = 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${gradientDef}</defs>
  <rect width="${W}" height="${H}" fill="${OG_BG}"/>
  <g transform="translate(${sx} ${sy})">
    <svg width="${sq}" height="${sq}" viewBox="0 0 100 100"><rect width="100" height="100" rx="23" ry="23" fill="url(#g)"/>${cMarkup(50, 50, 30)}</svg>
  </g>
  <text x="${W / 2}" y="350" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="bold" font-size="86" fill="#ffffff" letter-spacing="-1">CaptureFlow</text>
  <text x="${W / 2}" y="438" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="32" fill="${OG_TAGLINE}">Open-source screen recording with instant shareable links</text>
</svg>`;
}

async function renderPng(svg, size, outPath) {
  await mkdir(dirname(outPath), { recursive: true });
  const buf = await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await writeFile(outPath, buf);
  return buf;
}

async function main() {
  // --- Web icons ---------------------------------------------------------
  await renderPng(iconSvg(512, 'squircle'), 512, `${WEB}/icon-512.png`);
  await renderPng(iconSvg(192, 'squircle'), 192, `${WEB}/icon-192.png`);
  await renderPng(iconSvg(512, 'squircle'), 512, `${WEB}/logo.png`);
  await renderPng(iconSvg(512, 'round'), 512, `${WEB}/logo-round.png`);
  await renderPng(iconSvg(512, 'bleed'), 512, `${WEB}/icon-512-maskable.png`);
  await renderPng(iconSvg(192, 'bleed'), 192, `${WEB}/icon-192-maskable.png`);
  await renderPng(iconSvg(180, 'bleed'), 180, `${WEB}/apple-touch-icon.png`);

  // --- favicon.ico (32 + 16, packed) ------------------------------------
  const fav32 = await sharp(Buffer.from(iconSvg(32, 'squircle')), { density: 384 })
    .resize(32, 32)
    .png()
    .toBuffer();
  const fav16 = await sharp(Buffer.from(iconSvg(16, 'squircle')), { density: 384 })
    .resize(16, 16)
    .png()
    .toBuffer();
  await writeFile(`${WEB}/favicon.ico`, await pngToIco([fav16, fav32]));

  // --- OG image ----------------------------------------------------------
  await mkdir(WEB, { recursive: true });
  await writeFile(
    `${WEB}/og-image.png`,
    await sharp(Buffer.from(ogSvg()), { density: 192 }).png().toBuffer()
  );

  // --- Desktop recorder --------------------------------------------------
  await renderPng(iconSvg(1024, 'squircle'), 1024, `${DRES}/icon.png`);
  await renderPng(iconSvg(512, 'squircle'), 512, `${DRES}/logo.png`);
  await renderPng(iconSvg(22, 'round'), 22, `${DRES}/trayIcon.png`);
  await renderPng(iconSvg(44, 'round'), 44, `${DRES}/trayIcon@2x.png`);
  await renderPng(iconSvg(1024, 'squircle'), 1024, `${DASSETS}/logo.png`);
  await renderPng(iconSvg(512, 'round'), 512, `${DASSETS}/logo-round.png`);

  console.log('✓ brand assets generated (icon-dev.png left amber for dev builds)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
