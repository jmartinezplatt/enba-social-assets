#!/bin/bash
# Build reel-primera-vez v7
# Fixes: franja lateral (crop+scale all segments) + logo overlay en cierre + nueva música 15%
set -e

BASE="C:/Users/josea/enba-redes/campaigns/reels/reel-primera-vez"
SEG="$BASE/segments"
RAW="$BASE/material-crudo"
MUSIC="$BASE/music/let-good-times-roll.mp3"
LOGO="$SEG/logo-horizontal.png"
OUT="$BASE/reel-primera-vez-v7.mp4"

FONT="C\\:/Windows/Fonts/arialbd.ttf"

# Color grading: golden/teal + film grain
CG="colorbalance=rs=0.05:gs=0.0:bs=-0.08:rh=0.1:gh=0.05:bh=-0.03,noise=alls=8:allf=t"

# Fix franja: crop 6px right + rescale
FIX="crop=iw-6:ih:0:0,scale=1080:1920:flags=lanczos"

# Text style common
DT="fontcolor=white:borderw=3:bordercolor=black:box=1:boxcolor=black@0.5:boxborderw=12:x=(w-text_w)/2"

echo "=========================================="
echo "PASO 1: Regenerar segments con crop fix"
echo "=========================================="

# --- TOMA 1: Hook (3s) ---
echo "[1/11] Toma 1: Hook"
ffmpeg -y -i "$RAW/IMG_5383.MP4" \
  -t 3 \
  -vf "${FIX},eq=gamma=1.3,${CG},fade=t=in:st=0:d=0.3:color=black,drawtext=fontfile='${FONT}':text='Nunca había subido a un velero':fontsize=64:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma01.mp4"

# --- TOMA 2: Contexto (3s) ---
echo "[2/11] Toma 2: Contexto"
ffmpeg -y -i "$RAW/IMG_5336.MP4" \
  -t 3 \
  -vf "${FIX},${CG},drawtext=fontfile='${FONT}':text='Costanera Norte, un sábado cualquiera':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma02.mp4"

# --- TOMA 3: Preparación (3s) — 4K scale ---
echo "[3/11] Toma 3: Preparación"
ffmpeg -y -ss 5 -i "$RAW/IMG_5344.MOV" \
  -t 3 \
  -vf "scale=1080:1920,crop=iw-6:ih:0:0,scale=1080:1920:flags=lanczos,${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma03.mp4"

# --- TOMA 4: Motor apagado (5s) — 4K scale ---
echo "[4/11] Toma 4: Motor apagado"
ffmpeg -y -ss 0 -i "$RAW/IMG_5344.MOV" \
  -t 5 \
  -vf "scale=1080:1920,crop=iw-6:ih:0:0,scale=1080:1920:flags=lanczos,${CG},drawtext=fontfile='${FONT}':text='Cuando se apaga el motor...':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma04.mp4"

# --- TOMA 5a: Navegación (2s) — 4K scale ---
echo "[5/11] Toma 5a: Navegación"
ffmpeg -y -ss 0 -i "$RAW/IMG_5388.MOV" \
  -t 2 \
  -vf "scale=1080:1920,crop=iw-6:ih:0:0,scale=1080:1920:flags=lanczos,${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma05a.mp4"

# --- TOMA 5b: Navegación (2s) ---
echo "[6/11] Toma 5b: Navegación"
ffmpeg -y -i "$RAW/IMG_5365.MP4" \
  -t 2 \
  -vf "${FIX},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma05b.mp4"

# --- TOMA 6: Reacción (4s) ---
echo "[7/11] Toma 6: Reacción"
ffmpeg -y -ss 30 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" \
  -t 4 \
  -vf "${FIX},${CG},drawtext=fontfile='${FONT}':text='...cambia todo':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma06.mp4"

# --- TOMA 7a: Grupo (1.5s) ---
echo "[8/11] Toma 7a: Grupo"
ffmpeg -y -i "$RAW/IMG_5380.MP4" \
  -t 1.5 \
  -vf "${FIX},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma07a.mp4"

# --- TOMA 7b: Grupo (1.5s) ---
echo "[9/11] Toma 7b: Grupo"
ffmpeg -y -i "$RAW/IMG_1974.MP4" \
  -t 1.5 \
  -vf "${FIX},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma07b.mp4"

# --- TOMA 8: Paisaje (5s) ---
echo "[10/11] Toma 8: Paisaje"
ffmpeg -y -ss 0 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" \
  -t 5 \
  -vf "${FIX},${CG},drawtext=fontfile='${FONT}':text='Tu primera vez también puede ser así':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma08.mp4"

# --- TOMA 9: Cierre (4s) — LOGO overlay instead of text ---
echo "[11/11] Toma 9: Cierre con LOGO"
ffmpeg -y -ss 5 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" \
  -i "$LOGO" \
  -t 4 \
  -filter_complex "[0:v]${FIX},${CG}[bg];[1:v]scale=700:-1[logo];[bg][logo]overlay=(W-w)/2:(H-h)/2-60[v];[v]drawtext=fontfile='${FONT}':text='Escribinos por DM':fontsize=48:${DT}:y=1060,fade=t=out:st=3.5:d=0.5:color=black[vout]" \
  -map "[vout]" -map 0:a \
  -af "afade=t=out:st=3.5:d=0.5" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma09.mp4"

echo ""
echo "=========================================="
echo "PASO 2: Verificar resoluciones"
echo "=========================================="
for TOMA in toma01 toma02 toma03 toma04 toma05a toma05b toma06 toma07a toma07b toma08 toma09; do
  RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/${TOMA}.mp4" 2>&1 | head -1)
  echo "  $TOMA: $RES"
  if [ "$RES" != "1080,1920" ]; then echo "ERROR: $TOMA is $RES"; exit 1; fi
done

echo ""
echo "=========================================="
echo "PASO 3: Concatenar"
echo "=========================================="
cat > "$SEG/concat.txt" << 'CONCAT'
file 'toma01.mp4'
file 'toma02.mp4'
file 'toma03.mp4'
file 'toma04.mp4'
file 'toma05a.mp4'
file 'toma05b.mp4'
file 'toma06.mp4'
file 'toma07a.mp4'
file 'toma07b.mp4'
file 'toma08.mp4'
file 'toma09.mp4'
CONCAT

ffmpeg -y -f concat -safe 0 -i "$SEG/concat.txt" \
  -c copy \
  "$SEG/video_only.mp4"

VIDEO_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$SEG/video_only.mp4")
echo "Video duration: ${VIDEO_DUR}s"

echo "=========================================="
echo "PASO 4: Audio (ambiente 100% + música 15%)"
echo "=========================================="

ffmpeg -y -i "$SEG/video_only.mp4" \
  -vn -c:a pcm_s16le -ar 48000 \
  "$SEG/ambient.wav"

ffmpeg -y \
  -i "$SEG/ambient.wav" \
  -i "$MUSIC" \
  -filter_complex "[0:a]volume=1.0[a];[1:a]volume=0.15,atrim=0:${VIDEO_DUR%.*},afade=t=out:st=$((${VIDEO_DUR%.*}-2)):d=2[m];[a][m]amix=inputs=2:duration=first[out]" \
  -map "[out]" \
  -c:a pcm_s16le -ar 48000 \
  "$SEG/mixed.wav"

echo "=========================================="
echo "PASO 5: Mux final"
echo "=========================================="

ffmpeg -y \
  -i "$SEG/video_only.mp4" \
  -i "$SEG/mixed.wav" \
  -c:v copy -c:a aac -ar 48000 \
  "$OUT"

echo "=== BUILD V7 COMPLETE ==="
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT"
