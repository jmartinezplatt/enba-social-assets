#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const baseDir = path.resolve("C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/tiktok-30d-pilot");
const piecesFile = path.join(baseDir, "tiktok-pieces.js");
const logoPath = path.join(baseDir, "brand", "ENBA-horizontal-oscuro.svg");
const outputDir = path.join(baseDir, "final");

const [pieceId, mainDurationArg, variantArg] = process.argv.slice(2);

if (!pieceId) {
  console.error("Uso: node render-tiktok-piece.mjs <TT##> [mainDurationSeconds] [variantName]");
  process.exit(1);
}

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

async function loadPieces() {
  const source = await fs.readFile(piecesFile, "utf8");
  const context = { globalThis: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.globalThis.ENBATiktokPieces ?? [];
}

async function probeDuration(file) {
  const output = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file
  ], { encoding: "utf8" });
  return Number.parseFloat(output.trim());
}

function sanitizeSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function computeMainDuration(sourceDuration, requestedDuration) {
  if (Number.isFinite(requestedDuration) && requestedDuration > 3) {
    return Math.min(sourceDuration, requestedDuration);
  }
  if (sourceDuration <= 14.5) return Math.max(6, sourceDuration - 1.4);
  if (sourceDuration <= 21) return Math.max(10, sourceDuration - 1.5);
  return Math.min(20.5, Math.max(14, sourceDuration - 1.6));
}

function htmlShell(content, lineCount) {
  const bottom = lineCount >= 4 ? 710 : 660;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600&family=Teko:wght@600;700&display=swap" rel="stylesheet">
  <style>
    html, body { margin: 0; width: 1080px; height: 1920px; background: transparent; overflow: hidden; }
    body { position: relative; color: #E8EDF2; font-family: "Barlow Semi Condensed", Arial, sans-serif; }
    .stack { position: absolute; left: 64px; bottom: ${bottom}px; display: flex; flex-direction: column; gap: 14px; width: 920px; }
    .line { display: inline-flex; align-self: flex-start; max-width: 100%; }
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
    .line-2 span { font-size: 68px; }
    .line-3 span { font-size: 64px; }
    .line-4 span { font-size: 60px; }
    .endcard {
      position: absolute; inset: 0;
      background:
        radial-gradient(circle at top left, rgba(77, 184, 160, 0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(212, 168, 67, 0.16), transparent 22%),
        linear-gradient(180deg, #07131d 0%, #0A1520 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .endcard-logo { width: 972px; max-width: 90%; }
    .endcard-logo svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 18px 32px rgba(0, 0, 0, 0.24)); }
  </style>
</head>
<body>${content}</body>
</html>`;
}

function buildTextHtml(lines) {
  const lineHtml = lines.map((line, index) => `<div class="line line-${index + 1}"><span>${line}</span></div>`).join("");
  return htmlShell(`<div class="stack">${lineHtml}</div>`, lines.length);
}

function buildEndCardHtml(logoSvg) {
  return htmlShell(`<div class="endcard"><div class="endcard-logo">${logoSvg}</div></div>`, 1);
}

async function screenshotHtml(browser, html, file) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

async function renderAssets(textOverlays, endCardPng) {
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

function buildMainClip(inputVideo, textOverlays, mainClip, mainDuration, trimStart = 0) {
  const filterSteps = ["[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[base]"];
  let current = "base";
  const step = Math.max(1.8, (mainDuration - 0.6) / textOverlays.length);
  let start = 0.2;

  for (let index = 0; index < textOverlays.length; index += 1) {
    const next = `v${index + 1}`;
    const enable = index === textOverlays.length - 1
      ? `gte(t,${start.toFixed(2)})`
      : `between(t,${start.toFixed(2)},${(start + step).toFixed(2)})`;
    filterSteps.push(`[${current}][${index + 1}:v]overlay=0:0:enable='${enable}'[${next}]`);
    current = next;
    start += step;
  }

  run("ffmpeg", [
    "-y",
    ...(trimStart > 0 ? ["-ss", trimStart.toFixed(2)] : []),
    "-i", inputVideo,
    ...textOverlays.flatMap((overlay) => ["-i", overlay.file]),
    "-filter_complex", filterSteps.join(";"),
    "-map", `[${current}]`, "-map", "0:a?",
    "-t", mainDuration.toFixed(2),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
    "-movflags", "+faststart", "-c:a", "aac", "-b:a", "192k",
    mainClip
  ]);
}

function buildEndCardClip(endCardPng, endCardVideo) {
  run("ffmpeg", [
    "-y", "-loop", "1", "-i", endCardPng,
    "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-filter_complex", "[0:v]zoompan=z='if(eq(on,0),1.02,max(1.0,1.02-0.0006667*on))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,fade=t=in:st=0:d=0.18,fade=t=out:st=0.9:d=0.3[v]",
    "-map", "[v]", "-map", "1:a", "-t", "1.5",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
    "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart",
    endCardVideo
  ]);
}

function buildFinalVideo(mainClip, endCardVideo, outputVideo) {
  run("ffmpeg", [
    "-y", "-i", mainClip, "-i", endCardVideo,
    "-filter_complex", "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]",
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    outputVideo
  ]);
}

async function main() {
  const pieces = await loadPieces();
  const piece = pieces.find((entry) => entry.id === pieceId);

  if (!piece) {
    throw new Error(`No encontré la pieza ${pieceId}`);
  }

  const inputVideo = path.join(baseDir, piece.media);
  const sourceDuration = await probeDuration(inputVideo);
  const trimStart = Number.isFinite(piece.trimStart) ? piece.trimStart : 0;
  const usableDuration = Math.max(0.1, sourceDuration - trimStart);
  const requestedDuration = mainDurationArg ? Number.parseFloat(mainDurationArg) : NaN;
  const mainDuration = computeMainDuration(usableDuration, requestedDuration);
  const variant = variantArg || `${pieceId.toLowerCase()}-endcard-v1`;
  const slug = sanitizeSlug(variant);
  const assetDir = path.join(outputDir, slug);
  const outputVideo = path.join(outputDir, `${pieceId}-final-enba-v1-endcard-logo-fade.mp4`);
  const mainClip = path.join(assetDir, `${pieceId.toLowerCase()}-main-cut.mp4`);
  const endCardPng = path.join(assetDir, `${pieceId.toLowerCase()}-endcard-logo-only.png`);
  const endCardVideo = path.join(assetDir, `${pieceId.toLowerCase()}-endcard-logo-fade.mp4`);
  const textOverlays = piece.screenText.map((_, index) => ({
    file: path.join(assetDir, `${pieceId.toLowerCase()}-text-${String(index + 1).padStart(2, "0")}.png`),
    lines: piece.screenText.slice(0, index + 1)
  }));

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(assetDir, { recursive: true });
  await renderAssets(textOverlays, endCardPng);
  buildMainClip(inputVideo, textOverlays, mainClip, mainDuration, trimStart);
  buildEndCardClip(endCardPng, endCardVideo);
  buildFinalVideo(mainClip, endCardVideo, outputVideo);

  console.log(`\nListo:\n- ${outputVideo}\n- duración fuente: ${sourceDuration.toFixed(2)}s\n- trim start: ${trimStart.toFixed(2)}s\n- main cut: ${mainDuration.toFixed(2)}s`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
