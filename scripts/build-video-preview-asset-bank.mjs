#!/usr/bin/env node
/**
 * build-video-preview-asset-bank.mjs
 * Genera preview HTML interactivo de videos del asset-bank.
 * Extrae thumbnails con ffmpeg, filtra por duración mínima, genera HTML con selección.
 *
 * Uso: node scripts/build-video-preview-asset-bank.mjs
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ASSET_BANK = "C:/Users/josea/enba-redes/asset-bank";
const THUMB_DIR = "C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/video-thumbs-v2";
const OUTPUT_HTML = "C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/preview-video-clips-v2.html";
const MIN_DURATION = 0; // sin filtro de duración — mostrar todos los videos

const SUBFOLDERS = [
  "travesias-navegacion",
  "grupos-experiencia",
  "buenos-aires-paisaje",
  "destinos",
  "escuela-aprendizaje",
  "servicios",
  "veleros-broker",
];

const VIDEO_EXTS = [".mp4", ".mov", ".MP4", ".MOV"];

if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

function getDuration(filepath) {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filepath}"`,
      { encoding: "utf-8", timeout: 10000 }
    ).trim();
    return parseFloat(out);
  } catch {
    return 0;
  }
}

function extractThumb(filepath, thumbPath) {
  try {
    execSync(
      `ffmpeg -y -ss 2 -i "${filepath}" -frames:v 1 -update 1 -vf "scale=320:320:force_original_aspect_ratio=increase,crop=320:320" -q:v 3 "${thumbPath}"`,
      { timeout: 15000, stdio: "pipe" }
    );
    return true;
  } catch {
    return false;
  }
}

function getCreationDate(filepath) {
  try {
    const out = execSync(
      `ffprobe -v quiet -print_format json -show_format "${filepath}"`,
      { encoding: "utf-8", timeout: 10000 }
    );
    const json = JSON.parse(out);
    const tags = json.format?.tags || {};
    const raw = tags["com.apple.quicktime.creationdate"] || tags["creation_time"] || null;
    if (!raw) return null;
    return new Date(raw);
  } catch {
    return null;
  }
}

// Scan videos
const clips = [];

for (const folder of SUBFOLDERS) {
  const dir = path.join(ASSET_BANK, folder);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => VIDEO_EXTS.includes(path.extname(f)));
  console.log(`${folder}: ${files.length} videos`);

  for (const file of files) {
    const filepath = path.join(dir, file).replace(/\\/g, "/");
    const name = path.basename(file, path.extname(file));
    const thumbName = `${folder}__${name}.jpg`;
    const thumbPath = path.join(THUMB_DIR, thumbName).replace(/\\/g, "/");

    let dur = 0;
    if (!fs.existsSync(thumbPath)) {
      dur = getDuration(filepath);
      if (dur < MIN_DURATION) continue;
      process.stdout.write(`  thumb: ${file} (${dur.toFixed(1)}s)... `);
      const ok = extractThumb(filepath, thumbPath);
      console.log(ok ? "OK" : "FAILED");
    } else {
      dur = getDuration(filepath);
      if (dur < MIN_DURATION) continue;
    }

    const createdAt = getCreationDate(filepath);

    clips.push({
      name,
      file,
      folder,
      duration: Math.round(dur),
      thumb: `video-thumbs-v2/${thumbName}`,
      createdAt,
      createdAtStr: createdAt ? createdAt.toISOString().slice(0, 10) : "sin fecha",
    });
  }
}

// Sort by folder then createdAt desc (más reciente primero), sin fecha al final
clips.sort((a, b) => {
  if (a.folder !== b.folder) return SUBFOLDERS.indexOf(a.folder) - SUBFOLDERS.indexOf(b.folder);
  if (!a.createdAt && !b.createdAt) return 0;
  if (!a.createdAt) return 1;
  if (!b.createdAt) return -1;
  return b.createdAt - a.createdAt;
});

console.log(`\nTotal clips: ${clips.length}`);

// Group by folder
const byFolder = {};
for (const clip of clips) {
  if (!byFolder[clip.folder]) byFolder[clip.folder] = [];
  byFolder[clip.folder].push(clip);
}

// Build HTML
const folderNames = {
  "travesias-navegacion": "Travesías / Navegación",
  "grupos-experiencia": "Grupos / Experiencia",
  "buenos-aires-paisaje": "Buenos Aires / Paisaje",
  "destinos": "Destinos",
  "escuela-aprendizaje": "Escuela / Aprendizaje",
  "servicios": "Servicios",
  "veleros-broker": "Veleros / Broker",
};

let sections = "";
for (const folder of SUBFOLDERS) {
  const list = byFolder[folder];
  if (!list || list.length === 0) continue;
  sections += `<h2>${folderNames[folder] || folder} <span class="count">(${list.length} clips)</span></h2>\n<div class="grid">\n`;
  for (const c of list) {
    const videoPath = `../../asset-bank/${c.folder}/${c.file}`;
    sections += `<div class="card" data-name="${c.name}" data-folder="${c.folder}" data-duration="${c.duration}" data-file="${videoPath}" onclick="openPlayer(this)">`;
    sections += `<div class="thumb-wrap"><img src="${c.thumb}" loading="lazy" alt="${c.name}"><div class="play-icon">&#9654;</div></div>`;
    sections += `<div class="label"><span class="folder">${c.folder}/</span>${c.file} &mdash; ${c.duration}s &mdash; <span class="date">${c.createdAtStr}</span></div>`;
    sections += `<button class="sel-btn" onclick="event.stopPropagation();toggle(this.parentElement)" title="Seleccionar">+</button>`;
    sections += `</div>\n`;
  }
  sections += `</div>\n`;
}

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Video clips asset-bank — ${new Date().toLocaleDateString("es-AR")}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #111; color: #eee; padding: 20px; }
  h1 { text-align: center; margin-bottom: 8px; font-size: 1.8rem; }
  .subtitle { text-align: center; color: #888; margin-bottom: 24px; font-size: 0.9rem; }
  h2 { margin: 24px 0 12px; padding: 8px 12px; background: #1a1a2e; border-left: 4px solid #0ff; font-size: 1.2rem; }
  .count { color: #888; font-weight: normal; font-size: 0.85rem; margin-left: 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; padding: 0 8px; }
  .card { position: relative; cursor: pointer; border: 3px solid transparent; border-radius: 6px; overflow: hidden; background: #1a1a1a; transition: border-color 0.15s, transform 0.1s; }
  .card:hover { transform: scale(1.03); border-color: #555; }
  .card.selected { border-color: #00e676; box-shadow: 0 0 12px rgba(0,230,118,0.3); }
  .thumb-wrap { position: relative; }
  .card img { width: 100%; height: 140px; object-fit: cover; display: block; }
  .play-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 2.5rem; color: rgba(255,255,255,0.85); text-shadow: 0 0 12px rgba(0,0,0,0.8); opacity: 0; transition: opacity 0.15s; pointer-events: none; }
  .card:hover .play-icon { opacity: 1; }
  .card .label { padding: 4px 6px; font-size: 0.65rem; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card .label .folder { color: #0ff; }
  .card .label .date { color: #f90; }
  .sel-btn { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid #555; border-radius: 4px; width: 22px; height: 22px; font-size: 14px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.15s; }
  .card:hover .sel-btn { opacity: 1; }
  .card.selected .sel-btn { opacity: 1; background: #00e676; color: #000; border-color: #00e676; content: '✓'; }
  .toolbar { position: sticky; top: 0; z-index: 100; background: #111; padding: 12px 0; display: flex; justify-content: center; gap: 12px; align-items: center; border-bottom: 1px solid #333; margin-bottom: 16px; }
  .toolbar button { padding: 10px 20px; border: none; border-radius: 6px; font-size: 0.95rem; cursor: pointer; font-weight: 600; }
  #btnExport { background: #00e676; color: #000; }
  #btnExport:hover { background: #00c853; }
  #btnClear { background: #333; color: #eee; }
  #btnClear:hover { background: #444; }
  #selCount { font-size: 1rem; color: #00e676; min-width: 120px; text-align: center; }
  /* Modal player */
  #modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 999; align-items: center; justify-content: center; flex-direction: column; gap: 12px; }
  #modal.open { display: flex; }
  #modalVideo { max-height: 85vh; max-width: 90vw; border-radius: 8px; background: #000; }
  #modalLabel { color: #aaa; font-size: 0.85rem; text-align: center; }
  #modalClose { position: fixed; top: 16px; right: 20px; font-size: 2rem; color: #fff; cursor: pointer; line-height: 1; background: none; border: none; }
</style>
</head>
<body>
<h1>Video clips — asset-bank</h1>
<p class="subtitle">${clips.length} clips. Generado ${new Date().toLocaleString("es-AR")}. Click = reproducir · Boton + = seleccionar para exportar.</p>
<div class="toolbar">
  <button id="btnExport" onclick="exportSelection()">Exportar selección (JSON)</button>
  <span id="selCount">0 seleccionados</span>
  <button id="btnClear" onclick="clearSelection()">Limpiar</button>
</div>
${sections}

<!-- Modal player -->
<div id="modal" onclick="closePlayer(event)">
  <button id="modalClose" onclick="closePlayer()">&#x2715;</button>
  <video id="modalVideo" controls autoplay></video>
  <div id="modalLabel"></div>
</div>

<script>
const selected = new Set();

function openPlayer(card) {
  const video = document.getElementById('modalVideo');
  const modal = document.getElementById('modal');
  const label = document.getElementById('modalLabel');
  video.src = card.dataset.file;
  label.textContent = card.dataset.folder + '/' + card.dataset.name + ' — ' + card.dataset.duration + 's';
  modal.classList.add('open');
  video.play();
}

function closePlayer(e) {
  if (e && e.target !== document.getElementById('modal') && e.target !== document.getElementById('modalClose')) return;
  const video = document.getElementById('modalVideo');
  video.pause();
  video.src = '';
  document.getElementById('modal').classList.remove('open');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePlayer({target: document.getElementById('modal')}); });

function toggle(card) {
  const key = card.dataset.folder + '/' + card.dataset.name;
  if (selected.has(key)) { selected.delete(key); card.classList.remove('selected'); }
  else { selected.add(key); card.classList.add('selected'); }
  document.getElementById('selCount').textContent = selected.size + ' seleccionados';
}

function clearSelection() {
  selected.clear();
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
  document.getElementById('selCount').textContent = '0 seleccionados';
}

function exportSelection() {
  const result = [];
  document.querySelectorAll('.card.selected').forEach(card => {
    result.push({ name: card.dataset.name, folder: card.dataset.folder, duration: parseInt(card.dataset.duration) });
  });
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'clips-seleccionados.json'; a.click();
}
</script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_HTML, html, "utf-8");
console.log(`\nHTML generado: ${OUTPUT_HTML}`);
console.log(`Thumbnails en: ${THUMB_DIR}`);
