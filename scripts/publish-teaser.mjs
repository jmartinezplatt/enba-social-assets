// DEPRECATED — Pipeline vivo es n8n (workflow oiFVJdy5VGlXtlMp).
// Este script usa endpoint FB viejo (POST /photos default) que Meta rechaza desde 2024/2025.
// No correr sin actualizar al patrón 2 pasos. Ver CLAUDE.md sección "Patrón FB publish (v6)".

import { readFileSync, writeFileSync } from 'fs';

const env = readFileSync('.env', 'utf8');
const get = key => env.split(`${key}=`)[1]?.split('\n')[0]?.trim();

const TOKEN = get('META_PAGE_ACCESS_TOKEN');
const PAGE_ID = get('META_PAGE_ID');
const IG_ID = get('META_IG_USER_ID');

const piece = JSON.parse(readFileSync('campaigns/teaser-frankenstein/pieza-final.json', 'utf8'));
const imageUrl = 'https://social-assets.espacionautico.com.ar/campaigns/teaser-frankenstein/slide-frankenstein.png';

console.log('=== PUBLICANDO TEASER FRANKENSTEIN ===');
console.log('Headline:', piece.headline.replace(/\n/g, ' '));
console.log('Imagen:', imageUrl);

// --- INSTAGRAM ---
console.log('\n--- Instagram ---');

const containerRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ID}/media`, {
  method: 'POST',
  body: new URLSearchParams({
    image_url: imageUrl,
    caption: piece.captionIg,
    access_token: TOKEN,
  }),
});
const container = await containerRes.json();

if (container.error) {
  console.error('IG container FAIL:', container.error.message);
  process.exit(1);
}
console.log('Container creado:', container.id);

let ready = false;
for (let i = 0; i < 30; i++) {
  const statusRes = await fetch(`https://graph.facebook.com/v21.0/${container.id}?fields=status_code&access_token=${TOKEN}`);
  const status = await statusRes.json();
  if (status.status_code === 'FINISHED') { ready = true; break; }
  if (status.status_code === 'ERROR') {
    console.error('IG container ERROR:', status);
    process.exit(1);
  }
  console.log('  Procesando...', status.status_code || 'IN_PROGRESS');
  await new Promise(r => setTimeout(r, 2000));
}

if (!ready) {
  console.error('IG container timeout');
  process.exit(1);
}

const publishRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ID}/media_publish`, {
  method: 'POST',
  body: new URLSearchParams({
    creation_id: container.id,
    access_token: TOKEN,
  }),
});
const igPublish = await publishRes.json();

if (igPublish.error) {
  console.error('IG publish FAIL:', igPublish.error.message);
  process.exit(1);
}
console.log('IG PUBLICADO:', igPublish.id);

// --- FACEBOOK ---
console.log('\n--- Facebook ---');

const fbRes = await fetch(`https://graph.facebook.com/v21.0/${PAGE_ID}/photos`, {
  method: 'POST',
  body: new URLSearchParams({
    message: piece.captionFb,
    url: imageUrl,
    access_token: TOKEN,
  }),
});
const fbPublish = await fbRes.json();

if (fbPublish.error) {
  console.error('FB publish FAIL:', fbPublish.error.message);
  process.exit(1);
}
console.log('FB PUBLICADO:', fbPublish.id);

// --- RESULTADO ---
console.log('\n=== TEASER PUBLICADO ===');
console.log('IG post ID:', igPublish.id);
console.log('FB post ID:', fbPublish.id);
console.log('Timestamp:', new Date().toISOString());

// Guardar resultado
piece.published = {
  ig_id: igPublish.id,
  fb_id: fbPublish.id,
  published_at: new Date().toISOString()
};
writeFileSync('campaigns/teaser-frankenstein/pieza-final.json', JSON.stringify(piece, null, 2));
console.log('Manifest actualizado con IDs de publicación');
