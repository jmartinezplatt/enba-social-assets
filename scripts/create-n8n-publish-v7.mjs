#!/usr/bin/env node
// Crea workflow n8n v7.1: ENBA - Redes Publicacion Diaria 12:15 v7
//
// Mejoras sobre v6:
//   - Pre-warm de imagen (GET a Cloudflare antes de llamar a Meta)
//   - Retry automático en IG Create Container y FB Create Photo (3 intentos, 10s entre)
//   - IG y FB publican en paralelo e independiente — si una falla, la otra sigue
//   - Anti-duplicado por plataforma — si una ya publicó, solo reintenta la que falta
//   - Email unificado reporta estado de cada plataforma
//
// Credenciales: Meta API ENBA (n8scJzbGXnCprioD) + Gmail ENBA (HpJBfNd1BCHaLYfY)

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1';
const META_CREDENTIAL_ID = 'n8scJzbGXnCprioD';
const GMAIL_CREDENTIAL_ID = 'HpJBfNd1BCHaLYfY';
const EMAIL = 'jmartinezplatt@gmail.com';
const CALENDAR_URL = 'https://social-assets.espacionautico.com.ar/campaigns/calendario-integrado.json';
const PIECES_URL = 'https://social-assets.espacionautico.com.ar/campaigns/lanzamiento-15-abr-2026/campaign.pieces.json';
const IG_USER_ID = '17841443139761422';
const PAGE_ID = '1064806400040502';

function getApiKey() {
  const out = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`).toString().trim();
  if (!out) throw new Error('N8N_API_KEY no cargada');
  return out;
}

function loadCodeNode(filename) {
  const path = new URL('../automatizaciones/n8n-workflows/nodes/' + filename, import.meta.url).pathname;
  const cleanPath = path.replace(/^\/([A-Za-z]:)/, '$1');
  return fs.readFileSync(cleanPath, 'utf-8');
}

function conn(node, index) {
  return { node: node, type: 'main', index: index || 0 };
}

function buildWorkflow() {
  // Load all Code node JS from files
  const findTodayPieceCode = loadCodeNode('find-today-piece.js');
  const setIgResultCode = loadCodeNode('set-ig-result.js');
  const setIgFailedCode = loadCodeNode('set-ig-failed.js');
  const setIgSkippedCode = loadCodeNode('set-ig-skipped.js');
  const setFbResultCode = loadCodeNode('set-fb-result.js');
  const setFbFailedCode = loadCodeNode('set-fb-failed.js');
  const setFbSkippedCode = loadCodeNode('set-fb-skipped.js');
  const collectResultsCode = loadCodeNode('collect-results.js');

  // Prepare Publish Data — versión live con dryRun + anti-dup
  const preparePublishCode = `
const allItems = $input.all();
const pieces = allItems.map(item => item.json);

const entry = $('Find Today Piece').first().json;
const piece = pieces.find(p => p && p.id === entry.id);

// Evaluate dryRun — fail closed
let isDryRun = true;
try {
  const raw = $vars.dryRun;
  const normalized = String(raw ?? 'true').toLowerCase().trim();
  isDryRun = normalized !== 'false';
} catch (e) {
  isDryRun = true;
}

if (!piece) {
  return [{ json: {
    action: 'error',
    pieceId: entry.id,
    message: 'Piece not found: ' + entry.id
  } }];
}

const staticData = $getWorkflowStaticData('global');
const todayStr = entry.date;
const key = piece.id + '_' + todayStr;

// Anti-duplicado por plataforma
const igDone = (staticData.lastPublished_ig || '') === key;
const fbDone = (staticData.lastPublished_fb || '') === key;

if (igDone && fbDone) {
  return [{ json: {
    action: 'duplicate',
    pieceId: piece.id,
    date: todayStr,
    headline: piece.headline,
    message: 'Pieza ya publicada en IG y FB. Skip.'
  } }];
}

const num = piece.id.replace('piece-', '');
const parts = piece.date.split('/');
const d = parts[0], m = parts[1], y = parts[2];
const dateStr = y + '-' + m + '-' + d;
const verticalSlug = piece.vertical.toLowerCase().replace(/\\u00ed/g, 'i');
const manifestId = 'sm-' + dateStr + '-ig-feed-' + verticalSlug + '-' + num;
const pngName = num + '-' + d + '-' + m + '-' + y + '-' + verticalSlug + '.png';
const imageUrl = 'https://enba-social-assets.pages.dev/staging/' + y + '/' + m + '/' + manifestId + '/' + pngName;

const action = isDryRun ? 'dryrun' : 'publish';

return [{ json: {
  action: action,
  pieceId: piece.id,
  date: piece.date,
  vertical: piece.vertical,
  headline: piece.headline,
  captionIg: piece.captionIg,
  captionFb: piece.captionFb,
  imageUrl: imageUrl,
  manifestId: manifestId,
  igUserId: '${IG_USER_ID}',
  pageId: '${PAGE_ID}',
  publishIg: !igDone,
  publishFb: !fbDone
} }];
`;

  // Email preparation code nodes (skip, duplicate, dryrun, error)
  const prepareSkipCode = `
const data = $('Find Today Piece').first().json;
const subject = '[INFO] ENBA Redes: sin pieza programada para hoy';
const body = 'SIN PIEZA PROGRAMADA\\n'
  + '====================\\n\\n'
  + 'No hay pieza tipo "pieza" en el calendario para hoy (' + data.date + ').\\n'
  + 'El workflow termino sin publicar.\\n\\n'
  + 'Timestamp: ' + new Date().toISOString();
return [{ json: { subject, body } }];
`;

  const prepareDuplicateCode = `
const data = $('Prepare Publish Data').first().json;
const subject = '[SKIP] ENBA Redes: ' + data.pieceId + ' ya publicada hoy';
const body = 'ANTI-DUPLICADO ACTIVADO\\n'
  + '========================\\n\\n'
  + 'La pieza ' + data.pieceId + ' ya fue publicada hoy.\\n'
  + 'El workflow no volvio a publicar.\\n\\n'
  + 'Timestamp: ' + new Date().toISOString();
return [{ json: { subject, body } }];
`;

  const prepareDryRunCode = `
const piece = $('Prepare Publish Data').first().json;
const subject = '[DRY RUN] ENBA Redes: ' + piece.pieceId + ' - ' + piece.headline;
const body = '=== DRY RUN – NO SE PUBLICO NADA ===\\n\\n'
  + 'Este email confirma que el workflow funciona correctamente.\\n'
  + 'No se toco Meta API. No se publico en IG ni FB.\\n\\n'
  + 'DATOS DE LA PIEZA:\\n'
  + '  Pieza: ' + piece.pieceId + '\\n'
  + '  Fecha: ' + piece.date + '\\n'
  + '  Vertical: ' + piece.vertical + '\\n'
  + '  Headline: ' + piece.headline + '\\n'
  + '  Image URL: ' + piece.imageUrl + '\\n\\n'
  + 'Para publicar de verdad, cambiar la variable dryRun a "false".\\n\\n'
  + 'Timestamp: ' + new Date().toISOString();
return [{ json: { subject, body } }];
`;

  const prepareErrorCode = `
const data = $('Prepare Publish Data').first().json;
const subject = '[ERROR] ENBA Redes: accion desconocida - ' + (data.pieceId || 'sin pieza');
const body = 'ERROR EN WORKFLOW\\n'
  + '=================\\n\\n'
  + 'El workflow llego a un estado imprevisto.\\n'
  + 'Accion recibida: ' + (data.action || 'undefined') + '\\n'
  + 'Mensaje: ' + (data.message || 'sin mensaje') + '\\n'
  + 'Pieza: ' + (data.pieceId || 'desconocida') + '\\n\\n'
  + 'ACCION REQUERIDA: revisar ejecucion en n8n.\\n\\n'
  + 'Timestamp: ' + new Date().toISOString();
return [{ json: { subject, body } }];
`;

  // Meta API credential block
  const metaCred = {
    httpHeaderAuth: { id: META_CREDENTIAL_ID, name: 'Meta API ENBA' }
  };

  // Gmail credential block
  const gmailCred = {
    smtp: { id: GMAIL_CREDENTIAL_ID, name: 'Gmail ENBA' }
  };

  // Email send node helper
  function emailNode(id, name, posX, posY) {
    return {
      parameters: {
        fromEmail: EMAIL,
        toEmail: EMAIL,
        subject: '={{ $json.subject }}',
        emailFormat: 'text',
        text: '={{ $json.body }}',
        options: {}
      },
      id: id,
      name: name,
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [posX, posY],
      credentials: gmailCred
    };
  }

  return {
    name: 'ENBA - Redes Publicacion Diaria 12:15 v7.2',
    nodes: [
      // === TRIGGER ===
      {
        parameters: {
          rule: {
            interval: [
              { field: 'cronExpression', expression: '15 12 * * *' }
            ]
          }
        },
        id: 'node-schedule',
        name: 'Schedule 12:15 ART',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.1,
        position: [0, 400]
      },

      // === CALENDAR + FIND PIECE ===
      {
        parameters: {
          method: 'GET',
          url: CALENDAR_URL,
          options: {}
        },
        id: 'node-get-calendar',
        name: 'Get Calendar',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [220, 400]
      },
      {
        parameters: { jsCode: findTodayPieceCode },
        id: 'node-find-today',
        name: 'Find Today Piece',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [440, 400]
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '' },
            conditions: [{
              id: 'cond-has-piece',
              leftValue: '={{ $json.skip }}',
              rightValue: false,
              operator: { type: 'boolean', operation: 'equals' }
            }]
          }
        },
        id: 'node-has-piece',
        name: 'Has Piece?',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [660, 400]
      },

      // === GET PIECES + PREPARE ===
      {
        parameters: {
          method: 'GET',
          url: PIECES_URL,
          options: {}
        },
        id: 'node-get-pieces',
        name: 'Get Pieces JSON',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [880, 300]
      },
      {
        parameters: { jsCode: preparePublishCode },
        id: 'node-prepare',
        name: 'Prepare Publish Data',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1100, 300]
      },

      // === ACTION ROUTING ===
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '' },
            conditions: [{
              id: 'cond-publish',
              leftValue: '={{ $json.action }}',
              rightValue: 'publish',
              operator: { type: 'string', operation: 'equals' }
            }]
          }
        },
        id: 'node-if-publish',
        name: 'IF_ActionPublish',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [1320, 300]
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '' },
            conditions: [{
              id: 'cond-dup',
              leftValue: '={{ $json.action }}',
              rightValue: 'duplicate',
              operator: { type: 'string', operation: 'equals' }
            }]
          }
        },
        id: 'node-if-dup',
        name: 'IF_ActionDuplicate',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [1320, 600]
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '' },
            conditions: [{
              id: 'cond-dry',
              leftValue: '={{ $json.action }}',
              rightValue: 'dryrun',
              operator: { type: 'string', operation: 'equals' }
            }]
          }
        },
        id: 'node-if-dry',
        name: 'IF_ActionDryRun',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [1320, 800]
      },

      // === PRE-WARM IMAGE ===
      {
        parameters: {
          method: 'GET',
          url: '={{ $json.imageUrl }}',
          options: { timeout: 15000 }
        },
        id: 'node-prewarm',
        name: 'Pre-warm Image',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1560, 200],
        onError: 'continueRegularOutput'
      },

      // === PLATFORM ROUTING ===
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '' },
            conditions: [{
              id: 'cond-need-ig',
              leftValue: '={{ $("Prepare Publish Data").first().json.publishIg }}',
              rightValue: true,
              operator: { type: 'boolean', operation: 'equals' }
            }]
          }
        },
        id: 'node-need-ig',
        name: 'Need IG?',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [1780, 160]
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '' },
            conditions: [{
              id: 'cond-need-fb',
              leftValue: '={{ $("Prepare Publish Data").first().json.publishFb }}',
              rightValue: true,
              operator: { type: 'boolean', operation: 'equals' }
            }]
          }
        },
        id: 'node-need-fb',
        name: 'Need FB?',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [1780, 400]
      },
      {
        parameters: { jsCode: setIgSkippedCode },
        id: 'node-set-ig-skip',
        name: 'Set IG Skipped',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2020, 240]
      },
      {
        parameters: { jsCode: setFbSkippedCode },
        id: 'node-set-fb-skip',
        name: 'Set FB Skipped',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2020, 520]
      },

      // === IG BRANCH ===
      {
        parameters: {
          method: 'POST',
          url: '=https://graph.facebook.com/v21.0/{{ $("Prepare Publish Data").first().json.igUserId }}/media?image_url={{ encodeURIComponent($("Prepare Publish Data").first().json.imageUrl) }}&caption={{ encodeURIComponent($("Prepare Publish Data").first().json.captionIg) }}',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {}
        },
        id: 'node-ig-container',
        name: 'IG Create Container',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1800, 100],
        credentials: metaCred,
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 10000,
        onError: 'continueErrorOutput'
      },
      {
        parameters: {
          amount: 8,
          unit: 'seconds'
        },
        id: 'node-wait-8s',
        name: 'Wait 8s',
        type: 'n8n-nodes-base.wait',
        typeVersion: 1.1,
        position: [2020, 60]
      },
      {
        parameters: {
          method: 'POST',
          url: '=https://graph.facebook.com/v21.0/{{ $("Prepare Publish Data").first().json.igUserId }}/media_publish?creation_id={{ $("IG Create Container").first().json.id }}',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {}
        },
        id: 'node-ig-publish',
        name: 'IG Publish',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [2240, 60],
        credentials: metaCred,
        onError: 'continueErrorOutput'
      },
      {
        parameters: { jsCode: setIgResultCode },
        id: 'node-set-ig-ok',
        name: 'Set IG Result',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2460, 20]
      },
      {
        parameters: { jsCode: setIgFailedCode },
        id: 'node-set-ig-fail',
        name: 'Set IG Failed',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2460, 180]
      },

      // === FB BRANCH ===
      {
        parameters: {
          method: 'POST',
          url: '=https://graph.facebook.com/v21.0/{{ $("Prepare Publish Data").first().json.pageId }}/photos?url={{ encodeURIComponent($("Prepare Publish Data").first().json.imageUrl) }}&published=false',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {}
        },
        id: 'node-fb-photo',
        name: 'FB Create Unpublished Photo',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1800, 340],
        credentials: metaCred,
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 10000,
        onError: 'continueErrorOutput'
      },
      {
        parameters: {
          method: 'POST',
          url: '=https://graph.facebook.com/v21.0/{{ $("Prepare Publish Data").first().json.pageId }}/feed?message={{ encodeURIComponent($("Prepare Publish Data").first().json.captionFb) }}&attached_media={{ encodeURIComponent(\'[{"media_fbid":"\' + $("FB Create Unpublished Photo").first().json.id + \'"}]\') }}',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          options: {}
        },
        id: 'node-fb-publish',
        name: 'FB Publish Post',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [2020, 300],
        credentials: metaCred,
        onError: 'continueErrorOutput'
      },
      {
        parameters: { jsCode: setFbResultCode },
        id: 'node-set-fb-ok',
        name: 'Set FB Result',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2460, 300]
      },
      {
        parameters: { jsCode: setFbFailedCode },
        id: 'node-set-fb-fail',
        name: 'Set FB Failed',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2460, 460]
      },

      // === MERGE + COLLECT ===
      {
        parameters: {
          mode: 'append',
          options: {}
        },
        id: 'node-merge',
        name: 'Merge IG+FB',
        type: 'n8n-nodes-base.merge',
        typeVersion: 3,
        position: [2700, 200]
      },
      {
        parameters: { jsCode: collectResultsCode },
        id: 'node-collect',
        name: 'Collect Results',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2920, 200]
      },

      // === EMAIL NODES ===
      emailNode('node-send-result', 'Send Result Email', 3140, 200),
      emailNode('node-send-skip', 'Send Skip Email', 1100, 560),
      emailNode('node-send-dup', 'Send Duplicate Email', 1560, 600),
      emailNode('node-send-dry', 'Send Dry Run Email', 1560, 800),
      emailNode('node-send-error', 'Send Error Email', 1560, 960),

      // === EMAIL PREP NODES (skip, dup, dry, error) ===
      {
        parameters: { jsCode: prepareSkipCode },
        id: 'node-prep-skip',
        name: 'Prepare Skip Email',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [880, 560]
      },
      {
        parameters: { jsCode: prepareDuplicateCode },
        id: 'node-prep-dup',
        name: 'Prepare Duplicate Email',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1320, 1000]
      },
      {
        parameters: { jsCode: prepareDryRunCode },
        id: 'node-prep-dry',
        name: 'Prepare Dry Run Email',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1320, 1200]
      },
      {
        parameters: { jsCode: prepareErrorCode },
        id: 'node-prep-error',
        name: 'Prepare Error Email',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1320, 1400]
      }
    ],

    connections: {
      // Trigger → Calendar → Find → Has Piece?
      'Schedule 12:15 ART': { main: [[conn('Get Calendar')]] },
      'Get Calendar': { main: [[conn('Find Today Piece')]] },
      'Find Today Piece': { main: [[conn('Has Piece?')]] },

      // Has Piece? → true: Get Pieces / false: Skip Email
      'Has Piece?': {
        main: [
          [conn('Get Pieces JSON')],   // true
          [conn('Prepare Skip Email')]  // false
        ]
      },

      // Pieces → Prepare → Action routing
      'Get Pieces JSON': { main: [[conn('Prepare Publish Data')]] },
      'Prepare Publish Data': { main: [[conn('IF_ActionPublish')]] },

      'IF_ActionPublish': {
        main: [
          [conn('Pre-warm Image')],       // true → publish
          [conn('IF_ActionDuplicate')]     // false → check next
        ]
      },

      'IF_ActionDuplicate': {
        main: [
          [conn('Prepare Duplicate Email')],  // true
          [conn('IF_ActionDryRun')]            // false
        ]
      },

      'IF_ActionDryRun': {
        main: [
          [conn('Prepare Dry Run Email')],  // true
          [conn('Prepare Error Email')]     // false → catch-all
        ]
      },

      // Pre-warm → fans out to BOTH platform checks (parallel)
      'Pre-warm Image': {
        main: [[
          conn('Need IG?'),
          conn('Need FB?')
        ]]
      },

      // Platform routing
      'Need IG?': {
        main: [
          [conn('IG Create Container')],  // true → publish IG
          [conn('Set IG Skipped')]         // false → already done
        ]
      },
      'Need FB?': {
        main: [
          [conn('FB Create Unpublished Photo')],  // true → publish FB
          [conn('Set FB Skipped')]                 // false → already done
        ]
      },
      'Set IG Skipped': { main: [[conn('Merge IG+FB', 0)]] },
      'Set FB Skipped': { main: [[conn('Merge IG+FB', 1)]] },

      // IG Branch
      'IG Create Container': {
        main: [
          [conn('Wait 8s')],          // output 0 = success
          [conn('Set IG Failed')]     // output 1 = error (after 3 retries)
        ]
      },
      'Wait 8s': { main: [[conn('IG Publish')]] },
      'IG Publish': {
        main: [
          [conn('Set IG Result')],   // output 0 = success
          [conn('Set IG Failed')]    // output 1 = error
        ]
      },
      'Set IG Result': { main: [[conn('Merge IG+FB', 0)]] },
      'Set IG Failed': { main: [[conn('Merge IG+FB', 0)]] },

      // FB Branch
      'FB Create Unpublished Photo': {
        main: [
          [conn('FB Publish Post')],   // output 0 = success
          [conn('Set FB Failed')]      // output 1 = error (after 3 retries)
        ]
      },
      'FB Publish Post': {
        main: [
          [conn('Set FB Result')],   // output 0 = success
          [conn('Set FB Failed')]    // output 1 = error
        ]
      },
      'Set FB Result': { main: [[conn('Merge IG+FB', 1)]] },
      'Set FB Failed': { main: [[conn('Merge IG+FB', 1)]] },

      // Merge → Collect → Email
      'Merge IG+FB': { main: [[conn('Collect Results')]] },
      'Collect Results': { main: [[conn('Send Result Email')]] },

      // Secondary email chains
      'Prepare Skip Email': { main: [[conn('Send Skip Email')]] },
      'Prepare Duplicate Email': { main: [[conn('Send Duplicate Email')]] },
      'Prepare Dry Run Email': { main: [[conn('Send Dry Run Email')]] },
      'Prepare Error Email': { main: [[conn('Send Error Email')]] }
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

  console.log('\n1) Construyendo workflow v7.2 JSON');
  const wf = buildWorkflow();
  console.log('   Nodos: ' + wf.nodes.length);
  console.log('   Cron: 15 12 * * * (12:15 ART diario)');
  console.log('   Anti-dup: por plataforma (IG/FB independientes)');

  console.log('\n2) POST workflow a n8n (inactivo)');
  const result = await createWorkflow(apiKey, wf);
  console.log('   ID: ' + result.id);
  console.log('   Nombre: ' + result.name);
  console.log('   Nodos: ' + result.nodes.length);
  console.log('   Active: ' + result.active);

  // Backup local
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = 'n8n-publish-v7.2-' + ts + '.json';
  fs.writeFileSync(backupFile, JSON.stringify(result, null, 2));
  console.log('   Backup: ' + backupFile);

  console.log('\n=== WORKFLOW v7.2 CREADO ===');
  console.log('ID: ' + result.id);
  console.log('Nombre: ' + result.name);
  console.log('Estado: INACTIVO (no activa automaticamente)');
  console.log('');
  console.log('PROXIMOS PASOS:');
  console.log('  1. Desactivar v7.1: F1ZehnAJcyPv6Zs2');
  console.log('  2. Activar este workflow + ciclo cron');
  console.log('  3. Testear manualmente en n8n UI');
  console.log('');
  console.log('DONE');
}

main().catch(function(e) { console.error('CREATION FAILED:', e.message); process.exit(1); });
