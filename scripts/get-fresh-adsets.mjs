#!/usr/bin/env node
/**
 * get-fresh-adsets.mjs — GET fresco de ad sets activos para auditoría
 */
import { execSync } from "node:child_process";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) { console.error("TOKEN VACÍO"); process.exit(1); }

const AD_SETS = {
  A2: "120238978174670139",
  B1: "120238978173190139",
  ENG_REEL: "120239078452300139",
};

const FIELDS = "name,effective_status,daily_budget,targeting,optimization_goal,promoted_object";

async function getAdSet(code, id) {
  const url = `${BASE}/${id}?fields=${FIELDS}&access_token=${TOKEN}`;
  const resp = await fetch(url);
  const data = await resp.json();
  console.log(`\n=== ${code} (${id}) ===`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function getAds(adsetId, code) {
  const url = `${BASE}/${adsetId}/ads?fields=name,effective_status,creative{id,name},url_tags&access_token=${TOKEN}`;
  const resp = await fetch(url);
  const data = await resp.json();
  console.log(`\n--- Ads in ${code} ---`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  for (const [code, id] of Object.entries(AD_SETS)) {
    await getAdSet(code, id);
    await getAds(id, code);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
