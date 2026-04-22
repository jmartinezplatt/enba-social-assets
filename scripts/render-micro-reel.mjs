#!/usr/bin/env node
/**
 * render-micro-reel.mjs — Micro-reel 15s "SEGUINOS..." v3
 *
 * Fixes v3:
 *   - Clip 2: 114E0CCF start=15 (bandera argentina limpia, sin texto quemado)
 *   - Logo 90% ancho (972px)
 *   - "SEGUINOS..." en lugar de "SEGUINOS"
 *   - Fade-in en logo card
 *   - Música: kevin-graham track
 *   - Fade-out música al final
 *
 * Uso: node scripts/render-micro-reel.mjs
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CLIPS_DIR = "C:/Users/josea/enba-fotos-crudas/google-photos/Veleros";
const LOGO = "campaigns/reels/reel-primera-vez/segments/logo-official.png";
const MUSIC = "C:/Users/josea/Downloads/53-kevin-graham-main-version-47358-01-40.mp3";
const OUTPUT_DIR = "campaigns/plan-crecimiento-10k/reels";
const OUTPUT = path.join(OUTPUT_DIR, "micro-reel-seguinos-v3.mp4");
const TEMP_DIR = path.join(OUTPUT_DIR, "temp-micro-reel");

const CLIPS = [
  { file: "IMG_4635.MOV", start: 3, dur: 2.5, label: "grupo-selfie" },
  { file: "114E0CCF-37F0-441C-9570-886925D41F46.mov", start: 15, dur: 2, label: "bandera-argentina" },
  { file: "9DAF427A-A44C-49DE-99ED-C1C6DE3A8F71.mp4", start: 1, dur: 2, label: "velero-azul" },
  { file: "IMG_1314.MOV", start: 1, dur: 2, label: "velero-exterior" },
  { file: "IMG_4576.MOV", start: 3, dur: 2, label: "estela-accion" },
  { file: "IMG_1504.MOV", start: 1, dur: 2, label: "vela-dorada" },
  { file: "IMG_4639.MOV", start: 2, dur: 2, label: "sunset-navegando" },
];

const LOGO_DURATION = 2; // un poco más para el fade-in

function run(cmd, label) {
  console.log(`\n[${label}]`);
  console.log(`  $ ${cmd.substring(0, 250)}...`);
  try {
    execSync(cmd, { stdio: "pipe", timeout: 120000 });
    console.log(`  ✓ OK`);
  } catch (e) {
    console.error(`  ✗ FAILED: ${e.stderr?.toString().substring(0, 500)}`);
    throw e;
  }
}

// ── Setup ───────────────────────────────────────────────
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

console.log("═══ MICRO-REEL 'SEGUINOS...' — v3 ═══\n");

// ── Step 1: Extract and normalize clips ──
console.log("PASO 1: Extraer y normalizar clips...");

const normalizedFiles = [];

for (let i = 0; i < CLIPS.length; i++) {
  const c = CLIPS[i];
  const input = path.join(CLIPS_DIR, c.file);
  const output = path.join(TEMP_DIR, `clip-${String(i).padStart(2, "0")}-${c.label}.mp4`);

  const cmd = `ffmpeg -y -ss ${c.start} -i "${input}" -t ${c.dur} -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" -r 30 -c:v libx264 -preset fast -crf 18 -an -pix_fmt yuv420p "${output}"`;
  run(cmd, `Clip ${i + 1}/${CLIPS.length}: ${c.label}`);
  normalizedFiles.push(output);
}

// ── Step 2: Logo card with fade-in ──
console.log("\nPASO 2: Logo card (90%, fade-in, SEGUINOS...)...");

const logoCard = path.join(TEMP_DIR, "clip-07-logo.mp4");
// Logo at 90% width (972px), fade-in from black over 0.6s, "SEGUINOS..."
const logoCmd = `ffmpeg -y -f lavfi -i "color=c=0x0a1628:s=1080x1920:d=${LOGO_DURATION}:r=30" -i "${LOGO}" -filter_complex "[1:v]scale=972:-1[logo];[0:v][logo]overlay=(W-w)/2:(H-h)/2-100[bg];[bg]drawtext=text='SEGUINOS...':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h/2)+200:fontfile='C\\:/Windows/Fonts/arialbd.ttf'[txt];[txt]fade=t=in:st=0:d=0.6" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an "${logoCard}"`;
run(logoCmd, "Logo card");
normalizedFiles.push(logoCard);

// ── Step 3: Concatenate video clips ──
console.log("\nPASO 3: Concatenar video...");

const concatList = path.join(TEMP_DIR, "concat.txt");
const concatContent = normalizedFiles.map(f => `file '${path.resolve(f).replace(/\\/g, "/")}'`).join("\n");
fs.writeFileSync(concatList, concatContent);

const concatVideo = path.join(TEMP_DIR, "concat-video.mp4");
const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart "${concatVideo}"`;
run(concatCmd, "Concatenar video");

// Get video duration
const probeCmd = `ffprobe -v error -show_entries format=duration -of csv=p=0 "${concatVideo}"`;
const videoDuration = parseFloat(execSync(probeCmd, { encoding: "utf-8" }).trim());
console.log(`  Video duration: ${videoDuration}s`);

// ── Step 4: Add music with fade-out ──
console.log("\nPASO 4: Agregar música con fade-out...");

const fadeStart = videoDuration - 2; // fade-out últimos 2 segundos
const finalCmd = `ffmpeg -y -i "${concatVideo}" -i "${MUSIC}" -filter_complex "[1:a]atrim=0:${videoDuration},afade=t=out:st=${fadeStart}:d=2[music]" -map 0:v -map "[music]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "${OUTPUT}"`;
run(finalCmd, "Merge video + música");

// ── Step 5: Verify ──
console.log("\nPASO 5: Verificar...");
const finalDuration = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${OUTPUT}"`, { encoding: "utf-8" }).trim();
console.log(`  Duración: ${finalDuration}s`);
console.log(`  Output: ${OUTPUT}`);

console.log("\n═══ MICRO-REEL v3 LISTO ═══");
console.log(`Archivo: ${OUTPUT}`);
console.log(`Duración: ${finalDuration}s`);
console.log(`Resolución: 1080x1920 (9:16)`);
console.log(`Clips: ${CLIPS.length} + logo card`);
console.log(`Música: kevin-graham (fade-out últimos 2s)`);
console.log(`Fixes: texto quemado eliminado, logo 90%, SEGUINOS..., fade-in logo`);
