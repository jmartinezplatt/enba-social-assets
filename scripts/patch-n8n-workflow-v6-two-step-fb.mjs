#!/usr/bin/env node
// Patch v6: FB publish en 2 pasos (photos published=false → feed attached_media)
// Motivo: Meta removió publicación visible directa en POST /{page}/photos (default published=true)
// devolviendo error "publish_actions deprecated". El patrón canónico post-2024 es:
//   1) POST /{page}/photos?published=false  → obtiene media_fbid
//   2) POST /{page}/feed?message=...&attached_media=[{media_fbid}]  → publica en feed
// Confirmado con test real exitoso (post creado + borrado, ventana 23s).
//
// Cambios respecto a v5:
//  - Renombra "FB Publish" → "FB Create Unpublished Photo" (agrega &published=false, quita message)
//  - Agrega nodo nuevo "FB Publish Post" (POST /feed con attached_media)
//  - Reconecta: IG Publish → FB Create Unpublished Photo → FB Publish Post → Prepare Email
//  - Ajusta Prepare Email para leer id del nodo nuevo

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const WF_ID = 'oiFVJdy5VGlXtlMp';
const BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1';

function getApiKey() {
  const out = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`).toString().trim();
  if (!out) throw new Error('N8N_API_KEY no cargada');
  return out;
}

async function fetchWorkflow(apiKey) {
  const res = await fetch(`${BASE_URL}/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': apiKey }
  });
  if (!res.ok) throw new Error(`GET failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function putWorkflow(apiKey, wf) {
  // n8n API PUT schema no acepta propiedades adicionales en settings (availableInMCP, binaryMode, callerPolicy)
  // Whitelistear solo las soportadas por el schema oficial
  const allowedSettingKeys = ['saveExecutionProgress', 'saveManualExecutions', 'saveDataErrorExecution',
    'saveDataSuccessExecution', 'executionTimeout', 'errorWorkflow', 'timezone', 'executionOrder'];
  const sanitizedSettings = {};
  const src = wf.settings || {};
  for (const k of allowedSettingKeys) if (k in src) sanitizedSettings[k] = src[k];
  if (!('executionOrder' in sanitizedSettings)) sanitizedSettings.executionOrder = 'v1';

  const body = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: sanitizedSettings
  };
  const res = await fetch(`${BASE_URL}/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`PUT failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function mutate(wf) {
  // 1. Encontrar el nodo "FB Publish" y transformarlo en "FB Create Unpublished Photo"
  const fbIdx = wf.nodes.findIndex(n => n.name === 'FB Publish');
  if (fbIdx === -1) throw new Error('Nodo "FB Publish" no encontrado en el workflow');
  const origFb = wf.nodes[fbIdx];
  const credentials = origFb.credentials;
  const pos = origFb.position;

  const createPhotoNode = {
    parameters: {
      method: 'POST',
      url: "=https://graph.facebook.com/v21.0/{{ $('Prepare Publish Data').first().json.pageId }}/photos?url={{ encodeURIComponent($('Prepare Publish Data').first().json.imageUrl) }}&published=false",
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      options: {}
    },
    id: 'node-fb-create-unpublished-photo',
    name: 'FB Create Unpublished Photo',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: pos,
    credentials
  };
  wf.nodes[fbIdx] = createPhotoNode;

  // 2. Agregar nuevo nodo "FB Publish Post" (POST /feed con attached_media)
  const publishPostNode = {
    parameters: {
      method: 'POST',
      url: "=https://graph.facebook.com/v21.0/{{ $('Prepare Publish Data').first().json.pageId }}/feed?message={{ encodeURIComponent($('Prepare Publish Data').first().json.captionFb) }}&attached_media={{ encodeURIComponent('[{\"media_fbid\":\"' + $('FB Create Unpublished Photo').first().json.id + '\"}]') }}",
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      options: {}
    },
    id: 'node-fb-publish-post',
    name: 'FB Publish Post',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [pos[0] + 220, pos[1]],
    credentials
  };
  wf.nodes.push(publishPostNode);

  // 3. Reconectar: la vieja conexión "FB Publish" → "Prepare Email" ahora pasa por Publish Post
  //    - IG Publish → FB Create Unpublished Photo  (ya apunta ahí porque renombramos el mismo nodo)
  //    - FB Create Unpublished Photo → FB Publish Post
  //    - FB Publish Post → Prepare Email
  const conns = wf.connections;
  if (conns['FB Publish']) {
    // Tras renombrado el IG Publish sigue apuntando al nodo anterior con id node-fb-create-... pero
    // n8n usa nombres en connections. Transferimos la key.
    conns['FB Create Unpublished Photo'] = {
      main: [[{ node: 'FB Publish Post', type: 'main', index: 0 }]]
    };
    delete conns['FB Publish'];
  } else if (conns['FB Create Unpublished Photo']) {
    // Ya existía (idempotencia)
    conns['FB Create Unpublished Photo'] = {
      main: [[{ node: 'FB Publish Post', type: 'main', index: 0 }]]
    };
  }
  conns['FB Publish Post'] = {
    main: [[{ node: 'Prepare Email', type: 'main', index: 0 }]]
  };

  // 4. Actualizar la referencia en IG Publish → ahora debe apuntar a FB Create Unpublished Photo
  if (conns['IG Publish']) {
    conns['IG Publish'] = {
      main: [[{ node: 'FB Create Unpublished Photo', type: 'main', index: 0 }]]
    };
  }

  // 5. Ajustar Prepare Email: $('FB Publish').first().json.id → $('FB Publish Post').first().json.id
  const prepEmail = wf.nodes.find(n => n.name === 'Prepare Email');
  if (!prepEmail) throw new Error('Nodo Prepare Email no encontrado');
  const newCode = prepEmail.parameters.jsCode.replaceAll("$('FB Publish')", "$('FB Publish Post')");
  if (newCode === prepEmail.parameters.jsCode) {
    console.log('(warn) Prepare Email jsCode sin referencias a FB Publish — revisar manualmente');
  }
  prepEmail.parameters.jsCode = newCode;

  return wf;
}

async function main() {
  const apiKey = getApiKey();
  console.log('N8N_API_KEY: CARGADA');

  console.log('\n1) GET workflow actual');
  const current = await fetchWorkflow(apiKey);
  console.log(`   nodes=${current.nodes.length} active=${current.active} updatedAt=${current.updatedAt}`);

  // Backup pre-patch adicional (por si el otro se sobreescribió)
  const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('Z', 'Z');
  fs.writeFileSync(`n8n-backup-v5-pre-v6patch-inline-${ts}.json`, JSON.stringify(current, null, 2));
  console.log(`   backup pre-patch: n8n-backup-v5-pre-v6patch-inline-${ts}.json`);

  console.log('\n2) Aplicando mutaciones en memoria');
  const patched = mutate(JSON.parse(JSON.stringify(current)));
  console.log(`   nodes nuevos count=${patched.nodes.length}`);
  console.log(`   FB Publish existe: ${patched.nodes.some(n => n.name === 'FB Publish')}`);
  console.log(`   FB Create Unpublished Photo existe: ${patched.nodes.some(n => n.name === 'FB Create Unpublished Photo')}`);
  console.log(`   FB Publish Post existe: ${patched.nodes.some(n => n.name === 'FB Publish Post')}`);
  console.log(`   IG Publish → ${JSON.stringify(patched.connections['IG Publish'])}`);
  console.log(`   FB Create Unpublished Photo → ${JSON.stringify(patched.connections['FB Create Unpublished Photo'])}`);
  console.log(`   FB Publish Post → ${JSON.stringify(patched.connections['FB Publish Post'])}`);

  console.log('\n3) PUT al workflow');
  const result = await putWorkflow(apiKey, patched);
  console.log(`   OK. nodes=${result.nodes.length} active=${result.active} updatedAt=${result.updatedAt}`);

  // Backup post-patch
  fs.writeFileSync(`n8n-backup-v6-${ts}.json`, JSON.stringify(result, null, 2));
  console.log(`   backup post-patch: n8n-backup-v6-${ts}.json`);

  console.log('\n4) Verificación estructura final');
  const prepEmail = result.nodes.find(n => n.name === 'Prepare Email');
  console.log(`   Prepare Email usa $('FB Publish Post'): ${prepEmail.parameters.jsCode.includes("$('FB Publish Post')")}`);
  console.log(`   Prepare Email aún usa $('FB Publish'): ${/\$\('FB Publish'\)/.test(prepEmail.parameters.jsCode)}`);
  console.log(`   active: ${result.active} (debe ser false)`);
  console.log('\nDONE');
}

main().catch(e => { console.error('PATCH FAILED:', e.message); process.exit(1); });
