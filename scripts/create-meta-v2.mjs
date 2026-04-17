#!/usr/bin/env node
/**
 * create-meta-v2.mjs — Ejecución Decisión B v2
 *
 * Basado en preflight-meta-api.md (schema real) + presupuesto-v2-500k.md
 *
 * FASES:
 *   1. Custom Audiences (D1-D5) — schema validado
 *   2. Ad Sets (7) — con exclusión vía D5, interest IDs reales, budgets respetando mínimos
 *
 * Campañas ya creadas en ejecución anterior. IDs en meta-ids.json.
 * Ads/Creatives bloqueados hasta resolver post_ids.
 */

import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { execSync } from "node:child_process";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;
const AD = "act_2303565156801569";
const OUTPUT = path.resolve("campaigns/plan-crecimiento-10k/meta-ids.json");

// Token desde Windows User scope (secret, no en .env)
const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

// IDs públicos desde .env
const env = {};
fs.readFileSync(".env", "utf-8").split("\n").forEach((l) => {
  if (l.includes("=") && !l.startsWith("#")) {
    const i = l.indexOf("=");
    env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
});
const PAGE_ID = env.META_PAGE_ID;
const IG_ID = env.META_IG_USER_ID;
const PIXEL_ID = "1273048378266952";

if (!TOKEN) {
  console.error("ERROR: META_ADS_USER_TOKEN no encontrado en Windows User scope");
  process.exit(1);
}

// Load state
const state = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));
if (!state.phase_1_custom_audiences) state.phase_1_custom_audiences = {};
if (!state.phase_4_adsets) state.phase_4_adsets = {};
state.phase_2_v2_run = { timestamp: new Date().toISOString(), errors: [] };

function saveState() {
  fs.writeFileSync(OUTPUT, JSON.stringify(state, null, 2));
}

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

// ═══════════════════════════════════════════════════════════
// FASE 1: Custom Audiences con schema validado
// ═══════════════════════════════════════════════════════════

async function createCustomAudiences() {
  console.log("\n═══ FASE 1: Custom Audiences ═══");

  const audiences = [
    {
      code: "D1",
      name: "ENBA_Custom_WebVisitors_30d",
      description: "Visitantes del sitio (Pixel) 30 días",
      body: {
        subtype: "WEBSITE",
        rule: JSON.stringify({
          inclusions: {
            operator: "or",
            rules: [{
              event_sources: [{ id: PIXEL_ID, type: "pixel" }],
              retention_seconds: 2592000,
              filter: {
                operator: "and",
                filters: [{ field: "url", operator: "i_contains", value: "espacionautico.com.ar" }],
              },
            }],
          },
        }),
        prefill: 1,
      },
    },
    {
      code: "D2",
      name: "ENBA_Custom_IGEngagers_90d",
      description: "Cualquier engagement con IG Business 90 días",
      body: {
        subtype: "ENGAGEMENT",
        rule: JSON.stringify({
          inclusions: {
            operator: "or",
            rules: [{
              event_sources: [{ id: IG_ID, type: "ig_business" }],
              retention_seconds: 7776000,
              filter: {
                operator: "and",
                filters: [{ field: "event", operator: "=", value: "ig_business_profile_all" }],
              },
            }],
          },
        }),
        prefill: 1,
      },
    },
    {
      code: "D3",
      name: "ENBA_Custom_FBEngagers_90d",
      description: "Cualquier engagement con FB Page 90 días",
      body: {
        subtype: "ENGAGEMENT",
        rule: JSON.stringify({
          inclusions: {
            operator: "or",
            rules: [{
              event_sources: [{ id: PAGE_ID, type: "page" }],
              retention_seconds: 7776000,
              filter: {
                operator: "and",
                filters: [{ field: "event", operator: "=", value: "page_engaged" }],
              },
            }],
          },
        }),
        prefill: 1,
      },
    },
    {
      code: "D5",
      name: "ENBA_Custom_FBPageLikers_exclusion",
      description: "FB Page likers actuales (para exclusión)",
      body: {
        subtype: "ENGAGEMENT",
        rule: JSON.stringify({
          inclusions: {
            operator: "or",
            rules: [{
              event_sources: [{ id: PAGE_ID, type: "page" }],
              retention_seconds: 0,
              filter: {
                operator: "and",
                filters: [{ field: "event", operator: "=", value: "page_liked" }],
              },
            }],
          },
        }),
        prefill: 1,
      },
    },
  ];

  // D4 Video Viewers — se crea después cuando haya video publicado
  state.phase_1_custom_audiences.D4 = {
    name: "ENBA_Custom_VideoViewers_30d",
    status: "deferred",
    reason: "requires published video_id, not yet available",
  };

  for (const aud of audiences) {
    try {
      console.log(`\n[${aud.code}] ${aud.name}`);
      const result = await call(`/${AD}/customaudiences`, {
        name: aud.name,
        description: aud.description,
        ...aud.body,
      });
      console.log(`  ✓ id=${result.id}`);
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
      state.phase_2_v2_run.errors.push({ phase: "1", code: aud.code, error: e.message });
      saveState();
    }
  }
}

// ═══════════════════════════════════════════════════════════
// FASE 2: Ad Sets con budgets v2 + exclusión D5
// ═══════════════════════════════════════════════════════════

const locGBA40 = {
  custom_locations: [{ latitude: -34.6037, longitude: -58.3816, radius: 40, distance_unit: "kilometer" }],
  location_types: ["home", "recent"],
};

const locArgentina = {
  countries: ["AR"],
};

// Interest IDs validados vía /search?type=adinterest
const INTERESTS = {
  // A2 Interés Navegación
  vela_deporte: { id: "6003187081552", name: "vela (deporte)" },
  motor_boat_yachting: { id: "6023137421020", name: "Motor Boat & Yachting" },
  sailing_world: { id: "6003125161176", name: "Sailing World" },
  yacht_racing: { id: "6004160148624", name: "Yacht racing" },
  embarcacion: { id: "6002878991172", name: "Embarcación" },
  // B1 Experiencias BA
  viajes: { id: "6004160395895", name: "Viajes" },
  gastronomia: { id: "6003415019460", name: "Gastronomía" },
  ocio: { id: "6003249531267", name: "Ocio" },
  recreacion_aire_libre: { id: "6002985584323", name: "Recreación al aire libre" },
  // B2 Outdoor
  kayaking: { id: "6003077915229", name: "Kayaking" },
  excursionismo: { id: "6003252804967", name: "Excursionismo" },
  camping: { id: "6003403012818", name: "camping" },
  paddleboarding: { id: "6003290325569", name: "Paddleboarding" },
  caminatas: { id: "6003074033139", name: "Caminatas" },
  // C1 Turismo
  viajes_aventura: { id: "6002868021822", name: "Viajes de aventura" },
  viajes_turismo: { id: "6003038269845", name: "Viajes Y Turismo" },
  // A3 Aspiracional
  lujo: { id: "6007828099136", name: "Artículos de lujo" },
  // C2 Regalos
  regalos: { id: "6003019539929", name: "Regalos" },
  san_valentin: { id: "6003310766888", name: "Día de San Valentín" },
  bodas: { id: "6003409392877", name: "Bodas" },
  // C3 Corporativo
  gestion_eventos: { id: "6003092932417", name: "Gestión de eventos" },
  hr_professional: { id: "6003508907986", name: "Professional in Human Resources" },
  espiritu_empresarial: { id: "6003371567474", name: "Espíritu empresarial" },
};

async function createAdSets() {
  console.log("\n═══ FASE 2: Ad Sets ═══");

  const campaignIds = {
    AWR: state.phase_3_campaigns.C_AWR?.id,
    ENG: state.phase_3_campaigns.C_ENG?.id,
    LEA: state.phase_3_campaigns.C_LEA?.id,
  };

  // Exclusión: FB Page Likers (D5)
  const exclusionAudience = state.phase_1_custom_audiences.D5?.id
    ? [{ id: state.phase_1_custom_audiences.D5.id }]
    : [];

  if (exclusionAudience.length === 0) {
    console.log("  ⚠ D5 no creada, ad sets se crearán sin exclusión de FB likers");
  }

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setUTCHours(15, 0, 0, 0);
  const startTimeISO = tomorrow.toISOString();

  const adsets = [
    {
      code: "AS_AWR_B1",
      campaign: "AWR",
      name: "ENBA_Awareness_B1_ExperienciasBA",
      daily_budget_ars: 2500,
      optimization: "REACH",
      targeting: {
        geo_locations: locGBA40,
        age_min: 28,
        age_max: 45,
        flexible_spec: [{ interests: [INTERESTS.viajes, INTERESTS.gastronomia, INTERESTS.ocio, INTERESTS.recreacion_aire_libre] }],
      },
    },
    {
      code: "AS_AWR_A2",
      campaign: "AWR",
      name: "ENBA_Awareness_A2_InteresNavegacion",
      daily_budget_ars: 1500,
      optimization: "REACH",
      targeting: {
        geo_locations: locGBA40,
        age_min: 28,
        age_max: 50,
        flexible_spec: [{ interests: [INTERESTS.vela_deporte, INTERESTS.motor_boat_yachting, INTERESTS.sailing_world, INTERESTS.yacht_racing, INTERESTS.embarcacion] }],
      },
    },
    {
      code: "AS_AWR_C1",
      campaign: "AWR",
      name: "ENBA_Awareness_C1_TurismoBA",
      daily_budget_ars: 1500,
      optimization: "REACH",
      targeting: {
        geo_locations: locArgentina,
        age_min: 28,
        age_max: 55,
        flexible_spec: [{ interests: [INTERESTS.viajes, INTERESTS.viajes_aventura, INTERESTS.viajes_turismo] }],
      },
    },
    {
      code: "AS_AWR_B2",
      campaign: "AWR",
      name: "ENBA_Awareness_B2_OutdoorAventura",
      daily_budget_ars: 1500,
      optimization: "REACH",
      targeting: {
        geo_locations: locGBA40,
        age_min: 25,
        age_max: 45,
        flexible_spec: [{ interests: [INTERESTS.kayaking, INTERESTS.excursionismo, INTERESTS.camping, INTERESTS.paddleboarding, INTERESTS.caminatas] }],
      },
    },
    {
      code: "AS_AWR_A3",
      campaign: "AWR",
      name: "ENBA_Awareness_A3_AspiracionalNautico",
      daily_budget_ars: 1500,
      optimization: "REACH",
      targeting: {
        geo_locations: locGBA40,
        age_min: 28,
        age_max: 45,
        flexible_spec: [{ interests: [INTERESTS.lujo, INTERESTS.viajes_aventura, INTERESTS.recreacion_aire_libre] }],
      },
    },
    {
      code: "AS_ENG_C2",
      campaign: "ENG",
      name: "ENBA_Engagement_C2_RegalosExperienciales",
      daily_budget_ars: 1500,
      optimization: "POST_ENGAGEMENT",
      targeting: {
        geo_locations: locGBA40,
        age_min: 28,
        age_max: 50,
        flexible_spec: [{ interests: [INTERESTS.regalos, INTERESTS.san_valentin, INTERESTS.bodas] }],
      },
    },
    {
      code: "AS_LEA_C3",
      campaign: "LEA",
      name: "ENBA_Leads_C3_Corporativo",
      daily_budget_ars: 3500,
      optimization: "LEAD_GENERATION",
      targeting: {
        geo_locations: locGBA40,
        age_min: 32,
        age_max: 55,
        flexible_spec: [{ interests: [INTERESTS.gestion_eventos, INTERESTS.hr_professional, INTERESTS.espiritu_empresarial] }],
      },
    },
  ];

  // Reset phase_4 para esta corrida
  state.phase_4_adsets = {};

  for (const as of adsets) {
    try {
      console.log(`\n[${as.code}] ${as.name}`);
      const campaignId = campaignIds[as.campaign];
      if (!campaignId) throw new Error(`campaign ${as.campaign} missing`);

      const targeting = {
        ...as.targeting,
        targeting_automation: { advantage_audience: 0 },
      };
      if (exclusionAudience.length > 0) {
        targeting.excluded_custom_audiences = exclusionAudience;
      }

      const body = {
        name: as.name,
        campaign_id: campaignId,
        daily_budget: as.daily_budget_ars * 100, // centavos
        billing_event: "IMPRESSIONS",
        optimization_goal: as.optimization,
        bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        targeting,
        status: "PAUSED",
        start_time: startTimeISO,
      };

      // Para LEAD_GENERATION, promoted_object requerido
      if (as.optimization === "LEAD_GENERATION") {
        body.promoted_object = { page_id: PAGE_ID };
      }

      const result = await call(`/${AD}/adsets`, body);
      console.log(`  ✓ id=${result.id}`);
      state.phase_4_adsets[as.code] = {
        id: result.id,
        name: as.name,
        campaign: as.campaign,
        daily_budget_ars: as.daily_budget_ars,
        optimization: as.optimization,
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
      state.phase_2_v2_run.errors.push({ phase: "2", code: as.code, error: e.message });
      saveState();
    }
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("═══ ENBA Meta v2 — Ejecución desde preflight ═══");
  console.log(`Ad Account: ${AD}`);
  console.log(`Output: ${OUTPUT}`);

  // Custom Audiences diferidas — schema requiere validación directa contra API
  // await createCustomAudiences();
  console.log("\nCustom Audiences: DIFERIDAS (segunda pasada con schema revalidado)");
  state.phase_1_custom_audiences_status = "DEFERRED — preflight schema no coincide con API real";
  saveState();

  await createAdSets();

  const ca = Object.values(state.phase_1_custom_audiences).filter(a => a.status === "created").length;
  const ads = Object.values(state.phase_4_adsets).filter(a => a.status === "PAUSED").length;
  const camps = Object.values(state.phase_3_campaigns || {}).filter(c => c.status === "PAUSED").length;

  console.log("\n═══ SUMMARY ═══");
  console.log(`Campaigns PAUSED:    ${camps}/4 (from previous run)`);
  console.log(`Custom Audiences:    ${ca}/4 created (+ D4 deferred)`);
  console.log(`Ad Sets PAUSED:      ${ads}/7`);
  console.log(`Errors:              ${state.phase_2_v2_run.errors.length}`);
  console.log(`\nAds + Creatives:     BLOCKED (pending post_ids from launch)`);
  console.log(`\nState: ${OUTPUT}`);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  saveState();
  process.exit(1);
});
