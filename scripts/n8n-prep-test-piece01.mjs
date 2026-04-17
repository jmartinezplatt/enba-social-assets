#!/usr/bin/env node
// Paso 1 — Preparación de test real con piece-01
// Hace:
//   1. Backup pre-test del workflow
//   2. Override Find Today Piece para devolver piece-01 (fecha 15/04/2026)
//   3. Cambia variable n8n dryRun a "false"
//   4. Escribe backup del jsCode original a disco para restore inmediato
//
// IMPORTANTE: NO toca active, sigue en false. Para el test real se usa botón Execute manual.
// Restore: n8n-restore-post-test-piece01.mjs

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const WF_ID = 'oiFVJdy5VGlXtlMp';
const BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1';

function getApiKey() {
  const out = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`).toString().trim();
  if (!out) throw new Error('N8N_API_KEY no cargada');
  return out;
}

async function fetchWorkflow(apiKey) {
  const res = await fetch(`${BASE_URL}/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': apiKey }
  });
  if (!res.ok) throw new Error(`GET workflow failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function putWorkflow(apiKey, wf) {
  const allowed = ['saveExecutionProgress', 'saveManualExecutions', 'saveDataErrorExecution',
    'saveDataSuccessExecution', 'executionTimeout', 'errorWorkflow', 'timezone', 'executionOrder'];
  const settings = {};
  for (const k of allowed) if (k in (wf.settings || {})) settings[k] = wf.settings[k];
  if (!('executionOrder' in settings)) settings.executionOrder = 'v1';
  const body = { name: wf.name, nodes: wf.nodes, connections: wf.connections, settings };
  const res = await fetch(`${BASE_URL}/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT workflow failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function listVariables(apiKey) {
  const res = await fetch(`${BASE_URL}/variables`, { headers: { 'X-N8N-API-KEY': apiKey } });
  if (!res.ok) throw new Error(`GET variables failed: ${res.status}`);
  return res.json();
}

async function updateVariable(apiKey, id, key, value) {
  const res = await fetch(`${BASE_URL}/variables/${id}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ key, value })
  });
  if (!res.ok) throw new Error(`PUT variable failed: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json().catch(() => null);
}

const OVERRIDE_CODE = `// ═══ OVERRIDE TEMPORAL PARA TEST REAL — piece-01 ═══
// Restauración: n8n-restore-post-test-piece01.mjs
const calendar = $input.first().json;
const todayStr = '15/04/2026';
const todayEntries = calendar.calendario.filter(e => e.fecha === todayStr && e.tipo === 'pieza');

if (todayEntries.length === 0) {
  return [{ json: { skip: true, message: 'No hay piezas para hoy (' + todayStr + ')', date: todayStr } }];
}

const entry = todayEntries[0];
return [{ json: { skip: false, date: todayStr, ...entry } }];
`;

async function main() {
  const apiKey = getApiKey();
  console.log('N8N_API_KEY: CARGADA');

  // ─── Paso 1: Backup pre-test ─────────────────────────────────────────────
  console.log('\n1) Backup pre-test del workflow');
  const wf = await fetchWorkflow(apiKey);
  console.log(`   nodes=${wf.nodes.length} active=${wf.active} updatedAt=${wf.updatedAt}`);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `n8n-backup-pretest-piece01-${ts}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(wf, null, 2));
  console.log(`   backup: ${backupPath}`);

  if (wf.active) {
    throw new Error('ABORT: workflow está active=true. No debería estarlo. Abort por seguridad.');
  }

  // ─── Paso 2: Guardar jsCode original de Find Today Piece ──────────────────
  const ftp = wf.nodes.find(n => n.name === 'Find Today Piece');
  if (!ftp) throw new Error('Nodo Find Today Piece no encontrado');
  const originalCode = ftp.parameters.jsCode;
  const originalPath = `n8n-find-today-piece-original-${ts}.txt`;
  fs.writeFileSync(originalPath, originalCode);
  console.log(`\n2) Original jsCode salvado: ${originalPath} (${originalCode.length} chars)`);

  // ─── Paso 3: Override ─────────────────────────────────────────────────────
  console.log('\n3) Aplicando override Find Today Piece → piece-01 (15/04/2026)');
  ftp.parameters.jsCode = OVERRIDE_CODE;
  const result = await putWorkflow(apiKey, wf);
  console.log(`   PUT OK. nodes=${result.nodes.length} active=${result.active} updatedAt=${result.updatedAt}`);

  // Verify
  const verifyFtp = result.nodes.find(n => n.name === 'Find Today Piece');
  if (!verifyFtp.parameters.jsCode.includes("'15/04/2026'")) {
    throw new Error('Override NO se aplicó correctamente — abort');
  }
  console.log(`   override confirmado (contiene '15/04/2026': true)`);

  // ─── Paso 4: Cambiar variable dryRun a "false" ────────────────────────────
  console.log('\n4) Cambiando variable dryRun → "false"');
  const vars = await listVariables(apiKey);
  const dryRunVar = (vars.data || []).find(v => v.key === 'dryRun');
  if (!dryRunVar) throw new Error('Variable dryRun no encontrada');
  console.log(`   var id: ${dryRunVar.id} | valor actual: ${JSON.stringify(dryRunVar.value)}`);
  await updateVariable(apiKey, dryRunVar.id, 'dryRun', 'false');

  // Re-verify
  const vars2 = await listVariables(apiKey);
  const dryRunAfter = (vars2.data || []).find(v => v.key === 'dryRun');
  console.log(`   valor nuevo: ${JSON.stringify(dryRunAfter.value)}`);
  if (dryRunAfter.value !== 'false') throw new Error('dryRun NO quedó en "false"');

  // ─── Resumen ──────────────────────────────────────────────────────────────
  console.log('\n═════════════════════════════════════════════');
  console.log('LISTO para Execute Workflow desde la UI');
  console.log('═════════════════════════════════════════════');
  console.log(`  workflow active:    ${result.active} (sin cambios)`);
  console.log(`  dryRun:             "false"`);
  console.log(`  Find Today Piece:   override → piece-01 / 15-04-2026`);
  console.log(`  backup pre-test:    ${backupPath}`);
  console.log(`  original jsCode:    ${originalPath}`);
  console.log('');
  console.log('Siguiente paso: hacer click en "Execute Workflow" desde la UI de n8n.');
  console.log('Restaurar inmediato post-test con: node scripts/n8n-restore-post-test-piece01.mjs');
}

main().catch(e => { console.error('\nPREP FAILED:', e.message); process.exit(1); });
