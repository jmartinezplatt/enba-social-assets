// burst-story-picker-v2.js
// Manifest llega del nodo anterior "Get Manifest" (HTTP Request)
// — no usa fetch() para compatibilidad con el sandbox de n8n cloud

const STORY_1_PUBLISHED_AT = new Date('2026-04-23T17:10:46.026Z');
const INTERVAL_MS = 60 * 60 * 1000; // 60 minutos
const FIRST_PENDING_SEQ = 4; // #1, #2, #3 ya publicadas por burst local

const now = new Date();
const elapsed = now - STORY_1_PUBLISHED_AT;
const storyIndex = Math.floor(elapsed / INTERVAL_MS) + 1; // 1-based

// Fuera de rango — ya publicada
if (storyIndex < FIRST_PENDING_SEQ) {
  return [{ json: {
    skip: true,
    reason: `Story #${storyIndex} ya fue publicada por el burst local.`,
    storyIndex
  }}];
}

// Burst completado
if (storyIndex > 24) {
  return [{ json: {
    skip: true,
    reason: 'Burst completado. Las 24 stories fueron publicadas.',
    storyIndex
  }}];
}

// Manifest viene del nodo HTTP Request anterior — sin fetch
const manifest = $input.first().json;

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
