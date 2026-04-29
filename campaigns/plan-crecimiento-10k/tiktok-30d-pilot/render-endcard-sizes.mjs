#!/usr/bin/env node
/**
 * render-endcard-sizes.mjs
 * Genera 3 variantes de endcard con logo a 90%, 94% y 98% del canvas.
 * Corrige centrado visual usando viewBox recortado al contenido real del SVG.
 *
 * Outputs en: C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/reels/reel-eng-v2/
 */

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const logoPath = path.resolve(
  "C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/tiktok-30d-pilot/brand/ENBA-horizontal-oscuro.svg"
);
const outputDir = path.resolve(
  "C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/reels/reel-eng-v2"
);

// Los 3 tamaños: nombre, ancho en px (canvas 1080)
const variants = [
  { name: "endcard_90pct", widthPx: 972,  label: "90% — 972px", file: "endcard_90pct.png" },
  { name: "endcard_94pct", widthPx: 1015, label: "94% — 1015px", file: "endcard_94pct.png" },
  { name: "endcard_98pct", widthPx: 1058, label: "98% — 1058px (~11px margen)", file: "endcard_98pct.png" },
];

/**
 * El SVG original tiene viewBox "0 0 440 80" pero el contenido visual
 * termina aproximadamente en x=370. Los ~70px vacíos a la derecha hacen
 * que el centrado geométrico del div NO coincida con el centrado visual.
 *
 * Solución: reemplazar el viewBox con "0 0 375 80" para recortarlo al
 * contenido real, y usar flex centering en el body.
 * Esto garantiza que el centro óptico del logo quede en el centro del canvas.
 */
function patchSvgViewBox(svgSource) {
  // Reemplazar viewBox="0 0 440 80" por "0 0 375 80"
  // 375 = margen izq mínimo (x=6) + contenido real (~363) con pequeño padding derecho
  return svgSource.replace(/viewBox="0 0 440 80"/, 'viewBox="0 0 375 80"');
}

function buildHtml(logoSvg, widthPx) {
  const patchedSvg = patchSvgViewBox(logoSvg);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300&family=Teko:wght@700&display=swap" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 1080px;
      height: 1920px;
      overflow: hidden;
    }
    body {
      background:
        radial-gradient(circle at top left, rgba(77, 184, 160, 0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(212, 168, 67, 0.16), transparent 22%),
        linear-gradient(180deg, #07131d 0%, #0A1520 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-wrap {
      width: ${widthPx}px;
      flex-shrink: 0;
    }
    .logo-wrap svg {
      display: block;
      width: 100%;
      height: auto;
      filter: drop-shadow(0 18px 32px rgba(0, 0, 0, 0.24));
    }
  </style>
</head>
<body>
  <div class="logo-wrap">
    ${patchedSvg}
  </div>
</body>
</html>`;
}

async function render(browser, html, outputPath) {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({
    path: outputPath,
    type: "jpeg",
    quality: 92,
    omitBackground: false,
  });
  await page.close();
  console.log(`  OK: ${path.basename(outputPath)}`);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const logoSvg = await fs.readFile(logoPath, "utf8");
  const browser = await chromium.launch({ headless: true });

  try {
    console.log("\nRenderizando 3 variantes de endcard...");
    for (const v of variants) {
      const html = buildHtml(logoSvg, v.widthPx);
      // Renombrar a .jpg (JPEG obligatorio para Meta API — ver CLAUDE.md regla 10)
      const outFile = path.join(outputDir, v.file.replace(".png", ".jpg"));
      await render(browser, html, outFile);
    }
  } finally {
    await browser.close();
  }

  // Generar HTML de comparación
  await buildCompareHtml(outputDir);

  console.log("\nListo. Archivos generados en:");
  console.log(` ${outputDir}`);
  console.log("\nAbrir para revision:");
  console.log(` ${path.join(outputDir, "endcard_compare_sizes.html")}`);
}

async function buildCompareHtml(dir) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>End Card — Comparacion Tamanos Logo</title>
  <style>
    body {
      background: #0d0d0d;
      color: #eee;
      font-family: 'Helvetica Neue', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 24px 60px;
      gap: 20px;
    }
    h1 {
      font-size: 20px;
      letter-spacing: 2px;
      color: #4db8a0;
      text-transform: uppercase;
      margin: 0;
    }
    .subtitle {
      font-size: 13px;
      color: #666;
      margin: 0;
      text-align: center;
      max-width: 700px;
      line-height: 1.6;
    }
    .compare {
      display: flex;
      gap: 32px;
      align-items: flex-start;
      flex-wrap: wrap;
      justify-content: center;
    }
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .label {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 1.5px;
      color: #e8edf2;
    }
    .sublabel {
      font-size: 12px;
      color: #777;
    }
    img {
      border: 1px solid #222;
      display: block;
    }
    .note {
      font-size: 11px;
      color: #555;
      text-align: center;
      margin-top: 8px;
    }
    .badge-current {
      background: #4db8a0;
      color: #0A1520;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 10px;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <h1>End Card &mdash; Comparacion Tamanos Logo</h1>
  <p class="subtitle">
    Canvas 1080&times;1920 &mdash; fondo navy #0A1520 &mdash; centrado visual con viewBox recortado a contenido real (0 0 375 80).<br>
    Todas las versiones se muestran al 40% del tamano real.
  </p>

  <div class="compare">

    <div class="item">
      <div class="label">90% &mdash; 972px</div>
      <div class="sublabel">endcard_90pct.jpg &mdash; <span class="badge-current">ACTUAL APROBADO</span></div>
      <img src="endcard_90pct.jpg" width="432" height="768" />
      <div class="note">Margen lateral: ~54px a c/lado</div>
    </div>

    <div class="item">
      <div class="label">94% &mdash; 1015px</div>
      <div class="sublabel">endcard_94pct.jpg</div>
      <img src="endcard_94pct.jpg" width="432" height="768" />
      <div class="note">Margen lateral: ~32px a c/lado</div>
    </div>

    <div class="item">
      <div class="label">98% &mdash; 1058px</div>
      <div class="sublabel">endcard_98pct.jpg &mdash; margen minimo</div>
      <img src="endcard_98pct.jpg" width="432" height="768" />
      <div class="note">Margen lateral: ~11px a c/lado</div>
    </div>

  </div>

  <p class="note">
    Centrado: body con display:flex + align-items:center + justify-content:center. SVG inline con viewBox recortado a contenido real.<br>
    El logo esta centrado optica y geometricamente en el canvas.
  </p>
</body>
</html>`;

  await fs.writeFile(path.join(dir, "endcard_compare_sizes.html"), html, "utf8");
  console.log("  OK: endcard_compare_sizes.html");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
