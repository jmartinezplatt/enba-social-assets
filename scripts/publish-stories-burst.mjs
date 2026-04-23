#!/usr/bin/env node
// publish-stories-burst.mjs
// Publica 1 story por hora durante 24 horas usando las 24 stories de Fase 1 (highlights)
// Output: stories publicadas en IG, email de status después de cada una
//
// Uso:
//   node scripts/publish-stories-burst.mjs            — publicación real
//   node scripts/publish-stories-burst.mjs --dry-run  — valida URLs sin publicar
//   node scripts/publish-stories-burst.mjs --start-from 5  — reanuda desde story #5
//
// Notas:
//   - image_url SIEMPRE usa pages.dev (el custom domain bloquea el crawler de IG)
//   - Token: META_ACCESS_TOKEN (Page Access Token) — NO usar META_ADS_USER_TOKEN
//   - Dry-run verifica que cada URL responde 200 antes del primer disparo real

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot   = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'campaigns', 'plan-crecimiento-10k', 'highlights', 'stories', 'burst-manifest.json');
const logsDir    = path.join(repoRoot, 'logs');

const BASE_URL   = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/';
const INTERVAL_MS = 60 * 60 * 1000; // 1 hora
const WEBHOOK_EMAIL_URL = 'https://espacionautico.app.n8n.cloud/webhook/enba-email-notifier';

// Leer tokens desde Windows User scope
function getEnvVar(name) {
  try {
    const val = execSync(
      `powershell -Command "[System.Environment]::GetEnvironmentVariable('${name}', 'User')"`,
      { encoding: 'utf8' }
    ).trim();
    return val || null;
  } catch { return null; }
}

// Email via n8n Email Notifier webhook (workflow "ENBA - Email Notifier", ID yYnyrB7UI52Syf9x)
async function sendEmail(subject, body) {
  try {
    const response = await fetch(WEBHOOK_EMAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body })
    });
    if (response.ok) {
      console.log(`  [email] Enviado: ${subject}`);
    } else {
      console.log(`  [email] Error ${response.status}: ${await response.text()}`);
    }
  } catch (e) {
    console.log(`  [email] Falló: ${e.message}`);
  }
}

async function verifyUrl(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return r.ok;
  } catch { return false; }
}

async function publishStory(igUserId, accessToken, imageUrl, dryRun) {
  if (dryRun) {
    console.log(`    [dry-run] payload: image_url=${imageUrl}, media_type=STORIES`);
    return { id: 'dry-run-container-id' };
  }

  // Paso 1: crear container
  const containerRes = await fetch(
    `https://graph.facebook.com/v22.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        media_type: 'STORIES',
        access_token: accessToken
      })
    }
  );
  const container = await containerRes.json();
  if (!container.id) {
    throw new Error(`Error creando container: ${JSON.stringify(container)}`);
  }

  // Paso 2: publicar
  await new Promise(r => setTimeout(r, 5000)); // wait 5s para que Meta procese
  const publishRes = await fetch(
    `https://graph.facebook.com/v22.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken
      })
    }
  );
  const published = await publishRes.json();
  if (!published.id) {
    throw new Error(`Error publicando: ${JSON.stringify(published)}`);
  }
  return published;
}

async function run() {
  const args = process.argv.slice(2);
  const dryRun    = args.includes('--dry-run');
  const startFrom = parseInt(args.find(a => a.startsWith('--start-from'))?.split('=')[1] || '1');

  console.log(`\n── ENBA Stories Burst ──`);
  console.log(`Modo: ${dryRun ? 'DRY-RUN (sin publicar)' : 'PUBLICACIÓN REAL'}`);
  if (startFrom > 1) console.log(`Reanudando desde story #${startFrom}`);
  console.log('');

  // Leer tokens
  const ACCESS_TOKEN = getEnvVar('META_ACCESS_TOKEN');
  const IG_USER_ID   = getEnvVar('META_IG_BUSINESS_ACCOUNT_ID');

  if (!dryRun) {
    if (!ACCESS_TOKEN) throw new Error('META_ACCESS_TOKEN no encontrado en Windows User scope');
    if (!IG_USER_ID)   throw new Error('META_IG_BUSINESS_ACCOUNT_ID no encontrado en Windows User scope');
    console.log('  Tokens: CARGADOS');
  }

  // Leer manifest
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const stories  = manifest.stories.filter(s => s.seq >= startFrom);
  console.log(`  Stories a publicar: ${stories.length} (de #${startFrom} a #${manifest.stories.length})`);
  console.log(`  Intervalo: ${manifest.interval_minutes} min (${manifest.interval_minutes / 60}h)`);
  console.log('');

  // Dry-run: verificar URLs primero
  if (dryRun) {
    console.log('── Verificando URLs en Cloudflare Pages ──');
    let allOk = true;
    for (const s of stories) {
      const url = BASE_URL + s.file;
      const ok  = await verifyUrl(url);
      console.log(`  ${ok ? '✓' : '✗'} #${s.seq} ${s.file} → ${ok ? 'OK' : 'NO ACCESIBLE'}`);
      if (!ok) allOk = false;
    }
    if (!allOk) {
      console.log('\n  ⚠ Hay URLs no accesibles. Verificar que Cloudflare Pages desplegó los archivos.');
      console.log('  Tip: hacer commit+push de las stories y esperar el deploy antes de correr el burst.');
      process.exit(1);
    }
    console.log(`\n  ✓ ${stories.length} URLs accesibles. El burst está listo para ejecutarse.\n`);
    return;
  }

  // Preparar log
  await fs.mkdir(logsDir, { recursive: true });
  const logFile = path.join(logsDir, `stories-burst-${Date.now()}.log`);
  const log = async (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    await fs.appendFile(logFile, line + '\n');
  };

  await log(`Burst iniciado. ${stories.length} stories, intervalo ${manifest.interval_minutes} min`);

  let ok = 0, errors = 0;

  for (let i = 0; i < stories.length; i++) {
    const s    = stories[i];
    const url  = BASE_URL + s.file;
    const isLast = i === stories.length - 1;

    await log(`Publicando #${s.seq}/${manifest.stories.length}: ${s.file} (${s.highlight})`);

    try {
      const result = await publishStory(IG_USER_ID, ACCESS_TOKEN, url, false);
      await log(`  ✓ Story publicada. IG ID: ${result.id}`);
      ok++;

      const subject = `ENBA Stories: ${s.file.replace('.png', '')} publicada ✓`;
      const nextInfo = isLast
        ? 'Última story del burst. ¡Ciclo Fase 1 completado!'
        : `Próxima: #${stories[i + 1].seq} "${stories[i + 1].file}" en ${manifest.interval_minutes} min`;
      const body = [
        `Story publicada correctamente.`,
        ``,
        `Seq: #${s.seq} / ${manifest.stories.length}`,
        `Archivo: ${s.file}`,
        `Highlight: ${s.highlight}`,
        `Caption: ${s.caption}`,
        `IG Story ID: ${result.id}`,
        `Timestamp: ${new Date().toISOString()}`,
        ``,
        nextInfo
      ].join('\n');
      await sendEmail(subject, body);

    } catch (e) {
      await log(`  ✗ ERROR: ${e.message}`);
      errors++;
      const subject = `[ERROR] ENBA Stories: ${s.file.replace('.png', '')}`;
      const body = [
        `Error al publicar story #${s.seq}.`,
        ``,
        `Archivo: ${s.file}`,
        `Error: ${e.message}`,
        ``,
        `Para reanudar: node scripts/publish-stories-burst.mjs --start-from=${s.seq}`
      ].join('\n');
      await sendEmail(subject, body);
    }

    // Esperar el intervalo (excepto después de la última)
    if (!isLast) {
      await log(`  Esperando ${manifest.interval_minutes} min hasta la próxima...`);
      await new Promise(r => setTimeout(r, INTERVAL_MS));
    }
  }

  await log(`\nBurst finalizado. OK: ${ok} | Errores: ${errors}`);
  console.log(`\nLog guardado en: ${logFile}`);
}

run().catch(e => { console.error(e); process.exit(1); });
