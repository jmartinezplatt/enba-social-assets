"""Build contact sheets from video thumbnails for visual classification."""
from pathlib import Path
from PIL import Image as PILImage

OUT_DIR = Path("C:/Users/josea/enba-social-assets")
THUMB_DIR = OUT_DIR / "thumbs-videos"

thumbs = sorted(THUMB_DIR.glob("v*.jpg"))
print(f"Found {len(thumbs)} video thumbnails")

COLS = 10
THUMB_W = 150
THUMB_H = 100
BATCH_SIZE = 50

batches = [thumbs[i:i+BATCH_SIZE] for i in range(0, len(thumbs), BATCH_SIZE)]

for batch_idx, batch in enumerate(batches):
    rows = (len(batch) + COLS - 1) // COLS
    sheet_w = COLS * THUMB_W
    sheet_h = rows * THUMB_H
    sheet = PILImage.new("RGB", (sheet_w, sheet_h), (17, 17, 17))

    for j, thumb_path in enumerate(batch):
        col = j % COLS
        row = j // COLS
        x = col * THUMB_W
        y = row * THUMB_H

        try:
            thumb = PILImage.open(thumb_path)
            thumb = thumb.resize((THUMB_W, THUMB_H), PILImage.LANCZOS)
            sheet.paste(thumb, (x, y))
            thumb.close()
        except:
            pass

    sheet_path = OUT_DIR / f"video-sheet-{batch_idx:02d}.jpg"
    sheet.save(sheet_path, "JPEG", quality=85)

print(f"Created {len(batches)} video contact sheets")
