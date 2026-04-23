#!/usr/bin/env node
// Crea workflow n8n "ENBA - Email Notifier" con webhook trigger
// Acepta POST {subject, body} y envía email via Gmail ENBA
// La URL del webhook se imprime al final — copiar a publish-stories-burst.mjs

import { execSync } from 'node:child_process';

const N8N_BASE = 'https://espacionautico.app.n8n.cloud/api/v1';
const GMAIL_CREDENTIAL_ID = 'HpJBfNd1BCHaLYfY';
const EMAIL = 'jmartinezplatt@gmail.com';

function getApiKey() {
  return execSync(
    `powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`,
    { encoding: 'utf8' }
  ).trim();
}

async function n8n(method, path, body) {
  const key = getApiKey();
  const r = await fetch(`${N8N_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': key },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`n8n ${r.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

const WEBHOOK_ID = 'enba-email-notifier';

const workflow = {
  name: 'ENBA - Email Notifier',
  nodes: [
    {
      id: 'webhook-trigger',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [200, 300],
      parameters: {
        httpMethod: 'POST',
        path: WEBHOOK_ID,
        responseMode: 'onReceived',
        responseData: 'noData'
      },
      webhookId: WEBHOOK_ID
    },
    {
      id: 'send-email',
      name: 'Send Email',
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [440, 300],
      credentials: {
        smtp: { id: GMAIL_CREDENTIAL_ID, name: 'Gmail ENBA' }
      },
      parameters: {
        fromEmail: EMAIL,
        toEmail: EMAIL,
        subject: '={{ $json.body.subject }}',
        emailFormat: 'text',
        text: '={{ $json.body.body }}',
        options: {}
      }
    }
  ],
  connections: {
    'Webhook': {
      main: [[{ node: 'Send Email', type: 'main', index: 0 }]]
    }
  },
  settings: {
    executionOrder: 'v1',
    timezone: 'America/Argentina/Buenos_Aires'
  }
};

const created = await n8n('POST', '/workflows', workflow);
console.log(`Creado: ID ${created.id}`);

await n8n('POST', `/workflows/${created.id}/deactivate`);
await new Promise(r => setTimeout(r, 500));
await n8n('POST', `/workflows/${created.id}/activate`);
console.log('Activado.');

const webhookUrl = `https://espacionautico.app.n8n.cloud/webhook/${WEBHOOK_ID}`;
console.log(`\nWebhook URL (producción):\n${webhookUrl}`);
console.log('\nActualizar en publish-stories-burst.mjs → constante WEBHOOK_EMAIL_URL');
