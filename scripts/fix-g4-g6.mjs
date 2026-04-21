#!/usr/bin/env node
/**
 * fix-g4-g6.mjs — Completar gaps que faltaron
 *
 * G-4: Crear creative + ad para reel "primera vez" usando video_data pattern
 * G-6: Escalar ENG_REEL de $5,000 a $7,250/día
 */
import { execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;
const AD_ACCOUNT = "act_2303565156801569";
const PAGE_ID = "1064806400040502";

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) { console.error("ERROR: TOKEN VACÍO"); process.exit(1); }
console.log("TOKEN: CARGADA");

async function apiPost(endpoint, body) {
  const url = `${BASE}${endpoint}`;
  console.log(`\nPOST ${endpoint}`);
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: TOKEN }),
  });
  const data = await resp.json();
  if (data.error) {
    console.error("ERROR:", JSON.stringify(data.error, null, 2));
    throw new Error(data.error.message);
  }
  console.log("OK:", JSON.stringify(data));
  return data;
}

async function apiGet(endpoint) {
  const url = `${BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}access_token=${TOKEN}`;
  const resp = await fetch(url);
  return resp.json();
}

// ============================================================
// G-4: Crear creative + ad para reel "primera vez"
// ============================================================
async function fixG4() {
  console.log("\n" + "=".repeat(60));
  console.log("G-4: Amplificar reel 'primera vez'");
  console.log("=".repeat(60));

  const videoId = "4467029896876277";

  // Paso 0: Obtener thumbnail del video
  console.log("Obteniendo thumbnail del video...");
  const videoInfo = await apiGet(`/${videoId}?fields=thumbnails`);
  let imageUrl = null;
  if (videoInfo.thumbnails && videoInfo.thumbnails.data && videoInfo.thumbnails.data.length > 0) {
    imageUrl = videoInfo.thumbnails.data[0].uri;
    console.log(`Thumbnail encontrado: ${imageUrl.substring(0, 80)}...`);
  } else {
    // Fallback: usar la thumbnail del video directamente
    const videoSource = await apiGet(`/${videoId}?fields=source,picture`);
    imageUrl = videoSource.picture;
    console.log(`Picture fallback: ${imageUrl ? imageUrl.substring(0, 80) + '...' : 'NO ENCONTRADA'}`);
  }

  if (!imageUrl) {
    console.error("No se pudo obtener thumbnail. Usando image_hash del reel-4horas-alt como fallback.");
  }

  const caption = "Hay experiencias que no se pueden explicar con palabras. La primera vez arriba de un velero es una de esas.\n\nSalimos desde Costanera Norte, grupo reducido, capitán a bordo y todo lo que necesitás para disfrutarlo sin preocuparte por nada.\n\n\ud83d\udc49 Si querés vivir tu primera vez en el río, escribinos.\n\ud83d\udd17 espacionautico.com.ar/paseos-en-velero-buenos-aires\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #PlanesBuenosAires #SalidaDistinta";

  const videoData = {
    video_id: videoId,
    message: caption,
    call_to_action: {
      type: "LEARN_MORE",
      value: {
        link: "https://espacionautico.com.ar/paseos-en-velero-buenos-aires",
      },
    },
  };

  if (imageUrl) {
    videoData.image_url = imageUrl;
  } else {
    // Fallback: usar el image_hash del reel-4horas-alt
    videoData.image_hash = "29e28a6876671b79cbc76739dfceefbe";
  }

  const creative = await apiPost(`/${AD_ACCOUNT}/adcreatives`, {
    name: "ENBA_creative_reelPrimeraVez_existing",
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      video_data: videoData,
    }),
  });
  console.log(`\u2713 Creative creado: ${creative.id}`);

  // Paso 2: Crear ad en ENG_REEL
  await sleep(2000);
  const ad = await apiPost(`/${AD_ACCOUNT}/ads`, {
    name: "ENBA_ad_reelPV_ENG",
    adset_id: "120239078452300139",
    creative: JSON.stringify({ creative_id: creative.id }),
    status: "ACTIVE",
  });
  console.log(`\u2713 Ad creado: ${ad.id}`);

  // Verificar
  await sleep(2000);
  const check = await apiGet(`/${ad.id}?fields=effective_status,name`);
  console.log(`  Status: ${check.effective_status}`);

  return { creative_id: creative.id, ad_id: ad.id };
}

// ============================================================
// G-6: Escalar ENG_REEL de $5,000 a $7,250/día
// ============================================================
async function fixG6() {
  console.log("\n" + "=".repeat(60));
  console.log("G-6: Escalar ENG_REEL a $7,250/dia");
  console.log("=".repeat(60));

  const adsetId = "120239078452300139";

  const current = await apiGet(`/${adsetId}?fields=daily_budget,effective_status`);
  console.log(`Budget actual: ${current.daily_budget} centavos (${parseInt(current.daily_budget) / 100} ARS/dia)`);

  const data = await apiPost(`/${adsetId}`, {
    daily_budget: 725000,
  });
  console.log(`\u2713 Budget actualizado`);

  await sleep(2000);
  const verify = await apiGet(`/${adsetId}?fields=daily_budget,effective_status`);
  console.log(`Nuevo budget: ${verify.daily_budget} centavos (${parseInt(verify.daily_budget) / 100} ARS/dia)`);
  console.log(`Status: ${verify.effective_status}`);

  return verify;
}

async function main() {
  const g4 = await fixG4();
  const g6 = await fixG6();

  console.log("\n" + "=".repeat(60));
  console.log("RESUMEN");
  console.log("=".repeat(60));
  console.log(`G-4: creative=${g4.creative_id}, ad=${g4.ad_id}`);
  console.log(`G-6: budget=${parseInt(g6.daily_budget) / 100} ARS/dia`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
