"""Select best photos for asset-bank based on resolution, quality, and composition.
Filters out: low-res, blurry, too dark/bright, selfies (portrait orientation with face close),
screenshots, and keeps only usable content for social media."""
import json, os, sys
from pathlib import Path
from PIL import Image, ImageStat, ImageFilter

SRC = Path("C:/Users/josea/Downloads/Veleros-3-001/Veleros")
OUT_DIR = Path("C:/Users/josea/enba-redes")

# Load classifications
with open(OUT_DIR / "photo-metadata.json") as f:
    photo_meta = json.load(f)

# Build lookup by original path
import re
html = (OUT_DIR / "preview-clasificar-fotos.html").read_text(encoding="utf-8")
m = re.search(r"localStorage\.getItem\('enba-photo-class'\) \|\| '(\{.*?\})'", html)
photo_class = json.loads(m.group(1))

# Map idx to classification and original path
idx_to_class = {}
idx_to_path = {}
for p in photo_meta:
    idx_to_class[p["idx"]] = photo_class.get(str(p["idx"]), "descartada")
    idx_to_path[p["idx"]] = p["original"]

# Get all current photos in the source folder
current_photos = set()
for f in SRC.iterdir():
    if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".png", ".gif"):
        current_photos.add(str(f).replace("\\", "/"))

print(f"Photos in folder: {len(current_photos)}")

# Filter: only non-descartada photos that still exist
candidates = []
for p in photo_meta:
    cat = idx_to_class.get(p["idx"], "descartada")
    if cat == "descartada":
        continue
    path = Path(p["original"])
    if not path.exists():
        continue
    candidates.append({
        "idx": p["idx"],
        "path": path,
        "category": cat,
        "name": p["name"]
    })

print(f"Candidates (non-discarded, existing): {len(candidates)}")

# Quality scoring
results = []
for i, c in enumerate(candidates):
    try:
        img = Image.open(c["path"])
        w, h = img.size

        # Skip too small (< 800px on shortest side)
        min_dim = min(w, h)
        if min_dim < 800:
            c["reject"] = f"too_small ({w}x{h})"
            continue

        # Analyze quality
        stat = ImageStat.Stat(img)
        brightness = sum(stat.mean[:3]) / 3

        # Skip too dark or too bright
        if brightness < 40:
            c["reject"] = f"too_dark (brightness={brightness:.0f})"
            continue
        if brightness > 240:
            c["reject"] = f"too_bright (brightness={brightness:.0f})"
            continue

        # Contrast check (stddev)
        contrast = sum(stat.stddev[:3]) / 3
        if contrast < 20:
            c["reject"] = f"low_contrast ({contrast:.0f})"
            continue

        # Blurriness check (Laplacian variance)
        gray = img.convert("L")
        laplacian = gray.filter(ImageFilter.Kernel((3,3), [0,1,0,1,-4,1,0,1,0], scale=1, offset=128))
        lap_stat = ImageStat.Stat(laplacian)
        sharpness = lap_stat.stddev[0]

        if sharpness < 5:
            c["reject"] = f"blurry (sharpness={sharpness:.1f})"
            continue

        # Score
        score = 0
        score += min(w * h / (3840 * 2160), 1.0) * 30  # resolution (max 30)
        score += min(contrast / 60, 1.0) * 25  # contrast (max 25)
        score += min(sharpness / 20, 1.0) * 25  # sharpness (max 25)
        # Bonus for landscape (more useful for social)
        if w > h:
            score += 10
        # Bonus for golden hour tones
        if stat.mean[0] > stat.mean[2] * 1.2:
            score += 10

        c["score"] = round(score, 1)
        c["width"] = w
        c["height"] = h
        c["brightness"] = round(brightness)
        c["sharpness"] = round(sharpness, 1)
        results.append(c)

        img.close()
    except Exception as e:
        c["reject"] = str(e)

    if (i + 1) % 200 == 0:
        print(f"  Analyzed {i+1}/{len(candidates)}...")

print(f"\nPassed quality filter: {len(results)}")
print(f"Rejected: {len(candidates) - len(results)}")

# Sort by score
results.sort(key=lambda x: -x["score"])

# Stats by category
from collections import Counter
cats = Counter(r["category"] for r in results)
print("\nBy category:")
for cat, count in cats.most_common():
    print(f"  {cat}: {count}")

# Save results
output = [{
    "idx": r["idx"],
    "name": r["name"],
    "path": str(r["path"]).replace("\\", "/"),
    "category": r["category"],
    "score": r["score"],
    "width": r["width"],
    "height": r["height"]
} for r in results]

with open(OUT_DIR / "bank-candidates.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"\nSaved {len(output)} candidates to bank-candidates.json")
print(f"Top 10 scores:")
for r in results[:10]:
    print(f"  {r['score']} - {r['name']} ({r['category']}, {r['width']}x{r['height']})")
