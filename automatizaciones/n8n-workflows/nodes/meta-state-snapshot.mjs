// meta-state-snapshot.mjs
// Script on-demand para verificar el estado real de Meta Ads vs meta-ids.json
// Uso: node meta-state-snapshot.mjs
// Requiere: META_ADS_USER_TOKEN en Windows User scope
//
// Qué hace:
// 1. Lee META_ADS_USER_TOKEN de Windows User scope
// 2. Hace GET batch de todos los ads Follow Plan v2 + ENG_REEL
// 3. Hace GET batch de los 4 ad sets Follow Plan v2
// 4. Imprime snapshot con effective_status, budget, exclusiones
// 5. Calcula burn rate real y días restantes

import { execSync } from 'child_process';

const TOKEN = execSync(
  "powershell.exe -Command \"[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')\""
).toString().trim();

if (!TOKEN) {
  console.error('ERROR: META_ADS_USER_TOKEN no encontrado en Windows User scope.');
  process.exit(1);
}

// ── IDs Follow Plan v2 ──────────────────────────────────────────────────
const FOLLOW_PLAN_ADS = {
  '120239353874370139': 'corporativo_IG_Cold',
  '120239303661060139': 'microreel_IG_Cold',
  '120239303661450139': 'destinos_IG_Cold',
  '120239303662020139': 'nosotros_IG_Cold',
  '120239303662540139': 'microreel_IG_Retarget',
  '120239303663260139': 'destinos_IG_Retarget',
  '120239303663740139': 'nosotros_IG_Retarget',
  '120239303664580139': 'microreel_FB_Cold',
  '120239303665020139': 'destinos_FB_Cold',
  '120239303666220139': 'nosotros_FB_Cold',
  '120239303668560139': 'microreel_FB_Retarget',
  '120239303669700139': 'destinos_FB_Retarget',
  '120239303670130139': 'nosotros_FB_Retarget',
  '120239078453020139': 'AD_ENG_REEL',
};

const FOLLOW_PLAN_ADSETS = {
  '120239303658370139': 'ig_cold       ($4.000/día)',
  '120239303659250139': 'ig_retarget   ($1.500/día)',
  '120239303659650139': 'fb_cold       ($10.920/día)',
  '120239303660260139': 'fb_retarget   ($3.600/día)',
};

// Known exclusions from meta-ids.json (for comparison)
const KNOWN_EXCLUSIONS = {
  '120239303658370139': ['120239621840990139'], // D6
  '120239303659250139': ['120239621840990139'], // D6
  '120239303659650139': ['120239146215040139'], // D5
  '120239303660260139': ['120239146215040139'], // D5
};

const CAMPAIGN_BUDGET_TOTAL = 500000;
const CAMPAIGN_END_DATE = new Date('2026-05-16T03:00:00Z');

// ── Fetch ads ──────────────────────────────────────────────────────────
const adIds = Object.keys(FOLLOW_PLAN_ADS).join(',');
const adsUrl = `https://graph.facebook.com/v21.0/?ids=${adIds}&fields=id,name,status,effective_status&access_token=${TOKEN}`;
const adsRes = await fetch(adsUrl);
const adsData = await adsRes.json();

if (adsData.error) {
  console.error('ERROR API ads:', JSON.stringify(adsData.error));
  process.exit(1);
}

// ── Fetch ad sets ──────────────────────────────────────────────────────
const adsetIds = Object.keys(FOLLOW_PLAN_ADSETS).join(',');
const adsetsUrl = `https://graph.facebook.com/v21.0/?ids=${adsetIds}&fields=id,name,status,effective_status,daily_budget,targeting&access_token=${TOKEN}`;
const adsetsRes = await fetch(adsetsUrl);
const adsetsData = await adsetsRes.json();

if (adsetsData.error) {
  console.error('ERROR API adsets:', JSON.stringify(adsetsData.error));
  process.exit(1);
}

// ── Fetch lifetime spend ───────────────────────────────────────────────
const accountUrl = `https://graph.facebook.com/v21.0/act_2303565156801569?fields=amount_spent&access_token=${TOKEN}`;
const accountRes = await fetch(accountUrl);
const accountData = await accountRes.json();
const totalSpentCents = parseInt(accountData.amount_spent || 0);
const totalSpent = totalSpentCents / 100; // Meta devuelve en centavos

// ── Output ─────────────────────────────────────────────────────────────
const now = new Date();
const art = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const timestamp = art.toISOString().replace('T', ' ').substring(0, 16) + ' ART';

console.log('\n======================================================');
console.log('ENBA Meta Ads — Estado real al', timestamp);
console.log('======================================================\n');

// Ads
console.log('─── ADS FOLLOW PLAN v2 + ENG_REEL ───────────────────\n');
let activeAds = 0;
let discrepancies = [];

for (const [id, alias] of Object.entries(FOLLOW_PLAN_ADS)) {
  const ad = adsData[id];
  if (!ad) { console.log(`  ❌ ${alias} — NO ENCONTRADO`); continue; }
  const isActive = ad.effective_status === 'ACTIVE';
  if (isActive) activeAds++;
  const icon = isActive ? '🟢' : '⚪';
  console.log(`  ${icon} ${alias}`);
  console.log(`     status: ${ad.status} | effective_status: ${ad.effective_status}`);
}

// Ad sets
console.log('\n─── AD SETS + BUDGETS + EXCLUSIONES ────────────────\n');
let realBurnRate = 0;
let exclusionDiscrepancies = [];

for (const [id, label] of Object.entries(FOLLOW_PLAN_ADSETS)) {
  const adset = adsetsData[id];
  if (!adset) { console.log(`  ❌ ${label} — NO ENCONTRADO`); continue; }

  const budget = parseInt(adset.daily_budget || 0) / 100;
  const isActive = adset.effective_status === 'ACTIVE';
  if (isActive) realBurnRate += budget;

  const actualExcl = (adset.targeting?.excluded_custom_audiences || []).map(a => a.id).sort();
  const knownExcl = (KNOWN_EXCLUSIONS[id] || []).sort();
  const exclMatch = JSON.stringify(actualExcl) === JSON.stringify(knownExcl);

  const icon = isActive ? '🟢' : '⚪';
  const exclIcon = exclMatch ? '✅' : '⚠️ ';
  console.log(`  ${icon} ${label}`);
  console.log(`     status: ${adset.status} | effective_status: ${adset.effective_status} | budget: $${budget}/día`);
  console.log(`     exclusiones API: [${actualExcl.join(', ') || 'ninguna'}]`);
  console.log(`     exclusiones JSON: [${knownExcl.join(', ') || 'ninguna'}]`);
  console.log(`     exclusiones: ${exclIcon} ${exclMatch ? 'OK' : 'DISCREPANCIA'}`);

  if (!exclMatch) {
    exclusionDiscrepancies.push(`${label}: API=[${actualExcl}] JSON=[${knownExcl}]`);
  }
}

// Summary
const budgetRemaining = CAMPAIGN_BUDGET_TOTAL - totalSpent;
const daysToEnd = Math.max(0, Math.round((CAMPAIGN_END_DATE - now) / (1000 * 60 * 60 * 24)));
const daysAtBurn = realBurnRate > 0 ? Math.floor(budgetRemaining / realBurnRate) : 999;
const exhaustDate = new Date(now.getTime() + daysAtBurn * 24 * 60 * 60 * 1000);
const exhaustStr = exhaustDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

console.log('\n─── RESUMEN ─────────────────────────────────────────\n');
console.log(`  Ads activos:      ${activeAds} / ${Object.keys(FOLLOW_PLAN_ADS).length}`);
console.log(`  Burn rate real:   $${realBurnRate.toLocaleString()}/día (suma ad sets activos)`);
console.log(`  Spend total cta:  $${totalSpent.toLocaleString()} / $500.000`);
console.log(`  Restante:         $${Math.round(budgetRemaining).toLocaleString()}`);
console.log(`  Días al fin:      ${daysToEnd} (hasta 16/05)`);
console.log(`  Días de budget:   ${daysAtBurn}`);
if (daysAtBurn < daysToEnd) {
  console.log(`  ⚠️  RIESGO: budget se agota el ${exhaustStr}, ${daysToEnd - daysAtBurn} días antes del 16/05`);
} else {
  console.log(`  ✅ Budget alcanza hasta el 16/05`);
}

if (exclusionDiscrepancies.length > 0) {
  console.log('\n─── DISCREPANCIAS vs meta-ids.json ──────────────────\n');
  exclusionDiscrepancies.forEach(d => console.log(`  ⚠️  ${d}`));
} else {
  console.log('\n  ✅ Sin discrepancias de exclusiones vs meta-ids.json');
}

console.log('\n======================================================\n');
