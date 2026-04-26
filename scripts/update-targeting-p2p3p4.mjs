#!/usr/bin/env node
// P2: Remove Gastronomía (6003415019460) from B1 and ENG_REEL
// P3: Verify/fix geo to 18-city list
// P4: Verify/fix age_min=18, age_max=65
// Fetches live targeting, patches only what needs changing

import { execSync } from 'child_process';

const AD_ACCOUNT = 'act_2303565156801569';
const GASTRONOMY_ID = '6003415019460';
const BAD_INTEREST_IDS = new Set([
  '6003415019460', // Gastronomía
  '6003074033139', // Caminatas
  '6003252804967', // Excursionismo
  '6003403012818', // Camping
]);

const GEO_18_CITIES = {
  cities: [
    { key: '1392243', name: 'Buenos Aires' },
    { key: '1392247', name: 'Córdoba' },
    { key: '1392244', name: 'Rosario' },
    { key: '1392249', name: 'Mendoza' },
    { key: '1392250', name: 'San Miguel de Tucumán' },
    { key: '1392251', name: 'La Plata' },
    { key: '1392252', name: 'Mar del Plata' },
    { key: '1392253', name: 'Salta' },
    { key: '1392254', name: 'Santa Fe' },
    { key: '1392255', name: 'San Juan' },
    { key: '1392256', name: 'Resistencia' },
    { key: '1392257', name: 'Santiago del Estero' },
    { key: '1392258', name: 'Corrientes' },
    { key: '1392259', name: 'Posadas' },
    { key: '1392260', name: 'Neuquén' },
    { key: '1392261', name: 'Bahía Blanca' },
    { key: '1392262', name: 'Paraná' },
    { key: '1392263', name: 'Formosa' },
  ]
};

// Ad sets to process (non-deprecated, active)
const ADSETS = [
  { key: 'AS_AWR_B1',  id: '120238978173190139', name: 'B1_ExperienciasBA',       checkInterests: true },
  { key: 'AS_AWR_A2',  id: '120238978174670139', name: 'A2_InteresNavegacion',    checkInterests: true },
  { key: 'AS_AWR_C1',  id: '120238978175200139', name: 'C1_TurismoBA',            checkInterests: true },
  { key: 'AS_AWR_B2',  id: '120238978175860139', name: 'B2_OutdoorAventura',      checkInterests: true },
  { key: 'AS_AWR_A3',  id: '120238978176270139', name: 'A3_AspiracionalNautico',  checkInterests: true },
  { key: 'AS_ENG_C2',  id: '120239146114130139', name: 'C2_RegalosExperienciales',checkInterests: true },
  { key: 'AS_ENG_REEL',id: '120239078452300139', name: 'Engagement_Reel4horas',   checkInterests: true },
  { key: 'AS_ENG_TOP', id: '120239146126860139', name: 'Engagement_TopPerformers',checkInterests: true },
  { key: 'AS_LEA_C3',  id: '120238978180620139', name: 'Leads_C3_Corporativo',    checkInterests: true },
  // Follow plan ad sets
  { key: 'FP_IG_COLD',    id: '120239303658370139', name: 'Follow_IG_Cold',    checkInterests: true },
  { key: 'FP_IG_RETARGET',id: '120239303659250139', name: 'Follow_IG_Retarget',checkInterests: true },
  { key: 'FP_FB_COLD',    id: '120239303659650139', name: 'Follow_FB_Cold',    checkInterests: true },
  { key: 'FP_FB_RETARGET',id: '120239303660260139', name: 'Follow_FB_Retarget',checkInterests: true },
];

function getToken() {
  return execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN', 'User')"`, { encoding: 'utf8' }).trim();
}

async function apiGet(token, path) {
  const url = `https://graph.facebook.com/v22.0/${path}&access_token=${token}`;
  const res = await fetch(url);
  return res.json();
}

async function apiPost(token, adsetId, targeting) {
  const url = `https://graph.facebook.com/v22.0/${adsetId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targeting, access_token: token }),
  });
  return res.json();
}

function extractInterests(targeting) {
  // interests can be in flexible_spec[0].interests or flexible_spec[].interests
  const interests = [];
  if (targeting.flexible_spec) {
    for (const spec of targeting.flexible_spec) {
      if (spec.interests) interests.push(...spec.interests);
    }
  }
  return interests;
}

function hasBadInterest(targeting) {
  const interests = extractInterests(targeting);
  return interests.some(i => BAD_INTEREST_IDS.has(String(i.id)));
}

function removeBadInterests(targeting) {
  if (!targeting.flexible_spec) return targeting;
  const cleaned = { ...targeting };
  cleaned.flexible_spec = targeting.flexible_spec.map(spec => {
    if (!spec.interests) return spec;
    return {
      ...spec,
      interests: spec.interests.filter(i => !BAD_INTEREST_IDS.has(String(i.id))),
    };
  }).filter(spec => {
    // Remove empty specs (interests was the only key and now it's empty)
    if (spec.interests && spec.interests.length === 0) {
      const otherKeys = Object.keys(spec).filter(k => k !== 'interests');
      return otherKeys.length > 0;
    }
    return true;
  });
  return cleaned;
}

function hasCorrectAge(targeting) {
  return targeting.age_min === 18 && targeting.age_max === 65;
}

function hasCorrectGeo(targeting) {
  const geo = targeting.geo_locations;
  if (!geo) return false;
  // Check if it's city-based (not country-based or radius-based)
  if (geo.countries && !geo.cities) return false;
  if (geo.custom_locations) return false; // radius-based = old format
  if (geo.cities && geo.cities.length >= 10) return true;
  return false;
}

async function run() {
  const token = getToken();
  if (!token) { console.error('META_ADS_USER_TOKEN no encontrado'); process.exit(1); }
  console.log('META_ADS_USER_TOKEN: CARGADO\n');

  const results = { patched: [], clean: [], errors: [] };

  for (const adset of ADSETS) {
    process.stdout.write(`Fetching ${adset.key} (${adset.id})... `);
    const data = await apiGet(token, `${adset.id}?fields=name,status,targeting`);

    if (data.error) {
      console.log(`ERROR: ${data.error.message}`);
      results.errors.push({ adset: adset.key, error: data.error.message });
      continue;
    }

    const targeting = data.targeting || {};
    const interests = extractInterests(targeting);
    const badInterests = interests.filter(i => BAD_INTEREST_IDS.has(String(i.id)));
    const needsInterestFix = badInterests.length > 0;
    const needsAgeFix = !hasCorrectAge(targeting);
    const needsGeoFix = !hasCorrectGeo(targeting);

    console.log(`status=${data.status}`);
    console.log(`  age: ${targeting.age_min}-${targeting.age_max} | geo: ${hasCorrectGeo(targeting) ? 'OK (cities)' : 'NEEDS FIX'} | interests: ${interests.length} total, ${badInterests.length} bad`);

    if (badInterests.length > 0) {
      console.log(`  BAD interests found: ${badInterests.map(i => i.name).join(', ')}`);
    }

    if (!needsInterestFix && !needsAgeFix && !needsGeoFix) {
      console.log(`  → CLEAN — no changes needed\n`);
      results.clean.push(adset.key);
      continue;
    }

    // Build updated targeting
    let updatedTargeting = { ...targeting };

    if (needsInterestFix) {
      updatedTargeting = removeBadInterests(updatedTargeting);
    }

    if (needsAgeFix) {
      updatedTargeting.age_min = 18;
      updatedTargeting.age_max = 65;
      console.log(`  → Fixing age to 18-65`);
    }

    // Note: not fixing geo automatically — city keys need to be verified first
    // Reporting geo issues for manual review
    if (needsGeoFix) {
      console.log(`  ⚠ GEO needs fix (not auto-patched — verify city keys first)`);
    }

    if (needsInterestFix || needsAgeFix) {
      console.log(`  → PATCHing...`);
      const patchRes = await apiPost(token, adset.id, updatedTargeting);
      if (patchRes.success || patchRes.id) {
        console.log(`  ✓ PATCHED OK\n`);
        results.patched.push({
          adset: adset.key,
          removed: badInterests.map(i => i.name),
          ageFix: needsAgeFix,
        });
      } else {
        console.log(`  ✗ PATCH FAILED: ${JSON.stringify(patchRes).substring(0, 300)}\n`);
        results.errors.push({ adset: adset.key, error: JSON.stringify(patchRes) });
      }
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log('RESUMEN P2/P3/P4');
  console.log('══════════════════════════════════════');
  console.log(`Patched (${results.patched.length}):`, results.patched.map(r =>
    `${r.adset} [removed: ${r.removed.join(', ') || 'none'}${r.ageFix ? ' + age fixed' : ''}]`
  ).join('\n  '));
  console.log(`Clean (${results.clean.length}):`, results.clean.join(', '));
  if (results.errors.length > 0) {
    console.log(`Errors (${results.errors.length}):`, results.errors);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
