import fs from 'fs';
import { execSync } from 'child_process';

const N8N_KEY = execSync('powershell -Command "[System.Environment]::GetEnvironmentVariable(\'N8N_API_KEY\',\'User\')"', {encoding:'utf8'}).trim();
const BASE = 'https://espacionautico.app.n8n.cloud/api/v1';
const WF_ID = 'LBjxUFXarIPV2cIi';
const IG_USER_ID = '17841443139761422';
const MANIFEST_URL = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/burst-manifest.json';
const WEBHOOK_EMAIL = 'https://espacionautico.app.n8n.cloud/webhook/enba-email-notifier';
const META_CREDENTIAL_ID = 'n8scJzbGXnCprioD';

const pickerV2 = fs.readFileSync('automatizaciones/n8n-workflows/nodes/burst-story-picker-v2.js', 'utf8');

async function n8n(method, endpoint, body) {
  const r = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': N8N_KEY },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`n8n ${r.status}: ${text.slice(0,400)}`);
  return text ? JSON.parse(text) : {};
}

const updatedWorkflow = {
  name: 'ENBA - Stories Burst (n8n)',
  nodes: [
    {
      id: 'schedule',
      name: 'Schedule 60min',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [200, 300],
      parameters: {
        rule: { interval: [{ field: 'cronExpression', expression: '1 * * * *' }] }
      }
    },
    {
      id: 'get-manifest',
      name: 'Get Manifest',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [420, 300],
      parameters: { method: 'GET', url: MANIFEST_URL, options: {} }
    },
    {
      id: 'pick-story',
      name: 'Pick Story',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [640, 300],
      parameters: { jsCode: pickerV2 }
    },
    {
      id: 'if-skip',
      name: 'Skip?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [860, 300],
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
          conditions: [{ id: 'skip-check', leftValue: '={{ $json.skip }}', rightValue: true, operator: { type: 'boolean', operation: 'equal' } }],
          combinator: 'and'
        }
      }
    },
    {
      id: 'ig-container',
      name: 'IG Create Container',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1080, 420],
      credentials: { httpHeaderAuth: { id: META_CREDENTIAL_ID, name: 'Meta API ENBA' } },
      parameters: {
        method: 'POST',
        url: `https://graph.facebook.com/v22.0/${IG_USER_ID}/media`,
        sendBody: true,
        bodyParameters: { parameters: [
          { name: 'image_url', value: "={{ $('Pick Story').first().json.imageUrl }}" },
          { name: 'media_type', value: 'STORIES' }
        ]}
      }
    },
    {
      id: 'wait',
      name: 'Wait 8s',
      type: 'n8n-nodes-base.wait',
      typeVersion: 1.1,
      position: [1300, 420],
      parameters: { amount: 8, unit: 'seconds', resume: 'timeInterval' }
    },
    {
      id: 'ig-publish',
      name: 'IG Publish',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1520, 420],
      credentials: { httpHeaderAuth: { id: META_CREDENTIAL_ID, name: 'Meta API ENBA' } },
      parameters: {
        method: 'POST',
        url: `https://graph.facebook.com/v22.0/${IG_USER_ID}/media_publish`,
        sendBody: true,
        bodyParameters: { parameters: [{ name: 'creation_id', value: '={{ $json.id }}' }] }
      }
    },
    {
      id: 'email-ok',
      name: 'Email OK',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1740, 420],
      parameters: {
        method: 'POST',
        url: WEBHOOK_EMAIL,
        sendBody: true,
        bodyParameters: { parameters: [
          { name: 'subject', value: "={{ 'ENBA Stories: ' + $('Pick Story').first().json.file + ' publicada \u2713 (' + $('Pick Story').first().json.progress + ')' }}" },
          { name: 'body',    value: "={{ 'Story publicada.\n\nSeq: ' + $('Pick Story').first().json.progress + '\nArchivo: ' + $('Pick Story').first().json.file + '\nHighlight: ' + $('Pick Story').first().json.highlight + '\nCaption: ' + $('Pick Story').first().json.caption + '\nIG Story ID: ' + $json.id + '\nTimestamp: ' + $('Pick Story').first().json.actualAt }}" }
        ]}
      }
    },
    {
      id: 'email-skip',
      name: 'Email Skip/Done',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1080, 180],
      parameters: {
        method: 'POST',
        url: WEBHOOK_EMAIL,
        sendBody: true,
        bodyParameters: { parameters: [
          { name: 'subject', value: "={{ 'ENBA Stories Burst: ' + $json.reason }}" },
          { name: 'body',    value: "={{ $json.reason + '\nTimestamp: ' + new Date().toISOString() }}" }
        ]}
      }
    }
  ],
  connections: {
    'Schedule 60min': { main: [[{ node: 'Get Manifest',        type: 'main', index: 0 }]] },
    'Get Manifest':   { main: [[{ node: 'Pick Story',          type: 'main', index: 0 }]] },
    'Pick Story':     { main: [[{ node: 'Skip?',               type: 'main', index: 0 }]] },
    'Skip?': { main: [
      [{ node: 'Email Skip/Done',     type: 'main', index: 0 }],
      [{ node: 'IG Create Container', type: 'main', index: 0 }]
    ]},
    'IG Create Container': { main: [[{ node: 'Wait 8s',        type: 'main', index: 0 }]] },
    'Wait 8s':             { main: [[{ node: 'IG Publish',     type: 'main', index: 0 }]] },
    'IG Publish':          { main: [[{ node: 'Email OK',       type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1', timezone: 'America/Argentina/Buenos_Aires' }
};

const updated = await n8n('PUT', `/workflows/${WF_ID}`, updatedWorkflow);
console.log('PUT OK — nodos:', updated.nodes?.map(n => n.name).join(', '));

await n8n('POST', `/workflows/${WF_ID}/deactivate`);
console.log('Deactivated');
await new Promise(r => setTimeout(r, 1500));
await n8n('POST', `/workflows/${WF_ID}/activate`);
console.log('Activated');

const wf = await n8n('GET', `/workflows/${WF_ID}`);
console.log('Active:', wf.active);
console.log('Cron actual:', wf.nodes?.find(n=>n.name==='Schedule 60min')?.parameters?.rule?.interval?.[0]?.expression);
console.log('IG URL:', wf.nodes?.find(n=>n.name==='IG Create Container')?.parameters?.url);
