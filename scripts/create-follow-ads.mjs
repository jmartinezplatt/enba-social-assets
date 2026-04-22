#!/usr/bin/env node
/**
 * create-follow-ads.mjs — Plan "Todo a Follows"
 *
 * Crea via Meta Graph API v22.0:
 *   1. Sube imágenes (carrusel destinos + carrusel nosotros + collages FB)
 *   2. Crea Ad Creatives (video + carruseles IG + collages FB)
 *   3. Crea 12 Ads en los 4 ad sets Follow (PAUSED)
 *
 * Ad Sets ya creados (PAUSED):
 *   - ENBA_Follow_IG_Cold: 120239300385090139
 *   - ENBA_Follow_IG_Retarget: 120239300375650139
 *   - ENBA_Follow_FB_Cold: 120239300385490139
 *   - ENBA_Follow_FB_Retarget: 120239300376060139
 *
 * Configuración aprobada:
 *   - Geo: 18 ciudades (CABA, GBA Norte/Sur, La Plata, Córdoba, Mendoza, Rosario, Santa Fe)
 *   - Edad: 18-65+
 *   - Intereses: 24 (náutico + experiencias)
 *   - Split: 60% IG / 40% FB, 70% cold / 30% retarget
 *   - CTA IG: VIEW_INSTAGRAM_PROFILE
 *   - CTA FB: LIKE_PAGE
 *   - Captions: Hook C + Hook A (test A/B)
 *
 * Output: campaigns/plan-crecimiento-10k/meta-ids.json (actualiza)
 *
 * Uso: node scripts/create-follow-ads.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { execSync } from "node:child_process";

const API = "v22.0";
const BASE = `https://graph.facebook.com/${API}`;
const AD_ACCOUNT = "act_2303565156801569";
const PAGE_ID = "1064806400040502";
const IG_PROFILE_URL = "https://www.instagram.com/espacionauticobsas/";
const IG_USER_ID = "17841443139761422";
const OUTPUT = path.resolve("campaigns/plan-crecimiento-10k/meta-ids.json");

// Token desde Windows User scope
const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) {
  console.error("ERROR: META_ADS_USER_TOKEN no encontrado");
  process.exit(1);
}
console.log("TOKEN: CARGADA");

// Load state
const state = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));
function saveState() {
  fs.writeFileSync(OUTPUT, JSON.stringify(state, null, 2));
}

// ── API helpers ─────────────────────────────────────────────
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
    throw new Error(data.error.error_user_msg || data.error.message);
  }
  console.log("OK:", JSON.stringify(data).substring(0, 200));
  return data;
}

async function apiPostForm(endpoint, params) {
  const url = `${BASE}${endpoint}`;
  console.log(`\nPOST (form) ${endpoint}`);
  params.append("access_token", TOKEN);
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await resp.json();
  if (data.error) {
    console.error("ERROR:", JSON.stringify(data.error, null, 2));
    throw new Error(data.error.error_user_msg || data.error.message);
  }
  console.log("OK:", JSON.stringify(data).substring(0, 200));
  return data;
}

async function uploadImage(filePath, name) {
  const url = `${BASE}/${AD_ACCOUNT}/adimages`;
  console.log(`\nUPLOAD ${name} (${filePath})`);
  const fileData = fs.readFileSync(filePath);
  const base64 = fileData.toString("base64");

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: TOKEN,
      bytes: base64,
      name: name,
    }),
  });
  const data = await resp.json();
  if (data.images && data.images[name]) {
    const hash = data.images[name].hash;
    console.log(`  ✓ hash=${hash}`);
    return hash;
  }
  console.error("UPLOAD ERROR:", JSON.stringify(data));
  throw new Error(`Upload failed for ${name}`);
}

// ── Ad Set IDs ──────────────────────────────────────────────
const ADSETS = {
  IG_COLD: "120239300385090139",
  IG_RETARGET: "120239300375650139",
  FB_COLD: "120239300385490139",
  FB_RETARGET: "120239300376060139",
};

// ── Captions ────────────────────────────────────────────────
const CAPTION_C = "No necesitás experiencia. Solo ganas. Seguinos.\n\nSalimos desde Costanera Norte a Colonia, Lacaze, el Delta y más. Cada travesía es única.\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #VelerosBuenosAires #SalidaDistinta";

const CAPTION_A = "Esto pasa cuando dejás la ciudad atrás y te unís a nuestra comunidad. Seguinos y descubrí más.\n\nGente real, río real. Sin filtro, sin guión. Vos podés ser el próximo.\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #PlanesBuenosAires #ExperienciasBuenosAires";

const CAPTION_VIDEO = "No necesitás experiencia. Solo ganas. Seguinos.\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #VelerosBuenosAires #SalidaDistinta";

// ═══════════════════════════════════════════════════════════
// FASE 1: Upload images
// ═══════════════════════════════════════════════════════════
async function uploadImages() {
  console.log("\n═══ FASE 1: Upload Images ═══");

  const images = [
    // Carousel destinos IG
    { file: "asset-bank/travesias-colonia-openwater.jpg", name: "follow-carousel-colonia" },
    { file: "asset-bank/destino-lacaze-puerto-sauce.jpg", name: "follow-carousel-lacaze" },
    { file: "asset-bank/destino-riachuelo.jpg", name: "follow-carousel-riachuelo" },
    { file: "asset-bank/destino-delta-pajarito.jpg", name: "follow-carousel-pajarito" },
    { file: "asset-bank/destino-martin-garcia.jpg", name: "follow-carousel-martingarcia" },
    { file: "asset-bank/destino-hero-travesias.jpg", name: "follow-carousel-cierre" },
    // Carousel nosotros IG
    { file: "asset-bank/grupo-mate-chaleco-cockpit.jpg", name: "follow-carousel-mate" },
    { file: "asset-bank/grupo-jovenes-cockpit-picnic-navegando.jpg", name: "follow-carousel-jovenes" },
    { file: "asset-bank/pareja-cockpit-sunset-risas.jpg", name: "follow-carousel-pareja" },
    { file: "asset-bank/encuentro-marina-picada-grupo.jpg", name: "follow-carousel-encuentro" },
    { file: "asset-bank/tripulacion-cockpit-bramador-bandera-argentina.jpg", name: "follow-carousel-tripulacion" },
    // Collages FB
    { file: "campaigns/plan-crecimiento-10k/collage-destinos-fb.png", name: "follow-collage-destinos" },
    { file: "campaigns/plan-crecimiento-10k/collage-nosotros-fb.png", name: "follow-collage-nosotros" },
  ];

  const hashes = {};
  for (const img of images) {
    try {
      hashes[img.name] = await uploadImage(img.file, img.name);
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ ${img.name}: ${e.message}`);
    }
  }

  // Save hashes
  if (!state.follow_plan) state.follow_plan = {};
  state.follow_plan.image_hashes = hashes;
  state.follow_plan.upload_date = new Date().toISOString();
  saveState();

  return hashes;
}

// ═══════════════════════════════════════════════════════════
// FASE 2: Create Creatives
// ═══════════════════════════════════════════════════════════
async function createCreatives(hashes) {
  console.log("\n═══ FASE 2: Create Creatives ═══");

  const creatives = {};

  // --- Video creative (IG) - placeholder: reel primera vez ---
  console.log("\n--- Video creative IG (VIEW_INSTAGRAM_PROFILE) ---");
  const videoCreativeIG = await apiPostForm(`/${AD_ACCOUNT}/adcreatives`, new URLSearchParams({
    name: "ENBA_follow_video_IG",
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      instagram_user_id: IG_USER_ID,
      video_data: {
        video_id: "4467029896876277", // reel primera vez
        message: CAPTION_VIDEO,
        call_to_action: {
          type: "VIEW_INSTAGRAM_PROFILE",
          value: { link: IG_PROFILE_URL },
        },
        image_hash: "c781def3fd3177e2a1d85f3161e5fa27", // thumbnail reel PV
      },
    }),
  }));
  creatives.video_ig = videoCreativeIG.id;
  await sleep(1000);

  // --- Video creative (FB) - LIKE_PAGE ---
  console.log("\n--- Video creative FB (LIKE_PAGE) ---");
  const videoCreativeFB = await apiPostForm(`/${AD_ACCOUNT}/adcreatives`, new URLSearchParams({
    name: "ENBA_follow_video_FB",
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      video_data: {
        video_id: "4467029896876277",
        message: CAPTION_VIDEO,
        call_to_action: {
          type: "LIKE_PAGE",
          value: { link: `https://www.facebook.com/${PAGE_ID}` },
        },
        image_hash: "c781def3fd3177e2a1d85f3161e5fa27",
      },
    }),
  }));
  creatives.video_fb = videoCreativeFB.id;
  await sleep(1000);

  // --- Carousel destinos IG (VIEW_INSTAGRAM_PROFILE) ---
  console.log("\n--- Carousel destinos IG ---");
  const carouselDestinosIG = await apiPostForm(`/${AD_ACCOUNT}/adcreatives`, new URLSearchParams({
    name: "ENBA_follow_destinos_IG",
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      instagram_user_id: IG_USER_ID,
      link_data: {
        link: IG_PROFILE_URL,
        message: CAPTION_C,
        child_attachments: [
          { image_hash: hashes["follow-carousel-colonia"], name: "Colonia del Sacramento", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-lacaze"], name: "Lacaze · Puerto Sauce", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-riachuelo"], name: "Riachuelo", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-pajarito"], name: "El Pajarito · Delta", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-martingarcia"], name: "Isla Martín García", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-cierre"], name: "Seguinos para ver más destinos", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
        ],
        call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } },
      },
    }),
  }));
  creatives.destinos_ig = carouselDestinosIG.id;
  await sleep(1000);

  // --- Carousel nosotros IG (VIEW_INSTAGRAM_PROFILE) ---
  console.log("\n--- Carousel nosotros IG ---");
  const carouselNosotrosIG = await apiPostForm(`/${AD_ACCOUNT}/adcreatives`, new URLSearchParams({
    name: "ENBA_follow_nosotros_IG",
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      instagram_user_id: IG_USER_ID,
      link_data: {
        link: IG_PROFILE_URL,
        message: CAPTION_A,
        child_attachments: [
          { image_hash: hashes["follow-carousel-mate"], name: "Mate en cockpit", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-jovenes"], name: "Picnic navegando", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-pareja"], name: "Sunset en cockpit", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-encuentro"], name: "Encuentro en marina", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-tripulacion"], name: "Tripulación", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
          { image_hash: hashes["follow-carousel-cierre"], name: "Seguinos para ser parte", link: IG_PROFILE_URL, call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } } },
        ],
        call_to_action: { type: "VIEW_INSTAGRAM_PROFILE", value: { link: IG_PROFILE_URL } },
      },
    }),
  }));
  creatives.nosotros_ig = carouselNosotrosIG.id;
  await sleep(1000);

  // --- Collage destinos FB (LIKE_PAGE) ---
  console.log("\n--- Collage destinos FB ---");
  const collageDestinosFB = await apiPostForm(`/${AD_ACCOUNT}/adcreatives`, new URLSearchParams({
    name: "ENBA_follow_destinos_FB",
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      link_data: {
        link: `https://www.facebook.com/${PAGE_ID}`,
        message: CAPTION_C,
        image_hash: hashes["follow-collage-destinos"],
        call_to_action: {
          type: "LIKE_PAGE",
          value: { link: `https://www.facebook.com/${PAGE_ID}` },
        },
      },
    }),
  }));
  creatives.destinos_fb = collageDestinosFB.id;
  await sleep(1000);

  // --- Collage nosotros FB (LIKE_PAGE) ---
  console.log("\n--- Collage nosotros FB ---");
  const collageNosotrosFB = await apiPostForm(`/${AD_ACCOUNT}/adcreatives`, new URLSearchParams({
    name: "ENBA_follow_nosotros_FB",
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      link_data: {
        link: `https://www.facebook.com/${PAGE_ID}`,
        message: CAPTION_A,
        image_hash: hashes["follow-collage-nosotros"],
        call_to_action: {
          type: "LIKE_PAGE",
          value: { link: `https://www.facebook.com/${PAGE_ID}` },
        },
      },
    }),
  }));
  creatives.nosotros_fb = collageNosotrosFB.id;

  state.follow_plan.creatives = creatives;
  saveState();
  return creatives;
}

// ═══════════════════════════════════════════════════════════
// FASE 3: Create 12 Ads (PAUSED)
// ═══════════════════════════════════════════════════════════
async function createAds(creatives) {
  console.log("\n═══ FASE 3: Create 12 Ads (PAUSED) ═══");

  const ads = [
    // IG Cold (3 ads)
    { name: "ENBA_ad_microreel_IG_Cold", adset: ADSETS.IG_COLD, creative: creatives.video_ig },
    { name: "ENBA_ad_destinos_IG_Cold", adset: ADSETS.IG_COLD, creative: creatives.destinos_ig },
    { name: "ENBA_ad_nosotros_IG_Cold", adset: ADSETS.IG_COLD, creative: creatives.nosotros_ig },
    // IG Retarget (3 ads)
    { name: "ENBA_ad_microreel_IG_Retarget", adset: ADSETS.IG_RETARGET, creative: creatives.video_ig },
    { name: "ENBA_ad_destinos_IG_Retarget", adset: ADSETS.IG_RETARGET, creative: creatives.destinos_ig },
    { name: "ENBA_ad_nosotros_IG_Retarget", adset: ADSETS.IG_RETARGET, creative: creatives.nosotros_ig },
    // FB Cold (3 ads)
    { name: "ENBA_ad_microreel_FB_Cold", adset: ADSETS.FB_COLD, creative: creatives.video_fb },
    { name: "ENBA_ad_destinos_FB_Cold", adset: ADSETS.FB_COLD, creative: creatives.destinos_fb },
    { name: "ENBA_ad_nosotros_FB_Cold", adset: ADSETS.FB_COLD, creative: creatives.nosotros_fb },
    // FB Retarget (3 ads)
    { name: "ENBA_ad_microreel_FB_Retarget", adset: ADSETS.FB_RETARGET, creative: creatives.video_fb },
    { name: "ENBA_ad_destinos_FB_Retarget", adset: ADSETS.FB_RETARGET, creative: creatives.destinos_fb },
    { name: "ENBA_ad_nosotros_FB_Retarget", adset: ADSETS.FB_RETARGET, creative: creatives.nosotros_fb },
  ];

  const adResults = {};

  for (const ad of ads) {
    try {
      const result = await apiPost(`/${AD_ACCOUNT}/ads`, {
        name: ad.name,
        adset_id: ad.adset,
        creative: { creative_id: ad.creative },
        status: "PAUSED",
      });
      console.log(`  ✓ ${ad.name}: ${result.id}`);
      adResults[ad.name] = { id: result.id, adset: ad.adset, creative: ad.creative, status: "PAUSED" };
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ ${ad.name}: ${e.message}`);
      adResults[ad.name] = { status: "FAILED", error: e.message };
    }
  }

  state.follow_plan.ads = adResults;
  saveState();
  return adResults;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log("═══ ENBA Plan 'Todo a Follows' — Creación de Ads ═══");
  console.log(`Ad Account: ${AD_ACCOUNT}`);
  console.log(`Output: ${OUTPUT}`);

  const hashes = await uploadImages();
  console.log(`\nImages uploaded: ${Object.keys(hashes).length}/13`);

  const creatives = await createCreatives(hashes);
  console.log(`\nCreatives created: ${Object.keys(creatives).length}/6`);

  const ads = await createAds(creatives);
  const ok = Object.values(ads).filter(a => a.status === "PAUSED").length;
  const fail = Object.values(ads).filter(a => a.status === "FAILED").length;

  console.log("\n═══ SUMMARY ═══");
  console.log(`Images:    ${Object.keys(hashes).length}/13`);
  console.log(`Creatives: ${Object.keys(creatives).length}/6`);
  console.log(`Ads OK:    ${ok}/12`);
  console.log(`Ads FAIL:  ${fail}/12`);
  console.log(`Status:    ALL PAUSED`);
  console.log(`\nState: ${OUTPUT}`);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  saveState();
  process.exit(1);
});
