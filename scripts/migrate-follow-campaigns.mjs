#!/usr/bin/env node
/**
 * migrate-follow-campaigns.mjs — Migración Plan "Todo a Follows"
 *
 * Crea 2 campañas dedicadas y migra ad sets + ads:
 *   1. ENBA_Follow_IG_abr2026 (OUTCOME_TRAFFIC) ← IG Cold + IG Retarget
 *   2. ENBA_Follow_FB_abr2026 (OUTCOME_ENGAGEMENT) ← FB Cold + FB Retarget
 *
 * Meta no permite mover ad sets entre campañas → se recrean con misma config.
 * Los ad sets/ads viejos quedan PAUSED para borrar después.
 *
 * Uso: node scripts/migrate-follow-campaigns.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { execSync } from "node:child_process";

const API = "v22.0";
const BASE = `https://graph.facebook.com/${API}`;
const AD_ACCOUNT = "act_2303565156801569";
const PAGE_ID = "1064806400040502";
const IG_USER_ID = "17841443139761422";
const OUTPUT = path.resolve("campaigns/plan-crecimiento-10k/meta-ids.json");

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) {
  console.error("ERROR: META_ADS_USER_TOKEN no encontrado");
  process.exit(1);
}
console.log("TOKEN: CARGADA");

const state = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));
function saveState() {
  fs.writeFileSync(OUTPUT, JSON.stringify(state, null, 2));
}

// ── API helper ──────────────────────────────────────────────
async function api(method, endpoint, body) {
  const url = `${BASE}${endpoint}`;
  console.log(`\n${method} ${endpoint}`);
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (method === "POST") {
    opts.body = JSON.stringify({ ...body, access_token: TOKEN });
  }
  if (method === "GET") {
    // token in query
  }
  const resp = await fetch(url + (method === "GET" ? `?access_token=${TOKEN}&${new URLSearchParams(body || {})}` : ""), method === "GET" ? undefined : opts);
  const data = await resp.json();
  if (data.error) {
    console.error("ERROR:", JSON.stringify(data.error, null, 2));
    throw new Error(data.error.error_user_msg || data.error.message);
  }
  console.log("OK:", JSON.stringify(data).substring(0, 200));
  return data;
}

// ── Shared targeting ────────────────────────────────────────
const GEO_18_CITIES = {
  cities: [
    { key: "83540", name: "Belén de Escobar" },
    { key: "83693", name: "Buenos Aires" },
    { key: "84740", name: "Córdoba" },
    { key: "87107", name: "Lanús" },
    { key: "87145", name: "La Plata" },
    { key: "88017", name: "Martínez" },
    { key: "88108", name: "Mendoza" },
    { key: "88527", name: "Olivos" },
    { key: "88928", name: "Pilar" },
    { key: "89445", name: "Quilmes" },
    { key: "89720", name: "Rosario" },
    { key: "89927", name: "San Fernando de la Buena Vista" },
    { key: "89977", name: "San Isidro" },
    { key: "90205", name: "Santa Fe" },
    { key: "90324", name: "Sarandí" },
    { key: "90675", name: "Tigre" },
    { key: "90988", name: "Vicente López" },
    { key: "91408", name: "Wilde" },
  ],
  location_types: ["home", "recent"],
};

const INTERESTS_24_COLD = [
  { id: "6002868021822", name: "Viajes de aventura" },
  { id: "6002878991172", name: "Embarcación" },
  { id: "6002896368310", name: "Helly Hansen" },
  { id: "6002931117162", name: "Volvo Ocean Race" },
  { id: "6002985584323", name: "Recreación al aire libre" },
  { id: "6003011993281", name: "Chárter náutico" },
  { id: "6003121397334", name: "club náutico" },
  { id: "6003122958658", name: "Navegación" },
  { id: "6003125161176", name: "Sailing World" },
  { id: "6003158258840", name: "Motonáutica" },
  { id: "6003181171533", name: "Copa América (regata)" },
  { id: "6003187081552", name: "vela (deporte)" },
  { id: "6003195878898", name: "Lancha motora" },
  { id: "6003249531267", name: "Ocio" },
  { id: "6003280577423", name: "navegación (embarcaciones)" },
  { id: "6003290693725", name: "Real Asociación de Navegación de Recreo" },
  { id: "6003338009689", name: "Yate" },
  { id: "6003344349527", name: "Montevideo" },
  { id: "6003487857831", name: "Puerto deportivo" },
  { id: "6004160148624", name: "Yacht racing" },
  { id: "6004160395895", name: "Viajes" },
  { id: "6023137421020", name: "Motor Boat & Yachting" },
  { id: "6769156181154", name: "Fabricación y ventas de embarcaciones" },
  { id: "6788379881203", name: "Revistas y contenido multimedia de navegación" },
];

const CUSTOM_AUDIENCES_RETARGET = [
  { id: "120239059710310139", name: "ENBA_Custom_WebVisitors_30d" },
  { id: "120239060128140139", name: "ENBA_Custom_FBEngagers_90d" },
  { id: "120239146204050139", name: "ENBA_Custom_VideoViewers_30d" },
];

const EXCLUSION_D5 = [
  { id: "120239146215040139", name: "ENBA_Custom_FBPageLikers_exclusion" },
];

// ── Creatives (ya existen) ──────────────────────────────────
const CREATIVES = state.follow_plan.creatives;
// { video_ig, video_fb, destinos_ig, nosotros_ig, destinos_fb, nosotros_fb }

// ═══════════════════════════════════════════════════════════
// PASO 1: Crear 2 campañas
// ═══════════════════════════════════════════════════════════
async function createCampaigns() {
  console.log("\n═══ PASO 1: Crear campañas ═══");

  // Campaign IG (Traffic → VISIT_INSTAGRAM_PROFILE)
  const igCamp = await api("POST", `/${AD_ACCOUNT}/campaigns`, {
    name: "ENBA_Follow_IG_abr2026",
    objective: "OUTCOME_TRAFFIC",
    status: "PAUSED",
    special_ad_categories: [],
    is_adset_budget_sharing_enabled: false,
  });
  await sleep(1000);

  // Campaign FB (Engagement → PAGE_LIKES)
  const fbCamp = await api("POST", `/${AD_ACCOUNT}/campaigns`, {
    name: "ENBA_Follow_FB_abr2026",
    objective: "OUTCOME_ENGAGEMENT",
    status: "PAUSED",
    special_ad_categories: [],
    is_adset_budget_sharing_enabled: false,
  });

  return { ig: igCamp.id, fb: fbCamp.id };
}

// ═══════════════════════════════════════════════════════════
// PASO 2: Crear 4 ad sets en campañas nuevas
// ═══════════════════════════════════════════════════════════
async function createAdSets(campaigns) {
  console.log("\n═══ PASO 2: Crear ad sets ═══");

  const adsets = {};

  // IG Cold
  console.log("\n--- IG Cold ---");
  const igCold = await api("POST", `/${AD_ACCOUNT}/adsets`, {
    name: "ENBA_Follow_IG_Cold",
    campaign_id: campaigns.ig,
    status: "PAUSED",
    daily_budget: 1260000,
    optimization_goal: "VISIT_INSTAGRAM_PROFILE",
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    destination_type: "INSTAGRAM_PROFILE",
    targeting: {
      age_min: 18,
      age_max: 65,
      geo_locations: GEO_18_CITIES,
      flexible_spec: [{ interests: INTERESTS_24_COLD }],
      excluded_custom_audiences: EXCLUSION_D5,
      targeting_automation: { advantage_audience: 0 },
    },
  });
  adsets.ig_cold = igCold.id;
  await sleep(1000);

  // IG Retarget
  console.log("\n--- IG Retarget ---");
  const igRetarget = await api("POST", `/${AD_ACCOUNT}/adsets`, {
    name: "ENBA_Follow_IG_Retarget",
    campaign_id: campaigns.ig,
    status: "PAUSED",
    daily_budget: 540000,
    optimization_goal: "VISIT_INSTAGRAM_PROFILE",
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    destination_type: "INSTAGRAM_PROFILE",
    targeting: {
      age_min: 18,
      age_max: 65,
      geo_locations: GEO_18_CITIES,
      custom_audiences: CUSTOM_AUDIENCES_RETARGET,
      targeting_relaxation_types: { lookalike: 0, custom_audience: 1 },
      targeting_automation: { advantage_audience: 0 },
    },
  });
  adsets.ig_retarget = igRetarget.id;
  await sleep(1000);

  // FB Cold
  console.log("\n--- FB Cold ---");
  const fbCold = await api("POST", `/${AD_ACCOUNT}/adsets`, {
    name: "ENBA_Follow_FB_Cold",
    campaign_id: campaigns.fb,
    status: "PAUSED",
    daily_budget: 840000,
    optimization_goal: "PAGE_LIKES",
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    destination_type: "ON_PAGE",
    promoted_object: { page_id: PAGE_ID },
    targeting: {
      age_min: 18,
      age_max: 65,
      geo_locations: GEO_18_CITIES,
      flexible_spec: [{ interests: INTERESTS_24_COLD }],
      excluded_custom_audiences: EXCLUSION_D5,
      targeting_automation: { advantage_audience: 0 },
    },
  });
  adsets.fb_cold = fbCold.id;
  await sleep(1000);

  // FB Retarget
  console.log("\n--- FB Retarget ---");
  const fbRetarget = await api("POST", `/${AD_ACCOUNT}/adsets`, {
    name: "ENBA_Follow_FB_Retarget",
    campaign_id: campaigns.fb,
    status: "PAUSED",
    daily_budget: 360000,
    optimization_goal: "PAGE_LIKES",
    billing_event: "IMPRESSIONS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    destination_type: "ON_PAGE",
    promoted_object: { page_id: PAGE_ID },
    targeting: {
      age_min: 18,
      age_max: 65,
      geo_locations: GEO_18_CITIES,
      custom_audiences: CUSTOM_AUDIENCES_RETARGET,
      targeting_relaxation_types: { lookalike: 0, custom_audience: 1 },
      targeting_automation: { advantage_audience: 0 },
    },
  });
  adsets.fb_retarget = fbRetarget.id;

  return adsets;
}

// ═══════════════════════════════════════════════════════════
// PASO 3: Crear 12 ads en ad sets nuevos
// ═══════════════════════════════════════════════════════════
async function createAds(adsets) {
  console.log("\n═══ PASO 3: Crear 12 ads ═══");

  const adsDef = [
    // IG Cold (3)
    { name: "ENBA_ad_microreel_IG_Cold", adset: adsets.ig_cold, creative: CREATIVES.video_ig },
    { name: "ENBA_ad_destinos_IG_Cold", adset: adsets.ig_cold, creative: CREATIVES.destinos_ig },
    { name: "ENBA_ad_nosotros_IG_Cold", adset: adsets.ig_cold, creative: CREATIVES.nosotros_ig },
    // IG Retarget (3)
    { name: "ENBA_ad_microreel_IG_Retarget", adset: adsets.ig_retarget, creative: CREATIVES.video_ig },
    { name: "ENBA_ad_destinos_IG_Retarget", adset: adsets.ig_retarget, creative: CREATIVES.destinos_ig },
    { name: "ENBA_ad_nosotros_IG_Retarget", adset: adsets.ig_retarget, creative: CREATIVES.nosotros_ig },
    // FB Cold (3)
    { name: "ENBA_ad_microreel_FB_Cold", adset: adsets.fb_cold, creative: CREATIVES.video_fb },
    { name: "ENBA_ad_destinos_FB_Cold", adset: adsets.fb_cold, creative: CREATIVES.destinos_fb },
    { name: "ENBA_ad_nosotros_FB_Cold", adset: adsets.fb_cold, creative: CREATIVES.nosotros_fb },
    // FB Retarget (3)
    { name: "ENBA_ad_microreel_FB_Retarget", adset: adsets.fb_retarget, creative: CREATIVES.video_fb },
    { name: "ENBA_ad_destinos_FB_Retarget", adset: adsets.fb_retarget, creative: CREATIVES.destinos_fb },
    { name: "ENBA_ad_nosotros_FB_Retarget", adset: adsets.fb_retarget, creative: CREATIVES.nosotros_fb },
  ];

  const results = {};
  for (const ad of adsDef) {
    try {
      const result = await api("POST", `/${AD_ACCOUNT}/ads`, {
        name: ad.name,
        adset_id: ad.adset,
        creative: { creative_id: ad.creative },
        status: "PAUSED",
      });
      results[ad.name] = { id: result.id, adset: ad.adset, creative: ad.creative, status: "PAUSED" };
      console.log(`  ✓ ${ad.name}: ${result.id}`);
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ ${ad.name}: ${e.message}`);
      results[ad.name] = { status: "FAILED", error: e.message };
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════
// PASO 4: Pausar ad sets viejos (ya están PAUSED, pero DELETE ads)
// ═══════════════════════════════════════════════════════════
async function deleteOldAds() {
  console.log("\n═══ PASO 4: Borrar ads viejos de C_TRF/C_ENG ═══");

  const oldAds = Object.entries(state.follow_plan.ads);
  for (const [name, ad] of oldAds) {
    if (ad.status === "FAILED") continue;
    try {
      await api("POST", `/${ad.id}`, { status: "DELETED" });
      console.log(`  ✓ DELETED ${name} (${ad.id})`);
      await sleep(300);
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
    }
  }

  // Delete old ad sets
  const oldAdSets = [
    "120239300385090139", // IG Cold viejo
    "120239300375650139", // IG Retarget viejo
    "120239300385490139", // FB Cold viejo
    "120239300376060139", // FB Retarget viejo
  ];
  for (const asId of oldAdSets) {
    try {
      await api("POST", `/${asId}`, { status: "DELETED" });
      console.log(`  ✓ DELETED ad set ${asId}`);
      await sleep(300);
    } catch (e) {
      console.error(`  ✗ ad set ${asId}: ${e.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log("═══ MIGRACIÓN: Plan 'Todo a Follows' → Campañas Dedicadas ═══\n");

  // Paso 1
  const campaigns = await createCampaigns();
  console.log(`\n✓ Campañas: IG=${campaigns.ig}, FB=${campaigns.fb}`);

  // Paso 2
  const adsets = await createAdSets(campaigns);
  console.log(`\n✓ Ad Sets: ${JSON.stringify(adsets)}`);

  // Paso 3
  const ads = await createAds(adsets);
  const ok = Object.values(ads).filter(a => a.status === "PAUSED").length;
  const fail = Object.values(ads).filter(a => a.status === "FAILED").length;
  console.log(`\n✓ Ads: ${ok}/12 OK, ${fail}/12 FAILED`);

  // Paso 4: borrar viejos
  await deleteOldAds();

  // Actualizar meta-ids.json
  state.follow_plan_v2 = {
    migration_date: new Date().toISOString(),
    campaigns: {
      ig: { id: campaigns.ig, name: "ENBA_Follow_IG_abr2026", objective: "OUTCOME_TRAFFIC", status: "PAUSED" },
      fb: { id: campaigns.fb, name: "ENBA_Follow_FB_abr2026", objective: "OUTCOME_ENGAGEMENT", status: "PAUSED" },
    },
    adsets: {
      ig_cold: { id: adsets.ig_cold, campaign: campaigns.ig, daily_budget: 1260000, optimization: "VISIT_INSTAGRAM_PROFILE" },
      ig_retarget: { id: adsets.ig_retarget, campaign: campaigns.ig, daily_budget: 540000, optimization: "VISIT_INSTAGRAM_PROFILE" },
      fb_cold: { id: adsets.fb_cold, campaign: campaigns.fb, daily_budget: 840000, optimization: "PAGE_LIKES" },
      fb_retarget: { id: adsets.fb_retarget, campaign: campaigns.fb, daily_budget: 360000, optimization: "PAGE_LIKES" },
    },
    ads,
    creatives: CREATIVES,
    old_deleted: {
      old_adsets: ["120239300385090139", "120239300375650139", "120239300385490139", "120239300376060139"],
      old_ads: Object.entries(state.follow_plan.ads).filter(([,a]) => a.id).map(([n,a]) => ({ name: n, id: a.id })),
    },
  };
  saveState();

  console.log("\n═══ SUMMARY ═══");
  console.log(`Campañas nuevas:  2 (IG + FB)`);
  console.log(`Ad sets nuevos:   4`);
  console.log(`Ads nuevos:       ${ok}/12`);
  console.log(`Ads viejos:       DELETED`);
  console.log(`Ad sets viejos:   DELETED`);
  console.log(`Estado:           TODO PAUSED`);
  console.log(`\nmeta-ids.json actualizado → follow_plan_v2`);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  saveState();
  process.exit(1);
});
