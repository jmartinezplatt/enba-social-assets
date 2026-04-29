#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const baseDir = path.resolve("C:/Users/josea/enba-social-assets/campaigns/plan-crecimiento-10k/tiktok-30d-pilot");
const inputVideo = path.join(baseDir, "media", "956CF4EA-ED6E-49B9-B883-B17C6A2D7403-h264.mp4");
const outputDir = path.join(baseDir, "final");
const overlayDir = path.join(baseDir, "final", "tt01-overlays");
const outputVideo = path.join(outputDir, "TT01-final-enba.mp4");
const logoPath = path.join(baseDir, "brand", "ENBA-horizontal-oscuro.svg");

const overlays = [
  {
    file: path.join(overlayDir, "tt01-overlay-01.png"),
    lines: ["No hace falta irte lejos"],
    showLogo: false
  },
  {
    file: path.join(overlayDir, "tt01-overlay-02.png"),
    lines: ["No hace falta irte lejos", "para vivir esto"],
    showLogo: false
  },
  {
    file: path.join(overlayDir, "tt01-overlay-03.png"),
    lines: ["No hace falta irte lejos", "para vivir esto", "Buenos Aires desde el agua"],
    showLogo: true
  }
];

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

async function ensureDirs() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(overlayDir, { recursive: true });
}

function buildHtml(lines, logoSvg, showLogo) {
  const lineHtml = lines
    .map(
      (line, index) => `
        <div class="line line-${index + 1}">
          <span>${line}</span>
        </div>`
    )
    .join("");

  const logoHtml = showLogo
    ? `<div class="logo-wrap">${logoSvg}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600&family=Teko:wght@600;700&display=swap" rel="stylesheet">
  <style>
    html, body {
      margin: 0;
      width: 1080px;
      height: 1920px;
      background: transparent;
      overflow: hidden;
    }
    body {
      position: relative;
      font-family: "Barlow Semi Condensed", Arial, sans-serif;
      color: #E8EDF2;
    }
    .stack {
      position: absolute;
      left: 70px;
      bottom: 310px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      width: 860px;
    }
    .line {
      display: inline-flex;
      align-self: flex-start;
      max-width: 100%;
    }
    .line span {
      display: inline-block;
      background: rgba(10, 21, 32, 0.82);
      color: #E8EDF2;
      border: 1px solid rgba(232, 237, 242, 0.08);
      border-radius: 22px;
      padding: 18px 24px 12px;
      font-family: "Teko", "Bebas Neue", sans-serif;
      font-size: 86px;
      font-weight: 700;
      letter-spacing: 1px;
      line-height: 0.9;
      text-transform: uppercase;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
    }
    .line-3 span {
      font-size: 70px;
    }
    .logo-wrap {
      position: absolute;
      left: 70px;
      bottom: 140px;
      width: 340px;
      opacity: 0.94;
    }
    .logo-wrap svg {
      display: block;
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="stack">${lineHtml}</div>
  ${logoHtml}
</body>
</html>`;
}

async function renderOverlay(browser, overlay, logoSvg) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(buildHtml(overlay.lines, logoSvg, overlay.showLogo), { waitUntil: "networkidle" });
  await page.screenshot({ path: overlay.file, omitBackground: true });
  await page.close();
}

async function renderOverlays() {
  const logoSvg = await fs.readFile(logoPath, "utf8");
  const browser = await chromium.launch({ headless: true });
  try {
    for (const overlay of overlays) {
      await renderOverlay(browser, overlay, logoSvg);
    }
  } finally {
    await browser.close();
  }
}

function renderFinalVideo() {
  const filter = [
    `[0:v][1:v]overlay=0:0:enable='between(t,0.35,2.60)'[v1]`,
    `[v1][2:v]overlay=0:0:enable='between(t,2.60,5.10)'[v2]`,
    `[v2][3:v]overlay=0:0:enable='gte(t,5.10)'[v3]`
  ].join(";");

  run("ffmpeg", [
    "-y",
    "-i", inputVideo,
    "-i", overlays[0].file,
    "-i", overlays[1].file,
    "-i", overlays[2].file,
    "-filter_complex", filter,
    "-map", "[v3]",
    "-map", "0:a?",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-movflags", "+faststart",
    "-c:a", "copy",
    outputVideo
  ]);
}

async function main() {
  await ensureDirs();
  await renderOverlays();
  renderFinalVideo();
  console.log(`\nTT01 listo: ${outputVideo}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
