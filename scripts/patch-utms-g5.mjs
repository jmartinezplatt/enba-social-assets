#!/usr/bin/env node
/**
 * patch-utms-g5.mjs — G-5: Agregar UTMs a todos los ads activos
 */
import { execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) { console.error("ERROR: TOKEN VACÍO"); process.exit(1); }
console.log("TOKEN: CARGADA");

const ACTIVE_ADS = [
  { code: "AD_A2_P01", id: "120239058261910139" },
  { code: "AD_B1_P01", id: "120239058262400139" },
  { code: "AD_B1_P03", id: "120239075118770139" },
  { code: "AD_ENG_REEL", id: "120239078453020139" },
  { code: "AD_B1_REEL4H", id: "120239287388330139" },
  { code: "AD_A2_REEL4HALT", id: "120239287392190139" },
  { code: "AD_ENG_REEL_PV", id: "120239287424800139" },
];

const UTM_TAGS = "utm_source=meta&utm_medium=paid&utm_campaign=crecimiento10k&utm_content={{ad.name}}";

async function patchUtm(ad) {
  // GET fresco
  const getUrl = `${BASE}/${ad.id}?fields=url_tags,effective_status&access_token=${TOKEN}`;
  const current = await (await fetch(getUrl)).json();
  console.log(`\n${ad.code} (${ad.id}): status=${current.effective_status}, url_tags=${current.url_tags || "VACÍO"}`);

  if (current.url_tags === UTM_TAGS) {
    console.log("  → Ya tiene UTMs correctos, skip");
    return { code: ad.code, action: "skipped" };
  }

  // PATCH
  const resp = await fetch(`${BASE}/${ad.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url_tags: UTM_TAGS, access_token: TOKEN }),
  });
  const data = await resp.json();

  if (data.error) {
    console.error(`  ✗ Error: ${data.error.message}`);
    return { code: ad.code, action: "error", error: data.error.message };
  }

  console.log(`  ✓ UTMs configurados`);

  // Verificar
  await sleep(1000);
  const verify = await (await fetch(`${BASE}/${ad.id}?fields=url_tags&access_token=${TOKEN}`)).json();
  console.log(`  Verificación: url_tags=${verify.url_tags}`);

  return { code: ad.code, action: "patched" };
}

async function main() {
  console.log("=== G-5: Patchear UTMs en ads activos ===\n");

  const results = [];
  for (const ad of ACTIVE_ADS) {
    const r = await patchUtm(ad);
    results.push(r);
    await sleep(500);
  }

  console.log("\n=== RESUMEN ===");
  results.forEach(r => console.log(`${r.code}: ${r.action}${r.error ? ` (${r.error})` : ""}`));
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
