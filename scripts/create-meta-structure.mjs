#!/usr/bin/env node
/**
 * create-meta-structure.mjs — Decision B reducida
 *
 * Crea via Meta Graph API v21.0:
 *   FASE 1: 6 Custom Audiences
 *   FASE 3: 4 Campanas (PAUSED, sin budget)
 *   FASE 4: 7 Ad Sets (PAUSED, targeting inline, exclusion D5+D6)
 *
 * NO crea:
 *   - Ad Creatives ni Ads (bloqueado hasta resolver post_ids de lanzamiento)
 *
 * Output: campaigns/plan-crecimiento-10k/meta-ids.json
 *
 * Uso: node scripts/create-meta-structure.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { execSync } from "node:child_process";

// ── Config ─────────────────────────────────────────────────────────────────

const API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;
const AD_ACCOUNT_ID = "act_2303565156801569";

const OUTPUT_PATH = path.resolve(
  "campaigns/plan-crecimiento-10k/meta-ids.json"
);

// ── Load credentials ───────────────────────────────────────────────────────

// Token desde Windows User scope (secret, no en .env)
const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

// IDs públicos desde .env
function loadEnv() {
  const envPath = path.resolve(".env");
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

const env = loadEnv();
const PAGE_ID = env.META_PAGE_ID;
const IG_USER_ID = env.META_IG_USER_ID;
const PIXEL_ID = "1273048378266952";

if (!TOKEN || !PAGE_ID || !IG_USER_ID) {
  console.error("ERROR: faltan credenciales. Token en Windows User scope, IDs en .env");
  process.exit(1);
}

// ── HTTP helper ────────────────────────────────────────────────────────────

async function call(method, endpoint, body = null) {
  const url = `${BASE}${endpoint}`;
  const init = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    // Always append token to body
    const payload = { ...body, access_token: TOKEN };
    if (method === "POST") {
      init.body = JSON.stringify(payload);
    }
  } else if (method === "GET") {
    const sep = url.includes("?") ? "&" : "?";
    const urlWithToken = `${url}${sep}access_token=${TOKEN}`;
    const resp = await fetch(urlWithToken);
    const data = await resp.json();
    if (data.error) throw new Error(`${data.error.code}: ${data.error.message}`);
    return data;
  }

  const resp = await fetch(url, init);
  const data = await resp.json();
  if (data.error) {
    throw new Error(
      `${data.error.code}: ${data.error.message}${
        data.error.error_user_msg ? ` | ${data.error.error_user_msg}` : ""
      }`
    );
  }
  return data;
}

// ── State tracking ─────────────────────────────────────────────────────────

const state = {
  timestamp: new Date().toISOString(),
  phase_1_custom_audiences: {},
  phase_3_campaigns: {},
  phase_4_adsets: {},
  phase_6_7_ads: "SKIPPED — pending post_ids from launch team",
  errors: [],
};

function saveState() {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(state, null, 2));
  console.log(`  → state saved to ${OUTPUT_PATH}`);
}

// ── FASE 1: Custom Audiences ───────────────────────────────────────────────

async function createCustomAudiences() {
  console.log("\n=== FASE 1: Custom Audiences ===");

  // 4 Custom Audiences (D5/D6 descartadas — se excluyen vía connections en ad sets)
  const audiences = [
    {
      code: "D1",
      name: "ENBA_Custom_WebVisitors_30d",
      description: "Visitantes del sitio en los últimos 30 días",
      payload: {
        pixel_id: PIXEL_ID,
        retention_days: 30,
        rule: {
          inclusions: {
            operator: "or",
            rules: [
              {
                event_sources: [{ id: PIXEL_ID, type: "pixel" }],
                retention_seconds: 30 * 86400,
              },
            ],
          },
        },
      },
    },
    {
      code: "D2",
      name: "ENBA_Custom_IGEngagers_90d",
      description: "Cualquier engagement con cuenta IG últimos 90 días",
      payload: {
        subtype: "ENGAGEMENT",
        rule: {
          inclusions: {
            operator: "or",
            rules: [
              {
                event_sources: [{ id: IG_USER_ID, type: "ig_business" }],
                retention_seconds: 90 * 86400,
                filter: {
                  operator: "and",
                  filters: [
                    { field: "event", operator: "=", value: "ig_business_profile_all" },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    {
      code: "D3",
      name: "ENBA_Custom_FBEngagers_90d",
      description: "Cualquier engagement con FB Page últimos 90 días",
      payload: {
        subtype: "ENGAGEMENT",
        rule: {
          inclusions: {
            operator: "or",
            rules: [
              {
                event_sources: [{ id: PAGE_ID, type: "page" }],
                retention_seconds: 90 * 86400,
                filter: {
                  operator: "and",
                  filters: [
                    { field: "event", operator: "=", value: "page_engaged" },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    {
      code: "D4",
      name: "ENBA_Custom_VideoViewers_30d",
      description: "Viewers >50% de cualquier video ENBA últimos 30 días",
      payload: {
        subtype: "ENGAGEMENT",
        rule: {
          inclusions: {
            operator: "or",
            rules: [
              {
                event_sources: [{ id: PAGE_ID, type: "page" }],
                retention_seconds: 30 * 86400,
                filter: {
                  operator: "and",
                  filters: [
                    { field: "event", operator: "=", value: "video_view_50_percent" },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  ];

  for (const aud of audiences) {
    try {
      console.log(`\n[${aud.code}] Creating: ${aud.name}`);
      const body = {
        name: aud.name,
        description: aud.description,
        ...aud.payload,
      };
      // Stringify rule if present
      if (body.rule && typeof body.rule === "object") {
        body.rule = JSON.stringify(body.rule);
      }
      const result = await call(
        "POST",
        `/${AD_ACCOUNT_ID}/customaudiences`,
        body
      );
      console.log(`  ✓ created id=${result.id}`);
      state.phase_1_custom_audiences[aud.code] = {
        id: result.id,
        name: aud.name,
        status: "created",
      };
      saveState();
      await sleep(500);
    } catch (e) {
      console.log(`  ✗ ERROR: ${e.message}`);
      state.phase_1_custom_audiences[aud.code] = {
        name: aud.name,
        status: "failed",
        error: e.message,
      };
      state.errors.push({ phase: "1", code: aud.code, error: e.message });
      saveState();
    }
  }
}

// ── FASE 3: Campaigns ──────────────────────────────────────────────────────

async function createCampaigns() {
  console.log("\n=== FASE 3: Campaigns ===");

  const campaigns = [
    { code: "C_AWR", name: "ENBA_Awareness_abr2026", objective: "OUTCOME_AWARENESS" },
    { code: "C_ENG", name: "ENBA_Engagement_abr2026", objective: "OUTCOME_ENGAGEMENT" },
    { code: "C_TRF", name: "ENBA_Traffic_abr2026", objective: "OUTCOME_TRAFFIC" },
    { code: "C_LEA", name: "ENBA_Leads_abr2026", objective: "OUTCOME_LEADS" },
  ];

  for (const camp of campaigns) {
    try {
      console.log(`\n[${camp.code}] Creating: ${camp.name}`);
      const result = await call("POST", `/${AD_ACCOUNT_ID}/campaigns`, {
        name: camp.name,
        objective: camp.objective,
        status: "PAUSED",
        special_ad_categories: [],
        is_adset_budget_sharing_enabled: false,
      });
      console.log(`  ✓ created id=${result.id}`);
      state.phase_3_campaigns[camp.code] = {
        id: result.id,
        name: camp.name,
        objective: camp.objective,
        status: "PAUSED",
      };
      saveState();
      await sleep(500);
    } catch (e) {
      console.log(`  ✗ ERROR: ${e.message}`);
      state.phase_3_campaigns[camp.code] = {
        name: camp.name,
        status: "failed",
        error: e.message,
      };
      state.errors.push({ phase: "3", code: camp.code, error: e.message });
      saveState();
    }
  }
}

// ── FASE 4: Ad Sets ────────────────────────────────────────────────────────

// Exclusiones nativas de Meta:
// - excluded_connections: excluye gente conectada a la FB Page (likers)
// - exclusions.connections (dentro de targeting): excluye IG followers
// No se usa Custom Audience para esto — son opciones de targeting nativas.

async function createAdSets() {
  console.log("\n=== FASE 4: Ad Sets ===");

  const campaignIds = {
    AWR: state.phase_3_campaigns.C_AWR?.id,
    ENG: state.phase_3_campaigns.C_ENG?.id,
    LEA: state.phase_3_campaigns.C_LEA?.id,
  };

  // Base: future start date (tomorrow 12:00 ART = 15:00 UTC)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setUTCHours(15, 0, 0, 0);
  const futureStart = Math.floor(tomorrow.getTime() / 1000);

  const adsets = [
    {
      code: "AS_AWR_A2",
      campaign: "AWR",
      name: "ENBA_Awareness_A2_InteresNavegacion",
      daily_budget_ars: 2000,
      targeting: {
        geo_locations: {
          custom_locations: [
            {
              latitude: -34.5532,
              longitude: -58.4505,
              radius: 40,
              distance_unit: "kilometer",
            },
          ],
          location_types: ["home", "recent"],
        },
        age_min: 28,
        age_max: 50,
        flexible_spec: [
          {
            interests: [
              { id: "6003237580025", name: "Sailing" },
              { id: "6003194647395", name: "Sailboat" },
              { id: "6003147269691", name: "Boat" },
            ],
          },
        ],
      },
    },
    {
      code: "AS_AWR_B1",
      campaign: "AWR",
      name: "ENBA_Awareness_B1_ExperienciasBA",
      daily_budget_ars: 3000,
      targeting: {
        geo_locations: {
          cities: [{ key: "1031", name: "Buenos Aires", radius: 30, distance_unit: "kilometer" }],
          location_types: ["home", "recent"],
        },
        age_min: 28,
        age_max: 45,
        flexible_spec: [
          {
            interests: [
              { id: "6003139266461", name: "Travel" },
              { id: "6003349442621", name: "Outdoor recreation" },
              { id: "6003283852750", name: "Gastronomy" },
            ],
          },
        ],
      },
    },
    {
      code: "AS_AWR_B2",
      campaign: "AWR",
      name: "ENBA_Awareness_B2_OutdoorAventura",
      daily_budget_ars: 1000,
      targeting: {
        geo_locations: {
          custom_locations: [
            {
              latitude: -34.5532,
              longitude: -58.4505,
              radius: 40,
              distance_unit: "kilometer",
            },
          ],
          location_types: ["home", "recent"],
        },
        age_min: 25,
        age_max: 45,
        flexible_spec: [
          {
            interests: [
              { id: "6003256851918", name: "Kayaking" },
              { id: "6003265467346", name: "Hiking" },
              { id: "6003209371345", name: "Camping" },
            ],
          },
        ],
      },
    },
    {
      code: "AS_AWR_C1",
      campaign: "AWR",
      name: "ENBA_Awareness_C1_TurismoBA",
      daily_budget_ars: 1500,
      targeting: {
        geo_locations: {
          countries: ["AR"],
        },
        age_min: 28,
        age_max: 55,
        flexible_spec: [
          {
            interests: [
              { id: "6003143131033", name: "Tourism" },
              { id: "6003139266461", name: "Travel" },
            ],
          },
        ],
      },
    },
    {
      code: "AS_AWR_A3",
      campaign: "AWR",
      name: "ENBA_Awareness_A3_AspiracionalNautico",
      daily_budget_ars: 1500,
      targeting: {
        geo_locations: {
          custom_locations: [
            {
              latitude: -34.5532,
              longitude: -58.4505,
              radius: 40,
              distance_unit: "kilometer",
            },
          ],
          location_types: ["home", "recent"],
        },
        age_min: 28,
        age_max: 45,
        flexible_spec: [
          {
            interests: [
              { id: "6003251053575", name: "Luxury goods" },
              { id: "6003139266461", name: "Travel" },
              { id: "6003349442621", name: "Outdoor recreation" },
            ],
          },
        ],
      },
    },
    {
      code: "AS_ENG_C2",
      campaign: "ENG",
      name: "ENBA_Engagement_C2_RegalosExperienciales",
      daily_budget_ars: 1000,
      targeting: {
        geo_locations: {
          custom_locations: [
            {
              latitude: -34.5532,
              longitude: -58.4505,
              radius: 40,
              distance_unit: "kilometer",
            },
          ],
          location_types: ["home", "recent"],
        },
        age_min: 28,
        age_max: 50,
        flexible_spec: [
          {
            interests: [
              { id: "6003295320538", name: "Gift" },
              { id: "6003139266461", name: "Travel" },
            ],
          },
        ],
      },
    },
    {
      code: "AS_LEA_C3",
      campaign: "LEA",
      name: "ENBA_Leads_C3_Corporativo",
      daily_budget_ars: 500,
      targeting: {
        geo_locations: {
          custom_locations: [
            {
              latitude: -34.5532,
              longitude: -58.4505,
              radius: 40,
              distance_unit: "kilometer",
            },
          ],
          location_types: ["home", "recent"],
        },
        age_min: 32,
        age_max: 55,
        flexible_spec: [
          {
            interests: [
              { id: "6003297699432", name: "Team building" },
              { id: "6003293995708", name: "Corporate event" },
            ],
          },
        ],
      },
    },
  ];

  const optimizationByObjective = {
    AWR: "REACH",
    ENG: "POST_ENGAGEMENT",
    LEA: "LEAD_GENERATION",
  };

  const billingByObjective = {
    AWR: "IMPRESSIONS",
    ENG: "IMPRESSIONS",
    LEA: "IMPRESSIONS",
  };

  for (const as of adsets) {
    try {
      console.log(`\n[${as.code}] Creating: ${as.name}`);
      const campaignId = campaignIds[as.campaign];
      if (!campaignId) {
        throw new Error(`campaign ${as.campaign} not created`);
      }

      // Exclusiones nativas: FB page likers + IG followers
      const targeting = {
        ...as.targeting,
        excluded_connections: [{ id: PAGE_ID }],
        exclusions: {
          connections: [{ id: IG_USER_ID }],
        },
      };

      const result = await call("POST", `/${AD_ACCOUNT_ID}/adsets`, {
        name: as.name,
        campaign_id: campaignId,
        daily_budget: as.daily_budget_ars * 100, // in cents
        billing_event: billingByObjective[as.campaign],
        optimization_goal: optimizationByObjective[as.campaign],
        bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        targeting,
        status: "PAUSED",
        start_time: futureStart,
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
      state.phase_4_adsets[as.code] = {
        name: as.name,
        status: "failed",
        error: e.message,
      };
      state.errors.push({ phase: "4", code: as.code, error: e.message });
      saveState();
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== ENBA Meta Structure — Decision B (reducida) ===");
  console.log(`Account: ${AD_ACCOUNT_ID}`);
  console.log(`Output: ${OUTPUT_PATH}`);

  await createCustomAudiences();
  await createCampaigns();
  await createAdSets();

  console.log("\n=== SUMMARY ===");
  console.log(`Custom Audiences created: ${Object.values(state.phase_1_custom_audiences).filter(a => a.status === "created").length}/6`);
  console.log(`Campaigns created: ${Object.values(state.phase_3_campaigns).filter(c => c.status === "PAUSED").length}/4`);
  console.log(`Ad Sets created: ${Object.values(state.phase_4_adsets).filter(a => a.status === "PAUSED").length}/7`);
  console.log(`Errors: ${state.errors.length}`);
  console.log(`\nAds + Creatives: SKIPPED (pending post_ids from launch team)`);
  console.log(`\nFull state: ${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  saveState();
  process.exit(1);
});
