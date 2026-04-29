/**
 * render-endcard-compare.mjs
 * Dani — Productor Visual, ENBA
 *
 * Genera dos versiones del end card para comparacion visual:
 *   endcard_37pct.png  — logo a 400px de ancho (37% de 1080px)
 *   endcard_90pct.png  — logo a 972px de ancho (90% de 1080px)
 *   endcard_compare.html — comparacion side-by-side en browser
 *
 * Canvas: 1080x1920px, fondo navy #0A1520
 * Logo: lockup-horizontal-on-dark.svg (520x94px, ratio 5.532:1)
 * Safe area: 150px arriba y abajo (UI de IG)
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ── Paths ──────────────────────────────────────────────────────────────────
const SVG_PATH = path.resolve(
  'C:/Users/josea/enba-social-assets-redes/campaigns/lanzamiento-15-abr-2026/enba-portfolio-de-marca/03-LOGOS-BASE/ENBA-horizontal-oscuro.svg'
);
const OUT_DIR = path.resolve(
  'C:/Users/josea/enba-social-assets-redes/campaigns/plan-crecimiento-10k/reels/reel-eng-v2'
);

// ── Canvas & logo specs ────────────────────────────────────────────────────
const CANVAS_W = 1080;
const CANVAS_H = 1920;
const BG_COLOR = '#0A1520';
const SAFE_AREA = 150; // px — IG superpone UI arriba y abajo

// Logo dimensions por version
const VERSIONS = [
  { pct: 37, logoW: 400,  suffix: '37pct' },
  { pct: 90, logoW: 972,  suffix: '90pct' },
];

const SVG_NATIVE_W = 440;
const SVG_NATIVE_H = 80;
const SVG_RATIO = SVG_NATIVE_W / SVG_NATIVE_H; // 5.5:1

// ── SVG content ───────────────────────────────────────────────────────────
const svgContent = readFileSync(SVG_PATH, 'utf-8');

// ── HTML builder ──────────────────────────────────────────────────────────
function buildEndcardHTML(logoW) {
  const logoH = Math.round(logoW / SVG_RATIO);

  // Centro del canvas, respetando safe area
  const usableH = CANVAS_H - SAFE_AREA * 2;
  const centerY = SAFE_AREA + usableH / 2;

  // Posicion top-left del logo para centrarlo
  const logoX = Math.round((CANVAS_W - logoW) / 2);
  const logoY = Math.round(centerY - logoH / 2);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;500&family=Teko:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${CANVAS_W}px;
    height: ${CANVAS_H}px;
    background: ${BG_COLOR};
    overflow: hidden;
    position: relative;
  }
  .logo {
    position: absolute;
    left: ${logoX}px;
    top: ${logoY}px;
    width: ${logoW}px;
  }
  .logo svg {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
</head>
<body>
  <div class="logo">${svgContent}</div>
</body>
</html>`;
}

// ── Playwright render ─────────────────────────────────────────────────────
async function renderEndcard(page, version) {
  const { pct, logoW, suffix } = version;
  const logoH = Math.round(logoW / SVG_RATIO);
  console.log(`[${suffix}] logoW=${logoW}px, logoH=${logoH}px`);

  const html = buildEndcardHTML(logoW);
  await page.setContent(html, { waitUntil: 'networkidle' });

  const outPath = path.join(OUT_DIR, `endcard_${suffix}.png`);
  await page.screenshot({
    path: outPath,
    type: 'png',
    clip: { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H },
  });
  console.log(`[${suffix}] Guardado: ${outPath}`);
  return outPath;
}

// ── Compare HTML builder ──────────────────────────────────────────────────
function buildCompareHTML(paths) {
  // Escala de visualizacion: 50% para que quepan dos side by side
  const displayW = Math.round(CANVAS_W * 0.5);
  const displayH = Math.round(CANVAS_H * 0.5);

  // Nombres de archivo solo (sin path completo) para el src relativo
  const files = paths.map(p => path.basename(p));

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>End Card Compare — 37% vs 90%</title>
  <style>
    body {
      background: #111;
      color: #eee;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      gap: 24px;
    }
    h1 {
      font-size: 22px;
      letter-spacing: 1px;
      color: #9FD8CB;
    }
    .compare {
      display: flex;
      gap: 40px;
      align-items: flex-start;
    }
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .label {
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .sublabel {
      font-size: 13px;
      color: #aaa;
    }
    img {
      border: 1px solid #333;
      display: block;
    }
    .note {
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>End Card — Comparacion Logo Size</h1>
  <p class="note">Renderizado al 50% del tamano real (1080x1920 → 540x960). Canvas navy #0A1520.</p>
  <div class="compare">
    <div class="item">
      <div class="label">37% — 400px</div>
      <div class="sublabel">endcard_37pct.png &mdash; logo oficial 03-LOGOS-BASE</div>
      <img src="${files[0]}" width="${displayW}" height="${displayH}" />
    </div>
    <div class="item">
      <div class="label">90% — 972px</div>
      <div class="sublabel">endcard_90pct.png &mdash; logo oficial 03-LOGOS-BASE</div>
      <img src="${files[1]}" width="${displayW}" height="${displayH}" />
    </div>
  </div>
  <p class="note">Safe area 150px arriba y abajo (donde IG superpone UI). Logo centrado en area util.</p>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: CANVAS_W, height: CANVAS_H },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const outputPaths = [];
  for (const version of VERSIONS) {
    const outPath = await renderEndcard(page, version);
    outputPaths.push(outPath);
  }

  await browser.close();

  // Generar HTML de comparacion
  const compareHtml = buildCompareHTML(outputPaths);
  const comparePath = path.join(OUT_DIR, 'endcard_compare.html');
  writeFileSync(comparePath, compareHtml, 'utf-8');
  console.log(`[compare] HTML guardado: ${comparePath}`);

  console.log('\n--- Entregables ---');
  for (const p of outputPaths) {
    console.log(` PNG: ${p}`);
  }
  console.log(` HTML: ${comparePath}`);
  console.log('\nAbrir en browser:');
  console.log(` file:///${comparePath.replace(/\\/g, '/')}`);
})();
