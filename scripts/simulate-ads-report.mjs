#!/usr/bin/env node
// Simulacro del reporte diario de ads — disparo único inmediato
// Crea un workflow temporario en n8n con Webhook trigger (igual que el productivo
// pero con webhook en vez de schedule), lo dispara, y lo elimina.
// El email llega exactamente igual que si fueran las 9:00 ART de mañana.

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE_URL            = 'https://espacionautico.app.n8n.cloud/api/v1';
const WEBHOOK_BASE        = 'https://espacionautico.app.n8n.cloud/webhook';
const AD_ACCOUNT          = 'act_2303565156801569';
const META_ADS_CRED_ID    = '6LxWcVxeyZgsBTUU';
const GMAIL_CRED_ID       = 'HpJBfNd1BCHaLYfY';
const EMAIL               = 'jmartinezplatt@gmail.com';
const WEBHOOK_PATH        = 'enba-ads-simulate-' + Date.now();

const INSIGHTS_URL = 'https://graph.facebook.com/v21.0/' + AD_ACCOUNT
  + '/insights?level=ad'
  + '&fields=ad_id,ad_name,campaign_id,created_time,impressions,reach,clicks,spend,actions,ctr,frequency,video_thruplay_watched_actions,instagram_profile_visits,quality_ranking,engagement_rate_ranking,conversion_rate_ranking'
  + '&date_preset=maximum&limit=50';

const FB_FOLLOWERS_URL = 'https://graph.facebook.com/v21.0/1064806400040502?fields=fan_count,followers_count';
const IG_FOLLOWERS_URL = 'https://graph.facebook.com/v21.0/17841443139761422?fields=followers_count';

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
    throw new Error((method || 'GET') + ' ' + endpoint + ' → ' + res.status + ': ' + txt);
  }
  // DELETE devuelve 204 sin body
  if (res.status === 204) return {};
  return res.json();
}

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function main() {
  const apiKey = getApiKey();
  console.log('N8N_API_KEY: CARGADA');

  const evaluateCode = loadEvaluateCode();
  console.log('evaluate-ads.js v2: CARGADO (' + evaluateCode.split('\n').length + ' lineas)');

  // 1. Construir workflow temporario con Webhook trigger
  console.log('\n1) Construyendo workflow temporario...');
  const wf = {
    name: 'ENBA - Ads Simulate [temp]',
    nodes: [
      // Webhook trigger
      {
        parameters: {
          httpMethod: 'POST',
          path: WEBHOOK_PATH,
          responseMode: 'onReceived',
          options: {}
        },
        id: 'node-webhook-sim',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1.1,
        position: [200, 300],
        webhookId: WEBHOOK_PATH
      },
      // HTTP Request — Meta Insights
      {
        parameters: {
          method: 'GET',
          url: INSIGHTS_URL,
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {}
        },
        id: 'node-get-insights',
        name: 'Get Ad Insights',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [420, 300],
        credentials: {
          httpHeaderAuth: { id: META_ADS_CRED_ID, name: 'Meta Ads API ENBA' }
        }
      },
      // HTTP Request — FB Page follower count
      {
        parameters: {
          method: 'GET',
          url: FB_FOLLOWERS_URL,
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {}
        },
        id: 'node-get-fb-followers',
        name: 'Get FB Followers',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [640, 300],
        continueOnFail: true,
        credentials: {
          httpHeaderAuth: { id: META_ADS_CRED_ID, name: 'Meta Ads API ENBA' }
        }
      },
      // HTTP Request — IG followers count
      {
        parameters: {
          method: 'GET',
          url: IG_FOLLOWERS_URL,
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {}
        },
        id: 'node-get-ig-followers',
        name: 'Get IG Followers',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [860, 300],
        continueOnFail: true,
        credentials: {
          httpHeaderAuth: { id: META_ADS_CRED_ID, name: 'Meta Ads API ENBA' }
        }
      },
      // Code — evaluate-ads.js v4
      {
        parameters: { jsCode: evaluateCode },
        id: 'node-evaluate',
        name: 'Evaluate Ads',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1080, 300]
      },
      // Email
      {
        parameters: {
          fromEmail: EMAIL,
          toEmail:   EMAIL,
          subject:   '={{ $json.subject }}',
          emailFormat: 'html',
          html:      '={{ $json.html }}',
          options: {}
        },
        id: 'node-send-report',
        name: 'Send Report Email',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2.1,
        position: [1300, 300],
        credentials: { smtp: { id: GMAIL_CRED_ID, name: 'Gmail ENBA' } }
      }
    ],
    connections: {
      'Webhook Trigger':  { main: [[{ node: 'Get Ad Insights',  type: 'main', index: 0 }]] },
      'Get Ad Insights':  { main: [[{ node: 'Get FB Followers',  type: 'main', index: 0 }]] },
      'Get FB Followers': { main: [[{ node: 'Get IG Followers',  type: 'main', index: 0 }]] },
      'Get IG Followers': { main: [[{ node: 'Evaluate Ads',      type: 'main', index: 0 }]] },
      'Evaluate Ads':     { main: [[{ node: 'Send Report Email', type: 'main', index: 0 }]] }
    },
    settings: { executionOrder: 'v1', timezone: 'America/Argentina/Buenos_Aires' }
  };

  // 2. Crear workflow temporario
  console.log('2) Creando workflow temporario en n8n...');
  const created = await apiFetch(apiKey, '/workflows', 'POST', wf);
  const tempId = created.id;
  console.log('   ID: ' + tempId);
  console.log('   Nombre: ' + created.name);

  // 3. Activar (para que el webhook sea accesible)
  console.log('\n3) Activando workflow temporario...');
  await apiFetch(apiKey, '/workflows/' + tempId + '/activate', 'POST');
  console.log('   active: true');

  // 4. Esperar que n8n registre el webhook
  console.log('\n4) Esperando 3s para registro del webhook...');
  await sleep(3000);

  // 5. Disparar el webhook → inicia la cadena completa
  const webhookUrl = WEBHOOK_BASE + '/' + WEBHOOK_PATH;
  console.log('\n5) Disparando webhook...');
  console.log('   URL: ' + webhookUrl);
  const triggerRes = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trigger: 'simulate', timestamp: new Date().toISOString() })
  });
  console.log('   HTTP status: ' + triggerRes.status);
  if (!triggerRes.ok) {
    const txt = await triggerRes.text();
    throw new Error('Webhook trigger fallido: ' + triggerRes.status + ' ' + txt);
  }
  console.log('   ✓ Webhook recibido — n8n procesando (Meta API → evaluate → email)');

  // 6. Polling hasta que la ejecución complete (máx 90s)
  console.log('\n6) Esperando que la ejecución complete (polling cada 5s, máx 90s)...');
  let execStatus = null;
  let execId = null;
  const maxWait = 18; // 18 × 5s = 90s
  for (let i = 0; i < maxWait; i++) {
    await sleep(5000);
    const execRes = await apiFetch(apiKey, '/executions?workflowId=' + tempId + '&limit=5');
    const execs = execRes.data || [];
    if (execs.length > 0) {
      const latest = execs[0];
      execId = latest.id;
      execStatus = latest.status;
      process.stdout.write('   [' + (i + 1) * 5 + 's] status: ' + execStatus + '\n');
      if (execStatus === 'success' || execStatus === 'error' || execStatus === 'crashed') break;
    } else {
      process.stdout.write('   [' + (i + 1) * 5 + 's] sin ejecución aún...\n');
    }
  }
  console.log('   Resultado final: ' + (execStatus || 'timeout'));

  // Si falló, mostrar el error antes de limpiar
  if (execId && execStatus !== 'success') {
    console.log('\n   Detalle de la ejecución fallida (' + execId + '):');
    try {
      const det = await apiFetch(apiKey, '/executions/' + execId);
      if (det.data && det.data.resultData) {
        const runData = det.data.resultData.runData || {};
        Object.keys(runData).forEach(function(nodeName) {
          const nr = runData[nodeName];
          if (nr && nr[0] && nr[0].error) {
            console.log('   Nodo con error:', nodeName, '→', nr[0].error.message);
          }
        });
        if (det.data.resultData.error) {
          console.log('   Error global:', det.data.resultData.error.message);
        }
      }
    } catch (e) { console.warn('   No se pudo leer detalle:', e.message); }
  }

  // 7. Limpiar: desactivar y eliminar workflow temporario
  console.log('\n7) Limpiando workflow temporario...');
  try {
    await apiFetch(apiKey, '/workflows/' + tempId + '/deactivate', 'POST');
    console.log('   deactivated: true');
    await apiFetch(apiKey, '/workflows/' + tempId, 'DELETE');
    console.log('   deleted: true');
  } catch (e) {
    console.warn('   ADVERTENCIA limpieza: ' + e.message);
    console.warn('   El workflow temporal puede seguir en n8n. Eliminarlo manualmente: ID ' + tempId);
  }

  console.log('\n=== SIMULACRO COMPLETADO ===');
  console.log('El email debería estar llegando a: ' + EMAIL);
  console.log('Asunto esperado: [ENBA Ads] ' + new Date().toLocaleDateString('es-AR') + ' | ...');
  console.log('\nSi el email no llega en 2 minutos:');
  console.log('  - Verificar carpeta Spam');
  console.log('  - Verificar que la credencial Gmail ENBA (' + GMAIL_CRED_ID + ') esté activa en n8n');
  console.log('  - Verificar ejecuciones en n8n UI: Settings → Executions');
  console.log('\nDONE');
}

main().catch(function(e) {
  console.error('\nSIMULACRO FAILED:', e.message);
  console.error('El workflow temporario puede haber quedado en n8n. Buscar "ENBA - Ads Simulate [temp]" y eliminarlo manualmente.');
  process.exit(1);
});
