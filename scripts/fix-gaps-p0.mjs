#!/usr/bin/env node
/**
 * fix-gaps-p0.mjs — Resolver gaps P0 de auditoría
 *
 * G-2: Crear video ads en AWR (A2 + B1)
 * G-4: Crear ad creative + ad para reel "primera vez" en ENG_REEL
 * G-6: Escalar ENG_REEL de $5,000 a $7,250/día
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;
const AD_ACCOUNT = "act_2303565156801569";
const PAGE_ID = "1064806400040502";
const OUTPUT = path.resolve("campaigns/plan-crecimiento-10k/meta-ids.json");

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) { console.error("ERROR: TOKEN VACÍO"); process.exit(1); }
console.log("TOKEN: CARGADA");

// Load state
const state = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));

function saveState() {
  fs.writeFileSync(OUTPUT, JSON.stringify(state, null, 2));
}

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
// G-2: Crear video ads en Awareness (A2 + B1)
// ============================================================
async function fixG2() {
  console.log("\n" + "=".repeat(60));
  console.log("G-2: Agregar video ads a Awareness");
  console.log("=".repeat(60));

  const ads = [
    {
      name: "ENBA_ad_reel4h_B1",
      adset_id: "120238978173190139", // B1
      creative_id: "950413604375752",  // reel-4horas-existing
      code: "AD_B1_REEL4H",
    },
    {
      name: "ENBA_ad_reel4hAlt_A2",
      adset_id: "120238978174670139", // A2
      creative_id: "1996455587614987",  // reel-4horas-alt
      code: "AD_A2_REEL4HALT",
    },
  ];

  const results = [];
  for (const ad of ads) {
    try {
      const data = await apiPost(`/${AD_ACCOUNT}/ads`, {
        name: ad.name,
        adset_id: ad.adset_id,
        creative: JSON.stringify({ creative_id: ad.creative_id }),
        status: "ACTIVE",
      });
      console.log(`✓ ${ad.code} creado: ${data.id}`);
      results.push({ ...ad, id: data.id });

      // Verificar
      await sleep(2000);
      const check = await apiGet(`/${data.id}?fields=effective_status,name`);
      console.log(`  Status: ${check.effective_status}`);
    } catch (e) {
      console.error(`✗ ${ad.code} falló: ${e.message}`);
    }
    await sleep(1000);
  }
  return results;
}

// ============================================================
// G-4: Crear creative + ad para reel "primera vez" en ENG_REEL
// ============================================================
async function fixG4() {
  console.log("\n" + "=".repeat(60));
  console.log("G-4: Amplificar reel 'primera vez' ahora");
  console.log("=".repeat(60));

  // Paso 1: Crear ad creative desde existing post
  // object_story_id = {page_id}_{post_id}
  const fbPostId = "4467029896876277";
  const objectStoryId = `${PAGE_ID}_${fbPostId}`;

  console.log(`\nCreando creative desde existing post: ${objectStoryId}`);
  const creative = await apiPost(`/${AD_ACCOUNT}/adcreatives`, {
    name: "reel-primera-vez-existing",
    object_story_id: objectStoryId,
  });
  console.log(`✓ Creative creado: ${creative.id}`);

  // Paso 2: Crear ad en ENG_REEL
  await sleep(2000);
  const ad = await apiPost(`/${AD_ACCOUNT}/ads`, {
    name: "ENBA_ad_reelPV_ENG",
    adset_id: "120239078452300139", // ENG_REEL
    creative: JSON.stringify({ creative_id: creative.id }),
    status: "ACTIVE",
  });
  console.log(`✓ Ad creado: ${ad.id}`);

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
  console.log("G-6: Escalar ENG_REEL a $7,250/día");
  console.log("=".repeat(60));

  const adsetId = "120239078452300139";

  // GET fresco primero
  const current = await apiGet(`/${adsetId}?fields=daily_budget,effective_status`);
  console.log(`Budget actual: ${current.daily_budget} (${parseInt(current.daily_budget)/100} ARS)`);

  // PATCH budget
  const data = await apiPost(`/${adsetId}`, {
    daily_budget: 725000, // $7,250 ARS en centavos
  });
  console.log(`✓ Budget actualizado`);

  // Verificar
  await sleep(2000);
  const verify = await apiGet(`/${adsetId}?fields=daily_budget,effective_status`);
  console.log(`Nuevo budget: ${verify.daily_budget} (${parseInt(verify.daily_budget)/100} ARS)`);
  console.log(`Status: ${verify.effective_status}`);

  return verify;
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log("=== Fix Gaps P0 — Auditoría Plan 10K ===\n");

  // G-2
  const g2Results = await fixG2();

  // G-4
  const g4Result = await fixG4();

  // G-6
  const g6Result = await fixG6();

  // Resumen
  console.log("\n" + "=".repeat(60));
  console.log("RESUMEN");
  console.log("=".repeat(60));
  console.log("G-2 Video ads AWR:", g2Results.length, "ads creados");
  g2Results.forEach(r => console.log(`  ${r.code}: ${r.id}`));
  console.log("G-4 Reel PV:", `creative=${g4Result.creative_id}, ad=${g4Result.ad_id}`);
  console.log("G-6 ENG_REEL budget:", `${parseInt(g6Result.daily_budget)/100} ARS/día`);
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
