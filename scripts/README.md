# Scripts — Indice de herramientas

**REGLA OBLIGATORIA:** Antes de crear cualquier script nuevo de render o publicacion, leer este archivo completo. Si la herramienta ya existe, usarla o adaptarla. No construir desde cero.

---

## Render / produccion visual

| Script | Tipo | Para que sirve | Cuando usarla |
|---|---|---|---|
| `build-reel-v8.sh` | bash + ffmpeg | Reel hardcodeado. Battle-tested. Usada para reel4horas_ENG. v8 reemplaza v7 (obsoleto). | Primer opcion para reels nuevos. |
| `render-reel.py` | Python + moviepy | Reel desde `edit-sheet.json`. Crop auto, slow-mo, texto, logo. La mas flexible. | Cuando el reel tiene estructura variable o muchos clips. |
| `render-micro-reel.mjs` | Node + ffmpeg | Micro-reel ~15s. Clips en array, 30fps/1080x1920, logo fade-in, musica fade-out. | Reels cortos de 10-20s. |
| `render-darkpost.mjs` | Playwright | Feed 10K (1080x1350). Lee `campaign.system.json` + `campaign.pieces.json`. 3 templates: manifesto, photo-hero, proof-utility. | Piezas de feed del frente 10K. |
| `render-enba-launch-campaign.mjs` | Playwright | Piezas de feed campana lanzamiento. | Campana lanzamiento. |
| `render-enba-launch-carousel.mjs` | Playwright | Carruseles. | Carruseles de cualquier campana. |
| `render-fase2-stories.mjs` | Playwright/Node | Stories fase 2. | Stories con plantilla fase 2. |
| `render-highlight-covers.mjs` | Playwright | Highlight covers de IG. | Renovar highlights de perfil IG. |
| `render-highlight-stories.mjs` | Playwright | Stories de highlights IG. | Stories para agregar a highlights. |
| `build-photo-preview.py` | Python | Previews de fotos para QA. | Revision de lotes de fotos. |
| `build-preview-qa-05-30.py` | Python | Preview QA especifico 05-30. | QA de lote especifico. |
| `build-video-contact-sheets.py` | Python | Contact sheets de video para revision. | Revisar clips crudos antes de editar. |

---

## Gestion de assets

| Script | Para que sirve |
|---|---|
| `curate-for-bank.py` | Cura fotos crudas y las prepara para asset-bank/ |
| `auto-classify-photos.py` | Clasificacion automatica de fotos por contenido |
| `classify-photos.py` | Clasificacion manual asistida de fotos |
| `classify-videos.py` | Clasificacion de videos crudos |
| `analyze-videos.py` | Analisis tecnico de videos (resolucion, fps, duracion) |
| `convert-heic.py` | Convierte HEIC (iPhone) a JPG |
| `build-redes-launch-image-bank.mjs` | Construye image bank del lanzamiento |

---

## Publicacion a Meta

| Script | Para que sirve |
|---|---|
| `publish-reel-ig.mjs` | Sube y publica reel en Instagram |
| `publish-reel-fb.mjs` | Sube y publica reel en Facebook |
| `publish-reel-10k.mjs` | Sube reel al frente 10K |
| `publish-piece.mjs` | Publica pieza de feed (imagen unica) |
| `publish-carousel.mjs` | Publica carrusel en IG y/o FB |
| `publish-fb-single.mjs` | Publica imagen unica en Facebook |
| `upload-video-to-ads.mjs` | Sube video a Meta Ads (para usar como creativo en ads) |
| `publish-stories-burst.mjs` | Burst de stories (usar con cuidado — ver CLAUDE.md sobre setTimeout) |
| `publish-scheduled.mjs` | Publicacion programada |
| `auto-publish-from-sitemap.mjs` | Publicacion automatica desde sitemap |
| `stage-campaign.mjs` | Mueve piezas aprobadas a staging/ |

---

## Meta Ads — estructura y segmentacion

| Script | Para que sirve |
|---|---|
| `create-meta-structure.mjs` / `create-meta-v2.mjs` | Crea estructura de campanas en Meta Ads |
| `create-meta-adsets.mjs` | Crea ad sets |
| `create-follow-ads.mjs` | Crea ads de follow (campanas de seguidores) |
| `update-targeting-p2p3p4.mjs` | Actualiza targeting de publicos P2, P3, P4 |
| `create-custom-conversions.mjs` / `create-missing-conversions.mjs` | Crea conversiones personalizadas en Meta |
| `get-fresh-adsets.mjs` | Fetch fresco del estado de ad sets desde Meta API |
| `gate1-fetch.mjs` | Fetch de metricas para evaluacion de Gate 1 |
| `migrate-follow-campaigns.mjs` | Migra campanas follow a nueva estructura |

---

## n8n — workflows y automatizacion

| Script | Para que sirve |
|---|---|
| `create-n8n-publish-v7.mjs` | Crea workflow de publicacion diaria v7 en n8n |
| `create-n8n-burst-workflow.mjs` | Crea workflow de burst de contenido |
| `create-n8n-ads-evaluation-workflow.mjs` | Crea workflow de evaluacion diaria de ads |
| `create-n8n-email-notifier.mjs` | Crea notificador de email via n8n |
| `create-n8n-stories-daily-workflow.mjs` | Crea workflow de stories diario |
| `patch-ads-evaluation-v2.mjs` | Parchea workflow de evaluacion de ads a v2 |
| `patch-burst-v2.mjs` | Parchea workflow burst a v2 |
| `patch-stories-add-sheets-log.mjs` | Agrega log a Google Sheets en workflow de stories |
| `check-executions.mjs` | Verifica ejecuciones recientes de n8n |

---

## Audio y voz

| Script | Para que sirve |
|---|---|
| `generate-voiceover.py` | Genera voiceover via API (base) |
| `generate-voiceover-eleven.py` | Genera voiceover via ElevenLabs |
| `generate-voiceover-eleven2.py` | Version 2 del generador ElevenLabs |

---

## Notas criticas

- **Para reels nuevos:** usar `build-reel-v8.sh` o `render-reel.py`. NO construir desde cero con Node+Playwright+ffmpeg — genera fricciones de fps, fuentes y rutas que ya resolvimos en estas herramientas.
- `build-reel-v7.sh` esta obsoleto — usar v8.
- Los scripts de publicacion usan `META_ACCESS_TOKEN` o `META_ADS_USER_TOKEN` desde Windows User scope. Ver CLAUDE.md seccion de tokens.
- No usar `setTimeout` en scripts de publicacion — usar n8n. Ver CLAUDE.md error #12.
