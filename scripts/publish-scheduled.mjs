// DEPRECATED — Pipeline vivo es n8n (workflow oiFVJdy5VGlXtlMp).
// Este script usa endpoint FB viejo (POST /photos default) que Meta rechaza desde 2024/2025.
// No correr sin actualizar al patrón 2 pasos. Ver CLAUDE.md sección "Patrón FB publish (v6)".

import { readFileSync, writeFileSync, existsSync } from 'fs';

const env = readFileSync('.env', 'utf8');
const get = key => env.split(`${key}=`)[1]?.split('\n')[0]?.trim();

const TOKEN = get('META_PAGE_ACCESS_TOKEN');
const PAGE_ID = get('META_PAGE_ID');
const IG_ID = get('META_IG_USER_ID');
const DOMAIN = 'https://social-assets.espacionautico.com.ar';

if (!TOKEN || !PAGE_ID || !IG_ID) {
  console.error('ERROR: Faltan variables en .env');
  process.exit(1);
}

// Load calendar
const calendar = JSON.parse(readFileSync('campaigns/calendario-integrado.json', 'utf8'));

// Find today's piece
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
const todayStr = `${dd}/${mm}/${yyyy}`;

const todayEntries = calendar.calendario.filter(e => e.fecha === todayStr && e.tipo === 'pieza');

if (todayEntries.length === 0) {
  console.log(`No hay piezas programadas para hoy (${todayStr})`);
  process.exit(0);
}

// Load pieces
const pieces = JSON.parse(readFileSync('campaigns/lanzamiento-15-abr-2026/campaign.pieces.json', 'utf8'));

for (const entry of todayEntries) {
  const piece = pieces.find(p => p.id === entry.id);
  if (!piece) {
    console.error(`ERROR: ${entry.id} no encontrado en campaign.pieces.json`);
    continue;
  }

  // Find manifest and staging URL
  const num = piece.id.replace('piece-', '');
  const [d, m, y] = piece.date.split('/');
  const dateStr = `${y}-${m}-${d}`;
  const verticalSlug = piece.vertical.toLowerCase().replace(/í/g, 'i');
  const manifestId = `sm-${dateStr}-ig-feed-${verticalSlug}-${num}`;
  const manifestPath = `manifests/${manifestId}.json`;

  if (!existsSync(manifestPath)) {
    console.error(`ERROR: Manifest no encontrado: ${manifestPath}`);
    continue;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  if (manifest.meta?.publish_id) {
    console.log(`SKIP ${piece.id}: ya publicado`);
    continue;
  }

  const imageUrl = manifest.staging_urls[0];
  console.log(`\n=== PUBLICANDO ${piece.id} (${piece.date}) ===`);
  console.log(`Vertical: ${piece.vertical} | Headline: ${piece.headline}`);
  console.log(`Imagen: ${imageUrl}`);

  // --- INSTAGRAM ---
  console.log('\n--- Instagram ---');
  const containerRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ID}/media`, {
    method: 'POST',
    body: new URLSearchParams({ image_url: imageUrl, caption: piece.captionIg, access_token: TOKEN }),
  });
  const container = await containerRes.json();

  if (container.error) {
    console.error('IG container FAIL:', container.error.message);
    continue;
  }
  console.log('Container:', container.id);

  let ready = false;
  for (let i = 0; i < 30; i++) {
    const s = await (await fetch(`https://graph.facebook.com/v21.0/${container.id}?fields=status_code&access_token=${TOKEN}`)).json();
    if (s.status_code === 'FINISHED') { ready = true; break; }
    if (s.status_code === 'ERROR') { console.error('IG ERROR:', s); break; }
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!ready) { console.error('IG timeout'); continue; }

  const igPub = await (await fetch(`https://graph.facebook.com/v21.0/${IG_ID}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({ creation_id: container.id, access_token: TOKEN }),
  })).json();

  if (igPub.error) { console.error('IG publish FAIL:', igPub.error.message); continue; }
  console.log('IG PUBLICADO:', igPub.id);

  // --- FACEBOOK ---
  console.log('\n--- Facebook ---');
  const fbPub = await (await fetch(`https://graph.facebook.com/v21.0/${PAGE_ID}/photos`, {
    method: 'POST',
    body: new URLSearchParams({ message: piece.captionFb, url: imageUrl, access_token: TOKEN }),
  })).json();

  if (fbPub.error) { console.error('FB publish FAIL:', fbPub.error.message); continue; }
  console.log('FB PUBLICADO:', fbPub.id);

  // Update manifest
  manifest.status = 'published';
  manifest.meta.publish_id = { ig: igPub.id, fb: fbPub.id };
  manifest.meta.published_at = new Date().toISOString();
  manifest.updated_at = new Date().toISOString();
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n=== ${piece.id} PUBLICADO OK ===`);
}
