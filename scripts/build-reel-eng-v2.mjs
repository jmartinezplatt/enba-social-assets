#!/usr/bin/env node
/**
 * build-reel-eng-v2.mjs
 * Ejecutar desde: C:/Users/josea/enba-social-assets (donde esta Playwright)
 *
 * Pipeline:
 *  1. Playwright → hook-png1.png (linea 1 con "...")
 *  2. Playwright → hook-png2.png (linea 1 sin "..." + linea 2)
 *  3. Playwright → endcard.png (logo 972px centrado, fondo #0A1520)
 *  4. ffmpeg → clip06_timonel_6s.mp4 (freeze ultimo frame, 30fps explicito)
 *  5. ffmpeg → clip07_endcard_v3.mp4 (1s, fade in 0.3s, 30fps explicito)
 *  6. ffmpeg → concat 7 clips → reel-noaudio.mp4
 *  7. ffmpeg → dos overlays hook (PNG1 t=0..2, PNG2 t=2..6) → reel-with-overlays.mp4
 *  8. ffmpeg → mix audio rise_up.wav desde 70.5s, fade out 1.5s → reel-eng-v2-final.mp4
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";
import { chromium } from "playwright";

const DIR   = "C:/Users/josea/enba-social-assets-redes/campaigns/plan-crecimiento-10k/reels/reel-eng-v2";
const LOGO  = "C:/Users/josea/enba-social-assets-redes/campaigns/lanzamiento-15-abr-2026/enba-portfolio-de-marca/03-LOGOS-BASE/ENBA-horizontal-oscuro.svg";

// Clips fuente (todos ya a 30fps, 1080x1920)
const clip01 = `${DIR}/clip01_hook.mp4`;
const clip02 = `${DIR}/clip02_velero.mp4`;
const clip03 = `${DIR}/clip03_acheron.mp4`;
const clip04 = `${DIR}/clip04_pov_trimmed.mp4`;
const clip05 = `${DIR}/clip05_canal_extended.mp4`;
const clip06src = `${DIR}/clip06_timonel.mp4`;

// Intermedios generados
const clip06ext  = `${DIR}/clip06_timonel_6s.mp4`;
const endcardPng = `${DIR}/endcard_v3.png`;
const clip07     = `${DIR}/clip07_endcard_v3.mp4`;
const hookPng1   = `${DIR}/hook-png1.png`;
const hookPng2   = `${DIR}/hook-png2.png`;
const concatTxt  = `${DIR}/concat_v3.txt`;
const noAudio    = `${DIR}/reel-noaudio-v3.mp4`;
const withOverlay = `${DIR}/reel-with-overlays-v3.mp4`;
const audioSrc   = `${DIR}/rise_up.wav`;
const output     = `${DIR}/reel-eng-v2-final.mp4`;

// Duraciones: 3 + 5 + 2.866667 + 3 + 6 + 6 + 1 = 26.866667s
const DURATION    = 26.866667;
const AUDIO_START = 70.5;
const FADE_START  = DURATION - 1.5;  // 25.366667s

function run(cmd, args) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit" });
}

// ── 1. hook-png1: linea 1 con "..." ─────────────────────────────────────────
async function step1_hookPng1() {
  console.log("\n[1/8] Renderizando hook-png1.png (linea 1 con ...)...");
  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Teko:wght@700&display=swap" rel="stylesheet">
  <style>
    html, body { margin: 0; width: 1080px; height: 1920px; background: transparent; overflow: hidden; }
    .stack {
      position: absolute;
      left: 64px;
      bottom: 500px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: 952px;
    }
    .line { display: inline-flex; align-self: flex-start; max-width: 100%; }
    .line span {
      display: inline-block;
      background: rgba(10, 21, 32, 0.78);
      color: #E8EDF2;
      border: 1px solid rgba(232, 237, 242, 0.08);
      border-radius: 20px;
      padding: 14px 20px 10px;
      font-family: "Teko", sans-serif;
      font-size: 72px;
      font-weight: 700;
      letter-spacing: 1px;
      line-height: 0.9;
      text-transform: uppercase;
      box-shadow: 0 18px 36px rgba(0,0,0,0.18);
    }
  </style>
</head><body>
  <div class="stack">
    <div class="line"><span>\u00bfCu\u00e1ndo fue la \u00faltima vez...</span></div>
  </div>
</body></html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({ path: hookPng1, omitBackground: true });
  await browser.close();
  console.log(`    => ${hookPng1}`);
}

// ── 2. hook-png2: linea 1 sin "..." + linea 2 ────────────────────────────────
async function step2_hookPng2() {
  console.log("\n[2/8] Renderizando hook-png2.png (linea 1 sin ... + linea 2)...");
  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Teko:wght@700&display=swap" rel="stylesheet">
  <style>
    html, body { margin: 0; width: 1080px; height: 1920px; background: transparent; overflow: hidden; }
    .stack {
      position: absolute;
      left: 64px;
      bottom: 500px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      width: 952px;
    }
    .line { display: inline-flex; align-self: flex-start; max-width: 100%; }
    .line span {
      display: inline-block;
      background: rgba(10, 21, 32, 0.78);
      color: #E8EDF2;
      border: 1px solid rgba(232, 237, 242, 0.08);
      border-radius: 20px;
      padding: 14px 20px 10px;
      font-family: "Teko", sans-serif;
      font-size: 72px;
      font-weight: 700;
      letter-spacing: 1px;
      line-height: 0.9;
      text-transform: uppercase;
      box-shadow: 0 18px 36px rgba(0,0,0,0.18);
    }
  </style>
</head><body>
  <div class="stack">
    <div class="line"><span>\u00bfCu\u00e1ndo fue la \u00faltima vez</span></div>
    <div class="line"><span>que hiciste algo por primera vez?</span></div>
  </div>
</body></html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({ path: hookPng2, omitBackground: true });
  await browser.close();
  console.log(`    => ${hookPng2}`);
}

// ── 3. endcard.png: logo 972px centrado con flexbox ──────────────────────────
async function step3_endcardPng() {
  console.log("\n[3/8] Renderizando endcard_v3.png (logo 90% centrado)...");
  const logoSvg = readFileSync(LOGO, "utf8");
  const html = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <style>
    html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; }
    .endcard {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, #07131d 0%, #0A1520 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .endcard-logo { width: 972px; }
    .endcard-logo svg { display: block; width: 100%; height: auto; }
  </style>
</head><body>
  <div class="endcard">
    <div class="endcard-logo">${logoSvg}</div>
  </div>
</body></html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.screenshot({ path: endcardPng });
  await browser.close();
  console.log(`    => ${endcardPng}`);
}

// ── 4. Extender clip06 a 6s (freeze, 30fps explicito) ─────────────────────
function step4_extendClip06() {
  console.log("\n[4/8] Extendiendo clip06_timonel → 6s (30fps)...");
  run("ffmpeg", [
    "-y",
    "-i", clip06src,
    "-vf", "tpad=stop_mode=clone:stop_duration=2",
    "-r", "30",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-an",
    "-t", "6",
    clip06ext,
  ]);
}

// ── 5. Generar clip07: 1s endcard, fade in 0.3s, 30fps explicito ─────────────
function step5_buildClip07() {
  console.log("\n[5/8] Generando clip07_endcard_v3.mp4 (1s, fade in 0.3s, 30fps)...");
  run("ffmpeg", [
    "-y",
    "-loop", "1",
    "-framerate", "30",
    "-i", endcardPng,
    "-vf", "fade=t=in:st=0:d=0.3",
    "-r", "30",
    "-t", "1.0",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-an",
    clip07,
  ]);
}

// ── 6. Concat 7 clips ─────────────────────────────────────────────────────
function step6_concat() {
  console.log("\n[6/8] Concatenando 7 clips → reel-noaudio-v3.mp4...");
  const content = [
    `file '${clip01}'`,
    `file '${clip02}'`,
    `file '${clip03}'`,
    `file '${clip04}'`,
    `file '${clip05}'`,
    `file '${clip06ext}'`,
    `file '${clip07}'`,
  ].join("\n");
  writeFileSync(concatTxt, content, "utf8");

  run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatTxt,
    "-map", "0:v",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-r", "30",
    "-an",
    "-movflags", "+faststart",
    noAudio,
  ]);
}

// ── 7. Dos overlays hook: PNG1 t=0..2, PNG2 t=2..6 ───────────────────────
function step7_overlays() {
  console.log("\n[7/8] Aplicando overlays hook (PNG1 t=0-2, PNG2 t=2-6)...");
  run("ffmpeg", [
    "-y",
    "-i", noAudio,
    "-i", hookPng1,
    "-i", hookPng2,
    "-filter_complex",
    "[0:v][1:v]overlay=0:0:enable='between(t,0,2)'[v1];[v1][2:v]overlay=0:0:enable='between(t,2,6)'[v]",
    "-map", "[v]",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.1",
    "-preset", "medium",
    "-r", "30",
    "-movflags", "+faststart",
    withOverlay,
  ]);
}

// ── 8. Mix audio: rise_up.wav desde 70.5s, fade out 1.5s al final ────────
function step8_audio() {
  console.log("\n[8/8] Mezclando audio y generando output final...");
  run("ffmpeg", [
    "-y",
    "-i", withOverlay,
    "-ss", String(AUDIO_START),
    "-i", audioSrc,
    "-filter_complex", `[1:a]afade=t=out:st=${FADE_START}:d=1.5[a]`,
    "-map", "0:v",
    "-map", "[a]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-t", String(DURATION),
    "-movflags", "+faststart",
    output,
  ]);
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  // Playwright: los 3 PNGs en paralelo
  await Promise.all([
    step1_hookPng1(),
    step2_hookPng2(),
    step3_endcardPng(),
  ]);

  // ffmpeg pipeline secuencial
  step4_extendClip06();
  step5_buildClip07();
  step6_concat();
  step7_overlays();
  step8_audio();

  // Verificacion final
  const probe = execSync(`ffprobe -v error -show_entries format=duration,size -of json "${output}"`).toString();
  const info  = JSON.parse(probe);
  console.log(`\n✓ LISTO: ${output}`);
  console.log(`  Duracion: ${parseFloat(info.format.duration).toFixed(2)}s  (esperado: ${DURATION.toFixed(2)}s)`);
  console.log(`  Tamano:   ${(parseInt(info.format.size) / 1024 / 1024).toFixed(2)} MB`);

  // Verificar fps del output
  const fpsRaw = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "${output}"`).toString().trim();
  console.log(`  FPS:      ${fpsRaw}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
