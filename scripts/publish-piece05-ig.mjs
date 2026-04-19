#!/usr/bin/env node
// Publica piece-05 en IG manualmente usando GitHub raw URL
// (Cloudflare Pages bloqueada por crawler IG de Meta)

import { execSync } from 'node:child_process';

const IG_USER_ID = '17841443139761422';
const IMAGE_URL = 'https://raw.githubusercontent.com/jmartinezplatt/enba-social-assets/main/staging/2026/04/sm-2026-04-19-ig-feed-marca-05/05-19-04-2026-marca.png';

const CAPTION = `Travesías, escuela, broker y servicios. Cuatro frentes, una misma forma de trabajar el río.

Criterio, presencia y acompañamiento real. Eso no cambia, elijas lo que elijas.

👉 Entrá a espacionautico.com.ar y elegí por dónde empezar según lo que hoy te interese más.

#EspacioNautico #ENBA #NavegaElRioDeLaPlata #VelerosBuenosAires #RioDeLaPlata #SailingArgentina #EscuelaNautica #BrokerNautico #PlanesBuenosAires #ExperienciasBuenosAires #SalidaDistinta`;

function getToken() {
  const out = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ACCESS_TOKEN','User')"`).toString().trim();
  if (!out) throw new Error('META_ACCESS_TOKEN no cargada');
  return out;
}

async function main() {
  const token = getToken();
  console.log('META_ACCESS_TOKEN: CARGADA');

  // 1. Create container
  console.log('\n1) Creando IG container con GitHub URL...');
  const containerUrl = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`;
  const containerParams = new URLSearchParams({
    image_url: IMAGE_URL,
    caption: CAPTION,
    access_token: token
  });

  const containerRes = await fetch(containerUrl + '?' + containerParams.toString(), { method: 'POST' });
  const containerData = await containerRes.json();

  if (containerData.error) {
    throw new Error('Container failed: ' + JSON.stringify(containerData.error));
  }

  const containerId = containerData.id;
  console.log('   Container ID: ' + containerId);

  // 2. Wait for processing
  console.log('\n2) Esperando 10s para procesamiento...');
  await new Promise(r => setTimeout(r, 10000));

  // 3. Publish
  console.log('3) Publicando...');
  const publishUrl = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`;
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: token
  });

  const publishRes = await fetch(publishUrl + '?' + publishParams.toString(), { method: 'POST' });
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error('Publish failed: ' + JSON.stringify(publishData.error));
  }

  console.log('   Post ID: ' + publishData.id);
  console.log('\n=== PIECE-05 PUBLICADO EN IG ===');
  console.log('Post ID: ' + publishData.id);
  console.log('Ver: https://www.instagram.com/espacionauticobsas/');
}

main().catch(function(e) { console.error('FAILED:', e.message); process.exit(1); });
