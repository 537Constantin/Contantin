/**
 * Generates all app icons + splash screens from one SVG logo.
 *
 *   node scripts/generate-app-icons.mjs   (or: npm run icons)
 *
 * Logo: a "team" of three people (teal / blue / purple gradients) on a dark
 * tile — the SmartStaff mark.
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

/** Shared gradient defs (unique ids per svg are fine since each file is standalone). */
const DEFS = `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1b2236"/>
    <stop offset="1" stop-color="#0a0e1a"/>
  </linearGradient>
  <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#46dccb"/>
    <stop offset="1" stop-color="#1fb4c6"/>
  </linearGradient>
  <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6b9bf4"/>
    <stop offset="1" stop-color="#3a5fe0"/>
  </linearGradient>
  <linearGradient id="purple" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a182f7"/>
    <stop offset="1" stop-color="#7a4ad4"/>
  </linearGradient>`;

/** Three people, designed in a 100×100 box (visual center ≈ 50,53). */
const PEOPLE = `
  <!-- left (teal) -->
  <g fill="url(#teal)">
    <circle cx="27" cy="45" r="9.5"/>
    <path d="M11 82 A17 21 0 0 1 45 82 Z"/>
  </g>
  <!-- right (purple) -->
  <g fill="url(#purple)">
    <circle cx="73" cy="45" r="9.5"/>
    <path d="M55 82 A17 21 0 0 1 89 82 Z"/>
  </g>
  <!-- center (blue), in front with a thin dark separation -->
  <g fill="url(#blue)" stroke="#0c1019" stroke-width="2.4" stroke-linejoin="round">
    <circle cx="50" cy="38" r="12.5"/>
    <path d="M27 80 A23 27 0 0 1 73 80 Z"/>
  </g>`;

/** Full-bleed app icon (dark tile + the three people). Safe for maskable. */
function iconSvg(size) {
  const k = (size * 0.64) / 76; // people content (~76 wide) → ~64% of canvas
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>${DEFS}</defs>
  <rect width="${size}" height="${size}" fill="url(#bg)"/>
  <g transform="translate(${size / 2} ${size / 2}) scale(${k}) translate(-50 -53)">${PEOPLE}</g>
</svg>`;
}

/** Splash: white canvas with a centered rounded logo tile. Any aspect ratio. */
function splashSvg(w, h) {
  const tile = Math.min(w, h) * 0.24;
  const x = (w - tile) / 2;
  const y = (h - tile) / 2;
  const r = tile * 0.235;
  const k = (tile * 0.64) / 76;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${DEFS}</defs>
  <rect width="${w}" height="${h}" fill="#ffffff"/>
  <rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="${r}" fill="url(#bg)"/>
  <g transform="translate(${x + tile / 2} ${y + tile / 2}) scale(${k}) translate(-50 -53)">${PEOPLE}</g>
</svg>`;
}

async function out(path, buf) {
  await mkdir(dirname(path), { recursive: true });
  await sharp(buf).png().toFile(path);
  console.log("✓", path);
}

const icon = (path, size) => out(path, Buffer.from(iconSvg(size)));
const splash = (path, w, h) => out(path, Buffer.from(splashSvg(w, h)));

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

console.log("\nAlle App-Icons & Splash-Screens (SmartStaff) erzeugt.");
