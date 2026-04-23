// pick-next-story.js
// Code node para el workflow n8n "ENBA - Stories 3x Diarias"
// Lee fase2-manifest.json desde Cloudflare Pages y determina qué story publicar
// según la fecha actual y el slot (manana / tarde / noche).
//
// Uso en n8n: este archivo se copia al Code node. Recibe como input el slot
// vía parámetro del workflow: {{ $json.slot }} ('manana' | 'tarde' | 'noche')
//
// Variables de entorno esperadas en el workflow (set via n8n workflow settings):
//   SLOT: 'manana' | 'tarde' | 'noche'  (definido por cada Schedule Trigger)
//   CYCLE_START_DATE: '2026-04-24'       (fecha de inicio del ciclo)

const MANIFEST_URL = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/fase2-manifest.json';
const BASE_IMG_URL = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/';

// Leer slot del input del nodo anterior (Schedule Trigger pasa parámetros via workflow)
const slot = $input.first().json.slot || 'manana';
const cycleStartDate = $input.first().json.cycleStartDate || '2026-04-24';

// Calcular día del ciclo (1-based)
const now = new Date();
// Usar fecha en ART (UTC-3)
const artOffset = -3 * 60;
const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
const artNow = new Date(utcMs + artOffset * 60000);
const artToday = new Date(artNow.getFullYear(), artNow.getMonth(), artNow.getDate());

const [sy, sm, sd] = cycleStartDate.split('-').map(Number);
const startDate = new Date(sy, sm - 1, sd);
const diffMs = artToday - startDate;
const dayOfCycle = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // 1-indexed

// Ciclo completado
if (dayOfCycle < 1 || dayOfCycle > 10) {
  return [{
    json: {
      skip: true,
      reason: dayOfCycle < 1
        ? `Ciclo aún no iniciado. Día calculado: ${dayOfCycle}`
        : `Ciclo completado (día ${dayOfCycle}/10). No hay más stories programadas.`,
      dayOfCycle,
      slot,
      timestamp: artNow.toISOString()
    }
  }];
}

// Fetch manifest
const response = await fetch(MANIFEST_URL);
if (!response.ok) {
  throw new Error(`No se pudo cargar el manifest: ${response.status} ${response.statusText}`);
}
const manifest = await response.json();

// Buscar la story que corresponde a este día y slot
const story = manifest.stories.find(s => s.day === dayOfCycle && s.slot === slot);

if (!story) {
  return [{
    json: {
      skip: true,
      reason: `No se encontró story para día ${dayOfCycle} slot ${slot}`,
      dayOfCycle,
      slot,
      timestamp: artNow.toISOString()
    }
  }];
}

const imageUrl = BASE_IMG_URL + story.file.replace('fase2/', 'fase2/');

return [{
  json: {
    skip: false,
    seq: story.seq,
    day: dayOfCycle,
    slot: story.slot,
    time: story.time,
    category: story.category,
    caption: story.caption,
    file: story.file,
    imageUrl,
    cycleProgress: `Día ${dayOfCycle}/10`,
    timestamp: artNow.toISOString()
  }
}];
