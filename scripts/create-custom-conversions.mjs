/**
 * Crea las 3 Custom Conversions en Meta Ads para el pixel ENBA
 * Ejecutar: node scripts/create-custom-conversions.mjs
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
    name: "ENBA - Lead (formulario servicios)",
    event: "Lead",
    description: "Envío exitoso del formulario de consulta de servicios náuticos",
  },
  {
    name: "ENBA - Contact (click WhatsApp)",
    event: "Contact",
    description: "Click en link de WhatsApp desde cualquier página del sitio",
  },
  {
    name: "ENBA - ViewContent (click CTA)",
    event: "ViewContent",
    description: "Click en botón CTA primario o accent del sitio",
  },
];

for (const conv of conversions) {
  const rule = JSON.stringify({
    inclusions: {
      operator: "or",
      rules: [
        {
          event_sources: [{ id: PIXEL_ID, type: "pixel" }],
          retention_seconds: 2592000,
          filter: {
            operator: "and",
            filters: [
              { field: "event", operator: "=", value: conv.event },
            ],
          },
        },
      ],
    },
  });

  const params = new URLSearchParams({
    name: conv.name,
    pixel_id: PIXEL_ID,
    rule,
    access_token: TOKEN,
  });

  const res = await fetch(`${BASE}/${AD_ACCOUNT}/customconversions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();

  if (data.id) {
    console.log(`✓ ${conv.name} — ID: ${data.id}`);
  } else {
    console.error(`✗ ${conv.name} — Error:`, JSON.stringify(data));
  }
}
