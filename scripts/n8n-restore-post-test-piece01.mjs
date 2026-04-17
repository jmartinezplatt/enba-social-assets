#!/usr/bin/env node
// Paso 5 — Restauración post-test piece-01
// Hace:
//   1. Restaura jsCode original de Find Today Piece (desde el archivo salvado por prep)
//   2. Cambia variable n8n dryRun a "true"
//   3. Backup post-test
// NO toca active (sigue false).
// Busca el último archivo n8n-find-today-piece-original-*.txt por mtime.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const WF_ID = 'oiFVJdy5VGlXtlMp';
const BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1';

function getApiKey() {
  const out = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`).toString().trim();
  if (!out) throw new Error('N8N_API_KEY no cargada');
  return out;
}

async function fetchWorkflow(apiKey) {
  const res = await fetch(`${BASE_URL}/workflows/${WF_ID}`, { headers: { 'X-N8N-API-KEY': apiKey } });
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
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
  if (!res.ok) throw new Error(`PUT failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function listVariables(apiKey) {
  const res = await fetch(`${BASE_URL}/variables`, { headers: { 'X-N8N-API-KEY': apiKey } });
  if (!res.ok) throw new Error(`GET vars failed: ${res.status}`);
  return res.json();
}

async function updateVariable(apiKey, id, key, value) {
  const res = await fetch(`${BASE_URL}/variables/${id}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ key, value })
  });
  if (!res.ok) throw new Error(`PUT var failed: ${res.status} ${await res.text()}`);
}

function findLatestOriginal() {
  const files = fs.readdirSync('.').filter(f => f.startsWith('n8n-find-today-piece-original-') && f.endsWith('.txt'));
  if (files.length === 0) throw new Error('No encontré n8n-find-today-piece-original-*.txt');
  files.sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime);
  return files[0];
}

async function main() {
  const apiKey = getApiKey();
  console.log('N8N_API_KEY: CARGADA');

  // ─── 1. Leer original jsCode ─────────────────────────────────────────────
  const origFile = findLatestOriginal();
  const originalCode = fs.readFileSync(origFile, 'utf8');
  console.log(`\n1) Original jsCode desde: ${origFile} (${originalCode.length} chars)`);

  // ─── 2. Fetch workflow actual ────────────────────────────────────────────
  console.log('\n2) GET workflow actual');
  const wf = await fetchWorkflow(apiKey);
  console.log(`   nodes=${wf.nodes.length} active=${wf.active} updatedAt=${wf.updatedAt}`);

  // ─── 3. Restaurar jsCode ─────────────────────────────────────────────────
  const ftp = wf.nodes.find(n => n.name === 'Find Today Piece');
  if (!ftp) throw new Error('Find Today Piece no encontrado');
  const isOverride = ftp.parameters.jsCode.includes('OVERRIDE') || ftp.parameters.jsCode.includes("'15/04/2026'");
  console.log(`   Find Today Piece actualmente tiene override: ${isOverride}`);
  ftp.parameters.jsCode = originalCode;

  console.log('\n4) PUT workflow restaurado');
  const result = await putWorkflow(apiKey, wf);
  console.log(`   OK. updatedAt=${result.updatedAt}`);

  const verifyFtp = result.nodes.find(n => n.name === 'Find Today Piece');
  const hasOverrideAfter = verifyFtp.parameters.jsCode.includes('OVERRIDE') || verifyFtp.parameters.jsCode.includes("'15/04/2026'");
  if (hasOverrideAfter) throw new Error('Restore falló: aún tiene override');
  console.log(`   override removido ✓`);

  // ─── 5. Cambiar dryRun a "true" ──────────────────────────────────────────
  console.log('\n5) dryRun → "true"');
  const vars = await listVariables(apiKey);
  const dryRunVar = (vars.data || []).find(v => v.key === 'dryRun');
  if (!dryRunVar) throw new Error('Variable dryRun no encontrada');
  console.log(`   valor actual: ${JSON.stringify(dryRunVar.value)}`);
  await updateVariable(apiKey, dryRunVar.id, 'dryRun', 'true');

  const vars2 = await listVariables(apiKey);
  const dryAfter = (vars2.data || []).find(v => v.key === 'dryRun');
  console.log(`   valor nuevo: ${JSON.stringify(dryAfter.value)}`);
  if (dryAfter.value !== 'true') throw new Error('dryRun NO quedó en "true"');

  // ─── 6. Backup post-test ─────────────────────────────────────────────────
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `n8n-backup-posttest-piece01-${ts}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(result, null, 2));
  console.log(`\n6) Backup post-test: ${backupPath}`);

  console.log('\n═════════════════════════════════════════════');
  console.log('RESTORE COMPLETO');
  console.log('═════════════════════════════════════════════');
  console.log(`  active:             ${result.active} (sin cambios)`);
  console.log(`  dryRun:             "true"`);
  console.log(`  Find Today Piece:   original restaurado`);
}

main().catch(e => { console.error('\nRESTORE FAILED:', e.message); process.exit(1); });
