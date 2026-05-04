#!/usr/bin/env python3
"""
group-similar-photos.py — Agrupa fotos similares y elige la mas nitida de cada grupo.

Inspirado en la funcion "Fotos similares" de Google Photos.
Usa perceptual hash (pHash) para detectar similitud visual y varianza de gradiente
para medir nitidez. Genera un preview HTML con los grupos para revision humana.

Uso:
    python scripts/group-similar-photos.py <directorio_fuente> [--threshold 8] [--out preview.html]

Argumentos:
    directorio_fuente   Carpeta con JPGs a analizar (incluye subdirectorios .temp-* con HEICs convertidos)
    --threshold N       Distancia maxima de pHash para considerar dos fotos similares (default: 8)
    --out PATH          Ruta del HTML de salida (default: grupo-similares-preview.html en el dir fuente)

Salida:
    - groups.json en el directorio fuente con la seleccion (best + similar descartables)
    - preview HTML con los grupos visualizados lado a lado

Dependencias:
    pip install imagehash Pillow numpy

Pendientes / mejoras futuras:
    - Agregar deteccion de calidad de exposicion (sobreexpuesta / subexpuesta)
    - Ordenar grupos por escena/hora EXIF
    - Modo interactivo: marcar keeper/discard directamente en el HTML
    - Soporte para comparar contra asset-bank existente (detectar duplicados cross-batch)
    - Exportar JSON de mapping src -> nombre_descriptivo para el paso de naming
"""

import sys
import json
import argparse
import numpy as np
from pathlib import Path
from PIL import Image
import imagehash


def sharpness(img_rgb: Image.Image) -> float:
    """Varianza del gradiente de Sobel como proxy de nitidez. Mayor = mas nitido."""
    gray = img_rgb.convert('L').resize((512, 512))
    arr = np.array(gray, dtype=float)
    gy = np.diff(arr, axis=0)
    gx = np.diff(arr, axis=1)
    return float(np.mean(gx ** 2) + np.mean(gy ** 2))


def to_file_uri(path: str) -> str:
    return 'file:///' + path.replace('\\', '/')


def collect_jpgs(source_dir: Path) -> list[Path]:
    """Recolecta JPGs unicos del directorio fuente y subdirectorios .temp-*"""
    seen_stems = set()
    imgs = []
    # JPGs directos (case-insensitive en Windows)
    for f in sorted(source_dir.glob('*.JPG')) + sorted(source_dir.glob('*.jpg')):
        if f.stem.lower() not in seen_stems:
            seen_stems.add(f.stem.lower())
            imgs.append(f)
    # HEICs convertidos en subdirectorios .temp-*
    for temp_dir in sorted(source_dir.glob('.temp-*')):
        for f in sorted(temp_dir.glob('*.jpg')):
            imgs.append(f)
    return imgs


def compute_hashes(imgs: list[Path]) -> list[dict]:
    hashes = []
    errors = 0
    for f in imgs:
        try:
            img = Image.open(f).convert('RGB')
            h = imagehash.phash(img)
            sharp = sharpness(img)
            hashes.append({'path': str(f), 'name': f.name, 'hash': h, 'sharp': sharp})
        except Exception as e:
            print(f'  WARN {f.name}: {e}')
            errors += 1
    if errors:
        print(f'  ({errors} archivos con error, saltados)')
    return hashes


def group_by_similarity(hashes: list[dict], threshold: int) -> list[dict]:
    used = [False] * len(hashes)
    groups = []
    for i in range(len(hashes)):
        if used[i]:
            continue
        group = [i]
        used[i] = True
        for j in range(i + 1, len(hashes)):
            if used[j]:
                continue
            if hashes[i]['hash'] - hashes[j]['hash'] <= threshold:
                group.append(j)
                used[j] = True
        groups.append(group)

    results = []
    for g in groups:
        best_idx = max(g, key=lambda i: hashes[i]['sharp'])
        others = [i for i in g if i != best_idx]
        results.append({
            'best': hashes[best_idx]['path'],
            'best_name': hashes[best_idx]['name'],
            'sharp': round(hashes[best_idx]['sharp'], 1),
            'similar': [hashes[i]['path'] for i in others],
            'similar_names': [hashes[i]['name'] for i in others],
        })
    return results


def build_html(results: list[dict], batch_label: str) -> str:
    grouped = [r for r in results if r['similar']]
    singles = [r for r in results if not r['similar']]
    total_desc = sum(len(r['similar']) for r in results)
    total_orig = len(results) + total_desc

    html = f'''<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8">
<title>Grupos similares — {batch_label}</title>
<style>
body {{ font-family: sans-serif; background: #111; color: #eee; padding: 20px; }}
h1 {{ color: #4DB8A0; }}
h2 {{ color: #D4A843; margin-top: 40px; border-bottom: 1px solid #333; padding-bottom: 8px; }}
.summary {{ background: #1a2a1a; border: 1px solid #4DB8A0; border-radius: 8px; padding: 14px 20px; margin-bottom: 30px; }}
.summary span {{ color: #4DB8A0; font-weight: bold; font-size: 1.1em; }}
.group-block {{ margin-bottom: 36px; }}
.group-label {{ color: #aaa; font-size: 13px; margin-bottom: 8px; }}
.group {{ display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }}
.card {{ text-align: center; }}
.card img {{ width: 220px; height: 280px; object-fit: cover; border-radius: 8px; cursor: pointer; }}
.best img {{ border: 3px solid #4DB8A0; }}
.discard img {{ border: 3px solid #e55; opacity: 0.65; }}
.label {{ font-size: 11px; margin-top: 4px; font-weight: bold; }}
.best .label {{ color: #4DB8A0; }}
.discard .label {{ color: #e55; }}
.meta {{ font-size: 10px; color: #666; margin-top: 2px; }}
.singles-grid {{ display: flex; flex-wrap: wrap; gap: 10px; }}
.singles-grid .scard {{ text-align: center; }}
.singles-grid img {{ width: 150px; height: 190px; object-fit: cover; border-radius: 6px; border: 2px solid #2a2a2a; cursor: pointer; }}
.singles-grid .sname {{ font-size: 9px; color: #555; margin-top: 2px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
</style>
</head>
<body>
<h1>Grupos similares — {batch_label}</h1>
<div class="summary">
  {len(grouped)} grupos con similares &nbsp;|&nbsp;
  <span>{total_desc} fotos descartables</span> &nbsp;|&nbsp;
  <span>{len(results)} a conservar</span> de {total_orig} totales
</div>
<h2>Grupos con similares ({len(grouped)})</h2>
'''

    for i, r in enumerate(grouped):
        html += f'<div class="group-block"><div class="group-label">Grupo {i+1} &mdash; {1 + len(r["similar"])} fotos similares</div><div class="group">'
        html += f'<div class="card best"><img src="{to_file_uri(r["best"])}" title="{r["best_name"]}"><div class="label">ELEGIDA</div><div class="meta">{r["best_name"]}<br>nitidez: {r["sharp"]}</div></div>'
        for s, sn in zip(r['similar'], r['similar_names']):
            html += f'<div class="card discard"><img src="{to_file_uri(s)}" title="{sn}"><div class="label">DESCARTAR</div><div class="meta">{sn}</div></div>'
        html += '</div></div>'

    html += f'<h2>Fotos unicas — {len(singles)}</h2><div class="singles-grid">'
    for r in singles:
        html += f'<div class="scard"><img src="{to_file_uri(r["best"])}" title="{r["best_name"]}"><div class="sname">{r["best_name"]}</div></div>'
    html += '</div></body></html>'
    return html


def main():
    parser = argparse.ArgumentParser(description='Agrupa fotos similares y elige la mas nitida.')
    parser.add_argument('source', help='Directorio fuente con JPGs')
    parser.add_argument('--threshold', type=int, default=8, help='Distancia pHash maxima (default: 8)')
    parser.add_argument('--out', default=None, help='Ruta HTML de salida')
    args = parser.parse_args()

    source_dir = Path(args.source)
    if not source_dir.exists():
        print(f'ERROR: directorio no existe: {source_dir}')
        sys.exit(1)

    batch_label = source_dir.name
    out_html = Path(args.out) if args.out else source_dir / 'grupos-similares-preview.html'

    print(f'Fuente: {source_dir}')
    print(f'Threshold pHash: {args.threshold}')

    imgs = collect_jpgs(source_dir)
    print(f'Fotos encontradas: {len(imgs)}')

    print('Computando pHash y nitidez...')
    hashes = compute_hashes(imgs)
    print(f'Procesados: {len(hashes)}')

    results = group_by_similarity(hashes, args.threshold)

    grouped = [r for r in results if r['similar']]
    total_desc = sum(len(r['similar']) for r in results)
    print(f'\nGrupos con similares: {len(grouped)}')
    print(f'A conservar: {len(results)}')
    print(f'Descartables: {total_desc}')

    for r in grouped:
        print(f'  MEJOR: {r["best_name"]} (sharp={r["sharp"]}) | descartar: {r["similar_names"]}')

    # Guardar groups.json
    groups_path = source_dir / 'groups.json'
    with open(groups_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f'\ngroups.json: {groups_path}')

    # Generar HTML
    html = build_html(results, batch_label)
    with open(out_html, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Preview: file:///{str(out_html).replace(chr(92), "/")}')


if __name__ == '__main__':
    main()
