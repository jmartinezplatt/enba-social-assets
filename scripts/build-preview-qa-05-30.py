#!/usr/bin/env python3
"""Build preview HTML for pieces 05-30 with QA status."""
import json, os, html as h

SRC = os.path.join(os.path.dirname(__file__), '..', 'campaigns', 'lanzamiento-15-abr-2026', 'campaign.pieces.json')
OUT = os.path.join(os.path.dirname(__file__), '..', 'campaigns', 'lanzamiento-15-abr-2026', 'preview-qa-05-30.html')

ACCENT = {
    'Marca': '#D4A843', 'Travesias': '#2E817D', 'Escuela': '#3A9FD4',
    'Broker': '#D4A843', 'Servicios': '#2E817D', 'Prueba': '#3A9FD4',
    'Backstage': '#2E817D', 'Cierre': '#D4A843'
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'campaigns', 'lanzamiento-15-abr-2026', 'output')

# Build lookup of actual PNG filenames: "08" -> "08-22-04-2026-travesias.png"
output_files = {}
for fname in os.listdir(OUTPUT_DIR):
    if fname.endswith('.png'):
        num = fname.split('-')[0]  # "08"
        output_files[num] = fname

with open(SRC, 'r', encoding='utf-8') as f:
    raw = json.load(f)
all_pieces = raw if isinstance(raw, list) else raw.get('pieces', [])
pieces = [p for p in all_pieces if int(p['id'].replace('piece-', '')) >= 5]

tmix = {}
for p in pieces:
    t = p['template']
    tmix[t] = tmix.get(t, 0) + 1

campaign = {
    'pieces': []
}
for p in pieces:
    campaign['pieces'].append({
        'id': p['id'],
        'date': p['date'],
        'vertical': p['vertical'],
        'phase': p['phase'],
        'template': p['template'],
        'headline': p['headline'],
        'summary': p['summary'],
        'support': p.get('support', ''),
        'objective': p['objective'],
        'cta': p['cta'],
        'captionIg': p['captionIg'],
        'captionFb': p['captionFb'],
        'imageNote': p.get('imageNote', ''),
        'output': p.get('output', '') or 'output/' + output_files.get(p['id'].replace('piece-', '').zfill(2), ''),
        'sourceImage': p.get('image', p.get('sourceImage', '')),
        'accent': ACCENT.get(p['vertical'], '#D4A843')
    })

campaign_json = json.dumps(campaign, ensure_ascii=False)
tmix_str = ' · '.join(f'{k} ({v})' for k, v in tmix.items())

HTML = f'''<!doctype html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Preview QA Piezas 05–30 | Post-Fix</title>
<style>
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Teko:wght@500;600;700&display=swap");
:root{{--bg:#ecf0f2;--ink:#102436;--muted:#58707f;--paper:#ffffff;--line:rgba(16,36,54,.1);--navy:#0A1520;--teal:#4DB8A0;--gold:#D4A843;--cream:#E8EDF2;--shadow:0 24px 64px rgba(16,36,54,.12)}}*{{box-sizing:border-box}}body{{margin:0;font-family:"Barlow Condensed",sans-serif;background:radial-gradient(circle at top left,rgba(77,184,160,.14),transparent 24%),radial-gradient(circle at top right,rgba(212,168,67,.12),transparent 18%),linear-gradient(180deg,#f7fafb 0%,var(--bg) 100%);color:var(--ink)}}.page{{width:min(1360px,calc(100% - 40px));margin:24px auto 48px}}.hero,.section{{background:rgba(255,255,255,.84);border:1px solid var(--line);border-radius:30px;box-shadow:var(--shadow);backdrop-filter:blur(14px)}}.hero{{padding:34px;background:linear-gradient(140deg,rgba(16,36,54,.96) 0%,rgba(23,53,81,.92) 100%),rgba(16,36,54,.92);color:var(--cream)}}.hero-top{{display:flex;justify-content:space-between;gap:24px;align-items:start}}.eyebrow{{margin:0 0 12px;text-transform:uppercase;letter-spacing:.18em;font-size:14px;color:rgba(237,242,244,.72)}}h1,h2,h3,h4{{font-family:"Teko",sans-serif;letter-spacing:.02em}}h1{{margin:0;max-width:760px;font-size:clamp(54px,7vw,88px);line-height:.92;text-transform:uppercase}}.hero p{{margin:0;font-size:26px;line-height:1.06;color:rgba(237,242,244,.84)}}.section{{margin-top:24px;padding:28px}}h2{{margin:0 0 16px;font-size:42px;line-height:.95;text-transform:uppercase}}.stats{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}}.stat{{border:1px solid var(--line);border-radius:22px;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(247,250,251,.96) 100%)}}.stat strong{{display:block;margin-bottom:6px;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}}.stat span{{font-size:24px;line-height:1.04}}.filters{{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}}.filter{{padding:10px 16px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);font:inherit;font-size:19px;cursor:pointer}}.filter.active{{background:var(--navy);color:var(--cream);border-color:transparent}}.pieces{{display:grid;gap:18px}}.piece{{display:grid;grid-template-columns:360px minmax(0,1fr);border:1px solid var(--line);border-radius:26px;overflow:hidden;background:#fff}}.piece-visual{{position:relative;padding:18px;background:radial-gradient(circle at top left,rgba(77,184,160,.12),transparent 36%),linear-gradient(180deg,#edf2f4 0%,#e4eaed 100%)}}.piece-visual img.render{{width:100%;border-radius:18px;display:block;box-shadow:0 20px 44px rgba(16,36,54,.18)}}.piece-body{{padding:20px 22px 22px}}.badges{{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}}.badge{{padding:7px 11px;border-radius:999px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--cream)}}.piece h3{{margin:0 0 8px;font-size:40px;line-height:.96;text-transform:uppercase}}.piece-summary{{margin:0 0 16px;color:var(--muted);font-size:22px;line-height:1.08}}.meta-grid{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:16px}}.meta{{border:1px solid var(--line);border-radius:22px;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(247,250,251,.96) 100%)}}.meta strong{{display:block;margin-bottom:6px;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}}.meta span{{font-size:24px;line-height:1.04}}.copies{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}.copy{{border:1px solid var(--line);border-radius:22px;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(247,250,251,.96) 100%)}}.copy strong{{display:block;margin-bottom:6px;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}}.copy p{{margin:0;white-space:pre-wrap;font-size:18px;line-height:1.12}}.cta-ok{{color:#2E817D;font-weight:600}}.cta-was-fixed{{background:rgba(46,129,125,.08);border-color:rgba(46,129,125,.25)}}@media (max-width:1100px){{.piece,.meta-grid,.copies,.stats{{grid-template-columns:1fr}}}}
</style></head>
<body><div class="page">
<section class="hero"><div class="hero-top"><div><p class="eyebrow">Preview post-fix QA — Piezas 05 a 30</p><h1>Espacio Nautico Buenos Aires</h1></div><p>El rio te llama. Nosotros te llevamos.</p></div></section>
<section class="section"><h2>Resumen</h2><div class="stats"><article class="stat"><strong>Piezas</strong><span>{len(pieces)}</span></article><article class="stat"><strong>Templates</strong><span>{tmix_str}</span></article><article class="stat"><strong>Estado</strong><span>CTAs corregidos — verificar visualmente</span></article></div></section>
<section class="section"><h2>Piezas</h2><div class="filters" id="filters"></div><div class="pieces" id="pieces"></div></section></div>
<script>
const CAMPAIGN={campaign_json};
const FIXED_IDS=new Set(["piece-08","piece-10","piece-12","piece-13","piece-15","piece-18","piece-19","piece-24","piece-26","piece-27","piece-28"]);
const filters=[{{key:"all",label:"Todas ("+CAMPAIGN.pieces.length+")"}},{{key:"photo-hero",label:"Photo Hero"}},{{key:"proof-utility",label:"Proof Utility"}},{{key:"manifesto",label:"Manifesto"}}];
const filtersRoot=document.getElementById("filters"); const piecesRoot=document.getElementById("pieces"); let activeFilter="all";
function esc(s){{const d=document.createElement("div");d.textContent=s;return d.innerHTML;}}
function renderFilters(){{filtersRoot.innerHTML=filters.map(f=>`<button class="filter ${{f.key===activeFilter?"active":""}}" data-filter="${{f.key}}">${{f.label}}</button>`).join(""); filtersRoot.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{{activeFilter=b.dataset.filter; renderFilters(); renderPieces();}}));}}
function renderPieces(){{const items=CAMPAIGN.pieces.filter(p=>activeFilter==="all"||p.template===activeFilter); piecesRoot.innerHTML=items.map(p=>{{const fixed=FIXED_IDS.has(p.id);return `<article class="piece ${{fixed?"cta-was-fixed":""}}"><div class="piece-visual"><img class="render" src="${{p.output}}" alt="${{esc(p.headline)}}" /></div><div class="piece-body"><div class="badges"><span class="badge" style="background:${{p.accent}}">${{p.date}}</span><span class="badge" style="background:var(--navy)">${{p.vertical}}</span><span class="badge" style="background:rgba(16,36,54,.72)">${{p.template}}</span>${{fixed?'<span class="badge" style="background:#2E817D">CTA CORREGIDO</span>':""}}</div><h3>${{esc(p.headline)}}</h3><p class="piece-summary">${{esc(p.summary)}}</p><div class="meta-grid"><div class="meta"><strong>Support (imagen)</strong><span>${{esc(p.support)}}</span></div><div class="meta"><strong>CTA (imagen)</strong><span class="${{fixed?"cta-ok":""}}">${{esc(p.cta)}}</span></div><div class="meta"><strong>Objetivo</strong><span>${{esc(p.objective)}}</span></div></div><div class="copies"><div class="copy"><strong>Caption IG</strong><p>${{esc(p.captionIg)}}</p></div><div class="copy"><strong>Caption FB</strong><p>${{esc(p.captionFb)}}</p></div></div></div></article>`;}}).join("");}}
renderFilters(); renderPieces();
</script></body></html>'''

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(HTML)
print(f'OK — {OUT}')
