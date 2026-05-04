import { execSync } from "node:child_process";

const token = execSync(`powershell.exe -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`, { encoding: "utf-8" }).trim();
const AD_ACCOUNT  = "act_2303565156801569";
const VIDEO_ID    = "843214181541117";
const AD_ID       = "120239303661060139";
const PAGE_ID     = "1064806400040502";
const IG_USER_ID  = "17841443139761422";
const IMAGE_HASH  = "62d457947264ef102ec0262fe19d2ecd";
const CAPTION     = "No necesitás experiencia. Solo ganas. Seguinos.\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #VelerosBuenosAires #SalidaDistinta";
const BASE        = "https://graph.facebook.com/v22.0";

console.log("PASO 2: Creando creative...");
const r2 = await fetch(`${BASE}/${AD_ACCOUNT}/adcreatives`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    access_token: token,
    name: "microreel-ig-v3",
    object_story_spec: {
      page_id: PAGE_ID,
      instagram_user_id: IG_USER_ID,
      video_data: {
        video_id: VIDEO_ID,
        image_hash: IMAGE_HASH,
        message: CAPTION,
        call_to_action: {
          type: "VIEW_INSTAGRAM_PROFILE",
          value: { link: "https://www.instagram.com/espacionauticobsas" },
        },
      },
    },
  }),
});
const d2 = await r2.json();
if (d2.error) throw new Error(`Creative: ${JSON.stringify(d2.error)}`);
console.log(`  creative_id: ${d2.id}`);

console.log("PASO 3: Actualizando ENBA_ad_microreel_IG_Cold...");
const r3 = await fetch(`${BASE}/${AD_ID}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ access_token: token, creative: { creative_id: d2.id } }),
});
const d3 = await r3.json();
if (d3.error) throw new Error(`Update ad: ${JSON.stringify(d3.error)}`);

console.log(`\n═══ SWAP COMPLETO ═══`);
console.log(`Video ID:   ${VIDEO_ID}`);
console.log(`Creative:   ${d2.id}`);
console.log(`Ad:         ENBA_ad_microreel_IG_Cold (${AD_ID})`);
console.log(`Respuesta:  ${JSON.stringify(d3)}`);
