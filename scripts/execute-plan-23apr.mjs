#!/usr/bin/env node
// Plan reconciliado Bruno/Experto — aprobado por Jose el 23/04/2026
//
// PAUSAR:
//   - Follow IG completo: ad sets ig_cold + ig_retarget
//   - reel4h_B1 AWR: ad individual (120239287388330139)
//   - reel4hAlt_A2 AWR: ad individual (120239287392190139)
//   - AS_ENG_C2 regalos: ad set completo
//   - AD_ENG_REEL_PV: ad individual (pausa el reelPV, deja reel4horas vivo)
//
// REDUCIR:
//   - AS_ENG_REEL: $7,250 → $3,000/día (300,000 centavos)
//     reel4horas sigue corriendo, solo con menos presupuesto
//
// ESCALAR:
//   - fb_cold ad set: +30% → $8,400 → $10,920/día (1,092,000 centavos)
//
// Burn estimado post-acciones: ~$17,500/día (target: $16,768)

import { execSync } from 'node:child_process';

const GRAPH = 'https://graph.facebook.com/v21.0';

function getToken() {
  const t = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`, { encoding: 'utf-8' }).trim();
  if (!t) throw new Error('META_ADS_USER_TOKEN no cargado');
  return t;
}

async function metaPost(token, id, fields) {
  const body = new URLSearchParams(fields);
  const res = await fetch(GRAPH + '/' + id, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    const msg = json.error ? json.error.message : 'HTTP ' + res.status;
    throw new Error('POST /' + id + ' failed: ' + msg);
  }
  return json;
}

async function metaGet(token, id, fields) {
  const url = GRAPH + '/' + id + '?fields=' + fields + '&access_token=' + token;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error('GET /' + id + ' failed: ' + (json.error ? json.error.message : res.status));
  return json;
}

async function main() {
  const token = getToken();
  console.log('META_ADS_USER_TOKEN: CARGADO\n');

  const results = [];

  // ── 1. PAUSAR Follow IG — ad set ig_cold ──────────────────────────
  console.log('1) PAUSAR ig_cold ad set (120239303658370139)...');
  try {
    await metaPost(token, '120239303658370139', { status: 'PAUSED' });
    console.log('   ✓ PAUSED');
    results.push({ action: 'PAUSE', id: '120239303658370139', name: 'IG Cold ad set', ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'PAUSE', id: '120239303658370139', name: 'IG Cold ad set', ok: false, error: e.message });
  }

  // ── 2. PAUSAR Follow IG — ad set ig_retarget ─────────────────────
  console.log('2) PAUSAR ig_retarget ad set (120239303659250139)...');
  try {
    await metaPost(token, '120239303659250139', { status: 'PAUSED' });
    console.log('   ✓ PAUSED');
    results.push({ action: 'PAUSE', id: '120239303659250139', name: 'IG Retarget ad set', ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'PAUSE', id: '120239303659250139', name: 'IG Retarget ad set', ok: false, error: e.message });
  }

  // ── 3. PAUSAR reel4h_B1 AWR (ad) ─────────────────────────────────
  console.log('3) PAUSAR AD reel4h_B1 (120239287388330139)...');
  try {
    await metaPost(token, '120239287388330139', { status: 'PAUSED' });
    console.log('   ✓ PAUSED');
    results.push({ action: 'PAUSE', id: '120239287388330139', name: 'ENBA_ad_reel4h_B1', ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'PAUSE', id: '120239287388330139', name: 'ENBA_ad_reel4h_B1', ok: false, error: e.message });
  }

  // ── 4. PAUSAR reel4hAlt_A2 AWR (ad) ──────────────────────────────
  console.log('4) PAUSAR AD reel4hAlt_A2 (120239287392190139)...');
  try {
    await metaPost(token, '120239287392190139', { status: 'PAUSED' });
    console.log('   ✓ PAUSED');
    results.push({ action: 'PAUSE', id: '120239287392190139', name: 'ENBA_ad_reel4hAlt_A2', ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'PAUSE', id: '120239287392190139', name: 'ENBA_ad_reel4hAlt_A2', ok: false, error: e.message });
  }

  // ── 5. PAUSAR AS_ENG_C2 regalos (ad set) ─────────────────────────
  console.log('5) PAUSAR AS_ENG_C2 regalos (120239146114130139)...');
  try {
    await metaPost(token, '120239146114130139', { status: 'PAUSED' });
    console.log('   ✓ PAUSED');
    results.push({ action: 'PAUSE', id: '120239146114130139', name: 'AS_ENG_C2 regalos', ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'PAUSE', id: '120239146114130139', name: 'AS_ENG_C2 regalos', ok: false, error: e.message });
  }

  // ── 6. PAUSAR AD_ENG_REEL_PV (reelPrimeraVez) ────────────────────
  console.log('6) PAUSAR AD reelPV_ENG (120239287424800139)...');
  try {
    await metaPost(token, '120239287424800139', { status: 'PAUSED' });
    console.log('   ✓ PAUSED');
    results.push({ action: 'PAUSE', id: '120239287424800139', name: 'ENBA_ad_reelPV_ENG', ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'PAUSE', id: '120239287424800139', name: 'ENBA_ad_reelPV_ENG', ok: false, error: e.message });
  }

  // ── 7. REDUCIR AS_ENG_REEL: $7,250 → $3,000/día ──────────────────
  console.log('7) REDUCIR AS_ENG_REEL budget $7,250 → $3,000/día (120239078452300139)...');
  try {
    // Verificar budget actual antes de cambiar
    const current = await metaGet(token, '120239078452300139', 'name,daily_budget,status');
    console.log('   Budget actual:', current.daily_budget, 'centavos ($' + Math.round(current.daily_budget/100) + ' ARS/día)');
    await metaPost(token, '120239078452300139', { daily_budget: '300000' });
    console.log('   ✓ REDUCIDO a 300,000 centavos ($3,000 ARS/día)');
    results.push({ action: 'REDUCE', id: '120239078452300139', name: 'AS_ENG_REEL', from: current.daily_budget, to: 300000, ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'REDUCE', id: '120239078452300139', name: 'AS_ENG_REEL', ok: false, error: e.message });
  }

  // ── 8. ESCALAR fb_cold +30%: $8,400 → $10,920/día ────────────────
  console.log('8) ESCALAR fb_cold +30%: $8,400 → $10,920/día (120239303659650139)...');
  try {
    const current = await metaGet(token, '120239303659650139', 'name,daily_budget,status');
    console.log('   Budget actual:', current.daily_budget, 'centavos ($' + Math.round(current.daily_budget/100) + ' ARS/día)');
    await metaPost(token, '120239303659650139', { daily_budget: '1092000' });
    console.log('   ✓ ESCALADO a 1,092,000 centavos ($10,920 ARS/día)');
    results.push({ action: 'SCALE', id: '120239303659650139', name: 'fb_cold', from: current.daily_budget, to: 1092000, ok: true });
  } catch(e) {
    console.error('   ✗ ERROR:', e.message);
    results.push({ action: 'SCALE', id: '120239303659650139', name: 'fb_cold', ok: false, error: e.message });
  }

  // ── Resumen ───────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('RESUMEN DE EJECUCIÓN');
  console.log('═══════════════════════════════════════');
  const ok  = results.filter(function(r) { return r.ok; });
  const err = results.filter(function(r) { return !r.ok; });
  ok.forEach(function(r) {
    console.log('✓', r.action, '|', r.name);
  });
  if (err.length > 0) {
    console.log('\n⚠ ERRORES:');
    err.forEach(function(r) {
      console.log('✗', r.action, '|', r.name, '→', r.error);
    });
  }
  console.log('\nOK:', ok.length + '/' + results.length);
  console.log('Burn estimado post-acciones: ~$17,500/día');
  console.log('Target: $16,768/día — dentro de rango');
  console.log('\nPróximo paso: convocar /marina para auditoría de perfil IG');
  console.log('DONE');
}

main().catch(function(e) {
  console.error('\nEJECUCIÓN FAILED:', e.message);
  process.exit(1);
});
