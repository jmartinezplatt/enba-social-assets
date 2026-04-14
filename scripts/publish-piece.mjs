import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load env
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

// Get piece ID from command line
const pieceId = process.argv[2];
if (!pieceId) {
  console.error('Uso: node scripts/publish-piece.mjs piece-01');
  process.exit(1);
}

// Load campaign data
const pieces = JSON.parse(readFileSync('campaigns/lanzamiento-15-abr-2026/campaign.pieces.json', 'utf8'));
const piece = pieces.find(p => p.id === pieceId);
if (!piece) {
  console.error(`ERROR: ${pieceId} no encontrado en campaign.pieces.json`);
  process.exit(1);
}

// Find manifest
const num = pieceId.replace('piece-', '');
const [d, m, y] = piece.date.split('/');
const dateStr = `${y}-${m}-${d}`;
const verticalSlug = piece.vertical.toLowerCase().replace(/í/g, 'i');
const manifestId = `sm-${dateStr}-ig-feed-${verticalSlug}-${num}`;
const manifestPath = `manifests/${manifestId}.json`;

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch {
  console.error(`ERROR: Manifest no encontrado: ${manifestPath}`);
  process.exit(1);
}

if (manifest.meta.publish_id) {
  console.error(`ERROR: ${pieceId} ya fue publicado (publish_id: ${manifest.meta.publish_id})`);
  process.exit(1);
}

const imageUrl = manifest.staging_urls[0];
console.log(`\n=== PUBLICANDO ${pieceId} ===`);
console.log(`Fecha: ${piece.date}`);
console.log(`Vertical: ${piece.vertical}`);
console.log(`Headline: ${piece.headline}`);
console.log(`Imagen: ${imageUrl}`);

// --- INSTAGRAM ---
console.log('\n--- Instagram ---');

// Step 1: Create media container
const containerParams = new URLSearchParams({
  image_url: imageUrl,
  caption: piece.captionIg,
  access_token: TOKEN,
});

const containerRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ID}/media`, {
  method: 'POST',
  body: containerParams,
});
const container = await containerRes.json();

if (container.error) {
  console.error('IG container FAIL:', container.error.message);
  process.exit(1);
}
console.log(`Container creado: ${container.id}`);

// Step 2: Wait for container to be ready
let ready = false;
for (let i = 0; i < 30; i++) {
  const statusRes = await fetch(`https://graph.facebook.com/v21.0/${container.id}?fields=status_code&access_token=${TOKEN}`);
  const status = await statusRes.json();
  if (status.status_code === 'FINISHED') { ready = true; break; }
  if (status.status_code === 'ERROR') {
    console.error('IG container ERROR:', status);
    process.exit(1);
  }
  await new Promise(r => setTimeout(r, 2000));
}

if (!ready) {
  console.error('IG container timeout — no se completó en 60s');
  process.exit(1);
}

// Step 3: Publish
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
console.log(`IG publicado: ${igPublish.id}`);

// --- FACEBOOK ---
console.log('\n--- Facebook ---');

const fbParams = new URLSearchParams({
  message: piece.captionFb,
  url: imageUrl,
  access_token: TOKEN,
});

const fbRes = await fetch(`https://graph.facebook.com/v21.0/${PAGE_ID}/photos`, {
  method: 'POST',
  body: fbParams,
});
const fbPublish = await fbRes.json();

if (fbPublish.error) {
  console.error('FB publish FAIL:', fbPublish.error.message);
  process.exit(1);
}
console.log(`FB publicado: ${fbPublish.id}`);

// --- UPDATE MANIFEST ---
manifest.status = 'published';
manifest.meta.publish_id = { ig: igPublish.id, fb: fbPublish.id };
manifest.meta.published_at = new Date().toISOString();
manifest.updated_at = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\nManifest actualizado: ${manifestPath}`);

console.log(`\n=== ${pieceId} PUBLICADO ✓ ===`);
