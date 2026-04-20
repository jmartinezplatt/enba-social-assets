"""Convert all HEIC files in a directory to JPG, skip already converted."""
import sys, os
from pathlib import Path

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    print("ERROR: pip install pillow-heif")
    sys.exit(1)

from PIL import Image, ImageOps

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
heics = list(src.rglob("*.HEIC")) + list(src.rglob("*.heic"))
print(f"Found {len(heics)} HEIC files")

converted = 0
skipped = 0
errors = 0

for i, h in enumerate(heics):
    jpg_path = h.with_suffix(".jpg")
    if jpg_path.exists():
        skipped += 1
        continue
    try:
        img = Image.open(h)
        img = ImageOps.exif_transpose(img)
        img.save(jpg_path, "JPEG", quality=90)
        converted += 1
        if converted % 50 == 0:
            print(f"  Converted {converted}...")
    except Exception as e:
        errors += 1
        if errors <= 5:
            print(f"  ERROR {h.name}: {e}")

print(f"\nDone: {converted} converted, {skipped} skipped, {errors} errors")
