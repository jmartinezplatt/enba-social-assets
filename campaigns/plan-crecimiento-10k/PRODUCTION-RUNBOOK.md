# PRODUCTION RUNBOOK — ENBA

**Uso:** Recibís "quiero TAL pieza para TAL red" → buscá el tipo abajo → ejecutá el path.
**Fuentes de verdad:** `CLAUDE.md` (reglas, vocabulario, URLs), `STATUS.md` (estado actual), `meta-ids.json` (IDs de ads activos).

---

## 1. Regla de decisión rápida

| Tipo de pieza | Red | Render | Publicación |
|---|---|---|---|
| Feed imagen única | IG + FB | Playwright | `publish-piece.mjs` |
| Carrusel | IG | Playwright | `publish-carousel.mjs --ig-only` |
| Imagen única post-carrusel | FB | Playwright | `publish-fb-single.mjs` |
| Reel orgánico sin texto | IG + FB | `build-reel-v8.sh` | `publish-reel-ig/fb.mjs` |
| Reel con overlays/texto/end card | IG + FB | **Remotion** | Python upload + swap script |
| Video creativo para Meta Ads | Meta Ads | Remotion o ffmpeg | Python upload → creative → swap |
| Stories | IG + FB | `render-fase2-stories.mjs` | n8n workflow o manual |
| TikTok | TikTok | — | **RESTRINGIDO** — publicación manual |

---

## 2. Paths por tipo de pieza

---

### Feed imagen única — IG + FB

**Cuándo:** pieza de feed estática. Formato 1080×1350 (4:5) o 1080×1080 (1:1).

**Render:**
```bash
node scripts/render-darkpost.mjs          # piezas del frente 10K
node scripts/render-enba-launch-campaign.mjs  # campaña lanzamiento
```

**Output esperado:** `campaigns/.../output/piece-XX.jpg` + `captions.json` con `captionIg` y `captionFb`.

**Publicación:**
```bash
node scripts/stage-campaign.mjs           # mover a staging/
node scripts/publish-piece.mjs <piece-id> # publica IG + FB
```

**QA mínimo (Nico):**
- `captionIg` y `captionFb` presentes y completos
- Sin vocabulario prohibido, sin precios, sin "Puerto Madero"
- URLs correctas según tabla de verticales (CLAUDE.md)
- Hashtags: IG 8-15, FB 3-5
- Visual = spec del brief

**No hacer:**
- No publicar sin `captions.json` completo
- No usar PNG para Meta API — siempre JPEG (`type: 'jpeg', quality: 92`)
- No asumir que push a main = deploy. Verificar Cloudflare Pages antes de usar URL en Meta API

---

### Carrusel IG + imagen única FB

**Cuándo:** contenido educativo, multi-slide. FB no soporta carrusel nativo — se publica como imagen única (hero slide o collage).

**Render:**
```bash
node scripts/render-enba-launch-carousel.mjs
# o el renderer específico del carrusel
```

**Output esperado:** `slide-01.png ... slide-NN.png` + `carousel.config.json` + `captions.json`.

**Publicación:**
```bash
node scripts/publish-carousel.mjs campaigns/carruseles-organicos/X/ --ig-only
node scripts/publish-fb-single.mjs campaigns/carruseles-organicos/X/  # imagen única FB
```

**QA mínimo:** ídem feed imagen única + verificar que el primer slide funciona como imagen standalone para FB.

**No hacer:**
- No intentar publicar carrusel en FB — no está soportado
- No correr `publish-carousel.mjs` sin `--ig-only` si no querés tocar FB

---

### Reel orgánico sin texto — IG + FB

**Cuándo:** reel de clips puros, sin overlays tipográficos, sin end card animado.

**Render:**
```bash
bash scripts/build-reel-v8.sh   # opción principal, battle-tested
python scripts/render-reel.py   # si el reel tiene estructura variable
```

**Output esperado:** MP4 1080×1920, 30fps, H.264, CRF 23.

**Publicación:**
```bash
node scripts/publish-reel-ig.mjs <video.mp4> --caption "..."
node scripts/publish-reel-fb.mjs <video.mp4> --caption "..."
```

**QA mínimo:**
- Duración ≤ 90s (límite IG Reels)
- Audio presente (música o ambiente)
- Revisar safe zone si hay elementos gráficos

**No hacer:**
- No usar `build-reel-v7.sh` — obsoleto, usar v8
- No construir desde cero con Node+Playwright+ffmpeg si ya existe herramienta

---

### Reel con overlays / texto / end card — IG + FB

**Cuándo:** reel que necesita texto tipografiado (Barlow Semi Condensed), overlays con fade, end card animado con logo ENBA. Este es el path de Remotion.

**Render:**
```bash
# En enba-remotion/
npm run dev                                    # preview en Remotion Studio
npx remotion render MicroreelV3 out/reel.mp4  # render final
```

Clonar `src/Microreel.tsx` para composiciones nuevas. Cambiar `CLIPS` y `OVERLAYS`. Los `tIn`/`tOut` son frames absolutos a 30fps.

**Safe zone obligatoria:**
- `bottom` de overlays: `>= 400px` (UI de IG ocupa los primeros 350px desde abajo)
- `top`: evitar los primeros `250px` (username, botón seguir)
- `right`: evitar los últimos `120px` (like/comment/share)

**Output esperado:** MP4 en `out/reel.mp4` → copiar a `enba-redes/campaigns/plan-crecimiento-10k/reels/`.

**Subida a Meta:**
```bash
# 1. Upload del video (Python — Node.js Blob está roto para binarios)
python3 -c "..." # ver swap-ig-cold-v3.mjs como referencia

# 2. Publicación orgánica
node scripts/publish-reel-ig.mjs <video.mp4>
node scripts/publish-reel-fb.mjs <video.mp4>
```

**QA mínimo:** verificar safe zone en Remotion Studio antes de render final. Preview `microreel-ig-v3-preview.html` como referencia.

**No hacer:**
- No usar `render-micro-reel.mjs` para reels con texto — fuentes no garantizadas con ffmpeg drawtext
- No subir video a Meta con Node.js fetch/Blob — trunca el binario

---

### Video creativo para Meta Ads

**Cuándo:** reemplazar el creativo de un ad activo en Meta Ads. No es publicación orgánica — el video queda como ad.

**Render:** según tipo (Remotion si tiene overlays, ffmpeg si es solo clips).

**Pipeline de subida (validado):**

```
1. Python multipart upload → VIDEO_ID
   POST /{ad_account}/advideos

2. Node.js crear creative → CREATIVE_ID (con META_ACCESS_TOKEN / Page Token)
   POST /{ad_account}/adcreatives
   body: { object_story_spec: { page_id, instagram_user_id, video_data: { video_id, image_hash, message, call_to_action } } }

3. Node.js actualizar ad → success (con META_ADS_USER_TOKEN / System User)
   POST /{AD_ID}
   body: { creative: { creative_id } }
```

**Scripts de referencia:**
- `scripts/swap-ig-cold-v3.mjs` — swap puntual, scope acotado a un solo ad ← usar este como base
- `scripts/swap-creative-microreel-ig-cold.mjs` — versión intermedia, también válida

**QA mínimo:**
- Verificar status del ad antes de tocar: `GET /{AD_ID}?fields=status,effective_status`
- Verificar que el video procesó completo: `length` debe ser la duración real (no 0.4s)
- Confirmar `{"success":true}` en la respuesta del ad update
- Revisar en Ads Manager o preview URL que el creative se cargó

**No hacer:**
- No usar `upload-video-to-ads.mjs` — actualiza los 4 ads sin verificar status (deprecated de facto)
- No subir video con Node.js Blob/FormData — Meta recibe el archivo truncado
- No pausar ad sets ni campañas — solo pausar/despausar a nivel `ad`
- No asumir que `{"success":true}` = video correcto. Verificar `length` del video antes de crear el creative

---

### Stories — IG + FB

**Cuándo:** stories de marca, highlights, o stories diarias del selector de best performer.

**Render:**
```bash
node scripts/render-fase2-stories.mjs      # stories fase 2
node scripts/render-highlight-stories.mjs  # stories para highlights
node scripts/render-highlight-covers.mjs   # covers de highlights IG
```

**Publicación:**
- Stories automáticas diarias: via n8n workflow `ZGIGw47IYuwHv3Wh` (08:30 ART) — no ejecutar manualmente
- Stories puntuales: `publish-stories-burst.mjs` **solo via n8n** — nunca correr localmente con setTimeout

**No hacer:**
- No publicar stories con scripts locales con setTimeout — genera procesos zombie y duplicados (incidente 23/04)
- Para cualquier burst o publicación periódica: usar n8n

---

### TikTok

**Estado: RESTRINGIDO.** La app "ENBA Social" está en review en TikTok Developer Portal. Videos publicados via API quedan en modo privado hasta aprobación.

**Publicación:** manual únicamente hasta recibir aprobación explícita de TikTok.

---

## 3. Remotion — cuándo usarlo y cuándo no

**Usar Remotion para:**
- Reels con overlays de texto tipografiado (fade in/out, posición precisa)
- End cards animados (`EndCard.tsx` ya existe — reusar sin cambios)
- Cualquier composición donde la safe zone o el timing de texto importa
- Composiciones React que mezclan video + texto + logo

**No usar Remotion para:**
- Feed images estáticas (Playwright es suficiente)
- Carrusel slides (Playwright)
- Stories estáticas (Playwright)
- Reels sin texto (build-reel-v8.sh o render-reel.py son más rápidos)

**`public/` es cache local — no va a git:**
- Contiene clips MP4 pre-procesados y música
- Se rehidrata copiando desde `C:\Users\josea\enba-fotos-crudas\` + extracción ffmpeg
- Ver `enba-remotion/README.md` para instrucciones de rehidratación

**Repo fuente:** `enba-remotion` (privado, sin remote de deploy)
**Output final:** MP4 renderizado se copia a `enba-redes/campaigns/.../reels/` para subida a Meta

---

## 4. Meta Ads — reglas operativas

**Tokens:**
- `META_ACCESS_TOKEN` (Page Token) — crear creatives
- `META_ADS_USER_TOKEN` (System User, nunca expira) — actualizar ads, leer métricas

**Upload de video:** siempre Python `requests` multipart. Node.js Blob/FormData trunca binarios grandes.

**Swap de creativo:** usar scripts acotados por ad (como `swap-ig-cold-v3.mjs`). Nunca scripts que iteran sobre múltiples ads sin verificar `status`.

**Jerarquía de pausa:** solo a nivel `ad`. Campañas y ad sets se mantienen siempre `ACTIVE`.

**Verificar antes de actuar:**
```bash
# Estado actual de un ad
node -e "fetch('https://graph.facebook.com/v22.0/{AD_ID}?fields=name,status,effective_status,creative&access_token=TOKEN').then(r=>r.json()).then(console.log)"
```

**Scripts deprecated — no usar:**
- `upload-video-to-ads.mjs` — actualiza 4 ads sin verificar status

---

## 5. Referencias

- `CLAUDE.md` — voz de marca, vocabulario prohibido, URLs por vertical, pipeline completo, reglas n8n
- `campaigns/plan-crecimiento-10k/STATUS.md` — snapshot operativo de la sesión actual
- `campaigns/plan-crecimiento-10k/meta-ids.json` — IDs de todos los ads, ad sets, campañas y creativos activos
- `scripts/README.md` — inventario completo de scripts con descripción y cuándo usar cada uno
- `enba-remotion/README.md` — instrucciones de setup y rehidratación de assets
