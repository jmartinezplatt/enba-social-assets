"""Analyze videos: extract metadata + 1 frame thumbnail, build preview HTML."""
import sys, os, json, subprocess
from pathlib import Path

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
OUT_DIR = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("C:/Users/josea/enba-redes")
THUMB_DIR = OUT_DIR / "thumbs-videos"
THUMB_DIR.mkdir(exist_ok=True)

# Find all video files
videos = sorted(
    list(SRC.rglob("*.MP4")) + list(SRC.rglob("*.mp4")) +
    list(SRC.rglob("*.MOV")) + list(SRC.rglob("*.mov")) +
    list(SRC.rglob("*.MTS"))
)

# Deduplicate
seen = set()
unique = []
for v in videos:
    key = v.stem.upper()
    if key not in seen:
        seen.add(key)
        unique.append(v)
videos = unique
print(f"Found {len(videos)} unique videos")

video_data = []
errors = 0

for i, v in enumerate(videos):
    thumb_name = f"v{i:04d}.jpg"
    thumb_path = THUMB_DIR / thumb_name

    # Get metadata with ffprobe
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_format", "-show_streams", str(v)],
            capture_output=True, text=True, timeout=10
        )
        info = json.loads(probe.stdout)

        # Find video stream
        vstream = None
        for s in info.get("streams", []):
            if s.get("codec_type") == "video":
                vstream = s
                break

        if not vstream:
            errors += 1
            continue

        duration = float(info.get("format", {}).get("duration", 0))
        width = int(vstream.get("width", 0))
        height = int(vstream.get("height", 0))
        codec = vstream.get("codec_name", "unknown")
        size_mb = int(info.get("format", {}).get("size", 0)) / (1024*1024)

        # Extract frame at 1/3 of duration
        if not thumb_path.exists():
            seek = max(0.5, duration * 0.33)
            subprocess.run(
                ["ffmpeg", "-y", "-ss", str(seek), "-i", str(v),
                 "-vframes", "1", "-vf", "scale=300:-1",
                 "-q:v", "5", str(thumb_path)],
                capture_output=True, timeout=15
            )

        video_data.append({
            "idx": i,
            "thumb": f"thumbs-videos/{thumb_name}",
            "original": str(v).replace("\\", "/"),
            "name": v.name,
            "duration": round(duration, 1),
            "width": width,
            "height": height,
            "codec": codec,
            "size_mb": round(size_mb, 1)
        })

    except Exception as e:
        errors += 1
        if errors <= 5:
            print(f"  ERROR {v.name}: {e}")

    if (i + 1) % 50 == 0:
        print(f"  {i+1}/{len(videos)} processed...")

print(f"\nDone: {len(video_data)} videos analyzed, {errors} errors")

# Stats
durations = [v["duration"] for v in video_data]
total_dur = sum(durations)
print(f"Total duration: {total_dur/60:.0f} min")
print(f"Avg duration: {sum(durations)/len(durations):.1f}s")
print(f"Shortest: {min(durations):.1f}s, Longest: {max(durations):.1f}s")

# Resolutions
resolutions = {}
for v in video_data:
    r = f"{v['width']}x{v['height']}"
    resolutions[r] = resolutions.get(r, 0) + 1
print("\nResolutions:")
for r, c in sorted(resolutions.items(), key=lambda x: -x[1]):
    print(f"  {r}: {c}")

# Build HTML
CATEGORIES = [
    "reel-material", "travesias-navegacion", "escuela-aprendizaje",
    "grupos-experiencia", "veleros-broker", "servicios",
    "buenos-aires-paisaje", "destinos", "descartada"
]

categories_json = json.dumps(CATEGORIES)
videos_json = json.dumps(video_data)

html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>ENBA — Clasificar videos ({len(video_data)})</title>
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ background: #111; color: #fff; font-family: system-ui; }}
.header {{ position: sticky; top: 0; background: #111; padding: 1rem 2rem; border-bottom: 1px solid #333; z-index: 100; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }}
.header h1 {{ font-size: 1.2rem; margin-right: 1rem; }}
.filter-btn {{ padding: 6px 14px; border: 1px solid #555; border-radius: 20px; background: none; color: #aaa; cursor: pointer; font-size: 0.8rem; }}
.filter-btn:hover {{ border-color: #4fc3f7; color: #4fc3f7; }}
.filter-btn.active {{ background: #4fc3f7; color: #111; border-color: #4fc3f7; }}
.stats {{ color: #888; font-size: 0.85rem; margin-left: auto; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 6px; padding: 1rem; }}
.card {{ position: relative; cursor: pointer; border: 2px solid transparent; border-radius: 4px; overflow: hidden; transition: border-color 0.2s; }}
.card:hover {{ border-color: #4fc3f7; }}
.card img {{ width: 100%; height: 180px; object-fit: cover; display: block; }}
.card .label {{ position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 4px 8px; font-size: 0.7rem; color: #ccc; }}
.card .label .dur {{ color: #4fc3f7; font-weight: bold; }}
.card .label .res {{ color: #888; }}
.card .play-icon {{ position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 2rem; color: rgba(255,255,255,0.7); pointer-events: none; }}
.card .cat-badge {{ position: absolute; top: 4px; right: 4px; padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: bold; }}
.cat-reel-material {{ background: #e91e63; color: #fff; }}
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
.modal img {{ max-width: 90vw; max-height: 55vh; object-fit: contain; }}
.modal .info {{ color: #aaa; margin: 0.5rem 0; font-size: 0.85rem; }}
.modal .actions {{ display: flex; gap: 8px; margin-top: 1rem; flex-wrap: wrap; justify-content: center; }}
.modal .cat-btn {{ padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: bold; }}
.modal .close-btn {{ position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #fff; font-size: 2rem; cursor: pointer; }}
.modal .nav-btn {{ position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 2rem; cursor: pointer; padding: 1rem; }}
.modal .nav-btn.prev {{ left: 1rem; }}
.modal .nav-btn.next {{ right: 1rem; }}
.export-bar {{ position: fixed; bottom: 0; left: 0; right: 0; background: #222; padding: 1rem 2rem; border-top: 1px solid #333; z-index: 100; display: flex; gap: 1rem; align-items: center; }}
.export-btn {{ padding: 8px 20px; background: #4fc3f7; color: #111; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }}
</style>
</head>
<body>
<div class="header">
  <h1>Clasificar videos ({len(video_data)})</h1>
  <button class="filter-btn active" onclick="filterAll()">Todos</button>
  <button class="filter-btn" onclick="filterUnclassified()">Sin clasificar</button>
  <button class="filter-btn" onclick="filterCat('reel-material')">Reel material</button>
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
  <div class="info" id="modal-info"></div>
  <div class="actions" id="modal-actions"></div>
</div>
<div class="export-bar">
  <button class="export-btn" onclick="exportClassification()">Exportar clasificación (JSON)</button>
  <button class="export-btn" onclick="importClassification()">Importar</button>
  <input type="file" id="import-input" style="display:none" accept=".json">
  <div class="stats" id="export-stats"></div>
</div>
<script>
const videos = {videos_json};
const categories = {categories_json};
const classifications = JSON.parse(localStorage.getItem('enba-video-class') || '{{}}');
let currentFilter = 'all';
let currentIdx = -1;
let filtered = [...videos];
const catColors = {{'reel-material':'#e91e63','travesias-navegacion':'#1976d2','escuela-aprendizaje':'#388e3c','grupos-experiencia':'#f57c00','veleros-broker':'#7b1fa2','servicios':'#455a64','buenos-aires-paisaje':'#00838f','destinos':'#c62828','descartada':'#333'}};
const catLabels = {{'reel-material':'Reel','travesias-navegacion':'Travesías','escuela-aprendizaje':'Escuela','grupos-experiencia':'Grupos','veleros-broker':'Veleros','servicios':'Servicios','buenos-aires-paisaje':'BA/Paisaje','destinos':'Destinos','descartada':'Descartada'}};
function save(){{localStorage.setItem('enba-video-class',JSON.stringify(classifications));updateStats();}}
function updateStats(){{const t=videos.length,c=Object.keys(classifications).length;const byCat={{}};for(const cat of Object.values(classifications))byCat[cat]=(byCat[cat]||0)+1;document.getElementById('stats').textContent=`${{c}}/${{t}} clasificados`;document.getElementById('export-stats').textContent=Object.entries(byCat).map(([c,n])=>`${{catLabels[c]||c}}: ${{n}}`).join(' | ');}}
function renderGrid(){{const grid=document.getElementById('grid');grid.innerHTML='';filtered=videos.filter(v=>{{if(currentFilter==='all')return true;if(currentFilter==='unclassified')return!classifications[v.idx];return classifications[v.idx]===currentFilter;}});for(const v of filtered){{const card=document.createElement('div');card.className='card';const cat=classifications[v.idx];if(cat)card.classList.add('classified-'+cat);card.innerHTML=`<img src="${{v.thumb}}" loading="lazy"><div class="play-icon">▶</div><div class="label">${{v.name}} <span class="dur">${{v.duration}}s</span> <span class="res">${{v.width}}x${{v.height}}</span></div>`;if(cat)card.innerHTML+=`<div class="cat-badge cat-${{cat}}">${{catLabels[cat]||cat}}</div>`;card.onclick=()=>openModal(v.idx);grid.appendChild(card);}}updateStats();}}
function openModal(idx){{currentIdx=idx;const v=videos[idx];document.getElementById('modal-img').src=v.thumb;document.getElementById('modal-info').textContent=`${{v.name}} | ${{v.duration}}s | ${{v.width}}x${{v.height}} | ${{v.codec}} | ${{v.size_mb}}MB`;const actions=document.getElementById('modal-actions');actions.innerHTML='';for(const cat of categories){{const btn=document.createElement('button');btn.className='cat-btn';btn.style.background=catColors[cat];btn.style.color=cat==='descartada'?'#888':'#fff';btn.textContent=catLabels[cat]||cat;if(classifications[idx]===cat)btn.style.outline='3px solid #fff';btn.onclick=()=>{{classifications[idx]=cat;save();navNext();}};actions.appendChild(btn);}}document.getElementById('modal').classList.add('open');}}
function closeModal(){{document.getElementById('modal').classList.remove('open');renderGrid();}}
function navNext(){{const ci=filtered.findIndex(v=>v.idx===currentIdx);if(ci<filtered.length-1)openModal(filtered[ci+1].idx);else closeModal();}}
function navPrev(){{const ci=filtered.findIndex(v=>v.idx===currentIdx);if(ci>0)openModal(filtered[ci-1].idx);}}
function filterAll(){{currentFilter='all';renderGrid();}}
function filterUnclassified(){{currentFilter='unclassified';renderGrid();}}
function filterCat(cat){{currentFilter=cat;renderGrid();}}
function exportClassification(){{const data={{classifications,videos:videos.map(v=>({{idx:v.idx,name:v.name,original:v.original,duration:v.duration,width:v.width,height:v.height,category:classifications[v.idx]||null}}))}};const blob=new Blob([JSON.stringify(data,null,2)],{{type:'application/json'}});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='enba-video-classification.json';a.click();}}
function importClassification(){{document.getElementById('import-input').click();}}
document.getElementById('import-input').addEventListener('change',e=>{{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{{try{{const data=JSON.parse(ev.target.result);Object.assign(classifications,data.classifications||{{}});save();renderGrid();}}catch(err){{alert('Error: '+err.message);}}}};reader.readAsText(file);}});
document.addEventListener('keydown',e=>{{if(!document.getElementById('modal').classList.contains('open'))return;if(e.key==='Escape')closeModal();if(e.key==='ArrowRight')navNext();if(e.key==='ArrowLeft')navPrev();const num=parseInt(e.key);if(num>=1&&num<=categories.length){{classifications[currentIdx]=categories[num-1];save();navNext();}}}});
renderGrid();
</script>
</body>
</html>"""

html_path = OUT_DIR / "preview-clasificar-videos.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print(f"\nHTML written to {html_path}")
