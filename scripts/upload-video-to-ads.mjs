#!/usr/bin/env node
/**
 * upload-video-to-ads.mjs — Sube un video a Meta Ads y actualiza los ads microreel
 *
 * Pipeline completo:
 *   1. Upload video via multipart form-data (soporta archivos grandes)
 *   2. Espera procesamiento de Meta
 *   3. Extrae thumbnail del video y la sube como ad image
 *   4. Crea 2 ad creatives (IG: VIEW_INSTAGRAM_PROFILE, FB: LIKE_PAGE)
 *   5. Actualiza los 4 ads microreel en follow_plan_v2
 *   6. Actualiza meta-ids.json
 *
 * Uso:
 *   node scripts/upload-video-to-ads.mjs <video-file> [--caption "texto"] [--name "nombre"]
 *
 * Ejemplos:
 *   node scripts/upload-video-to-ads.mjs campaigns/plan-crecimiento-10k/reels/micro-reel-seguinos-v3.mp4
 *   node scripts/upload-video-to-ads.mjs mi-reel.mp4 --caption "Hook distinto. Seguinos."
 *   node scripts/upload-video-to-ads.mjs mi-reel.mp4 --name "ENBA_reel_nuevo_v1"
 */

import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { execSync } from "node:child_process";

// ── Config ──────────────────────────────────────────────
const API = "v22.0";
const BASE = `https://graph.facebook.com/${API}`;
const AD_ACCOUNT = "act_2303565156801569";
const PAGE_ID = "1064806400040502";
const IG_USER_ID = "17841443139761422";
const IG_PROFILE_URL = "https://www.instagram.com/espacionauticobsas/";
const META_IDS = path.resolve("campaigns/plan-crecimiento-10k/meta-ids.json");

const DEFAULT_CAPTION =
  "No necesitás experiencia. Solo ganas. Seguinos.\n\n" +
  "#EspacioNautico #ENBA #NavegaElRioDeLaPlata #VelerosBuenosAires #SalidaDistinta";

// ── Parse args ──────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === "--help") {
  console.log("Uso: node scripts/upload-video-to-ads.mjs <video-file> [--caption \"...\"] [--name \"...\"]");
  process.exit(0);
}

const videoFile = path.resolve(args[0]);
if (!fs.existsSync(videoFile)) {
  console.error(`ERROR: archivo no encontrado: ${videoFile}`);
  process.exit(1);
}

let caption = DEFAULT_CAPTION;
let videoName = path.basename(videoFile, path.extname(videoFile));

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--caption" && args[i + 1]) { caption = args[++i]; }
  if (args[i] === "--name" && args[i + 1]) { videoName = args[++i]; }
}

// ── Token ───────────────────────────────────────────────
const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) {
  console.error("ERROR: META_ADS_USER_TOKEN no encontrado en Windows User scope");
  process.exit(1);
}
console.log("TOKEN: CARGADA");

// ── State ───────────────────────────────────────────────
const state = JSON.parse(fs.readFileSync(META_IDS, "utf-8"));
function saveState() {
  fs.writeFileSync(META_IDS, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════════════
// PASO 1: Upload video (multipart)
// ═══════════════════════════════════════════════════════════
async function uploadVideo() {
  console.log("\n═══ PASO 1: Upload video ═══");

  const fileData = fs.readFileSync(videoFile);
  const sizeMB = (fileData.length / 1024 / 1024).toFixed(1);
  console.log(`  Archivo: ${videoFile}`);
  console.log(`  Tamaño: ${sizeMB} MB`);
  console.log(`  Nombre: ${videoName}`);

  const blob = new Blob([fileData], { type: "video/mp4" });
  const form = new FormData();
  form.append("access_token", TOKEN);
  form.append("title", videoName);
  form.append("name", videoName);
  form.append("source", blob, path.basename(videoFile));

  const resp = await fetch(`${BASE}/${AD_ACCOUNT}/advideos`, {
    method: "POST",
    body: form,
  });
  const data = await resp.json();

  if (data.error) {
    console.error("  ERROR:", data.error.error_user_msg || data.error.message);
    throw new Error(data.error.message);
  }

  console.log(`  ✓ Video ID: ${data.id}`);
  return data.id;
}

// ═══════════════════════════════════════════════════════════
// PASO 2: Esperar procesamiento
// ═══════════════════════════════════════════════════════════
async function waitForVideo(videoId) {
  console.log("\n═══ PASO 2: Esperando procesamiento... ═══");

  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const resp = await fetch(
      `${BASE}/${videoId}?fields=status&access_token=${TOKEN}`
    );
    const data = await resp.json();
    const status = data.status?.video_status;
    process.stdout.write(`  [${i + 1}] ${status}\r`);

    if (status === "ready") {
      console.log(`  [${i + 1}] ready ✓`);
      return;
    }
    if (status === "error") {
      throw new Error("Video processing failed en Meta");
    }
  }
  throw new Error("Timeout: 5 minutos esperando procesamiento del video");
}

// ═══════════════════════════════════════════════════════════
// PASO 3: Extraer thumbnail y subir como ad image
// ═══════════════════════════════════════════════════════════
async function uploadThumbnail() {
  console.log("\n═══ PASO 3: Thumbnail ═══");

  const thumbPath = path.join(path.dirname(videoFile), `${videoName}-thumb.jpg`);

  // Extraer frame a los 3 segundos
  execSync(
    `ffmpeg -y -ss 3 -i "${videoFile}" -frames:v 1 -q:v 2 "${thumbPath}"`,
    { stdio: "pipe" }
  );
  console.log(`  Extraído: ${thumbPath}`);

  // Subir como ad image
  const thumbData = fs.readFileSync(thumbPath);
  const base64 = thumbData.toString("base64");

  const resp = await fetch(`${BASE}/${AD_ACCOUNT}/adimages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: TOKEN,
      bytes: base64,
      name: `${videoName}-thumb`,
    }),
  });
  const data = await resp.json();

  if (data.error) {
    console.error("  ERROR:", data.error.message);
    throw new Error(data.error.message);
  }

  const hash = data.images[`${videoName}-thumb`].hash;
  console.log(`  ✓ Image hash: ${hash}`);

  // Limpiar archivo temporal
  fs.unlinkSync(thumbPath);

  return hash;
}

// ═══════════════════════════════════════════════════════════
// PASO 4: Crear creatives (IG + FB)
// ═══════════════════════════════════════════════════════════
async function createCreatives(videoId, thumbHash) {
  console.log("\n═══ PASO 4: Crear creatives ═══");

  async function createOne(name, spec) {
    const params = new URLSearchParams({
      access_token: TOKEN,
      name,
      object_story_spec: JSON.stringify(spec),
    });
    const resp = await fetch(`${BASE}/${AD_ACCOUNT}/adcreatives`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await resp.json();
    if (data.error) {
      console.error(`  ✗ ${name}: ${data.error.error_user_msg || data.error.message}`);
      throw new Error(data.error.message);
    }
    console.log(`  ✓ ${name}: ${data.id}`);
    return data.id;
  }

  // Creative IG
  const igId = await createOne(`${videoName}_IG`, {
    page_id: PAGE_ID,
    instagram_user_id: IG_USER_ID,
    video_data: {
      video_id: videoId,
      image_hash: thumbHash,
      message: caption,
      call_to_action: {
        type: "VIEW_INSTAGRAM_PROFILE",
        value: { link: IG_PROFILE_URL },
      },
    },
  });
  await sleep(1000);

  // Creative FB
  const fbId = await createOne(`${videoName}_FB`, {
    page_id: PAGE_ID,
    video_data: {
      video_id: videoId,
      image_hash: thumbHash,
      message: caption,
      call_to_action: {
        type: "LIKE_PAGE",
        value: { link: `https://www.facebook.com/${PAGE_ID}` },
      },
    },
  });

  return { ig: igId, fb: fbId };
}

// ═══════════════════════════════════════════════════════════
// PASO 5: Actualizar los 4 ads microreel
// ═══════════════════════════════════════════════════════════
async function updateAds(creatives) {
  console.log("\n═══ PASO 5: Actualizar ads ═══");

  const ads = state.follow_plan_v2?.ads;
  if (!ads) {
    console.log("  ⚠ No hay follow_plan_v2.ads en meta-ids.json — skip update");
    return;
  }

  const updates = [
    { name: "ENBA_ad_microreel_IG_Cold", creative: creatives.ig },
    { name: "ENBA_ad_microreel_IG_Retarget", creative: creatives.ig },
    { name: "ENBA_ad_microreel_FB_Cold", creative: creatives.fb },
    { name: "ENBA_ad_microreel_FB_Retarget", creative: creatives.fb },
  ];

  let ok = 0;
  for (const u of updates) {
    const ad = ads[u.name];
    if (!ad?.id) {
      console.error(`  ✗ ${u.name}: no encontrado en meta-ids.json`);
      continue;
    }

    const resp = await fetch(`${BASE}/${ad.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: TOKEN,
        creative: { creative_id: u.creative },
      }),
    });
    const data = await resp.json();

    if (data.error) {
      console.error(`  ✗ ${u.name}: ${data.error.message}`);
    } else {
      console.log(`  ✓ ${u.name}`);
      ad.creative = u.creative;
      ad.creative_updated = new Date().toISOString();
      ok++;
    }
    await sleep(500);
  }

  console.log(`  Resultado: ${ok}/4 actualizados`);
  return ok;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log(`═══ UPLOAD VIDEO → META ADS ═══`);
  console.log(`Video: ${videoFile}`);
  console.log(`Nombre: ${videoName}`);
  console.log(`Caption: ${caption.substring(0, 60)}...`);

  const videoId = await uploadVideo();
  await waitForVideo(videoId);
  const thumbHash = await uploadThumbnail();
  const creatives = await createCreatives(videoId, thumbHash);
  const adsUpdated = await updateAds(creatives);

  // Guardar en meta-ids.json
  if (!state.follow_plan_v2) state.follow_plan_v2 = {};
  state.follow_plan_v2.creatives = {
    ...state.follow_plan_v2.creatives,
    video_ig: creatives.ig,
    video_fb: creatives.fb,
  };
  state.follow_plan_v2.micro_reel_latest = {
    video_id: videoId,
    creative_ig: creatives.ig,
    creative_fb: creatives.fb,
    thumb_hash: thumbHash,
    upload_date: new Date().toISOString(),
    source: path.relative(process.cwd(), videoFile),
    name: videoName,
  };
  saveState();

  console.log("\n═══ LISTO ═══");
  console.log(`Video ID:     ${videoId}`);
  console.log(`Thumb hash:   ${thumbHash}`);
  console.log(`Creative IG:  ${creatives.ig}`);
  console.log(`Creative FB:  ${creatives.fb}`);
  console.log(`Ads updated:  ${adsUpdated}/4`);
  console.log(`Estado:       PAUSED`);
  console.log(`meta-ids.json actualizado ✓`);
}

main().catch((e) => {
  console.error("\nFATAL:", e.message);
  saveState();
  process.exit(1);
});
