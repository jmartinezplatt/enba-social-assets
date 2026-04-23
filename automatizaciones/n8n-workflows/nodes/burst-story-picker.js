// burst-story-picker.js
// Code node para el workflow n8n "ENBA - Stories Burst"
// Calcula qué story publicar basándose en tiempo transcurrido desde story #1
//
// Story #1 fue publicada el 2026-04-23T17:10:46.026Z
// Cada story = 60 minutos de intervalo
// El burst local ya publicó #1, #2, #3 — este workflow arranca desde #4

const MANIFEST_URL = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/burst-manifest.json';
const STORY_1_PUBLISHED_AT = new Date('2026-04-23T17:10:46.026Z');
const INTERVAL_MS = 60 * 60 * 1000; // 60 minutos
const FIRST_PENDING_SEQ = 4; // #1, #2, #3 ya publicadas por burst local

const now = new Date();
const elapsed = now - STORY_1_PUBLISHED_AT;
const storyIndex = Math.floor(elapsed / INTERVAL_MS) + 1; // 1-based

// Fuera de rango
if (storyIndex < FIRST_PENDING_SEQ) {
  return [{ json: {
    skip: true,
    reason: `Story #${storyIndex} ya fue publicada por el burst local.`,
    storyIndex
  }}];
}

if (storyIndex > 24) {
  return [{ json: {
    skip: true,
    reason: 'Burst completado. Las 24 stories fueron publicadas.',
    storyIndex
  }}];
}

// Cargar manifest
const response = await fetch(MANIFEST_URL);
if (!response.ok) throw new Error(`No se pudo cargar manifest: ${response.status}`);
const manifest = await response.json();

const story = manifest.stories.find(s => s.seq === storyIndex);
if (!story) throw new Error(`No se encontró story con seq ${storyIndex} en el manifest`);

const imageUrl = `https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/${story.file}`;

return [{ json: {
  skip: false,
  seq: story.seq,
  file: story.file,
  highlight: story.highlight,
  caption: story.caption,
  imageUrl,
  progress: `#${story.seq}/24`,
  scheduledAt: new Date(STORY_1_PUBLISHED_AT.getTime() + (storyIndex - 1) * INTERVAL_MS).toISOString(),
  actualAt: now.toISOString()
}}];
