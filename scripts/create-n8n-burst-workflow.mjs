#!/usr/bin/env node
// Crea workflow n8n "ENBA - Stories Burst (n8n)" para publicar stories #4-#24
// Reemplaza el burst script local — corre en la nube, sin PC encendida

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const N8N_BASE = 'https://espacionautico.app.n8n.cloud/api/v1';
const META_CREDENTIAL_ID = 'n8scJzbGXnCprioD';
const GMAIL_CREDENTIAL_ID = 'HpJBfNd1BCHaLYfY';
const EMAIL = 'jmartinezplatt@gmail.com';
const IG_USER_ID = '17841443139761422'; // confirmado funcional en sesión 23/04
const WEBHOOK_EMAIL = 'https://espacionautico.app.n8n.cloud/webhook/enba-email-notifier';

function getApiKey() {
  return execSync(
    `powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`,
    { encoding: 'utf8' }
  ).trim();
}

function loadCode(filename) {
  const filePath = path.join(repoRoot, 'automatizaciones', 'n8n-workflows', 'nodes', filename);
  return fs.readFileSync(filePath, 'utf-8');
}

async function n8n(method, endpoint, body) {
  const key = getApiKey();
  const r = await fetch(`${N8N_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': key },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`n8n ${r.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

const pickerCode = loadCode('burst-story-picker.js');

// Workflow: Schedule cada 60 min → Pick Story → [skip?] → IG Create → Wait → IG Publish → Email
const workflow = {
  name: 'ENBA - Stories Burst (n8n)',
  nodes: [
    {
      id: 'schedule',
      name: 'Schedule 60min',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [200, 300],
      parameters: {
        rule: {
          interval: [{ field: 'cronExpression', expression: '10 * * * *' }]
        }
      }
    },
    {
      id: 'pick-story',
      name: 'Pick Story',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [420, 300],
      parameters: { jsCode: pickerCode }
    },
    {
      id: 'if-skip',
      name: 'Skip?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [640, 300],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
          conditions: [{
            id: 'skip-check',
            leftValue: '={{ $json.skip }}',
            rightValue: true,
            operator: { type: 'boolean', operation: 'equal' }
          }],
          combinator: 'and'
        }
      }
    },
    {
      id: 'ig-container',
      name: 'IG Create Container',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [860, 420],
      credentials: { httpHeaderAuth: { id: META_CREDENTIAL_ID, name: 'Meta API ENBA' } },
      parameters: {
        method: 'POST',
        url: `https://graph.facebook.com/v22.0/${IG_USER_ID}/media`,
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'image_url', value: "={{ $('Pick Story').first().json.imageUrl }}" },
            { name: 'media_type', value: 'STORIES' }
          ]
        }
      }
    },
    {
      id: 'wait',
      name: 'Wait 8s',
      type: 'n8n-nodes-base.wait',
      typeVersion: 1.1,
      position: [1080, 420],
      parameters: { amount: 8, unit: 'seconds', resume: 'timeInterval' }
    },
    {
      id: 'ig-publish',
      name: 'IG Publish',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1300, 420],
      credentials: { httpHeaderAuth: { id: META_CREDENTIAL_ID, name: 'Meta API ENBA' } },
      parameters: {
        method: 'POST',
        url: `https://graph.facebook.com/v22.0/${IG_USER_ID}/media_publish`,
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'creation_id', value: '={{ $json.id }}' }
          ]
        }
      }
    },
    {
      id: 'email-ok',
      name: 'Email OK',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1520, 420],
      parameters: {
        method: 'POST',
        url: WEBHOOK_EMAIL,
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'subject', value: "={{ 'ENBA Stories: ' + $('Pick Story').first().json.file + ' publicada ✓ (' + $('Pick Story').first().json.progress + ')' }}" },
            { name: 'body',    value: "={{ 'Story publicada.\\n\\nSeq: ' + $('Pick Story').first().json.progress + '\\nArchivo: ' + $('Pick Story').first().json.file + '\\nHighlight: ' + $('Pick Story').first().json.highlight + '\\nCaption: ' + $('Pick Story').first().json.caption + '\\nIG Story ID: ' + $json.id + '\\nTimestamp: ' + $('Pick Story').first().json.actualAt }}" }
          ]
        }
      }
    },
    {
      id: 'email-skip',
      name: 'Email Skip/Done',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [860, 180],
      parameters: {
        method: 'POST',
        url: WEBHOOK_EMAIL,
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'subject', value: "={{ 'ENBA Stories Burst: ' + $json.reason }}" },
            { name: 'body',    value: "={{ $json.reason + '\\nTimestamp: ' + new Date().toISOString() }}" }
          ]
        }
      }
    }
  ],
  connections: {
    'Schedule 60min':     { main: [[{ node: 'Pick Story',          type: 'main', index: 0 }]] },
    'Pick Story':         { main: [[{ node: 'Skip?',               type: 'main', index: 0 }]] },
    'Skip?':              { main: [
      [{ node: 'Email Skip/Done',    type: 'main', index: 0 }],
      [{ node: 'IG Create Container',type: 'main', index: 0 }]
    ]},
    'IG Create Container':{ main: [[{ node: 'Wait 8s',             type: 'main', index: 0 }]] },
    'Wait 8s':            { main: [[{ node: 'IG Publish',          type: 'main', index: 0 }]] },
    'IG Publish':         { main: [[{ node: 'Email OK',            type: 'main', index: 0 }]] }
  },
  settings: {
    executionOrder: 'v1',
    timezone: 'America/Argentina/Buenos_Aires'
  }
};

const created = await n8n('POST', '/workflows', workflow);
console.log(`Creado: ID ${created.id}`);

await n8n('POST', `/workflows/${created.id}/deactivate`);
await new Promise(r => setTimeout(r, 1000));
await n8n('POST', `/workflows/${created.id}/activate`);
console.log(`Activado.`);

console.log(`\nWorkflow ID: ${created.id}`);
console.log(`Trigger: cada hora a los :10 minutos (ART)`);
console.log(`Próxima ejecución: ${new Date(Math.ceil(Date.now() / 3600000) * 3600000 + 10 * 60000).toISOString()}`);
console.log(`Stories pendientes: #4 (broker-story-01.jpg) → #24`);
