/**
 * Generates all app icons + splash screens from one SVG logo.
 *
 *   node scripts/generate-app-icons.mjs
 *
 * Outputs:
 *  - src/app/icon.png, src/app/apple-icon.png   (browser tab + iOS home icon, auto-linked by Next)
 *  - public/icons/*                              (PWA manifest icons)
 *  - public/apple-splash-*.png                   (iOS PWA startup images)
 *  - assets/icon.png, assets/splash.png          (source for @capacitor/assets, native build)
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const SPARK =
  "M12 2C12 6.5 17.5 12 22 12 17.5 12 12 17.5 12 22 12 17.5 6.5 12 2 12 6.5 12 12 6.5 12 2Z";

/** Full-bleed app icon (dark tile + white spark). Safe for maskable. */
function iconSvg(size) {
  const c = size / 2;
  const s = size * 0.0275; // spark scale (≈ 58% of canvas)
  const a = size * 0.009; // accent spark scale
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c1c20"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.34" r="0.62">
      <stop offset="0" stop-color="#43434c"/>
      <stop offset="1" stop-color="#43434c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" fill="url(#glow)"/>
  <g transform="translate(${c} ${c}) scale(${s}) translate(-12 -12)">
    <path d="${SPARK}" fill="#ffffff"/>
  </g>
  <g transform="translate(${size * 0.7} ${size * 0.32}) scale(${a}) translate(-12 -12)" opacity="0.85">
    <path d="${SPARK}" fill="#a1a1aa"/>
  </g>
</svg>`;
}

/** Splash: white canvas with a centered rounded logo tile. Any aspect ratio. */
function splashSvg(w, h) {
  const tile = Math.min(w, h) * 0.22;
  const x = (w - tile) / 2;
  const y = (h - tile) / 2;
  const c = tile / 2;
  const s = tile * 0.024;
  const r = tile * 0.235;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c1c20"/>
      <stop offset="1" stop-color="#000000"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#ffffff"/>
  <rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="${r}" fill="url(#bg)"/>
  <g transform="translate(${x + c} ${y + c}) scale(${s}) translate(-12 -12)">
    <path d="${SPARK}" fill="#ffffff"/>
  </g>
</svg>`;
}

async function out(path, buf) {
  await mkdir(dirname(path), { recursive: true });
  await sharp(buf).png().toFile(path);
  console.log("✓", path);
}

async function icon(path, size) {
  await out(path, Buffer.from(iconSvg(size)));
}

async function splash(path, w, h) {
  await out(path, Buffer.from(splashSvg(w, h)));
}

await Promise.all([
  // Browser tab + iOS home-screen icon (Next auto-links these)
  icon("src/app/icon.png", 512),
  icon("src/app/apple-icon.png", 180),
  // PWA manifest icons
  icon("public/icons/icon-192.png", 192),
  icon("public/icons/icon-512.png", 512),
  icon("public/icons/icon-maskable-512.png", 512),
  // Capacitor source assets (native build)
  icon("assets/icon.png", 1024),
  splash("assets/splash.png", 2732, 2732),
  // iOS PWA startup images (common devices)
  splash("public/apple-splash-2048x2732.png", 2048, 2732), // iPad Pro 12.9"
  splash("public/apple-splash-1290x2796.png", 1290, 2796), // iPhone Pro Max
  splash("public/apple-splash-1179x2556.png", 1179, 2556), // iPhone Pro
  splash("public/apple-splash-1170x2532.png", 1170, 2532), // iPhone 12–14
]);

console.log("\nAlle App-Icons & Splash-Screens erzeugt.");
