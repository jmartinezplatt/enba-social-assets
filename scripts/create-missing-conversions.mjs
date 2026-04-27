/**
 * Crea las 2 Custom Conversions faltantes en Meta Ads (Contact + ViewContent)
 * Lead ya existe: 1634612341204888 — custom_event_type: LEAD
 * Formato correcto verificado del Lead existente: custom_event_type + rule URL
 */

import { execSync } from "child_process";

const TOKEN = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN', 'User')"`,
  { encoding: "utf8" }
).trim();

if (!TOKEN) {
  console.error("META_ADS_USER_TOKEN vacío — abortando");
  process.exit(1);
}

const AD_ACCOUNT = "act_2303565156801569";
const PIXEL_ID = "1273048378266952";
const BASE = "https://graph.facebook.com/v22.0";
const conversions = [
  {
    name: "ENBA - Contact (click WhatsApp)",
    custom_event_type: "CONTACT",
    rule: JSON.stringify({ url: { starts_with: "https://espacionautico.com.ar" } }),
  },
  {
    name: "ENBA - ViewContent (click CTA)",
    custom_event_type: "CONTENT_VIEW",
    rule: JSON.stringify({ url: { starts_with: "https://www.espacionautico.com.ar" } }),
  },
];

for (const conv of conversions) {
  const params = new URLSearchParams({
    name: conv.name,
    pixel_id: PIXEL_ID,
    event_source_id: PIXEL_ID,
    custom_event_type: conv.custom_event_type,
    rule: conv.rule,
    access_token: TOKEN,
  });

  const res = await fetch(`${BASE}/${AD_ACCOUNT}/customconversions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();

  if (data.id) {
    console.log(`✓ ${conv.name}`);
    console.log(`  ID: ${data.id}`);
    console.log(`  ROLLBACK: node -e "const t=process.env.T; fetch('https://graph.facebook.com/v22.0/${data.id}',{method:'DELETE',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'access_token='+t}).then(r=>r.json()).then(console.log)"`);
  } else {
    console.error(`✗ ${conv.name} — Error:`, JSON.stringify(data));
  }
}
