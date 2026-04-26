// pick-next-story-v2.js
// Manifest llega del nodo anterior "Get Manifest" (HTTP Request)
// — no usa fetch() para compatibilidad con el sandbox de n8n cloud
// Slot y cycleStartDate vienen del nodo "Set Slot" referenciado por nombre

const manifest = $input.first().json;
const slot = $('Set Slot').first().json.slot;
const cycleStartDate = $('Set Slot').first().json.cycleStartDate || '2026-04-26';

const BASE_IMG_URL = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/';

// Calcular día del ciclo en ART (UTC-3)
const now = new Date();
const artOffset = -3 * 60;
const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
const artNow = new Date(utcMs + artOffset * 60000);
const artToday = new Date(artNow.getFullYear(), artNow.getMonth(), artNow.getDate());

const [sy, sm, sd] = cycleStartDate.split('-').map(Number);
const startDate = new Date(sy, sm - 1, sd);
const diffMs = artToday - startDate;
const dayOfCycle = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

if (dayOfCycle < 1 || dayOfCycle > 10) {
  return [{ json: {
    skip: true,
    reason: dayOfCycle < 1
      ? `Ciclo aún no iniciado. Día calculado: ${dayOfCycle}`
      : `Ciclo completado (día ${dayOfCycle}/10). No hay más stories programadas.`,
    dayOfCycle, slot, timestamp: artNow.toISOString()
  }}];
}

const story = manifest.stories.find(s => s.day === dayOfCycle && s.slot === slot);

if (!story) {
  return [{ json: {
    skip: true,
    reason: `No se encontró story para día ${dayOfCycle} slot ${slot}`,
    dayOfCycle, slot, timestamp: artNow.toISOString()
  }}];
}

return [{ json: {
  skip: false,
  seq: story.seq,
  day: dayOfCycle,
  slot: story.slot,
  time: story.time,
  category: story.category,
  caption: story.caption,
  file: story.file,
  imageUrl: BASE_IMG_URL + story.file,
  cycleProgress: `Día ${dayOfCycle}/10`,
  timestamp: artNow.toISOString()
}}];
