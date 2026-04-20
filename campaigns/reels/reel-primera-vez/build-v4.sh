#!/bin/bash
# Build reel-primera-vez v4 — Fix franjas laterales + audio ambiente real
# Dani — Productor Visual, ENBA Team 3
#
# Fixes v4:
# - FRANJA LATERAL: Los clips iPhone tienen rotation=-90. FFmpeg auto-rota,
#   así que post-rotación son portrait nativos (1080x1920).
#   NO se usa crop. Solo scale para 4K clips.
# - AUDIO: Audio original de cada clip al 100%. Música mezclada al 5%.
#
# Track: "Landra's Dream" by Jason Shaw (audionautix.com) — CC BY 4.0
set -e

BASE="C:/Users/josea/enba-social-assets/campaigns/reels/reel-primera-vez"
SEG="$BASE/segments"
RAW="$BASE/material-crudo"
MUSIC="$BASE/music/landras-dream.mp3"
OUT="$BASE/reel-primera-vez-v4.mp4"

FONT="C\\:/Windows/Fonts/arialbd.ttf"

# Color grading: golden/teal + film grain
CG="colorbalance=rs=0.05:gs=0.0:bs=-0.08:rh=0.1:gh=0.05:bh=-0.03,noise=alls=8:allf=t"

# Text style common
DT="fontcolor=white:borderw=3:bordercolor=black:box=1:boxcolor=black@0.5:boxborderw=12:x=(w-text_w)/2"

echo "=========================================="
echo "PASO 0: Limpiar segments/"
echo "=========================================="
rm -f "$SEG"/*.mp4 "$SEG"/*.wav "$SEG"/*.txt "$SEG"/*.jpg "$SEG"/*.aac
echo "Limpio."

echo "=========================================="
echo "PASO 1: Generar segmentos (sin crop)"
echo "=========================================="

# --- TOMA 1: Hook (3s) — IMG_5383 (1080x1920 post-rot, NO crop NO scale) ---
# Extra: eq=gamma=1.3 + fade in from black
echo "[1/11] Toma 1: Hook — IMG_5383.MP4"
ffmpeg -y -i "$RAW/IMG_5383.MP4" \
  -t 3 \
  -vf "eq=gamma=1.3,${CG},fade=t=in:st=0:d=0.3:color=black,drawtext=fontfile='${FONT}':text='Nunca había subido a un velero':fontsize=64:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma01.mp4"

# Verify
RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma01.mp4" 2>&1 | head -1)
echo "  toma01 resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma01 is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 2: Contexto (3s) — IMG_5336 (1080x1920 post-rot) ---
echo "[2/11] Toma 2: Contexto — IMG_5336.MP4"
ffmpeg -y -i "$RAW/IMG_5336.MP4" \
  -t 3 \
  -vf "${CG},drawtext=fontfile='${FONT}':text='Costanera Norte, un sábado cualquiera':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma02.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma02.mp4" 2>&1 | head -1)
echo "  toma02 resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma02 is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 3: Preparación (3s) — IMG_5344 ss=5 (4K 2160x3840, needs scale) ---
echo "[3/11] Toma 3: Preparación — IMG_5344.MOV ss=5"
ffmpeg -y -ss 5 -i "$RAW/IMG_5344.MOV" \
  -t 3 \
  -vf "scale=1080:1920,${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma03.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma03.mp4" 2>&1 | head -1)
echo "  toma03 resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma03 is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 4: Motor apagado (5s) — IMG_5344 ss=0 (4K, scale) ---
echo "[4/11] Toma 4: Motor apagado — IMG_5344.MOV ss=0"
ffmpeg -y -ss 0 -i "$RAW/IMG_5344.MOV" \
  -t 5 \
  -vf "scale=1080:1920,${CG},drawtext=fontfile='${FONT}':text='Cuando se apaga el motor...':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma04.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma04.mp4" 2>&1 | head -1)
echo "  toma04 resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma04 is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 5a: Navegación (2s) — IMG_5388 ss=0 (4K, scale) ---
echo "[5/11] Toma 5a: Navegación — IMG_5388.MOV ss=0"
ffmpeg -y -ss 0 -i "$RAW/IMG_5388.MOV" \
  -t 2 \
  -vf "scale=1080:1920,${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma05a.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma05a.mp4" 2>&1 | head -1)
echo "  toma05a resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma05a is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 5b: Navegación (2s) — IMG_5365 (1080x1920 post-rot) ---
echo "[6/11] Toma 5b: Navegación — IMG_5365.MP4"
ffmpeg -y -i "$RAW/IMG_5365.MP4" \
  -t 2 \
  -vf "${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma05b.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma05b.mp4" 2>&1 | head -1)
echo "  toma05b resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma05b is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 6: Reacción (4s) — 956CF4EA ss=30 (1080x1920 native) ---
echo "[7/11] Toma 6: Reacción — 956CF4EA ss=30"
ffmpeg -y -ss 30 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" \
  -t 4 \
  -vf "${CG},drawtext=fontfile='${FONT}':text='...cambia todo':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma06.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma06.mp4" 2>&1 | head -1)
echo "  toma06 resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma06 is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 7a: Grupo (1.5s) — IMG_5380 (1080x1920 post-rot) ---
echo "[8/11] Toma 7a: Grupo — IMG_5380.MP4"
ffmpeg -y -i "$RAW/IMG_5380.MP4" \
  -t 1.5 \
  -vf "${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma07a.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma07a.mp4" 2>&1 | head -1)
echo "  toma07a resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma07a is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 7b: Grupo (1.5s) — IMG_1974 (1080x1920 post-rot) ---
echo "[9/11] Toma 7b: Grupo — IMG_1974.MP4"
ffmpeg -y -i "$RAW/IMG_1974.MP4" \
  -t 1.5 \
  -vf "${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma07b.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma07b.mp4" 2>&1 | head -1)
echo "  toma07b resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma07b is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 8: Paisaje (5s) — 956CF4EA ss=0 (1080x1920 native) ---
echo "[10/11] Toma 8: Paisaje — 956CF4EA ss=0"
ffmpeg -y -ss 0 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" \
  -t 5 \
  -vf "${CG},drawtext=fontfile='${FONT}':text='Tu primera vez también puede ser así':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma08.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma08.mp4" 2>&1 | head -1)
echo "  toma08 resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma08 is $RES, expected 1080,1920"; exit 1; fi

# --- TOMA 9: Cierre (4s) — 956CF4EA ss=5 (1080x1920 native) ---
# Extra: fade out video + audio at 3.5s
echo "[11/11] Toma 9: Cierre — 956CF4EA ss=5"
ffmpeg -y -ss 5 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" \
  -t 4 \
  -vf "${CG},drawtext=fontfile='${FONT}':text='ESPACIO NÁUTICO BUENOS AIRES':fontsize=60:${DT}:y=850,drawtext=fontfile='${FONT}':text='Escribinos por DM':fontsize=48:${DT}:y=930,fade=t=out:st=3.5:d=0.5:color=black" \
  -af "afade=t=out:st=3.5:d=0.5" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p \
  -c:a aac -ar 48000 \
  "$SEG/toma09.mp4"

RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/toma09.mp4" 2>&1 | head -1)
echo "  toma09 resolution: $RES"
if [ "$RES" != "1080,1920" ]; then echo "ERROR: toma09 is $RES, expected 1080,1920"; exit 1; fi

echo ""
echo "=========================================="
echo "PASO 2: Extraer frames de verificación"
echo "=========================================="

for TOMA in toma01 toma02 toma03 toma04 toma05a toma05b toma06 toma07a toma07b toma08 toma09; do
  ffmpeg -y -ss 0.5 -i "$SEG/${TOMA}.mp4" -frames:v 1 -q:v 2 "$SEG/verify_${TOMA}.jpg" 2>/dev/null
  echo "  $TOMA: frame extraído"
done

echo ""
echo "=========================================="
echo "PASO 3: Concatenar video"
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
echo "Video duration: ${VIDEO_DUR}s (target: 34s)"

echo "=========================================="
echo "PASO 4: Mezclar audio (ambiente 100% + música 5%)"
echo "=========================================="

# Extraer audio ambiente del video concatenado
ffmpeg -y -i "$SEG/video_only.mp4" \
  -vn -c:a pcm_s16le -ar 48000 \
  "$SEG/ambient.wav"

# Mezclar: ambiente al 100%, música al 5%
ffmpeg -y \
  -i "$SEG/ambient.wav" \
  -i "$MUSIC" \
  -filter_complex "[0:a]volume=1.0[a];[1:a]volume=0.05,atrim=0:34[m];[a][m]amix=inputs=2:duration=first[out]" \
  -map "[out]" \
  -c:a pcm_s16le -ar 48000 \
  "$SEG/mixed.wav"

echo "=========================================="
echo "PASO 5: Mux video + audio final"
echo "=========================================="

ffmpeg -y \
  -i "$SEG/video_only.mp4" \
  -i "$SEG/mixed.wav" \
  -c:v copy -c:a aac -ar 48000 \
  "$OUT"

echo "=========================================="
echo "PASO 6: Verificación final"
echo "=========================================="

echo "--- reel-primera-vez-v4.mp4 ---"
ffprobe -v quiet -show_entries format=duration,size -of default=nw=1 "$OUT"
ffprobe -v quiet -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate -of default=nw=1 "$OUT"

echo ""
echo "Output: $OUT"
echo "Track: Landra's Dream by Jason Shaw (audionautix.com) — CC BY 4.0"
echo "=== BUILD V4 COMPLETE ==="
