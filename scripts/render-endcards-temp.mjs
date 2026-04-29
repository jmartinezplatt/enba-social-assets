/**
 * render-endcards-temp.mjs
 * Genera endcard_37pct.png y endcard_90pct.png con el logo oficial ENBA-horizontal-oscuro.png
 * Canvas: 1080x1920, fondo navy #0A1520
 * Logo: PNG real con dimensiones 1375x250 (ratio 5.5:1), modo RGBA
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const BG_COLOR = '#0A1520';
const SAFE = 150; // px safe area top/bottom

const LOGO_PATH = path.resolve('C:/Users/josea/enba-redes/brand/ENBA-horizontal-oscuro.png');
const OUT_DIR = 'C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/reels/reel-eng-v2';

// Logo real: 1375x250, ratio 5.5
const LOGO_ASPECT = 1375 / 250; // 5.5

const variants = [
  { name: 'endcard_37pct', logoW: Math.round(CANVAS_W * 0.37) }, // 400
  { name: 'endcard_90pct', logoW: Math.round(CANVAS_W * 0.90) }, // 972
];

// Encode logo as base64 data URI
const logoBuffer = fs.readFileSync(LOGO_PATH);
const logoB64 = logoBuffer.toString('base64');
const logoDataUri = `data:image/png;base64,${logoB64}`;

const browser = await chromium.launch();

for (const v of variants) {
  const logoH = Math.round(v.logoW / LOGO_ASPECT);
  const logoX = Math.round((CANVAS_W - v.logoW) / 2);
  const logoY = Math.round((CANVAS_H - logoH) / 2);

  console.log(`Rendering ${v.name}: logo ${v.logoW}x${logoH} at (${logoX}, ${logoY})`);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
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
  width: ${v.logoW}px;
  height: ${logoH}px;
}
</style>
</head>
<body>
<img class="logo" src="${logoDataUri}" />
</body>
</html>`;

  const page = await browser.newPage();
  await page.setViewportSize({ width: CANVAS_W, height: CANVAS_H });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const outPath = path.join(OUT_DIR, `${v.name}.png`);
  await page.screenshot({ path: outPath, type: 'png', fullPage: false });
  await page.close();

  console.log(`  Saved: ${outPath}`);
}

await browser.close();
console.log('Done.');
