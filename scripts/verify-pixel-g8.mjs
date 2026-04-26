#!/usr/bin/env node
/**
 * verify-pixel-g8.mjs — G-8: Verificar qué pixel usa D1 WebVisitors
 */
import { execSync } from "node:child_process";

const API = "v21.0";
const BASE = `https://graph.facebook.com/${API}`;

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`,
  { encoding: "utf-8" }
).trim();

if (!TOKEN) { console.error("ERROR: TOKEN VACÍO"); process.exit(1); }

async function main() {
  console.log("=== G-8: Verificar pixel en D1 WebVisitors ===\n");

  const D1_ID = "120239059710310139";
  const url = `${BASE}/${D1_ID}?fields=name,subtype,rule,delivery_status,approximate_count_lower_bound,approximate_count_upper_bound&access_token=${TOKEN}`;
  const resp = await fetch(url);
  const data = await resp.json();

  console.log("D1 WebVisitors:");
  console.log(JSON.stringify(data, null, 2));

  // Check if rule references the correct pixel
  if (data.rule) {
    const ruleStr = typeof data.rule === "string" ? data.rule : JSON.stringify(data.rule);
    if (ruleStr.includes("1273048378266952")) {
      console.log("\n✓ D1 usa Event Data pixel (1273048378266952) — CORRECTO");
    } else if (ruleStr.includes("830831356111912")) {
      console.log("\n✗ D1 usa ENBA Pixel (830831356111912) — NO SIRVE, NO SE USA, NO ES VÁLIDO, NO FUNCIONA — reemplazar por 1273048378266952");
    } else {
      console.log("\n? No se pudo determinar qué pixel usa. Rule:", ruleStr);
    }
  }

  // Also check D2-D4 delivery status while we're at it
  console.log("\n--- Estado de todas las audiences ---");
  const audiences = {
    D1: "120239059710310139",
    D2: "120239059862040139",
    D3: "120239060128140139",
    D4: "120239146204050139",
    D5: "120239146215040139",
  };

  for (const [code, id] of Object.entries(audiences)) {
    const r = await fetch(`${BASE}/${id}?fields=name,delivery_status,approximate_count_lower_bound,approximate_count_upper_bound&access_token=${TOKEN}`);
    const d = await r.json();
    console.log(`${code}: delivery=${JSON.stringify(d.delivery_status)}, size=${d.approximate_count_lower_bound || "?"}-${d.approximate_count_upper_bound || "?"}`);
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
