#!/usr/bin/env node
// Patch quirúrgico: ENBA Ads Evaluation Workflow → v4
// Actualiza el workflow vivo (ID: 1qRywsEWAl7VoO5o) con:
//   1. Nodos Get FB Followers + Get IG Followers (si no existen) — idempotente
//   2. Conexiones: Get Ad Insights → Get FB Followers → Get IG Followers → Evaluate Ads
//   3. URL del nodo HTTP insights: nuevos fields
//   4. jsCode del nodo Evaluate Ads: v4
// Luego deactiva y reactiva para reload del scheduler.

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE_URL       = 'https://espacionautico.app.n8n.cloud/api/v1';
const WF_ID          = '1qRywsEWAl7VoO5o';
const AD_ACCOUNT     = 'act_2303565156801569';
const FB_PAGE_ID     = '1064806400040502';
const IG_USER_ID     = '17841443139761422';
const META_CRED_ID   = '6LxWcVxeyZgsBTUU'; // Meta Ads API ENBA (System User Token)
const META_CRED_NAME = 'Meta Ads API ENBA';

const NEW_INSIGHTS_URL = 'https://graph.facebook.com/v21.0/' + AD_ACCOUNT
  + '/insights?level=ad'
  + '&fields=ad_id,ad_name,campaign_id,created_time,impressions,reach,clicks,spend,actions,ctr,frequency,video_thruplay_watched_actions,instagram_profile_visits,quality_ranking,engagement_rate_ranking,conversion_rate_ranking'
  + '&date_preset=maximum&limit=50';

const FB_FOLLOWERS_URL = 'https://graph.facebook.com/v21.0/' + FB_PAGE_ID
  + '?fields=fan_count,followers_count';

const IG_FOLLOWERS_URL = 'https://graph.facebook.com/v21.0/' + IG_USER_ID
  + '?fields=followers_count';

function getApiKey() {
  const out = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`, { encoding: 'utf-8' }).trim();
  if (!out) throw new Error('N8N_API_KEY no cargada');
  return out;
}

function loadEvaluateCode() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const codePath  = path.join(__dirname, '..', 'automatizaciones', 'n8n-workflows', 'nodes', 'evaluate-ads.js');
  return fs.readFileSync(codePath, 'utf-8');
}

async function apiFetch(apiKey, endpoint, method, body) {
  const opts = {
    method: method || 'GET',
    headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json; charset=utf-8' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + endpoint, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(method + ' ' + endpoint + ' failed: ' + res.status + ' ' + txt);
  }
  return res.json();
}

function makeFollowerNode(id, name, url, x, y) {
  return {
    parameters: {
      method: 'GET',
      url: url,
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      options: {}
    },
    id: id,
    name: name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [x, y],
    continueOnFail: true,  // si falla no rompe la cadena — el email igual llega
    credentials: {
      httpHeaderAuth: { id: META_CRED_ID, name: META_CRED_NAME }
    }
  };
}

async function main() {
  const apiKey = getApiKey();
  console.log('N8N_API_KEY: CARGADA');

  // 1. GET fresco
  console.log('\n1) GET workflow ' + WF_ID + '...');
  const wf = await apiFetch(apiKey, '/workflows/' + WF_ID);
  console.log('   Nodos actuales: ' + wf.nodes.length);
  console.log('   Estado actual: ' + (wf.active ? 'ACTIVO' : 'INACTIVO'));
  wf.nodes.forEach(function(n) { console.log('     -', n.name, '|', n.id); });

  // 2. Cargar código v4
  console.log('\n2) Cargando evaluate-ads.js v4...');
  const newCode = loadEvaluateCode();
  console.log('   Lineas: ' + newCode.split('\n').length);

  // 3. Backup
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'n8n-backup-ads-eval-' + ts + '.json');
  fs.writeFileSync(backupFile, JSON.stringify(wf, null, 2));
  console.log('\n3) Backup: ' + path.basename(backupFile));

  // 4. Determinar posición de nodos existentes para insertar los nuevos
  const insightsNode = wf.nodes.find(function(n) { return n.name === 'Get Ad Insights'; });
  const evaluateNode = wf.nodes.find(function(n) { return n.name === 'Evaluate Ads'; });
  if (!insightsNode) throw new Error('Nodo "Get Ad Insights" no encontrado');
  if (!evaluateNode) throw new Error('Nodo "Evaluate Ads" no encontrado');

  const insX = insightsNode.position[0];
  const insY = insightsNode.position[1];

  // 5. Agregar nodos de followers si no existen (idempotente)
  console.log('\n4) Verificando nodos de followers...');
  const hasFB = wf.nodes.some(function(n) { return n.name === 'Get FB Followers'; });
  const hasIG = wf.nodes.some(function(n) { return n.name === 'Get IG Followers'; });

  if (!hasFB) {
    wf.nodes.push(makeFollowerNode('node-get-fb-followers', 'Get FB Followers', FB_FOLLOWERS_URL, insX + 220, insY));
    console.log('   ✓ Nodo "Get FB Followers" agregado');
  } else {
    console.log('   ≡ "Get FB Followers" ya existe');
    // Actualizar URL por si cambió
    wf.nodes = wf.nodes.map(function(n) {
      if (n.name === 'Get FB Followers') { n.parameters.url = FB_FOLLOWERS_URL; }
      return n;
    });
  }

  if (!hasIG) {
    wf.nodes.push(makeFollowerNode('node-get-ig-followers', 'Get IG Followers', IG_FOLLOWERS_URL, insX + 440, insY));
    console.log('   ✓ Nodo "Get IG Followers" agregado');
  } else {
    console.log('   ≡ "Get IG Followers" ya existe');
    wf.nodes = wf.nodes.map(function(n) {
      if (n.name === 'Get IG Followers') { n.parameters.url = IG_FOLLOWERS_URL; }
      return n;
    });
  }

  // 6. Cambios quirúrgicos en nodos existentes
  console.log('\n5) Aplicando cambios quirúrgicos...');
  let httpUpdated = false;
  let codeUpdated = false;

  wf.nodes = wf.nodes.map(function(node) {
    if (node.type === 'n8n-nodes-base.httpRequest' && node.name === 'Get Ad Insights') {
      node.parameters.url = NEW_INSIGHTS_URL;
      httpUpdated = true;
      console.log('   ✓ HTTP "Get Ad Insights": URL actualizada');
    }
    if (node.type === 'n8n-nodes-base.code' && node.name === 'Evaluate Ads') {
      node.parameters.jsCode = newCode;
      codeUpdated = true;
      console.log('   ✓ Code "Evaluate Ads": jsCode v4 cargado');
    }
    return node;
  });

  if (!httpUpdated) throw new Error('Nodo "Get Ad Insights" no encontrado para actualizar URL');
  if (!codeUpdated) throw new Error('Nodo "Evaluate Ads" no encontrado para actualizar jsCode');

  // 7. Actualizar conexiones
  // Cadena nueva: Schedule → Get Ad Insights → Get FB Followers → Get IG Followers → Evaluate Ads → Send Report Email
  console.log('\n6) Actualizando conexiones...');
  const newConnections = {};
  Object.keys(wf.connections).forEach(function(key) {
    // Copiar todo excepto Get Ad Insights (lo redefinimos abajo)
    if (key !== 'Get Ad Insights') {
      newConnections[key] = wf.connections[key];
    }
  });
  // Get Ad Insights → Get FB Followers
  newConnections['Get Ad Insights'] = { main: [[{ node: 'Get FB Followers', type: 'main', index: 0 }]] };
  // Get FB Followers → Get IG Followers
  newConnections['Get FB Followers'] = { main: [[{ node: 'Get IG Followers', type: 'main', index: 0 }]] };
  // Get IG Followers → Evaluate Ads
  newConnections['Get IG Followers'] = { main: [[{ node: 'Evaluate Ads', type: 'main', index: 0 }]] };
  wf.connections = newConnections;
  console.log('   ✓ Cadena: Get Ad Insights → Get FB Followers → Get IG Followers → Evaluate Ads');
  console.log('   ✓ Conexiones totales:', Object.keys(wf.connections).join(' | '));

  // 8. PUT — solo campos permitidos por n8n API
  console.log('\n7) PUT workflow...');
  const cleanSettings = {
    executionOrder: wf.settings.executionOrder || 'v1',
    timezone:       wf.settings.timezone       || 'America/Argentina/Buenos_Aires'
  };
  const putBody = {
    name:        wf.name,
    nodes:       wf.nodes,
    connections: wf.connections,
    settings:    cleanSettings
  };
  await apiFetch(apiKey, '/workflows/' + WF_ID, 'PUT', putBody);
  console.log('   ✓ Workflow actualizado en n8n (' + wf.nodes.length + ' nodos)');

  // 9. Deactivate → Activate (reload cron scheduler)
  console.log('\n8) Reload cron: deactivate → activate...');
  await apiFetch(apiKey, '/workflows/' + WF_ID + '/deactivate', 'POST');
  console.log('   active: false');
  await apiFetch(apiKey, '/workflows/' + WF_ID + '/activate', 'POST');
  console.log('   active: true');

  console.log('\n=== PATCH v4 COMPLETADO ===');
  console.log('Workflow ID: ' + WF_ID);
  console.log('Nodos totales: ' + wf.nodes.length);
  console.log('Cadena: Schedule → Get Ad Insights → Get FB Followers → Get IG Followers → Evaluate Ads → Send Email');
  console.log('Nuevas métricas: follower counts reales, follow rate IG, burn rate, segmento Cold/Retarget, D4 context');
  console.log('Próximo disparo automático: mañana 9:00 ART');
  console.log('\nDONE');
}

main().catch(function(e) { console.error('\nPATCH FAILED:', e.message); process.exit(1); });
