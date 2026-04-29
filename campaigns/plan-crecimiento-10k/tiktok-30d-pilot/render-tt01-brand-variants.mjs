#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const baseDir = path.resolve("C:/Users/josea/enba-social-assets/campaigns/plan-crecimiento-10k/tiktok-30d-pilot");
const inputVideo = path.join(baseDir, "media", "956CF4EA-ED6E-49B9-B883-B17C6A2D7403-h264.mp4");
const logoPath = path.join(baseDir, "brand", "ENBA-horizontal-oscuro.svg");
const outputDir = path.join(baseDir, "final");
const assetDir = path.join(outputDir, "tt01-brand-variants");

const outputs = {
  logoSafe: path.join(outputDir, "TT01-final-enba-v3-logo-safe.mp4"),
  endCard: path.join(outputDir, "TT01-final-enba-v4-endcard.mp4")
};

const textOverlays = [
  {
    file: path.join(assetDir, "tt01-text-01.png"),
    lines: ["No hace falta irte", "lejos"]
  },
  {
    file: path.join(assetDir, "tt01-text-02.png"),
    lines: ["No hace falta irte", "lejos", "para vivir esto"]
  },
  {
    file: path.join(assetDir, "tt01-text-03.png"),
    lines: ["No hace falta irte", "lejos", "para vivir esto", "Buenos Aires desde el agua"]
  }
];

const logoOverlay = path.join(assetDir, "tt01-logo-safe.png");
const endCardPng = path.join(assetDir, "tt01-endcard.png");
const endCardVideo = path.join(assetDir, "tt01-endcard.mp4");
const mainNoLogo = path.join(assetDir, "tt01-main-no-logo.mp4");
const concatList = path.join(assetDir, "tt01-endcard-concat.txt");

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

async function ensureDirs() {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(assetDir, { recursive: true });
}

function htmlShell(content) {
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
      color: #E8EDF2;
      font-family: "Barlow Semi Condensed", Arial, sans-serif;
    }
    .stack {
      position: absolute;
      left: 64px;
      bottom: 620px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: 820px;
    }
    .line {
      display: inline-flex;
      align-self: flex-start;
      max-width: 100%;
    }
    .line span {
      display: inline-block;
      background: rgba(10, 21, 32, 0.78);
      color: #E8EDF2;
      border: 1px solid rgba(232, 237, 242, 0.08);
      border-radius: 20px;
      padding: 14px 20px 10px;
      font-family: "Teko", "Bebas Neue", sans-serif;
      font-size: 72px;
      font-weight: 700;
      letter-spacing: 1px;
      line-height: 0.9;
      text-transform: uppercase;
      box-shadow: 0 18px 36px rgba(0, 0, 0, 0.18);
    }
    .line-4 span {
      font-size: 58px;
    }
    .safe-logo {
      position: absolute;
      top: 150px;
      right: 54px;
      width: 190px;
      opacity: 0.92;
      filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.18));
    }
    .safe-logo svg,
    .endcard-logo svg {
      display: block;
      width: 100%;
      height: auto;
    }
    .endcard {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top left, rgba(77, 184, 160, 0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(212, 168, 67, 0.16), transparent 22%),
        linear-gradient(180deg, #07131d 0%, #0A1520 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 30px;
    }
    .endcard-logo {
      width: 420px;
    }
    .endcard-copy {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 12px 22px;
      font-family: "Barlow Semi Condensed", Arial, sans-serif;
      font-size: 34px;
      font-weight: 600;
      letter-spacing: 0.4px;
      color: rgba(232, 237, 242, 0.92);
    }
  </style>
</head>
<body>${content}</body>
</html>`;
}

function buildTextHtml(lines) {
  const lineHtml = lines
    .map(
      (line, index) => `
        <div class="line line-${index + 1}">
          <span>${line}</span>
        </div>`
    )
    .join("");

  return htmlShell(`<div class="stack">${lineHtml}</div>`);
}

function buildLogoHtml(logoSvg) {
  return htmlShell(`<div class="safe-logo">${logoSvg}</div>`);
}

function buildEndCardHtml(logoSvg) {
  return htmlShell(`
    <div class="endcard">
      <div class="endcard-logo">${logoSvg}</div>
      <div class="endcard-copy">Espacio Náutico Buenos Aires</div>
    </div>
  `);
}

async function screenshotHtml(browser, html, file) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

async function renderAssets() {
  const browser = await chromium.launch({ headless: true });
  const logoSvg = await fs.readFile(logoPath, "utf8");
  try {
    for (const overlay of textOverlays) {
      await screenshotHtml(browser, buildTextHtml(overlay.lines), overlay.file);
    }
    await screenshotHtml(browser, buildLogoHtml(logoSvg), logoOverlay);
    await screenshotHtml(browser, buildEndCardHtml(logoSvg), endCardPng);
  } finally {
    await browser.close();
  }
}

function buildLogoSafeVersion() {
  const filter = [
    `[0:v][1:v]overlay=0:0:enable='between(t,0.35,2.60)'[v1]`,
    `[v1][2:v]overlay=0:0:enable='between(t,2.60,5.10)'[v2]`,
    `[v2][3:v]overlay=0:0:enable='gte(t,5.10)'[v3]`,
    `[v3][4:v]overlay=0:0:enable='gte(t,0)'[v4]`
  ].join(";");

  run("ffmpeg", [
    "-y",
    "-i", inputVideo,
    "-i", textOverlays[0].file,
    "-i", textOverlays[1].file,
    "-i", textOverlays[2].file,
    "-i", logoOverlay,
    "-filter_complex", filter,
    "-map", "[v4]",
    "-map", "0:a?",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-movflags", "+faststart",
    "-c:a", "copy",
    outputs.logoSafe
  ]);
}

function buildMainNoLogoVersion() {
  const filter = [
    `[0:v][1:v]overlay=0:0:enable='between(t,0.35,2.60)'[v1]`,
    `[v1][2:v]overlay=0:0:enable='between(t,2.60,5.10)'[v2]`,
    `[v2][3:v]overlay=0:0:enable='gte(t,5.10)'[v3]`
  ].join(";");

  run("ffmpeg", [
    "-y",
    "-i", inputVideo,
    "-i", textOverlays[0].file,
    "-i", textOverlays[1].file,
    "-i", textOverlays[2].file,
    "-filter_complex", filter,
    "-map", "[v3]",
    "-map", "0:a?",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-movflags", "+faststart",
    "-c:a", "copy",
    mainNoLogo
  ]);
}

async function buildEndCardVersion() {
  run("ffmpeg", [
    "-y",
    "-loop", "1",
    "-i", endCardPng,
    "-f", "lavfi",
    "-i", "anullsrc=channel_layout=mono:sample_rate=44100",
    "-t", "1.2",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-c:a", "aac",
    "-b:a", "128k",
    "-shortest",
    "-movflags", "+faststart",
    endCardVideo
  ]);

  await fs.writeFile(
    concatList,
    [
      `file '${mainNoLogo.replace(/\\/g, "/")}'`,
      `file '${endCardVideo.replace(/\\/g, "/")}'`
    ].join("\n"),
    "utf8"
  );

  run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatList,
    "-c", "copy",
    outputs.endCard
  ]);
}

async function main() {
  await ensureDirs();
  await renderAssets();
  buildLogoSafeVersion();
  buildMainNoLogoVersion();
  await buildEndCardVersion();
  console.log(`\nListo:\n- ${outputs.logoSafe}\n- ${outputs.endCard}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
