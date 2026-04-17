#!/usr/bin/env node
// Prep test real piece-02 (fecha 16/04/2026)
// Mismo patrón que n8n-prep-test-piece01.mjs pero con fecha distinta.

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const WF_ID = 'oiFVJdy5VGlXtlMp';
const BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1';

function getApiKey() {
  return execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`).toString().trim();
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
  await fetch(`${BASE_URL}/variables/${id}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ key, value })
  });
}

const OVERRIDE_CODE = `// ═══ OVERRIDE TEMPORAL PARA TEST REAL — piece-02 ═══
const calendar = $input.first().json;
const todayStr = '16/04/2026';
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

  const wf = await fetchWorkflow(apiKey);
  console.log(`\n1) Backup pre-test: nodes=${wf.nodes.length} active=${wf.active}`);
  if (wf.active) throw new Error('ABORT: workflow active=true');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(`n8n-backup-pretest-piece02-${ts}.json`, JSON.stringify(wf, null, 2));

  const ftp = wf.nodes.find(n => n.name === 'Find Today Piece');
  fs.writeFileSync(`n8n-find-today-piece-original-${ts}.txt`, ftp.parameters.jsCode);
  console.log(`2) Original jsCode saved (${ftp.parameters.jsCode.length} chars)`);

  ftp.parameters.jsCode = OVERRIDE_CODE;
  const result = await putWorkflow(apiKey, wf);
  console.log(`3) Override aplicado. updatedAt=${result.updatedAt}`);

  const vars = await listVariables(apiKey);
  const dv = (vars.data || []).find(v => v.key === 'dryRun');
  await updateVariable(apiKey, dv.id, 'dryRun', 'false');
  const vars2 = await listVariables(apiKey);
  const dv2 = (vars2.data || []).find(v => v.key === 'dryRun');
  console.log(`4) dryRun = ${JSON.stringify(dv2.value)}`);

  console.log('\n═══════════════════════════════════════');
  console.log('LISTO — Execute Workflow desde la UI');
  console.log('  Find Today Piece: override → piece-02 / 16-04-2026');
  console.log('  dryRun: false');
  console.log('  active: false');
  console.log('═══════════════════════════════════════');
}

main().catch(e => { console.error('PREP FAILED:', e.message); process.exit(1); });
