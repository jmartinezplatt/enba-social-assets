"""Build an HTML preview of all photos with classification UI."""
import sys, os
from pathlib import Path
from PIL import Image, ImageOps
import json

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
OUT_DIR = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("C:/Users/josea/enba-social-assets")
THUMB_DIR = OUT_DIR / "thumbs-preview"
THUMB_DIR.mkdir(exist_ok=True)

CATEGORIES = [
    "travesias-navegacion",
    "escuela-aprendizaje",
    "grupos-experiencia",
    "veleros-broker",
    "servicios",
    "buenos-aires-paisaje",
    "destinos",
    "descartada"
]

# Find all JPG/JPEG photos (including converted HEIC)
photos = sorted(
    list(SRC.rglob("*.jpg")) + list(SRC.rglob("*.JPG")) +
    list(SRC.rglob("*.jpeg")) + list(SRC.rglob("*.JPEG"))
)

# Filter out duplicates (HEIC converted to jpg might duplicate existing)
seen = set()
unique = []
for p in photos:
    key = p.stem.upper()
    if key not in seen:
        seen.add(key)
        unique.append(p)

photos = unique
print(f"Found {len(photos)} unique photos")

# Generate thumbnails
print("Generating thumbnails...")
thumb_data = []
for i, p in enumerate(photos):
    thumb_name = f"{i:04d}.jpg"
    thumb_path = THUMB_DIR / thumb_name

    if not thumb_path.exists():
        try:
            img = Image.open(p)
            img = ImageOps.exif_transpose(img)
            img.thumbnail((300, 300), Image.LANCZOS)
            img.save(thumb_path, "JPEG", quality=75)
        except Exception as e:
            if i < 5:
                print(f"  ERROR {p.name}: {e}")
            continue

    thumb_data.append({
        "idx": i,
        "thumb": f"thumbs-preview/{thumb_name}",
        "original": str(p).replace("\\", "/"),
        "name": p.name
    })

    if (i + 1) % 100 == 0:
        print(f"  {i+1}/{len(photos)} thumbnails...")

print(f"Generated {len(thumb_data)} thumbnails")

# Build HTML
categories_json = json.dumps(CATEGORIES)
photos_json = json.dumps(thumb_data)

html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>ENBA — Clasificar fotos Google Photos ({len(thumb_data)} fotos)</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: #111; color: #fff; font-family: system-ui; }}
.header {{ position: sticky; top: 0; background: #111; padding: 1rem 2rem; border-bottom: 1px solid #333; z-index: 100; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }}
.header h1 {{ font-size: 1.2rem; margin-right: 1rem; }}
.filter-btn {{ padding: 6px 14px; border: 1px solid #555; border-radius: 20px; background: none; color: #aaa; cursor: pointer; font-size: 0.8rem; }}
.filter-btn:hover {{ border-color: #4fc3f7; color: #4fc3f7; }}
.filter-btn.active {{ background: #4fc3f7; color: #111; border-color: #4fc3f7; }}
.stats {{ color: #888; font-size: 0.85rem; margin-left: auto; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 4px; padding: 1rem; }}
.card {{ position: relative; cursor: pointer; border: 2px solid transparent; border-radius: 4px; overflow: hidden; transition: border-color 0.2s; }}
.card:hover {{ border-color: #4fc3f7; }}
.card img {{ width: 100%; height: 200px; object-fit: cover; display: block; }}
.card .label {{ position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); padding: 4px 8px; font-size: 0.7rem; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
.card .cat-badge {{ position: absolute; top: 4px; right: 4px; padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: bold; }}
.cat-travesias-navegacion {{ background: #1976d2; color: #fff; }}
.cat-escuela-aprendizaje {{ background: #388e3c; color: #fff; }}
.cat-grupos-experiencia {{ background: #f57c00; color: #fff; }}
.cat-veleros-broker {{ background: #7b1fa2; color: #fff; }}
.cat-servicios {{ background: #455a64; color: #fff; }}
.cat-buenos-aires-paisaje {{ background: #00838f; color: #fff; }}
.cat-destinos {{ background: #c62828; color: #fff; }}
.cat-descartada {{ background: #333; color: #666; }}
.card.classified-descartada {{ opacity: 0.3; }}
.modal {{ display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 200; justify-content: center; align-items: center; flex-direction: column; }}
.modal.open {{ display: flex; }}
.modal img {{ max-width: 90vw; max-height: 70vh; object-fit: contain; }}
.modal .actions {{ display: flex; gap: 8px; margin-top: 1rem; flex-wrap: wrap; justify-content: center; }}
.modal .cat-btn {{ padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: bold; }}
.modal .close-btn {{ position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; }}
.modal .nav-btn {{ position: absolute; top: 50%%; transform: translateY(-50%%); background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 2rem; cursor: pointer; padding: 1rem; }}
.modal .nav-btn.prev {{ left: 1rem; }}
.modal .nav-btn.next {{ right: 1rem; }}
.export-bar {{ position: fixed; bottom: 0; left: 0; right: 0; background: #222; padding: 1rem 2rem; border-top: 1px solid #333; z-index: 100; display: flex; gap: 1rem; align-items: center; }}
.export-btn {{ padding: 8px 20px; background: #4fc3f7; color: #111; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }}
</style>
</head>
<body>

<div class="header">
  <h1>Clasificar fotos ({len(thumb_data)})</h1>
  <button class="filter-btn active" onclick="filterAll()">Todas</button>
  <button class="filter-btn" onclick="filterUnclassified()">Sin clasificar</button>
  <button class="filter-btn" onclick="filterCat('travesias-navegacion')">Travesías</button>
  <button class="filter-btn" onclick="filterCat('escuela-aprendizaje')">Escuela</button>
  <button class="filter-btn" onclick="filterCat('grupos-experiencia')">Grupos</button>
  <button class="filter-btn" onclick="filterCat('veleros-broker')">Veleros</button>
  <button class="filter-btn" onclick="filterCat('servicios')">Servicios</button>
  <button class="filter-btn" onclick="filterCat('buenos-aires-paisaje')">BA/Paisaje</button>
  <button class="filter-btn" onclick="filterCat('destinos')">Destinos</button>
  <button class="filter-btn" onclick="filterCat('descartada')">Descartadas</button>
  <div class="stats" id="stats"></div>
</div>

<div class="grid" id="grid"></div>

<div class="modal" id="modal">
  <button class="close-btn" onclick="closeModal()">&times;</button>
  <button class="nav-btn prev" onclick="navPrev()">&#8249;</button>
  <button class="nav-btn next" onclick="navNext()">&#8250;</button>
  <img id="modal-img" src="">
  <div class="actions" id="modal-actions"></div>
</div>

<div class="export-bar">
  <button class="export-btn" onclick="exportClassification()">Exportar clasificación (JSON)</button>
  <button class="export-btn" onclick="importClassification()">Importar</button>
  <input type="file" id="import-input" style="display:none" accept=".json">
  <div class="stats" id="export-stats"></div>
</div>

<script>
const photos = {photos_json};
const categories = {categories_json};
const classifications = JSON.parse(localStorage.getItem('enba-photo-class') || '{{}}');
let currentFilter = 'all';
let currentIdx = -1;
let filteredPhotos = [...photos];

const catColors = {{
  'travesias-navegacion': '#1976d2',
  'escuela-aprendizaje': '#388e3c',
  'grupos-experiencia': '#f57c00',
  'veleros-broker': '#7b1fa2',
  'servicios': '#455a64',
  'buenos-aires-paisaje': '#00838f',
  'destinos': '#c62828',
  'descartada': '#333'
}};

const catLabels = {{
  'travesias-navegacion': 'Travesías',
  'escuela-aprendizaje': 'Escuela',
  'grupos-experiencia': 'Grupos',
  'veleros-broker': 'Veleros',
  'servicios': 'Servicios',
  'buenos-aires-paisaje': 'BA/Paisaje',
  'destinos': 'Destinos',
  'descartada': 'Descartada'
}};

function save() {{
  localStorage.setItem('enba-photo-class', JSON.stringify(classifications));
  updateStats();
}}

function updateStats() {{
  const total = photos.length;
  const classified = Object.keys(classifications).length;
  const byCat = {{}};
  for (const cat of Object.values(classifications)) {{
    byCat[cat] = (byCat[cat] || 0) + 1;
  }}
  document.getElementById('stats').textContent = `${{classified}}/${{total}} clasificadas`;

  let exportStats = Object.entries(byCat).map(([c, n]) => `${{catLabels[c] || c}}: ${{n}}`).join(' | ');
  document.getElementById('export-stats').textContent = exportStats;
}}

function renderGrid() {{
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  filteredPhotos = photos.filter(p => {{
    if (currentFilter === 'all') return true;
    if (currentFilter === 'unclassified') return !classifications[p.idx];
    return classifications[p.idx] === currentFilter;
  }});

  for (const p of filteredPhotos) {{
    const card = document.createElement('div');
    card.className = 'card';
    const cat = classifications[p.idx];
    if (cat) card.classList.add('classified-' + cat);

    card.innerHTML = `<img src="${{p.thumb}}" loading="lazy"><div class="label">${{p.name}}</div>`;
    if (cat) {{
      card.innerHTML += `<div class="cat-badge cat-${{cat}}">${{catLabels[cat] || cat}}</div>`;
    }}
    card.onclick = () => openModal(p.idx);
    grid.appendChild(card);
  }}
  updateStats();
}}

function openModal(idx) {{
  currentIdx = idx;
  const p = photos[idx];
  const modal = document.getElementById('modal');
  document.getElementById('modal-img').src = p.thumb;

  const actions = document.getElementById('modal-actions');
  actions.innerHTML = '';
  for (const cat of categories) {{
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.style.background = catColors[cat];
    btn.style.color = cat === 'descartada' ? '#888' : '#fff';
    btn.textContent = catLabels[cat] || cat;
    if (classifications[idx] === cat) {{
      btn.style.outline = '3px solid #fff';
    }}
    btn.onclick = () => {{
      classifications[idx] = cat;
      save();
      navNext();
    }};
    actions.appendChild(btn);
  }}

  modal.classList.add('open');
}}

function closeModal() {{
  document.getElementById('modal').classList.remove('open');
  renderGrid();
}}

function navNext() {{
  const currentInFiltered = filteredPhotos.findIndex(p => p.idx === currentIdx);
  if (currentInFiltered < filteredPhotos.length - 1) {{
    openModal(filteredPhotos[currentInFiltered + 1].idx);
  }} else {{
    closeModal();
  }}
}}

function navPrev() {{
  const currentInFiltered = filteredPhotos.findIndex(p => p.idx === currentIdx);
  if (currentInFiltered > 0) {{
    openModal(filteredPhotos[currentInFiltered - 1].idx);
  }}
}}

function filterAll() {{ currentFilter = 'all'; renderGrid(); updateFilterBtns('all'); }}
function filterUnclassified() {{ currentFilter = 'unclassified'; renderGrid(); updateFilterBtns('unclassified'); }}
function filterCat(cat) {{ currentFilter = cat; renderGrid(); updateFilterBtns(cat); }}

function updateFilterBtns(active) {{
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}}

function exportClassification() {{
  const data = {{ classifications, photos: photos.map(p => ({{ idx: p.idx, name: p.name, original: p.original, category: classifications[p.idx] || null }})) }};
  const blob = new Blob([JSON.stringify(data, null, 2)], {{ type: 'application/json' }});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'enba-photo-classification.json';
  a.click();
}}

function importClassification() {{
  document.getElementById('import-input').click();
}}

document.getElementById('import-input').addEventListener('change', (e) => {{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {{
    try {{
      const data = JSON.parse(ev.target.result);
      Object.assign(classifications, data.classifications || {{}});
      save();
      renderGrid();
    }} catch (err) {{
      alert('Error importando: ' + err.message);
    }}
  }};
  reader.readAsText(file);
}});

document.addEventListener('keydown', (e) => {{
  if (!document.getElementById('modal').classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') navNext();
  if (e.key === 'ArrowLeft') navPrev();
  const num = parseInt(e.key);
  if (num >= 1 && num <= categories.length) {{
    classifications[currentIdx] = categories[num - 1];
    save();
    navNext();
  }}
}});

renderGrid();
</script>
</body>
</html>""";

html_path = OUT_DIR / "preview-clasificar-fotos.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print(f"HTML written to {html_path}")
