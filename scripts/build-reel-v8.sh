#!/bin/bash
# Build reel-primera-vez v8
# Fixes: franja (crop 10px all sides), logo oficial, música nueva 15% stereo
set -e

BASE="C:/Users/josea/enba-social-assets/campaigns/reels/reel-primera-vez"
SEG="$BASE/segments"
RAW="$BASE/material-crudo"
MUSIC="$BASE/music/let-good-times-roll.mp3"
LOGO="$SEG/logo-official.png"
OUT="$BASE/reel-primera-vez-v8.mp4"

FONT="C\\:/Windows/Fonts/arialbd.ttf"

# Color grading
CG="colorbalance=rs=0.05:gs=0.0:bs=-0.08:rh=0.1:gh=0.05:bh=-0.03,noise=alls=8:allf=t"

# Fix franja: crop 10px from right, 4px from left, rescale to exact 1080x1920
FIX="crop=iw-14:ih:4:0,scale=1080:1920:flags=lanczos"

# Same for 4K clips (scale first to 1080 then crop)
FIX4K="scale=1080:1920,crop=iw-14:ih:4:0,scale=1080:1920:flags=lanczos"

# Text style
DT="fontcolor=white:borderw=3:bordercolor=black:box=1:boxcolor=black@0.5:boxborderw=12:x=(w-text_w)/2"

echo "=== PASO 1: Segments ==="

echo "[1/11] Toma 1: Hook"
ffmpeg -y -i "$RAW/IMG_5383.MP4" -t 3 \
  -vf "${FIX},eq=gamma=1.3,${CG},fade=t=in:st=0:d=0.3:color=black,drawtext=fontfile='${FONT}':text='Nunca había subido a un velero':fontsize=64:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma01.mp4"

echo "[2/11] Toma 2: Contexto"
ffmpeg -y -i "$RAW/IMG_5336.MP4" -t 3 \
  -vf "${FIX},${CG},drawtext=fontfile='${FONT}':text='Costanera Norte, un sábado cualquiera':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma02.mp4"

echo "[3/11] Toma 3: Preparación"
ffmpeg -y -ss 5 -i "$RAW/IMG_5344.MOV" -t 3 \
  -vf "${FIX4K},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma03.mp4"

echo "[4/11] Toma 4: Motor apagado"
ffmpeg -y -ss 0 -i "$RAW/IMG_5344.MOV" -t 5 \
  -vf "${FIX4K},${CG},drawtext=fontfile='${FONT}':text='Cuando se apaga el motor...':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma04.mp4"

echo "[5/11] Toma 5a: Navegación"
ffmpeg -y -ss 0 -i "$RAW/IMG_5388.MOV" -t 2 \
  -vf "${FIX4K},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma05a.mp4"

echo "[6/11] Toma 5b: Navegación"
ffmpeg -y -i "$RAW/IMG_5365.MP4" -t 2 \
  -vf "${FIX},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma05b.mp4"

echo "[7/11] Toma 6: Reacción"
ffmpeg -y -ss 30 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" -t 4 \
  -vf "${FIX},${CG},drawtext=fontfile='${FONT}':text='...cambia todo':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma06.mp4"

echo "[8/11] Toma 7a: Grupo"
ffmpeg -y -i "$RAW/IMG_5380.MP4" -t 1.5 \
  -vf "${FIX},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma07a.mp4"

echo "[9/11] Toma 7b: Grupo"
ffmpeg -y -i "$RAW/IMG_1974.MP4" -t 1.5 \
  -vf "${FIX},${CG}" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma07b.mp4"

echo "[10/11] Toma 8: Paisaje"
ffmpeg -y -ss 0 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" -t 5 \
  -vf "${FIX},${CG},drawtext=fontfile='${FONT}':text='Tu primera vez también puede ser así':fontsize=56:${DT}:y=1400" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma08.mp4"

echo "[11/11] Toma 9: Cierre con LOGO OFICIAL"
ffmpeg -y -ss 5 -i "$RAW/956CF4EA-ED6E-49B9-B883-B17C6A2D7403.mp4" \
  -i "$LOGO" \
  -t 4 \
  -filter_complex "[0:v]${FIX},${CG}[bg];[1:v]scale=980:-1[logo];[bg][logo]overlay=(W-w)/2:200[v];[v]drawtext=fontfile='${FONT}':text='Escribinos por DM':fontsize=52:${DT}:y=480,fade=t=out:st=3.5:d=0.5:color=black[vout]" \
  -map "[vout]" -map 0:a \
  -af "afade=t=out:st=3.5:d=0.5" \
  -c:v libx264 -crf 18 -preset medium -r 30 -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 "$SEG/toma09.mp4"

echo "=== PASO 2: Verificar ==="
ALL_OK=true
for TOMA in toma01 toma02 toma03 toma04 toma05a toma05b toma06 toma07a toma07b toma08 toma09; do
  RES=$(ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 "$SEG/${TOMA}.mp4" 2>&1 | head -1)
  echo "  $TOMA: $RES"
  if [ "$RES" != "1080,1920" ]; then echo "  ERROR!"; ALL_OK=false; fi
done
if [ "$ALL_OK" = false ]; then echo "ABORT: resolution mismatch"; exit 1; fi

echo "=== PASO 3: Concatenar ==="
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

ffmpeg -y -f concat -safe 0 -i "$SEG/concat.txt" -c copy "$SEG/video_only.mp4"
DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$SEG/video_only.mp4")
echo "Duration: ${DUR}s"

echo "=== PASO 4: Audio (ambiente stereo + música 15%) ==="
# Extract ambient as stereo WAV
ffmpeg -y -i "$SEG/video_only.mp4" -vn -c:a pcm_s16le -ar 48000 -ac 2 "$SEG/ambient_stereo.wav"

# Mix: ambient 100% + music 15%, fade out last 2s
DURI=${DUR%.*}
FADE_START=$((DURI - 2))
ffmpeg -y \
  -i "$SEG/ambient_stereo.wav" \
  -i "$MUSIC" \
  -filter_complex "[0:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,volume=1.0[amb];[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,volume=0.15,atrim=0:${DURI},afade=t=out:st=${FADE_START}:d=2[mus];[amb][mus]amix=inputs=2:duration=first:normalize=0[out]" \
  -map "[out]" -c:a pcm_s16le -ar 48000 -ac 2 "$SEG/mixed_stereo.wav"

echo "=== PASO 5: Mux final ==="
ffmpeg -y -i "$SEG/video_only.mp4" -i "$SEG/mixed_stereo.wav" \
  -c:v copy -c:a aac -ar 48000 -ac 2 -b:a 192k \
  -map 0:v -map 1:a \
  "$OUT"

echo "=== BUILD V8 COMPLETE ==="
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT"
ffprobe -v quiet -show_entries stream=codec_name,width,height,channels,sample_rate -of csv=p=0 "$OUT"
