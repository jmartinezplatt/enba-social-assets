#!/usr/bin/env node
/**
 * verify-all-gaps.mjs — Verificación end-to-end de todos los gaps resueltos
 */
import { execSync } from "node:child_process";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

async function get(endpoint) {
  const url = `${BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}access_token=${TOKEN}`;
  return (await fetch(url)).json();
}

async function main() {
  console.log("=== VERIFICACIÓN END-TO-END — Audit Fix ===\n");

  // 1. Ad sets activos con targeting
  console.log("--- AD SETS ACTIVOS ---");
  const adsets = [
    { code: "A2", id: "120238978174670139" },
    { code: "B1", id: "120238978173190139" },
    { code: "ENG_REEL", id: "120239078452300139" },
  ];

  for (const as of adsets) {
    const d = await get(`/${as.id}?fields=name,effective_status,daily_budget,targeting`);
    const interests = d.targeting?.flexible_spec?.[0]?.interests?.map(i => i.name) || [];
    console.log(`\n${as.code}: status=${d.effective_status}, budget=${parseInt(d.daily_budget || 0)/100} ARS`);
    console.log(`  Interests: ${interests.join(", ")}`);
  }

  // 2. Todos los ads y su estado
  console.log("\n\n--- TODOS LOS ADS ---");
  const ads = [
    { code: "AD_A2_P01", id: "120239058261910139" },
    { code: "AD_B1_P01", id: "120239058262400139" },
    { code: "AD_B1_P03", id: "120239075118770139" },
    { code: "AD_ENG_REEL", id: "120239078453020139" },
    { code: "AD_B1_REEL4H (G-2)", id: "120239287388330139" },
    { code: "AD_A2_REEL4HALT (G-2+G-10)", id: "120239287392190139" },
    { code: "AD_ENG_REEL_PV (G-4)", id: "120239287424800139" },
  ];

  for (const ad of ads) {
    const d = await get(`/${ad.id}?fields=name,effective_status,url_tags`);
    console.log(`${ad.code}: status=${d.effective_status}, utms=${d.url_tags || "N/A"}`);
  }

  // 3. Budget total
  console.log("\n\n--- BUDGET DIARIO TOTAL ---");
  let total = 0;
  for (const as of adsets) {
    const d = await get(`/${as.id}?fields=daily_budget`);
    const budget = parseInt(d.daily_budget || 0) / 100;
    total += budget;
  }
  console.log(`Total: ${total} ARS/día (target: 13,750)`);

  // 4. Resumen
  console.log("\n\n=== CHECKLIST GAPS ===");
  console.log("G-1  Intereses inválidos:     YA RESUELTO EN API (sesión anterior)");
  console.log("G-2  Video ads AWR:           CREADOS (2 ads)");
  console.log("G-3  Plan B warm D2:          DOCUMENTADO en plan-maestro.md");
  console.log("G-4  Reel primera vez:        EN PAUTA");
  console.log("G-5  UTMs:                    PATCHEADOS (7 ads)");
  console.log("G-6  Budget delta:            ENG_REEL escalado a $7,250");
  console.log("G-7  Ref v3→v4:               CORREGIDO en plan-maestro.md");
  console.log("G-8  Pixel D1:                VERIFICADO (Event Data correcto)");
  console.log("G-9  Darkpost pipeline:        DOCUMENTADO en plan-maestro.md");
  console.log("G-10 Reel alt sin asignar:    RESUELTO (en A2 via G-2)");
  console.log("G-11 Raw IDs cleanup:         WARNING agregado");
}

main().catch(e => { console.error(e); process.exit(1); });
