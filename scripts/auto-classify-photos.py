"""Auto-classify photos by analyzing thumbnails with basic heuristics.
Since we can't run ML locally, we'll classify based on filename patterns,
EXIF data, and generate a review HTML with pre-classifications."""
import sys, json
from pathlib import Path
from PIL import Image, ImageStat

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
OUT_DIR = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("C:/Users/josea/enba-social-assets")
THUMB_DIR = OUT_DIR / "thumbs-preview"

# Load the photo list from thumbnails
thumbs = sorted(THUMB_DIR.glob("*.jpg"))
print(f"Found {len(thumbs)} thumbnails to classify")

# Find original photos
photos = sorted(
    list(SRC.rglob("*.jpg")) + list(SRC.rglob("*.JPG")) +
    list(SRC.rglob("*.jpeg")) + list(SRC.rglob("*.JPEG"))
)

# Deduplicate
seen = set()
unique = []
for p in photos:
    key = p.stem.upper()
    if key not in seen:
        seen.add(key)
        unique.append(p)
photos = unique

# Analyze each photo
results = []
for i, p in enumerate(photos):
    if i >= len(thumbs):
        break

    thumb_path = thumbs[i]

    try:
        img = Image.open(thumb_path)
        stat = ImageStat.Stat(img)

        # Basic image properties
        w, h = img.size
        brightness = sum(stat.mean[:3]) / 3  # avg brightness

        # Aspect ratio of original
        try:
            orig = Image.open(p)
            ow, oh = orig.size
            orig.close()
        except:
            ow, oh = w, h

        is_portrait = oh > ow
        is_landscape = ow > oh
        is_dark = brightness < 80
        is_bright = brightness > 180
        is_golden = stat.mean[0] > stat.mean[2] * 1.3  # red > blue = warm/golden

        results.append({
            "idx": i,
            "name": p.name,
            "original": str(p).replace("\\", "/"),
            "thumb": f"thumbs-preview/{thumb_path.name}",
            "width": ow,
            "height": oh,
            "brightness": round(brightness),
            "is_portrait": is_portrait,
            "is_golden": is_golden,
            "category": None  # will be set below
        })

    except Exception as e:
        if i < 3:
            print(f"  ERROR {p.name}: {e}")
        results.append({
            "idx": i,
            "name": p.name,
            "original": str(p).replace("\\", "/"),
            "thumb": f"thumbs-preview/{thumb_path.name}",
            "width": 0, "height": 0, "brightness": 0,
            "is_portrait": False, "is_golden": False,
            "category": None
        })

    if (i + 1) % 200 == 0:
        print(f"  Analyzed {i+1}/{len(photos)}...")

print(f"Analyzed {len(results)} photos")

# Save results for Claude to classify via image reading
# Group into batches for review
BATCH_SIZE = 50
batches = [results[i:i+BATCH_SIZE] for i in range(0, len(results), BATCH_SIZE)]
print(f"Created {len(batches)} batches of ~{BATCH_SIZE} photos")

# Save metadata
with open(OUT_DIR / "photo-metadata.json", "w") as f:
    json.dump(results, f, indent=2)
print(f"Metadata saved to photo-metadata.json")

# Create contact sheet images (grid of thumbnails) for each batch
from PIL import Image as PILImage

COLS = 10
THUMB_SIZE = 150
LABEL_H = 15

for batch_idx, batch in enumerate(batches):
    rows = (len(batch) + COLS - 1) // COLS
    sheet_w = COLS * THUMB_SIZE
    sheet_h = rows * (THUMB_SIZE + LABEL_H)
    sheet = PILImage.new("RGB", (sheet_w, sheet_h), (17, 17, 17))

    for j, item in enumerate(batch):
        col = j % COLS
        row = j // COLS
        x = col * THUMB_SIZE
        y = row * (THUMB_SIZE + LABEL_H)

        try:
            thumb = PILImage.open(THUMB_DIR / f"{item['idx']:04d}.jpg")
            thumb = thumb.resize((THUMB_SIZE, THUMB_SIZE), PILImage.LANCZOS)
            sheet.paste(thumb, (x, y))
            thumb.close()
        except:
            pass

    sheet_path = OUT_DIR / f"contact-sheet-{batch_idx:02d}.jpg"
    sheet.save(sheet_path, "JPEG", quality=85)

    if (batch_idx + 1) % 5 == 0:
        print(f"  Contact sheet {batch_idx+1}/{len(batches)}")

print(f"Created {len(batches)} contact sheets")
print("Done! Claude can now read contact sheets to classify.")
