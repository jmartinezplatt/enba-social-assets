#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const baseDir = path.resolve("C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/tiktok-30d-pilot");
const inputVideo = path.join(baseDir, "media", "956CF4EA-ED6E-49B9-B883-B17C6A2D7403-h264.mp4");
const logoPath = path.join(baseDir, "brand", "ENBA-horizontal-oscuro.svg");
const outputDir = path.join(baseDir, "final");
const assetDir = path.join(outputDir, "tt01-endcard-v6");

const outputVideo = path.join(outputDir, "TT01-final-enba-v6-endcard-logo-fade.mp4");
const mainClip = path.join(assetDir, "tt01-main-cut-27_5s.mp4");
const endCardPng = path.join(assetDir, "tt01-endcard-logo-only.png");
const endCardVideo = path.join(assetDir, "tt01-endcard-logo-fade.mp4");

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
    .endcard {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top left, rgba(77, 184, 160, 0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(212, 168, 67, 0.16), transparent 22%),
        linear-gradient(180deg, #07131d 0%, #0A1520 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .endcard-logo {
      width: 972px;
      max-width: 90%;
    }
    .endcard-logo svg {
      display: block;
      width: 100%;
      height: auto;
      filter: drop-shadow(0 18px 32px rgba(0, 0, 0, 0.24));
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

function buildEndCardHtml(logoSvg) {
  return htmlShell(`
    <div class="endcard">
      <div class="endcard-logo">${logoSvg}</div>
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
    await screenshotHtml(browser, buildEndCardHtml(logoSvg), endCardPng);
  } finally {
    await browser.close();
  }
}

function buildMainClip() {
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
    "-t", "27.5",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-movflags", "+faststart",
    "-c:a", "aac",
    "-b:a", "192k",
    mainClip
  ]);
}

function buildEndCardClip() {
  run("ffmpeg", [
    "-y",
    "-loop", "1",
    "-i", endCardPng,
    "-f", "lavfi",
    "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-filter_complex",
    "[0:v]zoompan=z='if(eq(on,0),1.02,max(1.0,1.02-0.0006667*on))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,fade=t=in:st=0:d=0.18,fade=t=out:st=0.9:d=0.3[v]",
    "-map", "[v]",
    "-map", "1:a",
    "-t", "1.5",
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
}

function buildFinalVideo() {
  run("ffmpeg", [
    "-y",
    "-i", mainClip,
    "-i", endCardVideo,
    "-filter_complex", "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]",
    "-map", "[v]",
    "-map", "[a]",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    outputVideo
  ]);
}

async function main() {
  await ensureDirs();
  await renderAssets();
  buildMainClip();
  buildEndCardClip();
  buildFinalVideo();
  console.log(`\nListo:\n- ${outputVideo}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
