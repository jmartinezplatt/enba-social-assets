#!/usr/bin/env node
/**
 * swap-creative-microreel-ig-cold.mjs
 * Sube microreel-ig-v3.mp4 a Meta Ads y actualiza SOLO ENBA_ad_microreel_IG_Cold.
 * No toca ningun otro ad.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const VIDEO_FILE = "C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/reels/microreel-ig-v3.mp4";
const AD_ACCOUNT  = "act_2303565156801569";
const AD_ID       = "120239303661060139"; // ENBA_ad_microreel_IG_Cold (ACTIVE)
const AD_NAME     = "ENBA_ad_microreel_IG_Cold";
const CAPTION     = "No necesitás experiencia. Solo ganas. Seguinos.\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #VelerosBuenosAires #SalidaDistinta";
const IG_ACTOR_ID = "17841443139761422";
const API_VERSION = "v22.0";
const BASE        = `https://graph.facebook.com/${API_VERSION}`;

function getToken() {
  return execSync(
    `powershell.exe -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
    { encoding: "utf-8" }
  ).trim();
}

async function step1_uploadVideo(token) {
  console.log("PASO 1: Subiendo video a Meta Ads...");
  const fileSize = fs.statSync(VIDEO_FILE).size;
  const fileName = path.basename(VIDEO_FILE);

  // Iniciar sesión de upload resumable
  const initRes = await fetch(`${BASE}/${AD_ACCOUNT}/advideos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: token,
      upload_phase: "start",
      file_size: fileSize,
      file_name: fileName,
    }),
  });
  const initData = await initRes.json();
  if (initData.error) throw new Error(`Upload start: ${initData.error.message}`);
  const { upload_session_id, video_id, start_offset, end_offset } = initData;
  console.log(`  video_id: ${video_id}`);

  // Transferir el archivo
  console.log(`  Transfiriendo ${(fileSize/1024/1024).toFixed(1)} MB...`);
  const fileBuffer = fs.readFileSync(VIDEO_FILE);
  const chunk = fileBuffer.slice(parseInt(start_offset), parseInt(end_offset));
  const formData = new FormData();
  formData.append("access_token", token);
  formData.append("upload_phase", "transfer");
  formData.append("upload_session_id", upload_session_id);
  formData.append("start_offset", start_offset);
  formData.append("video_file_chunk", new Blob([chunk], { type: "video/mp4" }), fileName);

  const transferRes = await fetch(`${BASE}/${AD_ACCOUNT}/advideos`, {
    method: "POST",
    body: formData,
  });
  const transferData = await transferRes.json();
  if (transferData.error) throw new Error(`Upload transfer: ${transferData.error.message}`);

  // Finalizar
  const finishRes = await fetch(`${BASE}/${AD_ACCOUNT}/advideos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: token,
      upload_phase: "finish",
      upload_session_id,
    }),
  });
  const finishData = await finishRes.json();
  if (finishData.error) throw new Error(`Upload finish: ${finishData.error.message}`);
  console.log(`  Upload completo. video_id: ${video_id}`);
  return video_id;
}

async function step2_createCreative(token, video_id) {
  console.log("PASO 2: Creando creative...");
  const res = await fetch(`${BASE}/${AD_ACCOUNT}/adcreatives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: token,
      name: "microreel-ig-v3",
      object_story_spec: {
        instagram_user_id: IG_ACTOR_ID,
        video_data: {
          video_id,
          message: CAPTION,
          call_to_action: {
            type: "VIEW_INSTAGRAM_PROFILE",
            value: { link: "https://www.instagram.com/espacionauticobsas" },
          },
        },
      },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Creative: ${data.error.message}`);
  console.log(`  creative_id: ${data.id}`);
  return data.id;
}

async function step3_updateAd(token, creative_id) {
  console.log(`PASO 3: Actualizando ${AD_NAME} (${AD_ID})...`);
  const res = await fetch(`${BASE}/${AD_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: token,
      creative: { creative_id },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Update ad: ${data.error.message}`);
  console.log(`  OK: ${JSON.stringify(data)}`);
}

// ── MAIN ──
const token = getToken();
const video_id   = await step1_uploadVideo(token);
const creative_id = await step2_createCreative(token, video_id);
await step3_updateAd(token, creative_id);

console.log("\n═══ CREATIVE SWAP COMPLETO ═══");
console.log(`Ad:        ${AD_NAME}`);
console.log(`Video ID:  ${video_id}`);
console.log(`Creative:  ${creative_id}`);
console.log(`Estado:    PENDING_REVIEW → ACTIVE (Meta review ~minutos)`);
