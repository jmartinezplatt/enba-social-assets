import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join } from 'path';

const pieces = JSON.parse(readFileSync('campaigns/lanzamiento-15-abr-2026/campaign.pieces.json', 'utf8'));
const outputDir = 'campaigns/lanzamiento-15-abr-2026/output';
const outputFiles = readdirSync(outputDir);
const domain = 'https://social-assets.espacionautico.com.ar';

const verticalMap = {
  'Marca': 'MARCA',
  'Travesias': 'TRAVESIAS',
  'Escuela': 'ESCUELA',
  'Broker': 'BROKER',
  'Servicios': 'SERVICIOS',
  'Prueba': 'MARCA',
  'Backstage': 'MARCA',
  'Cierre': 'MARCA'
};

pieces.forEach(piece => {
  // Parse date DD/MM/YYYY
  const [d, m, y] = piece.date.split('/');
  const dateStr = `${y}-${m}-${d}`;
  const monthDir = m;

  // Find the rendered PNG
  const num = piece.id.replace('piece-', '');
  const png = outputFiles.find(f => f.startsWith(num + '-'));
  if (!png) {
    console.log(`SKIP ${piece.id}: PNG not found`);
    return;
  }

  // Build staging ID
  const verticalSlug = piece.vertical.toLowerCase().replace(/í/g, 'i');
  const id = `sm-${dateStr}-ig-feed-${verticalSlug}-${num}`;

  // Create staging dir
  const stagingPath = `staging/2026/${monthDir}/${id}`;
  mkdirSync(stagingPath, { recursive: true });

  // Copy PNG
  copyFileSync(join(outputDir, png), join(stagingPath, png));

  // Create manifest
  const manifest = {
    id,
    status: 'staging',
    channel: 'IG+FB',
    format: 'FEED_IMAGE',
    vertical: verticalMap[piece.vertical] || 'MARCA',
    theme: piece.headline,
    piece_id: piece.id,
    date: piece.date,
    assets_repo_path: stagingPath + '/',
    staging_urls: [
      `${domain}/${stagingPath}/${png}`
    ],
    published_urls: [],
    manifest_url: `${domain}/manifests/${id}.json`,
    source: {
      campaign: 'lanzamiento-15-abr-2026',
      image: piece.image
    },
    meta: {
      publish_id: null,
      published_at: null
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  writeFileSync(`manifests/${id}.json`, JSON.stringify(manifest, null, 2));
  console.log(`STAGED ${piece.id} => ${stagingPath}/${png}`);
});

console.log('\nDone. All pieces staged.');
