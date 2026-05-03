# STATUS — Frente REDES

**Última actualización:** 03 de mayo de 2026 (sesión curación asset-bank)
**Owner de mantenimiento:** quien cierre la sesión del frente redes
**Uso:** punto de entrada corto para inicio de sesión. Si este archivo contradice un handoff viejo, manda este archivo.

---

## 1. Qué leer primero

Orden recomendado de carga:

1. `CLAUDE.md` — reglas permanentes del repo
2. `campaigns/plan-crecimiento-10k/STATUS.md` — estado operativo vigente
3. Profundización por tarea:
   - estrategia / pendientes: `plan-maestro.md`
   - pauta: `presupuesto-v4-reestructuracion.md`
   - Meta Ads / IDs / estados: `meta-ids.json`
   - analytics / QA: `google-analytics-medicion.md`, `kpis.md`, `qa-report.md`
   - n8n / workflows / operación: `../../automatizaciones/n8n-workflows/OPERACION-N8N.md` + `../../automatizaciones/n8n-workflows/INCIDENTES.md`

**No usar handoffs fechados como fuente de verdad principal.**
Los `SESSION-HANDOFF-*.md` sirven como contexto histórico, lecciones e incidentes, pero pueden quedar desactualizados.

---

## 2. Snapshot vigente

### Branch activo

- `main`

### Estado general del frente

- La fuente de verdad de pauta vigente es `presupuesto-v4-reestructuracion.md`.
- La fuente de verdad operativa y de decisiones sigue siendo `plan-maestro.md`.
- La fuente de verdad de infraestructura Meta Ads es `meta-ids.json`.
- El contrato de producción de contenido sigue siendo:
  - `campaign.pieces.json` para campañas
  - `carousel.config.json` + `captions.json` para carruseles

### Snapshot del repo al 03/05

- `asset-bank/`: 1,924 archivos (1,281 fotos + 643 videos). Local-first: subcarpetas ignoradas por git (pesadas). Ver `asset-bank/README.md`.
    - `raíz`: 0 (limpia, todo clasificado)
    - `destinos/`: 285 fotos, 141 videos
    - `escuela-aprendizaje/`: 214 fotos, 68 videos
    - `servicios/`: 217 fotos, 130 videos
    - `travesias-navegacion/`: 191 fotos, 130 videos
    - `buenos-aires-paisaje/`: 117 fotos, 72 videos
    - `veleros-broker/`: 137 fotos, 76 videos
    - `grupos-experiencia/`: 120 fotos, 26 videos
- `staging/`: 32 archivos
- `published/`: 1 archivo
- `manifests/`: piezas programadas y publicadas del feed
- `campaigns/`: conviven campañas activas, renders, reels, propuestas y material histórico de trabajo

### Infra y operación documentadas como activas

| Workflow | ID | Descripción | Estado |
|---|---|---|---|
| ENBA - Redes Publicación Diaria v7.2 | `MipwleZNu8EG5v6C` | Publicación feed IG+FB 12:15 ART, 34 nodos | Activo |
| ENBA - Email Notifier | `yYnyrB7UI52Syf9x` | Webhook `enba-email-notifier` → email Gmail ENBA | Activo |
| ENBA - Evaluación Diaria Ads | `1qRywsEWAl7VoO5o` | Evaluación diaria de performance de ads | Activo |
| ENBA - Stories Fase 2 Mañana | `q1nZVNrtEsxKEFni` | Story IG+log sheet 09:00 ART | Activo |
| ENBA - Stories Fase 2 Tarde | `pBP7tkXlD6nzx4wd` | Story IG+log sheet 14:00 ART | Activo |
| ENBA - Stories Fase 2 Noche | `c8MHANGzW56GORAi` | Story IG+log sheet 20:00 ART | Activo |
| ENBA - Stories FB Best IG | `ZGIGw47IYuwHv3Wh` | Lee sheet, elige story con mayor reach, publica en FB 08:30 ART | Activo |

Google Sheet stories log: `1DimMWT7rNXNd2jS_rnCNs0qHLqSahwYLc3s9m7wpw1U`
Webhook email: `https://espacionautico.app.n8n.cloud/webhook/enba-email-notifier`

### Últimos hitos relevantes

- **03/05 sesión curación asset-bank:** Curación completa carpeta `Veleros` de Google Photos.
  - **Fuente procesada:** `enba-fotos-crudas/google-photos/Veleros/` — 2,579 archivos originales, carpeta vaciada al 100%.
  - **Paso 1 (JPG):** 649 analizadas, 472 duplicados eliminados, 140 descartadas, 37 curadas al asset-bank con nombres descriptivos.
  - **Paso 2 (HEIC):** 990 convertidas a JPG (pillow-heif), 621 duplicados por nombre + 2 visuales (imagehash phash), 281 descartadas, 88 curadas.
  - **Paso 3 (Videos):** 869 analizados, 690 duplicados eliminados, 127 Live Photos (<3s) eliminados, 162 descartados, 17 curados.
  - **Paso 4 (DNG/RAW):** 64 convertidos, 1 duplicado visual, 49 descartados, 14 curados.
  - **Total ingresado:** 156 archivos nuevos (139 fotos + 17 videos) con nombres descriptivos y clasificación por subcarpeta.
  - **Reclasificación masiva:** Jose revisó todo el banco con herramienta clasificador HTML. 1,111 acciones en fotos (997 moves + 114 deletes) + 559 acciones en videos (488 moves + 71 deletes).
  - **Raíz limpia:** 161 fotos de raíz movidas a subcarpetas. 0 archivos en raíz.
  - **Decisión local-first:** asset-bank subcarpetas ignoradas por git (1.3 GB fotos + 3 GB videos). Git trackea docs, scripts y piezas livianas. Documentado en `asset-bank/README.md`.
  - **Asset-bank final:** 1,281 fotos + 643 videos = 1,924 archivos en 7 subcarpetas.
  - **Pendiente:** grid curado IG (brief producción Dani) — preview `grid-curado-preview.html` generado, sin ejecutar.
- **02/05 sesión (día 14/27):** Auditoría completa targeting + ad set test creado.
  - **Gate 3: VERDE.** 1,044 follows acumulados (966 FB + 78 IG) vs target 800. CPS blended $256 (inflado por gasto desperdiado días 1-2).
  - **Review Bruno día 14:** reel-eng-v2 WINNER ENG (CPV $0.87 vs reel4horas $1.10). corporativo_IG_Cold sigue WINNER IG (CPV $25, freq 1.68). FB_static01 prometedor (CPF ~$62).
  - **Ad set ENBA_Follow_IG_Test_NAU creado:** 4 intereses náuticos puros (Vendée Globe, Boat show, Yachting magazine, American Sailing Association) + LAL1 + advantage_audience ON + D6 exclusion. Budget $1,500/día. 2 ads (static01+static02 mismos creativos). Propuesta original 7 intereses, 3 deprecados por Meta.
  - **ig_cold reducido $5K→$3.5K** — gasto total IG neutro $6.500/día.
  - **Auditoría targeting ejecutada:** Montevideo removido de intereses (irrelevante). D2 (IG Engagers 90d) agregada a ig_retarget y fb_retarget (faltaba). targeting_relaxation OFF en retargets (diluía audiencia warm). FB Stories excluido de fb_cold (CPF $408). AS_ENG_REEL intereses ampliados 4→23. 23 intereses validados via API (0 deprecados).
  - **Meta Verified Business Plus evaluado:** sin impacto en ads/delivery. Beneficios orgánicos: badge, perfil destacado, 2 links en reels orgánicos/mes.
  - **Aplicación automática Meta (Advantage+ automations) rechazada:** puede revertir limpieza de intereses, modificar creativos, expandir placements — contrario a la gestión manual que da mejores resultados.
  - Seguidores cierre: FB 989, IG ~78. Spend total: $267,372. Restante: $232,628.
  - **Pendiente próxima sesión:** Review ig_test_NAU 04/05 (48-72h). Evaluar microreel_IG_Cold (pausar si CPV>$40). Evaluar FB_static02 (pausar si CPF>$150). Escalar reel-eng-v2 si CPV<$1 (05/05). REEL-01 producción. Actualizar presupuesto-v4.
- **01/05 sesión (día 13/27):** Pivot growth strategy — de poda a producción.
  - **Diagnóstico Bruno:** análisis sesgado a cortar sin reemplazar. Pipeline de creativos vacío. IG usa TRAFFIC (optimiza visitas, no follows) vs FB usa PAGE_LIKES (optimiza follows directo). Investigación growth tactics 2026 completada.
  - **Hallazgo arquitectura IG:** OUTCOME_ENGAGEMENT no soporta VISIT_INSTAGRAM_PROFILE — verificado vía API. No hay objetivo Meta que optimice por IG follows. FB es canal principal de follows por diseño.
  - **nosotros_FB_Cold reactivado:** CPF $104 (mejor histórico FB). fb_cold pasó de 1 a 2 ads inmediatamente.
  - **Lookalike audience creada:** ENBA_LAL_1pct_FBLikers (ID 120239852278830139), 1% desde 947+ page likers FB. Sin usar aún — pendiente test.
  - **4 ads nuevos creados y subidos:** 2 IG (static01 grupo río sol, static02 pareja sunset) + 2 FB (static01 grupo skyline nublado, static02 amigos vela bandera). Todos con logo oficial ENBA. Captions FB aprobados por Jose. Ad text IG nuevo.
  - **Total ads activos: 10** (antes 5). FB: 4 ads en fb_cold. IG: 4 ads en ig_cold + 1 en ig_retarget. ENG: 1 ad.
  - **Regla nueva:** no pausar ningún ad sin tener reemplazo activo.
  - **sharp instalado** como dependencia (crop de imágenes).
  - Seguidores cierre: FB 970, IG 78.
  - **Pendiente próxima sesión:** Review V2 02/05 (72h data). Monitorear 4 ads nuevos (primeros datos 24-48h). REEL-01 (P1 del brief). Test LAL1. Tácticas complementarias (giveaway, reels orgánicos).
- **30/04 sesión (día 12/27):** Fix workflow evaluación diaria + acciones Bruno + investigación perfil IG.
  - **Workflow n8n `1qRywsEWAl7VoO5o` corregido:** 3 nodos HTTP con IDs hardcodeados reemplazados por queries dinámicas a la cuenta. Code node adaptado. Burn rate ahora solo suma ad sets con ads activos (antes sumaba todos los ACTIVE incluyendo los sin ads). Webhook trigger agregado para ejecución manual: `POST https://espacionautico.app.n8n.cloud/webhook/eval-ads-manual`.
  - **Causa raíz:** AD_ENG_REEL_V2 aparecía como PAUSED en reportes porque su ID no estaba en la lista hardcodeada. Cualquier ad nuevo quedaba invisible. Fix definitivo — nunca más.
  - **Acciones Bruno ejecutadas vía API:** (1) destinos_IG_Cold PAUSED (ER 1.9%, delivery muerto), (2) fb_cold reducido $5.000→$2.500/día (CPS $110 pero único ad FB), (3) ig_cold escalado $4.000→$5.000/día (WINNER CPV $25). Burn rate post-acciones: $11.875/día.
  - **Objetivo ajustado:** Jose redefinió de 10K a 6.500 seguidores.
  - **Investigación follow rate IG:** benchmark real para tráfico pagado frío a cuenta <100 seguidores es 3-8% (no 15-35%). ENBA en 2.9% — apenas debajo del piso realista. Causas: Meta optimiza visitas no follows, social proof negativo (77 seguidores), mismatch visual ad→grid. Análisis competitivo: @bairesnavega 106K (lifestyle > náutica, cara visible, voucher único).
  - **Cerrado en sesión 01/05:** perfil IG actualizado (bio reescrita, website ya configurado con /bio). captions.json de cuanto-sale y no-es-tour actualizados con post IDs reales (IG+FB). Pipeline CLAUDE.md corregido (staging/ es destino final, no published/).
  - **Cerrado en sesión 01/05 (cont.):** Carrusel elegi-aventura re-renderizado con fotos frescas (3 imágenes repetidas reemplazadas), publicado IG+FB. FB corregido de multi-image a imagen única (collage). Emojis agregados a captions. AD_ENG_REEL_V2 datos preliminares: CPV $0,85 estable, avg watch 9s, spend $4.618 en 2 días.
  - **Pendiente próxima sesión:** AD_ENG_REEL_V2 review formal 02/05 con 72h data — decisión escalar/pausar.
  - Seguidores cierre: FB 967, IG 77.
- **29/04 sesión cont. (día 11/27):** Verificación API Meta — 3 pendientes inmediatos cerrados.
  - microreel_IG_Cold + microreel_IG_Retarget: confirmados ACTIVE con creative original (`977761008544793`). Incidente de restauración de anoche resuelto.
  - AD_ENG_REEL_V2 día 1: CPV $0.94 (vs $1.10 reel4h), CPE $0.92 (vs $1.09), retención 25% = 46% (vs 24%). Señales positivas pero prematuro — revisar 01/05 con >$2.500 de spend.
  - 3 ads CORTAR (microreel_FB_Cold, microreel_FB_Retarget, nosotros_FB_Retarget): confirmados PAUSED desde 28/04. Sin cambios.
  - meta-ids.json sin discrepancias vs API.
- **29/04 sesión (día 11/27):** Mejora emails de automatizaciones + documentación encoding.
  - Emails stories IG (Mañana/Tarde/Noche): agregado link directo para ver la story en IG (expira 24h).
  - Email stories FB Best IG: body reescrito con detalle completo (fecha, slot ganador, reach IG, imagen, FB post_id) + fix `emailFormat: text` (llegaba vacío).
  - Documentación mojibake: `OPERACION-N8N.md` regla 5 expandida + `INCIDENTES.md` INC-007 ampliado con causa raíz (PowerShell/UTF-16), patrón Python obligatorio para PUTs.
  - Auditoría mojibake: 8 workflows / 100 nodos escaneados, cero FFFD.
  - 4 backups pre-patch guardados en `n8n-backups/`.
- Pixel stack completado: Custom Conversions Contact + ViewContent creadas. **Fix Contact pixel deployado** (commit `a9a2e67` enba-web main, 27/04): `openWhatsappFallback` en `chat.ts` ahora llama `fbq("Contact")`. Verificar eventos en Events Manager 24-48h post-deploy.
- D4 audience (VideoViewers_30d): 3.000–3.500 personas, lista para usar. Retarget ad sets (IG + FB) confirmados con D4 en targeting vía API.
- Stories Fase 2: 3 workflows activos (Mañana 09:00 / Tarde 14:00 / Noche 20:00 ART). Secuencia intacta. Monitorear cron Mañana 09:00 — falló el 26/04 y requirió retry manual.
- Burn rate 26/04: $24.038 (+23% vs día anterior). Benigno — ad sets madurando y alcanzando caps. Frecuencias 1.0–1.3, sin fatiga. Decisión de ajuste en Gate 2 (29/04).
- `jq` instalado en el entorno (`winget install jqlang.jq`) — disponible para llamadas API.
- **28/04 sesión noche (día 10/27):** Verificación completa con API Meta. Hallazgos críticos:
  - **WINNER confirmado:** `ENBA_ad_corporativo_IG_Cold` usa imagen estática (`grupo-cockpit-cielo-azul-4x5.jpg`) — **hipótesis video-first FALSADA**. El mejor performer es imagen estática, no video.
  - **fb_cold exclusión:** D5 (FBPageLikers) SÍ estaba configurada — nota en meta-ids.json era incorrecta. Corregida.
  - **Discrepancia de status:** `destinos_IG_Retarget` y `nosotros_IG_Retarget` marcados ACTIVE en meta-ids.json pero API retornó PAUSED. Corregidos.
  - **Burn rate real:** $23.020/día (Follow Plan v2 $20.020 + ENG_REEL $3.000). AWR ad sets tienen presupuesto CBO a nivel campaña pero todos sus ads están pausados → $0 gasto efectivo.
  - **3 ads CORTAR pausados 28/04 13:11 ART:** `microreel_FB_Cold` (CPS $114), `microreel_FB_Retarget` (CPS $116), `nosotros_FB_Retarget` (CPS $103) — pausados vía API (Conversions API System User). Confirmado por activity log Meta.
  - **Reporte diario ciego al estado real:** workflow `1qRywsEWAl7VoO5o` usa `date_preset=lifetime` sin `effective_status` → mezcla activos y pausados. Plan de mejora iniciado (ver `presupuesto-v4.1-estado-dia10.md`).
  - `meta-ids.json` sincronizado con API. `last_api_verified: 2026-04-28`.
- **27/04 sesión tarde:** Automatización FB stories construida y activa. Los 3 workflows de Fase 2 loguean cada story publicada en Google Sheets (date/slot/media_id/image_url/seq). Workflow selector `ZGIGw47IYuwHv3Wh` corre 08:30 ART: lee sheet, consulta reach IG de las 3 stories del día anterior, publica la ganadora como story en FB. Primera ejecución: 28/04 08:30 ART. Credencial Google Sheets OAuth2 reautorizada (`w3CGca02rWZppDL9`).
- **27/04 sesión:** TikTok incorporado como canal. Cuenta `@espacionauticobsas` creada. App "ENBA Social" en TikTok Developer Portal enviada a revisión. Sandbox configurado con cuenta ENBA como test user. DNS TXT record verificado en Cloudflare. **Restricción activa:** videos publicados via API quedan en modo privado hasta que TikTok apruebe la app. Publicación manual desde la app hasta recibir aprobación.

---

## 3. Qué documento usar para cada cosa

| Necesidad | Documento principal | Rol |
|---|---|---|
| Reglas del repo, equipos, voz, n8n | `CLAUDE.md` | Permanente |
| Arranque de sesión | `STATUS.md` | Snapshot corto vigente |
| Plan, timeline, pendientes, decisiones | `plan-maestro.md` | Documento vivo |
| Pauta vigente | `presupuesto-v4-reestructuracion.md` | Normativo para ads |
| Infra Meta Ads | `meta-ids.json` | Estado real y IDs |
| QA de piezas | `qa-report.md` | Referencia operativa |
| Medición y taxonomía | `kpis.md`, `google-analytics-medicion.md` | Soporte analítico |
| Contexto histórico | `SESSION-HANDOFF-*.md`, docs superseded | Histórico |

---

## 4. Estado documental

### Vigentes

- `CLAUDE.md`
- `campaigns/plan-crecimiento-10k/STATUS.md`
- `campaigns/plan-crecimiento-10k/plan-maestro.md`
- `campaigns/plan-crecimiento-10k/presupuesto-v4-reestructuracion.md`
- `campaigns/plan-crecimiento-10k/meta-ids.json`

### Vigentes pero condicionales

- `campaigns/plan-crecimiento-10k/kpis.md`
- `campaigns/plan-crecimiento-10k/google-analytics-medicion.md`
- `campaigns/plan-crecimiento-10k/qa-report.md`
- `campaigns/calendario-integrado.json`

### Históricos o superseded

- `campaigns/plan-crecimiento-10k/historico/presupuesto-v3-final.md`
- `campaigns/plan-crecimiento-10k/historico/presupuesto-v2-500k.md`
- `campaigns/plan-crecimiento-10k/historico/presupuesto.md`
- handoffs fechados que contradigan documentos vigentes

---

## 5. Checklist de inicio de sesión

1. Confirmar branch `main`.
2. Leer `CLAUDE.md` y `STATUS.md`.
3. Identificar si la tarea es de:
   - contenido
   - pauta / performance
   - publicación / n8n
   - medición / analytics
4. Recién ahí abrir los documentos largos del frente correspondiente.
5. Si aparece contradicción:
   - primero `CLAUDE.md`
   - después `STATUS.md`
   - después documento vivo específico
   - handoffs al final

---

## 6. Mantenimiento

Actualizar este archivo cuando cambie alguna de estas cosas:

- branch o frente activo
- documento vigente de pauta
- workflows activos
- hitos críticos o incidentes que cambian el contexto de arranque
- snapshot corto que un agente nuevo necesita sí o sí para no arrancar a ciegas

Este archivo no reemplaza al `plan-maestro.md`.
Su trabajo es reducir tiempo de arranque y separar vigente vs histórico.
