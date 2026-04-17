#!/usr/bin/env node
/**
 * create-meta-adsets.mjs — FASE 4 only: 7 Ad Sets con interest IDs reales
 *
 * Usa campañas ya creadas en meta-ids.json
 * Interest IDs validados vía /search?type=adinterest
 * Todos los ad sets en PAUSED con exclusión nativa de followers/likers
 */

import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { execSync } from "node:child_process";

const API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;
const AD_ACCOUNT_ID = "act_2303565156801569";
const OUTPUT_PATH = path.resolve("campaigns/plan-crecimiento-10k/meta-ids.json");

// Token desde Windows User scope (secret, no en .env)
const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

// IDs públicos desde .env
const env = {};
fs.readFileSync(".env", "utf-8").split("\n").forEach((l) => {
  if (l.includes("=") && !l.startsWith("#")) {
    const [k, v] = l.trim().split("=");
    env[k] = v;
  }
});
const PAGE_ID = env.META_PAGE_ID;
const IG_USER_ID = env.META_IG_USER_ID;

if (!TOKEN) {
  console.error("ERROR: META_ADS_USER_TOKEN no encontrado en Windows User scope");
  process.exit(1);
}

// Load existing state (campañas ya creadas)
const state = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
const campaignIds = {
  AWR: state.phase_3_campaigns.C_AWR?.id,
  ENG: state.phase_3_campaigns.C_ENG?.id,
  LEA: state.phase_3_campaigns.C_LEA?.id,
};
console.log("Campaign IDs:", campaignIds);

async function call(endpoint, body) {
  const resp = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: TOKEN }),
  });
  const data = await resp.json();
  if (data.error) {
    throw new Error(`${data.error.code}: ${data.error.message}${data.error.error_user_msg ? " | " + data.error.error_user_msg : ""}`);
  }
  return data;
}

function saveState() {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(state, null, 2));
}

// Base location: CABA + GBA 40km (Obelisco center)
const locGBA40 = {
  custom_locations: [{ latitude: -34.6037, longitude: -58.3816, radius: 40, distance_unit: "kilometer" }],
  location_types: ["home", "recent"],
};

// Argentina completa (para C1 Turismo)
const locArgentina = {
  countries: ["AR"],
};

// Ad Sets con interest IDs REALES validados
const adsets = [
  {
    code: "AS_AWR_A2",
    campaign: "AWR",
    name: "ENBA_Awareness_A2_InteresNavegacion",
    daily_budget_ars: 2000,
    targeting: {
      geo_locations: locGBA40,
      age_min: 28,
      age_max: 50,
      flexible_spec: [{
        interests: [
          { id: "6003187081552", name: "vela (deporte)" },
          { id: "6023137421020", name: "Motor Boat & Yachting" },
          { id: "6003125161176", name: "Sailing World" },
          { id: "6004160148624", name: "Yacht racing" },
          { id: "6002878991172", name: "Embarcación" },
        ],
      }],
    },
  },
  {
    code: "AS_AWR_B1",
    campaign: "AWR",
    name: "ENBA_Awareness_B1_ExperienciasBA",
    daily_budget_ars: 3000,
    targeting: {
      geo_locations: locGBA40,
      age_min: 28,
      age_max: 45,
      flexible_spec: [{
        interests: [
          { id: "6004160395895", name: "Viajes" },
          { id: "6003415019460", name: "Gastronomía" },
          { id: "6003249531267", name: "Ocio" },
          { id: "6002985584323", name: "Recreación al aire libre" },
        ],
      }],
    },
  },
  {
    code: "AS_AWR_B2",
    campaign: "AWR",
    name: "ENBA_Awareness_B2_OutdoorAventura",
    daily_budget_ars: 1000,
    targeting: {
      geo_locations: locGBA40,
      age_min: 25,
      age_max: 45,
      flexible_spec: [{
        interests: [
          { id: "6003077915229", name: "Kayaking" },
          { id: "6003252804967", name: "Excursionismo" },
          { id: "6003403012818", name: "camping" },
          { id: "6003290325569", name: "Paddleboarding" },
          { id: "6003074033139", name: "Caminatas" },
        ],
      }],
    },
  },
  {
    code: "AS_AWR_C1",
    campaign: "AWR",
    name: "ENBA_Awareness_C1_TurismoBA",
    daily_budget_ars: 1500,
    targeting: {
      geo_locations: locArgentina,
      age_min: 28,
      age_max: 55,
      flexible_spec: [{
        interests: [
          { id: "6004160395895", name: "Viajes" },
          { id: "6002868021822", name: "Viajes de aventura" },
          { id: "6003038269845", name: "Viajes Y Turismo" },
        ],
      }],
    },
  },
  {
    code: "AS_AWR_A3",
    campaign: "AWR",
    name: "ENBA_Awareness_A3_AspiracionalNautico",
    daily_budget_ars: 1500,
    targeting: {
      geo_locations: locGBA40,
      age_min: 28,
      age_max: 45,
      flexible_spec: [{
        interests: [
          { id: "6007828099136", name: "Artículos de lujo" },
          { id: "6002868021822", name: "Viajes de aventura" },
          { id: "6002985584323", name: "Recreación al aire libre" },
        ],
      }],
    },
  },
  {
    code: "AS_ENG_C2",
    campaign: "ENG",
    name: "ENBA_Engagement_C2_RegalosExperienciales",
    daily_budget_ars: 1000,
    targeting: {
      geo_locations: locGBA40,
      age_min: 28,
      age_max: 50,
      flexible_spec: [{
        interests: [
          { id: "6003019539929", name: "Regalos" },
          { id: "6003310766888", name: "Día de San Valentín" },
          { id: "6003409392877", name: "Bodas" },
        ],
      }],
    },
  },
  {
    code: "AS_LEA_C3",
    campaign: "LEA",
    name: "ENBA_Leads_C3_Corporativo",
    daily_budget_ars: 500,
    targeting: {
      geo_locations: locGBA40,
      age_min: 32,
      age_max: 55,
      flexible_spec: [{
        interests: [
          { id: "6003092932417", name: "Gestión de eventos" },
          { id: "6003508907986", name: "Professional in Human Resources" },
          { id: "6003371567474", name: "Espíritu empresarial" },
        ],
      }],
    },
  },
];

const optimizationByObjective = {
  AWR: "REACH",
  ENG: "POST_ENGAGEMENT",
  LEA: "LEAD_GENERATION",
};

// Start date: mañana 12:00 ART (15:00 UTC)
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
tomorrow.setUTCHours(15, 0, 0, 0);
const startTimeISO = tomorrow.toISOString();

console.log(`\nStart time: ${startTimeISO}\n`);

state.phase_4_adsets = {}; // reset

for (const as of adsets) {
  try {
    console.log(`\n[${as.code}] Creating: ${as.name}`);
    const campaignId = campaignIds[as.campaign];
    if (!campaignId) throw new Error(`campaign ${as.campaign} not available`);

    // Targeting con exclusión nativa de followers/likers
    const targeting = {
      ...as.targeting,
      excluded_connections: [{ id: PAGE_ID }],
      exclusions: {
        connections: [{ id: IG_USER_ID }],
      },
    };

    const result = await call(`/${AD_ACCOUNT_ID}/adsets`, {
      name: as.name,
      campaign_id: campaignId,
      daily_budget: as.daily_budget_ars * 100,
      billing_event: "IMPRESSIONS",
      optimization_goal: optimizationByObjective[as.campaign],
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      targeting,
      status: "PAUSED",
      start_time: startTimeISO,
    });

    console.log(`  ✓ created id=${result.id}`);
    state.phase_4_adsets[as.code] = {
      id: result.id,
      name: as.name,
      campaign: as.campaign,
      daily_budget_ars: as.daily_budget_ars,
      status: "PAUSED",
    };
    saveState();
    await sleep(500);
  } catch (e) {
    console.log(`  ✗ ERROR: ${e.message}`);
    state.phase_4_adsets[as.code] = { name: as.name, status: "failed", error: e.message };
    saveState();
  }
}

state.phase_1_custom_audiences_status = "DEFERRED — creación manual en UI o segunda pasada con schema corregido";
saveState();

const createdAS = Object.values(state.phase_4_adsets).filter(a => a.status === "PAUSED").length;
const createdC = Object.values(state.phase_3_campaigns).filter(c => c.status === "PAUSED").length;
console.log(`\n=== SUMMARY ===`);
console.log(`Campaigns: ${createdC}/4 PAUSED`);
console.log(`Ad Sets: ${createdAS}/7 PAUSED`);
console.log(`Custom Audiences: DEFERRED (not blocking)`);
console.log(`Ads + Creatives: BLOCKED (pending post_ids from launch)`);
