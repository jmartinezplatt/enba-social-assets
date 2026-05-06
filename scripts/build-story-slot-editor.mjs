import fs from 'node:fs';
import path from 'node:path';

const base = 'C:/Users/josea/enba-redes/asset-bank';
const folders = ['escuela-aprendizaje','grupos-experiencia','travesias-navegacion','buenos-aires-paisaje','destinos'];
const bankData = {};
for (const f of folders) {
  const dir = path.join(base, f);
  try { bankData[f] = fs.readdirSync(dir).filter(n => /\.(jpg|JPG)$/.test(n)).sort(); }
  catch(e) { bankData[f] = []; }
}

const slotMap = [
  { id:'f3-01-manana',day:1, slot:'manana',text:'¿Cómo se ve Buenos Aires desde el río?'},
  { id:'f3-02-noche', day:1, slot:'noche', text:'Hoy alguien lo vio por primera vez. Mañana podés ser vos.'},
  { id:'f3-03-manana',day:2, slot:'manana',text:'No hace falta saber nada. Cero.'},
  { id:'f3-04-noche', day:2, slot:'noche', text:'La primera vez siempre te cambia algo.'},
  { id:'f3-05-manana',day:3, slot:'manana',text:'Con tus amigos. Con tu pareja. El río recibe a todos.'},
  { id:'f3-06-noche', day:3, slot:'noche', text:'Algunas salidas se convierten en planes fijos.'},
  { id:'f3-07-manana',day:4, slot:'manana',text:'Salís. Navegás. Volvés distinto.'},
  { id:'f3-08-noche', day:4, slot:'noche', text:'Tres horas que se sienten como tres días.'},
  { id:'f3-09-manana',day:5, slot:'manana',text:'A cuatro horas de Buenos Aires. Sin subir a un avión.'},
  { id:'f3-10-noche', day:5, slot:'noche', text:'Hay una isla esperándote en el río.'},
  { id:'f3-11-manana',day:6, slot:'manana',text:'Empezás desde cero. Terminás con rumbo propio.'},
  { id:'f3-12-noche', day:6, slot:'noche', text:'La náutica no se aprende en un libro.'},
  { id:'f3-13-manana',day:7, slot:'manana',text:'El río no te pide CV. Solo ganas.'},
  { id:'f3-14-noche', day:7, slot:'noche', text:'Cada travesía suma tripulantes para la próxima.'},
  { id:'f3-15-manana',day:8, slot:'manana',text:'Costanera Norte, frente al Aeroparque. A 20 minutos de Palermo.'},
  { id:'f3-16-noche', day:8, slot:'noche', text:'Salís de la ciudad sin salir de la ciudad.'},
  { id:'f3-17-manana',day:9, slot:'manana',text:'El único paso que falta es el primero.'},
  { id:'f3-18-noche', day:9, slot:'noche', text:'El río está ahí. La pregunta es cuándo.'},
  { id:'f3-19-manana',day:10,slot:'manana',text:'Tu próxima salida empieza con un mensaje.'},
  { id:'f3-20-noche', day:10,slot:'noche', text:'Escribinos. Contamos los cupos con los dedos.'},
];

const initialFiles = [
  'escuela-aprendizaje/5FF3E0FE-6586-44BE-BB9F-FC3324E29155.jpg',
  'escuela-aprendizaje/647573CC-55EF-44BF-8736-86A0A3F811D5.jpg',
  'travesias-navegacion/1e3b0841-74c1-4d19-baa4-328dd67b57dc.jpg',
  'grupos-experiencia/32725459-084E-410C-9848-A339EB4722E7.jpg',
  'grupos-experiencia/79CB395F-9592-413C-B54A-BB5BE6AF53EC.jpg',
  'grupos-experiencia/FE3B5406-513A-4CE4-BF72-3BFD2617BD9A.jpg',
  'grupos-experiencia/307C5B1C-D0E6-49C6-8DB2-7EBD35CCA4A6.jpg',
  'grupos-experiencia/30001EE0-0172-491E-9597-D04045963192.jpg',
  'grupos-experiencia/540037DB-C252-4568-B3D7-F52E22BB9F82.jpg',
  'grupos-experiencia/IMG_1556.jpg',
  'escuela-aprendizaje/2A805BB8-51E8-43E2-BC71-019B5E72BBD7.jpg',
  'escuela-aprendizaje/366F1B75-E7D7-4CBF-B986-BDFBCBAD024A.jpg',
  'escuela-aprendizaje/3B79333A-4296-4AB7-A4B6-4FEE8D59FE89.jpg',
  'escuela-aprendizaje/65767E1B-67E8-4C19-9F26-29672ECAE618.jpg',
  'travesias-navegacion/0d66ea8a-47e5-4f5d-be7f-00eeed870d3d.jpg',
  'travesias-navegacion/0DEFD08C-E0F9-4EF6-B3B6-2EA35612E109.jpg',
  'travesias-navegacion/1ab2a95b-753a-45f5-818c-f8ed6e09f564.jpg',
  'travesias-navegacion/3D7FD09C-B786-4879-A28B-FBB0F213D53B.jpg',
  'buenos-aires-paisaje/635BFF82-D671-4C82-9E02-A0F84474388C.jpg',
  'buenos-aires-paisaje/47A8E97C-5138-495B-8A84-392FD9238B7F.jpg',
];

const bankJSON = JSON.stringify(bankData);
const slotJSON = JSON.stringify(slotMap);
const filesJSON = JSON.stringify(initialFiles);

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Fase 3 — Fotos por slot</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.toolbar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #161b22; border-bottom: 1px solid #21262d; position: sticky; top: 0; z-index: 10; }
.toolbar h1 { font-size: 0.95rem; font-weight: 600; flex: 1; }
.toolbar .hint { font-size: 0.7rem; color: #484f58; }
button { padding: 7px 18px; border: none; border-radius: 5px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
.btn-export { background: #238636; color: #fff; }
.btn-export:hover { background: #2ea043; }
.btn-reset { background: #21262d; color: #ccc; border: 1px solid #30363d; }
.btn-reset:hover { background: #30363d; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; max-width: 900px; margin: 0 auto; }

.card { background: #161b22; border: 2px solid #21262d; border-radius: 8px; overflow: hidden; transition: border-color 0.12s; }
.card.drag-over { border-color: #3fb950; background: #0a1a10; }

.card-header { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #1c2128; }
.badge { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 7px; border-radius: 3px; }
.badge.manana { background: #1a3a0a; color: #7ee787; }
.badge.noche  { background: #0d1f3c; color: #79c0ff; }
.day-label { font-size: 0.73rem; font-weight: 600; color: #8b949e; }

.photo-wrap { position: relative; height: 220px; background: #1c2128; overflow: hidden; }
.photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; cursor: grab; }
.photo-wrap img:active { cursor: grabbing; }

.pick-btn {
  position: absolute; top: 6px; right: 6px;
  width: 30px; height: 30px;
  background: rgba(0,0,0,0.72); border: 1.5px solid #484f58;
  border-radius: 50%; color: #ccc; font-size: 1.1rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  z-index: 2; transition: background 0.1s, border-color 0.1s;
}
.pick-btn:hover { background: rgba(88,166,255,0.9); border-color: #58a6ff; color: #fff; }

.drag-lbl { position: absolute; bottom: 5px; left: 6px; background: rgba(0,0,0,0.6); color: #666; font-size: 0.58rem; padding: 2px 5px; border-radius: 3px; pointer-events: none; }

.card-text { padding: 7px 10px; font-size: 0.68rem; color: #8b949e; line-height: 1.4; border-top: 1px solid #21262d; }
.card-fname { padding: 2px 10px 7px; font-size: 0.55rem; color: #383f47; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
</head>
<body>

<div class="toolbar">
  <h1>Fase 3 "Esto vivís" — 20 slots · Asigná fotos</h1>
  <span class="hint">⇄ arrastrá fotos entre cards · + para abrir explorador</span>
  <button class="btn-reset" onclick="resetAll()">Restablecer</button>
  <button class="btn-export" onclick="exportJSON()">Exportar JSON</button>
</div>

<div class="grid" id="grid"></div>

<input type="file" id="fileInput" accept="image/*" style="display:none">

<script>
const ASSET = 'file:///C:/Users/josea/enba-redes/asset-bank/';
const slotMap = ${slotJSON};
const bankData = ${bankJSON};
const initialFiles = ${filesJSON};

var files = [...initialFiles];
var localUrls = {};   // idx -> objectURL for files picked outside bank
var dragSrcIdx = null;
var pickerIdx = null;

// ── File picker ─────────────────────────────────────
document.getElementById('fileInput').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file || pickerIdx === null) return;
  var fname = file.name;
  // Try to match in bankData
  var matched = null;
  var fkeys = Object.keys(bankData);
  for (var k = 0; k < fkeys.length; k++) {
    if (bankData[fkeys[k]].indexOf(fname) !== -1) { matched = fkeys[k] + '/' + fname; break; }
  }
  if (matched) {
    delete localUrls[pickerIdx];
    files[pickerIdx] = matched;
  } else {
    localUrls[pickerIdx] = URL.createObjectURL(file);
    files[pickerIdx] = 'local/' + fname;
  }
  pickerIdx = null;
  render();
});

function openPicker(idx) {
  pickerIdx = idx;
  document.getElementById('fileInput').value = '';
  document.getElementById('fileInput').click();
}

// ── Render ───────────────────────────────────────────
function imgSrc(i) {
  return localUrls[i] ? localUrls[i] : ASSET + files[i];
}

function render() {
  var grid = document.getElementById('grid');
  grid.innerHTML = '';
  slotMap.forEach(function(slot, i) {
    var card = document.createElement('div');
    card.className = 'card';

    card.innerHTML =
      '<div class="card-header">' +
        '<span class="badge ' + slot.slot + '">' + (slot.slot === 'manana' ? 'Mañana' : 'Noche') + '</span>' +
        '<span class="day-label">Día ' + slot.day + '</span>' +
      '</div>' +
      '<div class="photo-wrap">' +
        '<img src="' + imgSrc(i) + '" alt="" onerror="this.style.opacity=.1">' +
        '<div class="drag-lbl">⇄ drag</div>' +
        '<button class="pick-btn" title="Elegir foto del explorador">+</button>' +
      '</div>' +
      '<div class="card-text">' + slot.text + '</div>' +
      '<div class="card-fname">' + files[i].split('/').pop() + '</div>';

    // Pick button
    card.querySelector('.pick-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      openPicker(i);
    });

    // Drag the photo
    var img = card.querySelector('img');
    img.draggable = true;
    img.addEventListener('dragstart', function(e) {
      dragSrcIdx = i;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(function() { img.style.opacity = '.2'; }, 0);
    });
    img.addEventListener('dragend', function() { img.style.opacity = '1'; dragSrcIdx = null; });

    // Drop target
    card.addEventListener('dragover', function(e) { e.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave', function() { card.classList.remove('drag-over'); });
    card.addEventListener('drop', function(e) {
      e.preventDefault(); card.classList.remove('drag-over');
      if (dragSrcIdx !== null && dragSrcIdx !== i) {
        var tmpF = files[dragSrcIdx]; files[dragSrcIdx] = files[i]; files[i] = tmpF;
        var tmpU = localUrls[dragSrcIdx]; localUrls[dragSrcIdx] = localUrls[i]; localUrls[i] = tmpU;
        if (!localUrls[dragSrcIdx]) delete localUrls[dragSrcIdx];
        if (!localUrls[i]) delete localUrls[i];
        render();
      }
    });

    grid.appendChild(card);
  });
}

function resetAll() {
  if (!confirm('¿Restablecer todas las fotos al estado inicial?')) return;
  files = [...initialFiles];
  localUrls = {};
  render();
}

function exportJSON() {
  var result = slotMap.map(function(s, i) {
    return { id: s.id, day: s.day, slot: s.slot, file: files[i], text: s.text };
  });
  var blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fase3-fotos-seleccionadas.json'; a.click();
}

render();
</script>
</body>
</html>`;

fs.writeFileSync('C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/preview-fase3-orden.html', html, 'utf8');
console.log(`OK — ${Math.round(html.length/1024)}KB`);
