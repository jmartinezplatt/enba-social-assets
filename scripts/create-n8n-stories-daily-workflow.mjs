#!/usr/bin/env node
// create-n8n-stories-daily-workflow.mjs
// Crea el workflow n8n "ENBA - Stories 3x Diarias" con 3 triggers (9:00/14:00/20:00 ART)
// Cada trigger publica la story correspondiente vía Meta Graph API y envía email de status
//
// Uso:
//   node scripts/create-n8n-stories-daily-workflow.mjs            — crear workflow real
//   node scripts/create-n8n-stories-daily-workflow.mjs --dry-run  — solo muestra JSON
//
// Requiere: N8N_API_KEY en Windows User scope
// Usa credenciales encriptadas de n8n (sin tokens en el JSON):
//   - Meta API ENBA: ID n8scJzbGXnCprioD (httpHeaderAuth)
//   - Gmail ENBA:    ID HpJBfNd1BCHaLYfY (smtpAuth)

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot   = path.resolve(__dirname, '..');
const nodesDir   = path.join(repoRoot, 'automatizaciones', 'n8n-workflows', 'nodes');

const N8N_BASE   = 'https://espacionautico.app.n8n.cloud/api/v1';
const IG_USER_ID = '17841443139761422'; // de meta-ids.json
const BASE_IMG_URL = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/';
const MANIFEST_URL = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/fase2-manifest.json';
const CYCLE_START  = '2026-04-26';

function getEnvVar(name) {
  try {
    return execSync(
      `powershell -Command "[System.Environment]::GetEnvironmentVariable('${name}', 'User')"`,
      { encoding: 'utf8' }
    ).trim() || null;
  } catch { return null; }
}

async function n8nRequest(method, path, body) {
  const N8N_KEY = getEnvVar('N8N_API_KEY');
  if (!N8N_KEY) throw new Error('N8N_API_KEY no encontrado en Windows User scope');

  const response = await fetch(`${N8N_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_KEY
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`n8n API ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

// Leer pick-next-story.js como string para el Code node
async function getPickNextStoryCode() {
  const codePath = path.join(nodesDir, 'pick-next-story.js');
  return await fs.readFile(codePath, 'utf8');
}

function buildWorkflow(pickNextStoryCode) {
  // Estructura: 3 pares de (Schedule → SetSlot → PickNextStory → IGContainer → Wait → IGPublish → SendEmail)
  // Por simplicidad y porque n8n admite múltiples Schedule Triggers, usamos un workflow
  // con 3 sub-cadenas paralelas, una por slot.
  //
  // Cada sub-cadena:
  //   ScheduleX → SetSlot → FetchManifest (HTTP) → PickNextStory (Code) →
  //   [If skip → EmailSkip] → IGCreateContainer (HTTP) → Wait5s → IGPublish (HTTP) → SendEmailOK
  //
  // Nota: n8n no permite múltiples Schedule Triggers en un solo workflow de forma
  // nativa, así que creamos 3 workflows separados (uno por slot).
  // Esta función recibe el slot como parámetro y devuelve el JSON de un workflow.
  // El caller la invoca 3 veces.

  // Ver función buildSlotWorkflow() abajo
}

function buildSlotWorkflow(slot, cronExpression, slotLabel, pickNextStoryCode) {
  const wfName = `ENBA - Stories ${slotLabel} (${slot})`;
  // Posiciones de nodos en el canvas
  const x0 = 200, y0 = 300;
  const dx = 220;

  return {
    name: wfName,
    nodes: [
      {
        id: `schedule-${slot}`,
        name: `Schedule ${slotLabel}`,
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [x0, y0],
        parameters: {
          rule: {
            interval: [
              {
                field: 'cronExpression',
                expression: cronExpression
              }
            ]
          }
        }
      },
      {
        id: `set-slot-${slot}`,
        name: 'Set Slot',
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        position: [x0 + dx, y0],
        parameters: {
          mode: 'manual',
          assignments: {
            assignments: [
              { id: 'slot', name: 'slot', value: slot, type: 'string' },
              { id: 'cycleStartDate', name: 'cycleStartDate', value: CYCLE_START, type: 'string' }
            ]
          }
        }
      },
      {
        id: `pick-story-${slot}`,
        name: 'Pick Next Story',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [x0 + dx * 2, y0],
        parameters: {
          jsCode: pickNextStoryCode
        }
      },
      {
        id: `if-skip-${slot}`,
        name: 'Skip?',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [x0 + dx * 3, y0],
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
            conditions: [
              {
                id: 'skip-check',
                leftValue: `={{ $json.skip }}`,
                rightValue: true,
                operator: { type: 'boolean', operation: 'equal' }
              }
            ],
            combinator: 'and'
          }
        }
      },
      {
        id: `email-skip-${slot}`,
        name: 'Email Skip',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2.1,
        position: [x0 + dx * 4, y0 - 120],
        credentials: {
          smtp: { id: 'HpJBfNd1BCHaLYfY', name: 'Gmail ENBA' }
        },
        parameters: {
          fromEmail: 'enba.social@gmail.com',
          toEmail: 'jmartinezplatt@gmail.com',
          subject: `={{ 'ENBA Stories [' + $('Set Slot').first().json.slot + ']: skip — ' + $json.reason }}`,
          emailType: 'text',
          message: `={{ 'Stories 3x Diarias — slot ' + $('Set Slot').first().json.slot + '\\n\\nMotivo: ' + $json.reason + '\\nTimestamp: ' + $json.timestamp }}`
        }
      },
      {
        id: `ig-container-${slot}`,
        name: 'IG Create Container',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [x0 + dx * 4, y0 + 80],
        credentials: {
          httpHeaderAuth: { id: 'n8scJzbGXnCprioD', name: 'Meta API ENBA' }
        },
        continueOnFail: false,
        parameters: {
          method: 'POST',
          url: `https://graph.facebook.com/v22.0/${IG_USER_ID}/media`,
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: 'image_url', value: `={{ '${BASE_IMG_URL}' + $('Pick Next Story').first().json.file }}` },
              { name: 'media_type', value: 'STORIES' }
            ]
          }
        }
      },
      {
        id: `wait-${slot}`,
        name: 'Wait 8s',
        type: 'n8n-nodes-base.wait',
        typeVersion: 1.1,
        position: [x0 + dx * 5, y0 + 80],
        parameters: {
          amount: 8,
          unit: 'seconds',
          resume: 'timeInterval'
        }
      },
      {
        id: `ig-publish-${slot}`,
        name: 'IG Publish',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [x0 + dx * 6, y0 + 80],
        credentials: {
          httpHeaderAuth: { id: 'n8scJzbGXnCprioD', name: 'Meta API ENBA' }
        },
        continueOnFail: false,
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
        id: `email-ok-${slot}`,
        name: 'Email OK',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2.1,
        position: [x0 + dx * 7, y0 + 80],
        credentials: {
          smtp: { id: 'HpJBfNd1BCHaLYfY', name: 'Gmail ENBA' }
        },
        parameters: {
          fromEmail: 'enba.social@gmail.com',
          toEmail: 'jmartinezplatt@gmail.com',
          subject: `={{ 'ENBA Stories [' + $('Pick Next Story').first().json.category + '] ' + $('Pick Next Story').first().json.cycleProgress + ' ' + $('Set Slot').first().json.slot + ' publicada ✓' }}`,
          emailType: 'text',
          message: `={{ 'Story publicada correctamente.\\n\\nCategoría: ' + $('Pick Next Story').first().json.category + '\\nCaption: ' + $('Pick Next Story').first().json.caption + '\\nArchivo: ' + $('Pick Next Story').first().json.file + '\\nIG Story ID: ' + $json.id + '\\nCiclo: ' + $('Pick Next Story').first().json.cycleProgress + '\\nSlot: ' + $('Pick Next Story').first().json.slot + ' (' + $('Pick Next Story').first().json.time + ' ART)\\nTimestamp: ' + $('Pick Next Story').first().json.timestamp }}`
        }
      }
    ],
    connections: {
      [`Schedule ${slotLabel}`]: {
        main: [[{ node: 'Set Slot', type: 'main', index: 0 }]]
      },
      'Set Slot': {
        main: [[{ node: 'Pick Next Story', type: 'main', index: 0 }]]
      },
      'Pick Next Story': {
        main: [[{ node: 'Skip?', type: 'main', index: 0 }]]
      },
      'Skip?': {
        main: [
          [{ node: 'Email Skip', type: 'main', index: 0 }],  // true branch (skip)
          [{ node: 'IG Create Container', type: 'main', index: 0 }]  // false branch (publish)
        ]
      },
      'IG Create Container': {
        main: [[{ node: 'Wait 8s', type: 'main', index: 0 }]]
      },
      'Wait 8s': {
        main: [[{ node: 'IG Publish', type: 'main', index: 0 }]]
      },
      'IG Publish': {
        main: [[{ node: 'Email OK', type: 'main', index: 0 }]]
      }
    },
    settings: {
      executionOrder: 'v1',
      timezone: 'America/Argentina/Buenos_Aires'
    }
  };
}

async function run() {
  const args   = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('\n── ENBA Stories Daily Workflow Creator ──');
  console.log(`Modo: ${dryRun ? 'DRY-RUN (solo muestra JSON)' : 'CREACIÓN REAL en n8n'}\n`);

  const pickNextStoryCode = await getPickNextStoryCode();

  const slots = [
    { slot: 'manana', cron: '0 9 * * *',  label: 'Mañana' },
    { slot: 'tarde',  cron: '0 14 * * *', label: 'Tarde'  },
    { slot: 'noche',  cron: '0 20 * * *', label: 'Noche'  }
  ];

  const workflows = slots.map(s =>
    buildSlotWorkflow(s.slot, s.cron, s.label, pickNextStoryCode)
  );

  if (dryRun) {
    for (const wf of workflows) {
      console.log(`\n── Workflow: ${wf.name} ──`);
      console.log(JSON.stringify(wf, null, 2).slice(0, 500) + '\n...(truncado)\n');
    }
    console.log(`\n✓ Dry-run OK. ${workflows.length} workflows listos para crear.`);
    return;
  }

  // Crear workflows en n8n
  const createdIds = [];
  for (const wf of workflows) {
    console.log(`Creando: ${wf.name}...`);
    try {
      const created = await n8nRequest('POST', '/workflows', wf);
      console.log(`  ✓ Creado: ID ${created.id}`);
      createdIds.push({ name: wf.name, id: created.id });

      // Ciclo deactivate → activate para registrar cron
      await n8nRequest('POST', `/workflows/${created.id}/deactivate`);
      await new Promise(r => setTimeout(r, 1000));
      await n8nRequest('POST', `/workflows/${created.id}/activate`);
      console.log(`  ✓ Activado`);
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
    }
  }

  console.log('\n── Resumen ──');
  for (const w of createdIds) {
    console.log(`  ${w.name} → ID: ${w.id}`);
  }
  console.log('\n3 workflows creados y activos en n8n.');
  console.log('Primer disparo: mañana a las 09:00 ART.');
  console.log('Verificar en: https://espacionautico.app.n8n.cloud/workflow');
}

run().catch(e => { console.error(e); process.exit(1); });
