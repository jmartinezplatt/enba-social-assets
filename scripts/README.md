# Scripts — Indice de herramientas

**REGLA OBLIGATORIA:** Antes de crear cualquier script nuevo de render o publicacion, leer este archivo completo. Si la herramienta ya existe, usarla o adaptarla. No construir desde cero.

> **Remotion:** para reels con overlays de texto, end cards animados o composiciones video+tipo, usar el repo separado `enba-remotion` (privado). Los scripts de este repo son para Playwright (estáticas, carruseles, stories) y ffmpeg (reels sin texto). Ver `campaigns/plan-crecimiento-10k/PRODUCTION-RUNBOOK.md` para la regla de decisión por tipo de pieza.

---

## Render / produccion visual

| Script | Tipo | Para que sirve | Cuando usarla |
|---|---|---|---|
| `build-reel-v8.sh` | bash + ffmpeg | Reel hardcodeado. Battle-tested. Usada para reel4horas_ENG. v8 reemplaza v7 (obsoleto). | Primer opcion para reels nuevos. |
| `build-reel-eng-v2.mjs` | Node + Playwright | Reel engagement v2 (reemplazo de reel4horas). | Reel ENG con estructura especifica. |
| `render-reel.py` | Python + moviepy | Reel desde `edit-sheet.json`. Crop auto, slow-mo, texto, logo. La mas flexible. | Cuando el reel tiene estructura variable o muchos clips. |
| `render-micro-reel.mjs` | Node + ffmpeg | Micro-reel ~15s. Clips en array, 30fps/1080x1920, logo fade-in, musica fade-out. **SUPERSEDIDO por Remotion (`enba-remotion`) para reels con texto — no usar para overlays tipograficos.** | Solo si el reel no necesita texto ni end card animado. |
| `render-darkpost.mjs` | Playwright | Feed 10K (1080x1350). Lee `campaign.system.json` + `campaign.pieces.json`. 3 templates: manifesto, photo-hero, proof-utility. | Piezas de feed del frente 10K. |
| `render-enba-launch-campaign.mjs` | Playwright | Piezas de feed campana lanzamiento. | Campana lanzamiento. |
| `render-enba-launch-carousel.mjs` | Playwright | Carruseles. | Carruseles de cualquier campana. |
| `render-fase2-stories.mjs` | Playwright/Node | Stories fase 2. | Stories con plantilla fase 2. |
| `render-highlight-covers.mjs` | Playwright | Highlight covers de IG. | Renovar highlights de perfil IG. |
| `render-highlight-stories.mjs` | Playwright | Stories de highlights IG. | Stories para agregar a highlights. |
| `render-endcard-compare.mjs` | Playwright | Genera dos versiones de end card para comparacion visual. | Comparar opciones de endcard para reels. |
| `render-endcards-temp.mjs` | Node | Genera endcards con logo oficial sobre fondo navy. | Endcards para TikTok/Reels. |
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
| `group-similar-photos.py` | Agrupa fotos similares (pHash) y elige la mas nitida de cada grupo. Genera `groups.json` + preview HTML. Uso: `python scripts/group-similar-photos.py <directorio> [--threshold 8] [--out preview.html]`. Incluye HEICs convertidos en subdirectorios `.temp-*`. |

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
| `upload-video-to-ads.mjs` | **DEPRECATED — no usar.** Actualiza los 4 ads microreel sin verificar status. Roto para binarios grandes (Node.js Blob). Reescribir antes de cualquier uso. |
| `swap-ig-cold-v3.mjs` | Swap creativo puntual en `ENBA_ad_microreel_IG_Cold`. Scope acotado a un solo ad. Usar como base para futuros swaps. |
| `swap-creative-microreel-ig-cold.mjs` | Version intermedia del swap (incluye upload). Valida como referencia. |
| `upload-ads-01may.mjs` | Referencia de patron upload imagenes estaticas (Node fetch, UTF-8 safe). No reutilizar directamente — extraer patron. |
| `publish-piece05-ig.mjs` | Publica piece-05 en IG manualmente (workaround Cloudflare/crawler) |
| `publish-teaser.mjs` | DEPRECATED — usa endpoint FB viejo. No correr sin actualizar a patron 2 pasos. |
| `publish-stories-burst.mjs` | Burst de stories (usar con cuidado — ver CLAUDE.md sobre setTimeout) |
| `publish-scheduled.mjs` | Publicacion programada |
| `publish-blog-recovery.mjs` | Recuperacion incidente Gmail 25/04 — publica blog via GitHub API |
| `auto-publish-from-sitemap.mjs` | Publicacion automatica desde sitemap |
| `stage-campaign.mjs` | Mueve piezas aprobadas a staging/ |
| `upload-ads-01may.mjs` | Sube 4 ads (2 IG + 2 FB) con creatives y captions via Node fetch (UTF-8 safe) |

---

## Meta Ads — estructura y segmentacion

| Script | Para que sirve |
|---|---|
| `create-meta-structure.mjs` / `create-meta-v2.mjs` | Crea estructura de campanas en Meta Ads |
| `create-meta-adsets.mjs` | Crea ad sets |
| `create-follow-ads.mjs` | Crea ads de follow (campanas de seguidores) |
| `update-targeting-p2p3p4.mjs` | Actualiza targeting de publicos P2, P3, P4 |
| `create-custom-conversions.mjs` / `create-missing-conversions.mjs` | Crea conversiones personalizadas en Meta |
| `create-meta-page-token-credential.mjs` | Crea credencial de Page Token en n8n desde Windows User scope |
| `get-fresh-adsets.mjs` | Fetch fresco del estado de ad sets desde Meta API |
| `gate1-fetch.mjs` | Fetch de metricas para evaluacion de Gate 1 |
| `migrate-follow-campaigns.mjs` | Migra campanas follow a nueva estructura |
| `simulate-ads-report.mjs` | Simulacro del reporte diario de ads — disparo unico via webhook temporario |
| `verify-all-gaps.mjs` | Verificacion end-to-end de todos los gaps resueltos post-auditoria |
| `verify-pixel-g8.mjs` | Verifica que pixel usa D1 WebVisitors |

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
| `patch-n8n-workflow-v6-two-step-fb.mjs` | Patch v6: FB publish en 2 pasos (photos published=false + feed attached_media) |
| `patch-utms-g5.mjs` | Agrega UTMs a todos los ads activos |
| `patch-ads-evaluation-v2.mjs` | Parchea workflow de evaluacion de ads a v2 |
| `patch-burst-v2.mjs` | Parchea workflow burst a v2 |
| `check-executions.mjs` | Verifica ejecuciones recientes de n8n |
| `n8n-prep-test-piece01.mjs` | Preparacion de test real con piece-01 (override Find Today Piece) |
| `n8n-prep-test-piece02.mjs` | Preparacion de test real con piece-02 |
| `n8n-restore-post-test-piece01.mjs` | Restauracion post-test piece-01 (restaura jsCode original) |

---

## Audio y voz

| Script | Para que sirve |
|---|---|
| `generate-voiceover.py` | Genera voiceover via API (base) |
| `generate-voiceover-eleven.py` | Genera voiceover via ElevenLabs |
| `generate-voiceover-eleven2.py` | Version 2 del generador ElevenLabs |

---

## One-offs y fixes historicos

Scripts que resolvieron problemas puntuales. No reutilizables pero documentan incidentes.

| Script | Para que sirvio |
|---|---|
| `execute-plan-23apr.mjs` | Plan reconciliado Bruno/Experto 23/04 — pausas y escalados via API |
| `fix-c3-creative-encoding.mjs` | Fix encoding roto en creative C3 Corporativo (curl bash perdio tildes) |
| `fix-g4-g6.mjs` | Completar gaps G-4 y G-6 de auditoria |
| `fix-gaps-p0.mjs` | Resolver gaps P0 de auditoria (video ads en AWR) |
| `investigate-g4.mjs` | Investigacion de como crear creative para reel primera vez |
| `migrate-env-to-windows.mjs` | Migra tokens de .env a Windows User scope |
| `delete-server.mjs` | Mini server para manejar borrado de archivos desde preview HTML |

---

## Notas criticas

- **Para reels sin texto:** usar `build-reel-v8.sh` o `render-reel.py`. NO construir desde cero con Node+Playwright+ffmpeg.
- **Para reels con texto/overlays/end card:** usar Remotion en repo `enba-remotion`. Ver `PRODUCTION-RUNBOOK.md`.
- `build-reel-v7.sh` esta obsoleto — usar v8.
- `upload-video-to-ads.mjs` esta DEPRECATED — no usar sin reescritura. Para swaps puntuales usar `swap-ig-cold-v3.mjs` como base.
- Los scripts de publicacion usan `META_ACCESS_TOKEN` o `META_ADS_USER_TOKEN` desde Windows User scope. Ver CLAUDE.md seccion de tokens.
- No usar `setTimeout` en scripts de publicacion — usar n8n. Ver CLAUDE.md error #12.
