#!/usr/bin/env node
// Crea workflow n8n: ENBA - Ads Evaluation Diaria 9:00
// Evalúa performance de Meta Ads diariamente y envía reporte por email
// con prompt listo para Bruno.
//
// Patrón: Schedule 9:00 ART → GET Insights → Code (evaluar) → Email
// Credenciales: Meta Ads API ENBA (6LxWcVxeyZgsBTUU) + Gmail ENBA (HpJBfNd1BCHaLYfY)

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1';
const META_ADS_CREDENTIAL_ID = '6LxWcVxeyZgsBTUU';
const GMAIL_CREDENTIAL_ID = 'HpJBfNd1BCHaLYfY';
const AD_ACCOUNT = 'act_2303565156801569';
const EMAIL = 'jmartinezplatt@gmail.com';

function getApiKey() {
  const out = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`).toString().trim();
  if (!out) throw new Error('N8N_API_KEY no cargada');
  return out;
}

function loadCodeNode(filename) {
  const path = new URL('../automatizaciones/n8n-workflows/nodes/' + filename, import.meta.url).pathname;
  // En Windows, el path empieza con /C: — corregir
  const cleanPath = path.replace(/^\/([A-Za-z]:)/, '$1');
  return fs.readFileSync(cleanPath, 'utf-8');
}

function buildWorkflow() {
  const evaluateCode = loadCodeNode('evaluate-ads.js');

  const insightsUrl = 'https://graph.facebook.com/v21.0/' + AD_ACCOUNT
    + '/insights?level=ad&fields=ad_id,ad_name,impressions,reach,clicks,spend,actions,cost_per_action_type,ctr,frequency'
    + '&date_preset=lifetime&limit=50';

  return {
    name: 'ENBA - Ads Evaluation Diaria 9:00',
    nodes: [
      // 1. Schedule Trigger — 9:00 ART diario
      {
        parameters: {
          rule: {
            interval: [
              { field: 'cronExpression', expression: '0 9 * * *' }
            ]
          }
        },
        id: 'node-schedule-eval',
        name: 'Schedule 9:00 ART',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.1,
        position: [200, 300]
      },
      // 2. HTTP Request — GET Meta Ads Insights
      {
        parameters: {
          method: 'GET',
          url: insightsUrl,
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
          httpHeaderAuth: {
            id: META_ADS_CREDENTIAL_ID,
            name: 'Meta Ads API ENBA'
          }
        }
      },
      // 3. Code — Evaluar performance + generar email
      {
        parameters: {
          jsCode: evaluateCode
        },
        id: 'node-evaluate',
        name: 'Evaluate Ads',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [640, 300]
      },
      // 4. Email — Enviar reporte
      {
        parameters: {
          fromEmail: EMAIL,
          toEmail: EMAIL,
          subject: '={{ $json.subject }}',
          emailFormat: 'html',
          html: '={{ $json.html }}',
          options: {}
        },
        id: 'node-send-report',
        name: 'Send Report Email',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2.1,
        position: [860, 300],
        credentials: {
          smtp: {
            id: GMAIL_CREDENTIAL_ID,
            name: 'Gmail ENBA'
          }
        }
      }
    ],
    connections: {
      'Schedule 9:00 ART': {
        main: [[{ node: 'Get Ad Insights', type: 'main', index: 0 }]]
      },
      'Get Ad Insights': {
        main: [[{ node: 'Evaluate Ads', type: 'main', index: 0 }]]
      },
      'Evaluate Ads': {
        main: [[{ node: 'Send Report Email', type: 'main', index: 0 }]]
      }
    },
    settings: {
      executionOrder: 'v1',
      timezone: 'America/Argentina/Buenos_Aires'
    }
  };
}

async function createWorkflow(apiKey, wf) {
  const res = await fetch(BASE_URL + '/workflows', {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(wf)
  });
  if (!res.ok) throw new Error('POST failed: ' + res.status + ' ' + (await res.text()));
  return res.json();
}

// n8n API v1: active es read-only en PUT. Usar POST /activate o /deactivate
async function activateWorkflow(apiKey, wfId) {
  const res = await fetch(BASE_URL + '/workflows/' + wfId + '/activate', {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': apiKey }
  });
  if (!res.ok) throw new Error('POST /activate failed: ' + res.status + ' ' + (await res.text()));
  return res.json();
}

async function deactivateWorkflow(apiKey, wfId) {
  const res = await fetch(BASE_URL + '/workflows/' + wfId + '/deactivate', {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': apiKey }
  });
  if (!res.ok) throw new Error('POST /deactivate failed: ' + res.status + ' ' + (await res.text()));
  return res.json();
}

async function main() {
  const apiKey = getApiKey();
  console.log('N8N_API_KEY: CARGADA');

  console.log('\n1) Construyendo workflow JSON');
  const wf = buildWorkflow();
  console.log('   Nodos: ' + wf.nodes.length);
  console.log('   Cron: 0 9 * * * (9:00 ART diario)');

  console.log('\n2) POST workflow a n8n');
  const result = await createWorkflow(apiKey, wf);
  console.log('   ID: ' + result.id);
  console.log('   Nombre: ' + result.name);
  console.log('   Nodos: ' + result.nodes.length);
  console.log('   Active: ' + result.active);

  // Backup
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = 'n8n-ads-evaluation-' + ts + '.json';
  fs.writeFileSync(backupFile, JSON.stringify(result, null, 2));
  console.log('   Backup: ' + backupFile);

  // Activar workflow (registra cron en scheduler interno)
  console.log('\n3) Activar workflow (registrar cron)');
  const activated = await activateWorkflow(apiKey, result.id);
  console.log('   active: ' + activated.active);
  console.log('   Cron registrado: 0 9 * * * (9:00 ART)');

  console.log('\n=== WORKFLOW CREADO ===');
  console.log('ID: ' + result.id);
  console.log('Nombre: ' + result.name);
  console.log('Estado: ACTIVE');
  console.log('Proximo disparo: manana 9:00 ART');
  console.log('Email a: ' + EMAIL);
  console.log('Credencial Meta: ' + META_ADS_CREDENTIAL_ID);
  console.log('Credencial Gmail: ' + GMAIL_CREDENTIAL_ID);
  console.log('\nDONE');
}

main().catch(function(e) { console.error('CREATION FAILED:', e.message); process.exit(1); });
