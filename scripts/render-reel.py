#!/usr/bin/env python3
"""
render-reel.py — ENBA Reel Renderer
Dani (Productor Visual) — Team 3

Reads an edit-sheet.json produced by Marina, processes each shot
(crop, trim, text overlay), concatenates them, adds a closing frame
with logo, and exports as 9:16 MP4 (1080x1920).

Usage:
    python render-reel.py <path-to-edit-sheet.json>

Dependencies:
    pip install moviepy Pillow
"""

import json
import sys
import os
from pathlib import Path

from moviepy import (
    VideoFileClip,
    ImageClip,
    TextClip,
    CompositeVideoClip,
    concatenate_videoclips,
)
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# ── Constants ──────────────────────────────────────────────────────────────
CANVAS_W = 1080
CANVAS_H = 1920
FPS = 30
CODEC = "libx264"

# Default directory where source clips live
DEFAULT_CLIPS_DIR = (
    "C:/Users/josea/enba-fotos-crudas/album-abril-2026/extracted/"
    "Content Mkt Online Campaing abril-mayo and others"
)

# Default output directory
DEFAULT_OUTPUT_DIR = (
    "C:/Users/josea/enba-redes/campaigns/reels/reel-4-horas-en-el-rio"
)


# ── Helpers ────────────────────────────────────────────────────────────────

def find_system_font_bold():
    """Return path to a bold sans-serif system font."""
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf",   # Arial Bold
        "C:/Windows/Fonts/calibrib.ttf",   # Calibri Bold
        "C:/Windows/Fonts/segoeui.ttf",    # Segoe UI (regular as fallback)
        "C:/Windows/Fonts/arial.ttf",      # Arial regular
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    return None


def _wrap_text(text, font, max_width, draw):
    """Wrap text to fit within max_width pixels."""
    words = text.split(" ")
    lines = []
    current_line = ""
    for word in words:
        test = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    return lines


def make_text_overlay_image(text, position="center", canvas_w=CANVAS_W, canvas_h=CANVAS_H):
    """
    Render text overlay as a numpy RGBA array using Pillow.
    Supports word-wrapping for long texts.
    Returns (numpy array, position tuple for CompositeVideoClip).
    """
    font_path = find_system_font_bold()
    shadow_offset = 3
    margin = 60  # margin from canvas edges
    max_text_width = canvas_w - margin * 2

    # Choose font size based on position/role
    font_size = 64
    if font_path:
        font = ImageFont.truetype(font_path, font_size)
    else:
        font = ImageFont.load_default()

    # Measure and wrap
    dummy_img = Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    draw = ImageDraw.Draw(dummy_img)

    # Check if text fits in one line
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]

    # If text is too wide, try smaller font first, then wrap
    if text_width > max_text_width:
        font_size = 52
        if font_path:
            font = ImageFont.truetype(font_path, font_size)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]

    # Wrap text if still too wide
    lines = _wrap_text(text, font, max_text_width, draw)

    # Measure each line
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_widths.append(bbox[2] - bbox[0])
        line_heights.append(bbox[3] - bbox[1])

    line_spacing = 8
    total_text_h = sum(line_heights) + line_spacing * (len(lines) - 1)
    max_line_w = max(line_widths) if line_widths else 0

    # Create image that spans the full canvas width for proper positioning
    pad_x, pad_y = 20, 16
    img_w = canvas_w
    img_h = total_text_h + pad_y * 2 + shadow_offset

    img = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw each line
    y_cursor = pad_y
    for i, line in enumerate(lines):
        lw = line_widths[i]

        # Horizontal alignment based on position
        if "left" in position:
            tx = margin
        elif "right" in position:
            tx = canvas_w - margin - lw
        else:  # center
            tx = (canvas_w - lw) // 2

        # Shadow
        draw.text((tx + shadow_offset, y_cursor + shadow_offset), line,
                  font=font, fill=(0, 0, 0, 200))
        # White text
        draw.text((tx, y_cursor), line, font=font, fill=(255, 255, 255, 255))

        y_cursor += line_heights[i] + line_spacing

    arr = np.array(img)

    # Vertical position on canvas
    x = 0  # full width image, text already positioned horizontally
    if "top" in position:
        y = int(canvas_h * 0.10)
    elif "bottom" in position:
        y = int(canvas_h * 0.78) - img_h
    elif position == "center":
        y = (canvas_h - img_h) // 2
    else:
        y = (canvas_h - img_h) // 2

    return arr, (x, y)


def make_closing_frame(logo_path, duration_s, bg_color_hex="#0A1520"):
    """
    Create a closing frame: solid background with optional logo centered.
    Returns a VideoClip of the given duration.
    """
    # Parse hex color
    bg = bg_color_hex.lstrip("#")
    r, g, b = int(bg[0:2], 16), int(bg[2:4], 16), int(bg[4:6], 16)

    # Create solid background with Pillow
    img = Image.new("RGBA", (CANVAS_W, CANVAS_H), (r, g, b, 255))

    # Try to add logo
    if logo_path and os.path.isfile(logo_path):
        try:
            # For SVG, try cairosvg first; fall back to Pillow for raster
            if logo_path.lower().endswith(".svg"):
                try:
                    import cairosvg
                    import io
                    png_data = cairosvg.svg2png(
                        url=logo_path, output_width=400
                    )
                    logo = Image.open(io.BytesIO(png_data)).convert("RGBA")
                except ImportError:
                    print(f"  [WARN] cairosvg not installed, skipping SVG logo")
                    logo = None
            else:
                logo = Image.open(logo_path).convert("RGBA")

            if logo:
                # Scale logo to fit (max 400px wide, proportional)
                max_w = 400
                if logo.width > max_w:
                    ratio = max_w / logo.width
                    logo = logo.resize(
                        (int(logo.width * ratio), int(logo.height * ratio)),
                        Image.LANCZOS,
                    )
                # Center it
                lx = (CANVAS_W - logo.width) // 2
                ly = (CANVAS_H - logo.height) // 2
                img.paste(logo, (lx, ly), logo)
        except Exception as e:
            print(f"  [WARN] Could not load logo {logo_path}: {e}")

    arr = np.array(img.convert("RGB"))
    clip = ImageClip(arr, duration=duration_s).with_fps(FPS)
    return clip


def _load_via_opencv(source_path):
    """
    Fallback loader for problematic MOV files (iPhone HEVC/Dolby Vision).
    Reads frames via opencv, writes a temp MP4, then loads with moviepy.
    """
    import cv2
    import tempfile

    cap = cv2.VideoCapture(source_path)
    if not cap.isOpened():
        return None

    fps_orig = cap.get(cv2.CAP_PROP_FPS) or 30
    w_orig = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h_orig = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Some iPhone MOVs report rotated dimensions; opencv may auto-rotate
    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    tmp_path = tmp.name
    tmp.close()

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(tmp_path, fourcc, fps_orig, (w_orig, h_orig))

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        writer.write(frame)

    cap.release()
    writer.release()

    try:
        clip = VideoFileClip(tmp_path)
        print(f"    Fallback OK: {w_orig}x{h_orig}, {clip.duration:.1f}s")
        return clip
    except Exception as e2:
        print(f"    Fallback also failed: {e2}")
        os.unlink(tmp_path)
        return None


def _load_single_clip(source, clips_dir, trim_start=0.0, trim_end=None):
    """Load a single clip, trim it, and crop to 9:16."""
    source_path = os.path.join(clips_dir, source)
    if not os.path.isfile(source_path):
        print(f"  [ERROR] Clip not found: {source_path}")
        return None

    print(f"  Loading: {source}")
    try:
        clip = VideoFileClip(source_path)
    except (IOError, OSError) as e:
        print(f"    [WARN] moviepy failed on {source}, converting via opencv...")
        clip = _load_via_opencv(source_path)
        if clip is None:
            print(f"  [ERROR] Could not load {source} via fallback either")
            return None

    w, h = clip.size
    print(f"    Original: {w}x{h}, {clip.duration:.1f}s")

    # Trim
    if trim_end is None:
        trim_end = clip.duration
    trim_end = min(trim_end, clip.duration)
    if trim_start >= trim_end:
        trim_start = 0.0
        trim_end = clip.duration

    clip = clip.subclipped(trim_start, trim_end)
    print(f"    Trimmed: {trim_start:.1f}s - {trim_end:.1f}s")

    # Crop to 9:16
    w, h = clip.size
    target_aspect = CANVAS_W / CANVAS_H

    if w > h:
        new_w = int(h * target_aspect)
        x_center = w // 2
        x1 = x_center - new_w // 2
        clip = clip.cropped(x1=x1, y1=0, x2=x1 + new_w, y2=h)
    elif w / h > target_aspect + 0.01:
        new_w = int(h * target_aspect)
        x_center = w // 2
        x1 = x_center - new_w // 2
        clip = clip.cropped(x1=x1, y1=0, x2=x1 + new_w, y2=h)
    elif w / h < target_aspect - 0.01:
        new_h = int(w / target_aspect)
        y_center = h // 2
        y1 = y_center - new_h // 2
        clip = clip.cropped(x1=0, y1=y1, x2=w, y2=y1 + new_h)

    clip = clip.resized((CANVAS_W, CANVAS_H))
    clip = clip.without_audio()
    return clip


def process_shot(shot, clips_dir):
    """
    Process a single shot from the edit sheet.
    Returns a VideoClip cropped to 1080x1920 with optional text overlay.
    Supports multi_clip shots (multiple source clips concatenated).
    """
    is_multi = shot.get("multi_clip", False)

    if is_multi:
        sub_clips = []
        for sub in shot.get("clips", []):
            sc = _load_single_clip(
                sub["source_file"], clips_dir,
                sub.get("trim_start_s", 0.0),
                sub.get("trim_end_s")
            )
            if sc:
                sub_clips.append(sc)
        if not sub_clips:
            return None
        clip = concatenate_videoclips(sub_clips, method="compose")
        print(f"    Multi-clip: {len(sub_clips)} clips, {clip.duration:.1f}s total")
    else:
        source = shot.get("source_file")
        if not source or source == "?" or source == "None":
            print(f"  [SKIP] No source file for shot {shot.get('shot_number')}")
            return None
        clip = _load_single_clip(
            source, clips_dir,
            shot.get("trim_start_s", 0.0),
            shot.get("trim_end_s")
        )
        if clip is None:
            return None

    # Speed adjustment (slow-mo)
    speed = shot.get("speed")
    if speed and speed != 1.0 and speed > 0:
        print(f"    Speed: {speed}x")
        clip = clip.with_speed_scaled(speed)

    # Text overlay
    text = shot.get("text_overlay")
    if text:
        position = shot.get("text_position", "center")
        print(f"    Text overlay: \"{text}\" at {position}")
        arr, pos = make_text_overlay_image(text, position)
        text_clip = (
            ImageClip(arr, duration=clip.duration, transparent=True)
            .with_fps(FPS)
            .with_position(pos)
        )
        clip = CompositeVideoClip([clip, text_clip], size=(CANVAS_W, CANVAS_H))

    # Remove audio
    clip = clip.without_audio()

    return clip


# ── Main ───────────────────────────────────────────────────────────────────

def render_reel(edit_sheet_path):
    """Main render function."""
    edit_sheet_path = os.path.abspath(edit_sheet_path)
    print(f"Reading edit sheet: {edit_sheet_path}")

    with open(edit_sheet_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    shots = data.get("shots", [])
    closing = data.get("closing", {})

    # Resolve clips directory: look for clips_dir in JSON, else use default
    clips_dir = data.get("clips_dir", DEFAULT_CLIPS_DIR)
    output_dir = data.get("output_dir", DEFAULT_OUTPUT_DIR)
    output_file = data.get("output_file", "reel-4-horas-DRAFT.mp4")
    output_path = os.path.join(output_dir, output_file)

    os.makedirs(output_dir, exist_ok=True)

    print(f"Clips dir: {clips_dir}")
    print(f"Output: {output_path}")
    print(f"Shots: {len(shots)}")
    print()

    # Process shots
    processed = []
    for i, shot in enumerate(shots):
        print(f"[Shot {shot.get('shot_number', i+1)}]")
        result = process_shot(shot, clips_dir)
        if result:
            processed.append(result)
        else:
            print(f"  Skipped shot {shot.get('shot_number', i+1)}")
        print()

    if not processed:
        print("[ERROR] No shots processed successfully. Aborting.")
        sys.exit(1)

    # Closing frame
    if closing:
        print("[Closing frame]")
        logo = closing.get("logo", "")
        # Resolve logo path relative to edit sheet dir if not absolute
        if logo and not os.path.isabs(logo):
            logo = os.path.join(os.path.dirname(edit_sheet_path), logo)
        duration = closing.get("duration_s", 2)
        bg = closing.get("background", "#0A1520")
        closing_clip = make_closing_frame(logo, duration, bg)
        processed.append(closing_clip)
        print(f"  Duration: {duration}s, Background: {bg}")
        print()

    # Concatenate
    print("Concatenating clips...")
    final = concatenate_videoclips(processed, method="compose")
    print(f"Final duration: {final.duration:.1f}s")

    # Export
    print(f"Exporting to {output_path}...")
    final.write_videofile(
        output_path,
        fps=FPS,
        codec=CODEC,
        audio=False,
        preset="medium",
        threads=4,
    )
    print(f"Done! Output: {output_path}")

    # Cleanup
    final.close()
    for c in processed:
        c.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python render-reel.py <path-to-edit-sheet.json>")
        sys.exit(1)

    render_reel(sys.argv[1])
