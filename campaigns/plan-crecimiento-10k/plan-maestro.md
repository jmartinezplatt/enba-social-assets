# Plan Maestro — Crecimiento 10K seguidores en 30 dias

**Autor:** Manu (Coordinador de Produccion)
**Fecha original:** 15 de abril de 2026
**Ultima actualizacion:** 26 de abril de 2026
**Periodo:** 19 de abril - 16 de mayo de 2026 (27 dias, re-baselineado al primer gasto real)
**Plan de pauta vigente:** `presupuesto-v4-reestructuracion.md` (fuente de verdad de pauta, reemplaza v3)
**Fuentes:** diagnostico-inicial (Bruno), estrategia-instagram (Franco), estrategia-facebook (Franco), analisis-reels (Marina), review-estrategia-ig (Marina), meta-business-setup (Bruno), google-analytics-medicion (Bruno), kpis (Bruno), historico/presupuesto-v3-final (Bruno), reporte-semanal-template (Bruno), calendario-integrado.json

---

## 1. Resumen ejecutivo

**Objetivo declarado:** 10.000 seguidores en IG + FB en 27 dias.

**Target realista:** 7.000-10.000 seguidores (Bruno, presupuesto-v4 post-reestructuracion, probabilidad 40-55%). Piso minimo: 5.900 pagados + 2.500 organicos.

**Presupuesto pauta:** ARS 500.000 neto para Meta Ads. Debito real en tarjeta ~ARS 700.000 (impuestos argentinos ~40%). Tarjeta Mastercard ····8307, limite confirmado. **500K es solo pauta, produccion es gasto aparte (confirmado 19/04).**

**Contenido disponible (actualizado 19/04):**
- 30 piezas estaticas: en staging, publicacion diaria via n8n. Pieces 01-05 ya publicadas.
- 3 carruseles organicos: slides renderizados, captions aprobados, QA PASS. Script `publish-carousel.mjs` listo.
- Reel "4 horas en el rio": editado, publicado IG+FB 17/04, corriendo como ad de engagement.
- Reel "primera vez": v8 final, publicado IG+FB 21/04. IG reel ID 18061312631443687 (instagram.com/reel/DXYeFzUDE6f/), FB video ID 4467029896876277. Musica "Let Good Times Roll", logo oficial, QA PASS Nico, captions Sole.
- 65 assets curados en asset-bank.
- Cortes de pauta reel 4h: 30s y 15s listos.

**Infraestructura (actualizado 19/04):**
- n8n workflow publicacion diaria activo (12:15 ART, ID `MipwleZNu8EG5v6C`, v7.2, 34 nodos). URLs de imagen apuntan a `enba-social-assets.pages.dev` (no custom domain, por bloqueo Cloudflare a crawler IG).
- n8n workflow evaluacion ads diaria activo (9:00 ART, ID `1qRywsEWAl7VoO5o`).
- Meta Ads: 3 campanas ACTIVE (AWR + ENG + LEA pausada). **Reestructurado 21/04 + audit fix 22/04:** AWR CBO $6,500/dia (A2 $3K + B1 $3.5K, pausados B2/C1/A3) con video ads agregados. ENG Reel $7,250/dia (escalado de $5K). Reel "primera vez" en pauta. C3 LEA PAUSED. C2 Regalos ACTIVE 23/04. Total diario: $15,250.
- C2 Regalos ACTIVE (activado 23/04, $1,500/dia).
- **Plan "Todo a Follows" (23-24/04):** Migrado a campanas dedicadas (22/04): `ENBA_Follow_IG_abr2026` (OUTCOME_TRAFFIC, 2 ad sets: IG Cold $12.6K + IG Retarget $5.4K) + `ENBA_Follow_FB_abr2026` (OUTCOME_ENGAGEMENT, 2 ad sets: FB Cold $8.4K + FB Retarget $3.6K). **ACTIVADO 22/04 noche.** 12 ads ACTIVE. Micro-reel 15s v3 subido. Corre en paralelo con ads existentes. Budget diario total ~$45,250. Baseline: FB 23 follows, IG 11 follows. Revision 29/04. Ver `meta-ids.json` seccion `follow_plan_v2`.
- UTMs configurados en todos los ads activos (22/04).
- Credenciales n8n: Meta API ENBA (page token), Meta Ads API ENBA (ads token), Gmail ENBA. **Token `META_ACCESS_TOKEN` renovado 22/04:** sesion de usuario invalidada por Meta (OAuthException 460). Nuevo token derivado del System User (`META_ADS_USER_TOKEN`) via `GET /{pageId}?fields=access_token`. No expira nunca. Credencial n8n `Meta API ENBA` (n8scJzbGXnCprioD) actualizada via API.
- GA4 instalado (G-XVN36KPHBL), Pixel Event Data activo (1273048378266952).
- Dominio autorizado en Events Manager.

**Distribucion de pauta:** ver `presupuesto-v4-reestructuracion.md` (fuente de verdad). Redistribucion: AWR 25% / ENG 45% / LEA 10% (diferido) / Reserva 20%.

**Split plataformas (Bruno):** IG 75% / FB 25%. Revision dia 10 (28/04).

---

## 2. Decisiones del usuario — Estado

Todas las decisiones originales fueron resueltas. Pendientes nuevos al final.

| # | Decision | Estado | Respuesta |
|---|----------|--------|-----------|
| 1 | Presupuesto: solo pauta o incluye produccion? | **RESUELTO 19/04** | $500K solo pauta. Produccion es gasto aparte. |
| 2 | Filmacion de reels | **RESUELTO 17/04** | Reel "4 horas" filmado, editado y publicado. Reel "primera vez" tiene material crudo + material de colega. |
| 3 | Meta Business Manager | **RESUELTO 16/04** | Existe. Business ID 814334400927137, Ad Account act_2303565156801569. |
| 4 | GA4 instalado? | **RESUELTO 19/04** | Si, G-XVN36KPHBL en enba-web/index.html. |
| 5 | Accesos IG y FB | **RESUELTO** | Jose tiene todos los accesos. |
| 6 | Equipo de filmacion | **RESUELTO** | No se compro gimbal. Se filmo con celular, calidad aceptable. |
| 7 | Engagement manual | **RESUELTO 19/04** | Jose con su gente. |

### Decisiones pendientes nuevas (19/04) — Estado

| # | Decision | Estado | Respuesta |
|---|----------|--------|-----------|
| 8 | Que creative para C3 Corporativo (lead gen)? | **RESUELTO 19/04** | Lead form v2 (944664581514608) + creative con grupo-cockpit-cielo-azul-4x5.jpg + copy Sole. Campana C_LEA + ad set C3 + ad ACTIVE. |
| 9 | Cuando publicar carruseles organicos? | **RESUELTO 19/04** | cuanto-sale publicado IG (carrusel) + FB (slide-04 imagen unica) 19/04. no-es-tour publicado IG (`18317065594280248`) + FB (`1064806400040502_122110365644620656`) 24/04. elegi-aventura 03/05. FB no soporta carruseles organicos: se publica slide hero como imagen unica (decision Marina). |
| 10 | Acceso a Google Photos | **RESUELTO 19/04** | Album descargado, material incorporado a asset-bank. |
| 11 | Ad sets B1 y C1 sin gasto | **RESUELTO 20/04** | Ambos gastando tras fix onboarding. B1: $1.998 spend, 8.860 reach. C1: $399 spend, 1.960 reach. Delivery normal. |

### Pendientes auditoria 22/04

| # | Pendiente | Owner | Deadline | Estado |
|---|-----------|-------|----------|--------|
| A1 | G-3 Plan B warm: si D2 sigue too_small al 01/05, crear ReelPrimeraVez_Warm solo con D4 (VideoViewers) | Bruno + Jose | 01/05 | PENDIENTE |
| A2 | G-9 Producir 2-3 darkposts nuevos para reemplazo fatigue dia 14 | Dani | 28/04 | PENDIENTE |
| A3 | Custom audiences: D1 y D3 pasaron a "ready" (22/04). D2 y D5 siguen "too_small". Re-verificar al 29/04 (Gate 2). | Bruno | 29/04 | MONITOREO |
| A4 | piece-08 CTA duplicado: 3 iteraciones hasta resolución real. (1) 1er republish usó imagen vieja — Cloudflare Pages llevaba 7 días sin deployar (MP4 31MB > límite 25MB). (2) Fix: MP4s removidos de git, merge a main, deploy OK, imagen correcta online. (3) A4 final ~14:30: posts eliminados (IG `18071315231302535` + FB `122110116092620656`) y republicados con imagen correcta. **IG final: `18001378085869134`. FB final: `1064806400040502_122110125068620656`.** Token META_ACCESS_TOKEN renovado 2da vez. | Jose | ASAP | RESUELTO 22/04 |

### Sesion 22/04 cierre — Publicacion organica

**Incidente:** piece-08 fallo a las 12:15 ART (token `META_ACCESS_TOKEN` invalidado por Meta, OAuthException 460). Republicada manualmente a las 16:26 (IG post `17922571914322359`, FB post `1064806400040502_122110114022620656`). Token renovado desde System User — no vuelve a expirar.

**Bug detectado:** CTA duplicado en staging PNGs (commit f1c9c9f del 18/04 — render ejecutado antes de corregir campaign.pieces.json). piece-01 ya publicada con bug (irrecuperable). piece-08 resuelta (ver A4 arriba). Piezas pendientes (09-30): **30 PNGs re-renderizados y verificados el 22/04**. Todos los CTAs correctos, verificacion visual 100%.

**Incidente Cloudflare Pages (22/04):** Deploy fallando desde hace 7 días por `micro-reel-seguinos-v3.mp4` (31.1 MB > límite 25 MB de Cloudflare Pages). Todos los commits de `plan-crecimiento-10k` llegaban al repo pero nunca al deploy → n8n publicaba imágenes de la version antigua de main (5 días atrás). Fix: git rm --cached todos los MP4s tracked, *.mp4 a .gitignore, merge plan-crecimiento-10k → main, push. Deploy production OK 22/04 14:30. Token META_ACCESS_TOKEN renovado nuevamente (2da invalidación) y credencial n8n actualizada.

### Auditoria profunda de audiencias 23/04

**Hallazgos:**
- interest-ids.json estaba desactualizado: contenía IDs basura (Filipinas, Singapur, Franquicias de juegos) que ya habían sido corregidos en Meta Ads pero nunca en el archivo. Sincronizado con API.
- Todos los ad sets (activos y pausados) tienen IDs de intereses correctos en producción. Todos verified.
- D5 (FBPageLikers) no estaba implementada como exclusión en ningún ad set.

**Acciones ejecutadas:**
- [x] interest-ids.json sincronizado con API en vivo — todos los ad sets verified
- [x] D5 agregada como excluded_custom_audience en A2, B1, ENG_REEL, C2 (verificado via API)
- [x] meta-ids.json actualizado con resultado de auditoría

### Acciones sesion 19/04 (tarde)

- User token regenerado con 19 permisos (agregados: pages_manage_ads, leads_retrieval, pages_read_user_content, instagram_manage_insights, instagram_manage_comments, read_insights, pages_manage_metadata, catalog_management)
- Lead form v1 archivado, v2 creado (thank you page → home en vez de /travesias)
- TOS de lead gen aceptados en FB
- Ad C3 Corporativo creado y activado: campana C_LEA + ad set AS_LEA_C3 + ad AD_C3_CORP ACTIVE, $3.500/dia
- Carrusel cuanto-sale publicado IG (6 slides) + FB (slide-04 imagen unica, caption variante 4 de Sole)
- Regla FB: no publicar carruseles como album. Publicar slide hero como imagen unica (fbHeroSlide en captions.json)
- Script publish-fb-single.mjs creado para publicacion FB de imagen unica
- Captions FB reescritos para los 3 carruseles (sin referencia a "carrusel", URLs corregidas)
- Asset grupo-cockpit-cielo-azul-4x5.jpg creado (crop 4:5 para ad C3)

---

## 3. Contradicciones y gaps entre documentos

Como Coordinador de Produccion, estas son las inconsistencias que encontre entre los documentos del equipo. Las flaggeo y propongo resolucion.

### Contradiccion 1: Orden y timing de reels

**Franco (estrategia-instagram):** Reel "Primera vez" el 25/04 (semana 2), reel "4 horas" el 02/05 (semana 3). Argumento: no retrasar contenido estatico por esperar reels.

**Marina (review-estrategia-ig, analisis-reels):** Invertir el orden. "4 horas" primero (score 8.5 vs 7). Publicar entre dia 3-5 (17-19 abr). Filmar dia 1-2.

**Resolucion adoptada:** Marina tiene razon en el scoring y el impacto. **Adopto el ajuste de Marina.** El reel "4 horas en el rio" se filma lo antes posible y se publica en cuanto este editado (idealmente dia 3-5, pero depende de la disponibilidad de salida). "Primera vez" va segundo. Si no hay salida disponible en semana 1, se mantiene el orden de Franco como fallback pero con "4 horas" primero cuando este listo.

### Contradiccion 2: Distribucion de pauta en reels

**Marina (analisis-reels):** 60% del presupuesto a reel "4 horas", 20% retargeting, 20% estaticos.

**Bruno (presupuesto):** Semanas 1-2 sin reels: 60% estaticos, 25% carruseles, 15% retargeting. Semanas 3-4 con reels: 55% reels, 20% retargeting, 25% estaticos.

**Franco (estrategia-instagram):** ARS 50K semana 1 (todo estaticos), ARS 70K semana 2 (incluyendo reel si esta).

**Resolucion adoptada:** Bruno tiene la distribucion mas pragmatica porque contempla que los reels no estan listos al dia 1. **Adopto la distribucion de Bruno** con la salvedad de que si el reel "4 horas" esta listo antes de lo esperado, se reasigna presupuesto de estaticos al reel segun criterio de Marina (hasta ARS 40K para el reel si cumple criterio de escala).

### Contradiccion 3: Split IG/FB

**Franco:** 70/30

**Bruno:** 75/25

**Resolucion adoptada:** **Adopto el 75/25 de Bruno** con revision a los 10 dias. Si CPS en FB es significativamente menor que en IG, se reasigna hasta 35% a FB.

### Gap 1: Carruseles no estan en staging

**Estado:** Los 3 carruseles tienen QA PASS pero NO estan en staging y el script de publicacion NO soporta carruseles todavia.

**Impacto:** carrusel-cuanto-sale esta programado para el 18/04 (dia 4). Si no se adapta el script antes, se pierde la pieza con mayor potencial de guardado de semana 1.

**Responsable:** Dani (adaptar script) + Nico (stagear). Deadline: 17/04.

### Gap 2: Reels adicionales no integrados en calendario

**Marina** propone 5 reels adicionales (seccion 5 de su analisis). **Franco** no los integra en el calendario.

**Resolucion:** Para el mes 1, los 2 reels principales son la prioridad. Los reels adicionales ("Lo que nadie te dice", "Buenos Aires desde el agua") se producen en semanas 3-4 con material sobrante de las filmaciones, si hay capacidad. No bloquear nada por esto.

### ~~Gap 3: Cover frames para reels en el grid~~ — DESCARTADO 21/04

Descartado por usuario. Se usa frame del propio video como portada desde IG. Cover frames disenados repiten fotos del asset-bank y no aportan valor en esta etapa.

### Gap 4: Cortes alternativos y subtitulos para pauta de reels

**Marina** requiere 3 versiones por reel pautado (completa, 30s, 15s) + subtitulos funcionales.

**Responsable:** Dani (edicion) con direccion de Marina. Se produce despues de la edicion del reel principal.

---

## 4. Timeline dia a dia — Semana 1: LANZAMIENTO (ejecutada)

### Checklist de arranque — Estado real

- [x] Meta Business Manager creado y configurado (16/04)
- [x] Cuenta publicitaria creada: act_2303565156801569, ARS, AR (16/04)
- [x] Metodo de pago configurado: Mastercard ····8307, limite $700K confirmado
- [x] IG y FB vinculados en Business Suite
- [x] Meta Pixel instalado: Event Data 1273048378266952 activo — ⚠️ ENBA Pixel 830831356111912 NO SIRVE, NO SE USA, NO ES VÁLIDO, NO FUNCIONA — ignorar siempre
- [x] Dominio autorizado en Events Manager (19/04)
- [x] GA4 propiedad instalada: G-XVN36KPHBL en enba-web/index.html. Search Console vinculado (21/04, sc-domain:espacionautico.com.ar, flujo ENBA Web).
- [x] 5 Custom Audiences creadas: D1 WebVisitors, D2 IGEngagers, D3 FBEngagers (API), D4 VideoViewers, D5 FBPageLikers (UI)
- [x] 5 Saved Audiences en ad sets: B1 Experiencias, A2 InteresNav, C1 Turismo, B2 Outdoor, A3 Aspiracional
- [x] n8n workflow publicacion verificado y activo (pieces 01-05 publicadas)
- [x] n8n workflow evaluacion ads creado y activo (9:00 ART diario)
- [x] Campanas Awareness + Engagement creadas y ACTIVE (19/04)
- [x] 6 ad sets ACTIVE + 7 ads ACTIVE
- [x] Script publish-carousel.mjs listo
- [x] Reel "4 horas" filmado, editado, publicado IG+FB (17/04), ad de engagement activo
- [x] Cortes pauta reel 4h: 30s y 15s listos
- [ ] ~~Gimbal~~ — no se compro, se filmo con celular
- [x] Eventos GA4 configurados — **RESUELTO 21/04.** Implementados y verificados en GA4 Realtime: click_cta ✓, scroll_depth ✓, click_whatsapp ✓, generate_lead (implementado, no testeado por submit). Deploy Cloudflare OK.
- [x] UTMs en link bio — **RESUELTO 21/04.** Ruta /bio desplegada, redirect 302 verificado, link bio IG actualizado a espacionautico.com.ar/bio. GA4 Realtime confirma UTMs llegando correctamente.
- [x] Posts fijados FB — **RESUELTO 20/04.** Post fijado: reel "4 horas en el rio" (17/04, 10 likes, 1 share) — mejor engagement de la page. Fijado manualmente por usuario.

---

### Ejecucion real — Pre-lanzamiento (15-18 abr, antes de pauta)

Publicacion organica via n8n desde 15/04. Pauta NO activa todavia.

| Fecha | Pieza | Estado |
|-------|-------|--------|
| 15/04 | piece-01 "El rio te llama" | Publicada IG+FB. CTAs viejos (irrecuperable). |
| 16/04 | piece-02 "Desde Costanera Norte" | Publicada IG+FB. CTAs viejos. |
| 17/04 | piece-03 "No salis con una marca" | Publicada IG+FB. CTAs viejos. Reel 4h publicado mismo dia. |
| 18/04 | piece-04 "Salir a navegar no deberia ser complicado" | Publicada IG+FB. CTAs viejos. |

Incidentes: CTAs duplicados en campaign.pieces.json detectados y corregidos (Sole reescribio 15, Marina+Franco aprobaron). Pieces 01-04 ya publicadas con CTAs viejos, no se pueden corregir. Pieces 05+ tienen CTAs corregidos.

### Dia 1 pauta — Sabado 19 de abril (activado, sin gasto hasta 20/04)

**Meta Ads activados a las 00:10 ART (primer gasto real: 20/04 ~03:00 ART, post incidente onboarding):**
- Campana AWR (Awareness) → ACTIVE
- Campana ENG (Engagement) → ACTIVE
- 5 ad sets Awareness: B1 ($2500), A2 ($1500), C1 ($1500), B2 ($1500), A3 ($1500)
- 1 ad set Engagement: Reel4horas ($3000)
- 7 ads: piece01dp x2, piece02 x2, piece03 x2, reel4horas x1
- Budget diario total: $11.500

**FEED organico:** piece-05 publicada 12:15 ART (primera con CTAs corregidos).

**Otras acciones dia 1:**
- Workflow evaluacion ads creado (n8n, 9:00 ART diario, email a jmartinezplatt@gmail.com)
- Darkpost C2 Regalos creado (PAUSED, activacion dia 5)
- Asset-bank ampliado 53→65 JPGs
- Script publish-carousel.mjs creado y verificado
- Cortes pauta reel 4h (30s + 15s) producidos
- Re-baseline presupuesto-v3: dia 1 = 20/04 (primer gasto real), fin = 16/05
- Direccion creativa reel "primera vez" completada (Marina, score 9/10)
- Captions darkpost regalos escritos (Sole) y aprobados

### Incidente onboarding Meta Ads (19-20/04)

Ads activados 19/04 00:10 ART. 48h con $0 gasto, columna Entrega vacía en Ads Manager.
Causa: cuenta nueva configurada 100% por API, checkpoints internos de onboarding no disparados.
Resolución: creación de campaña TEST_onboarding desde UI de Ads Manager + toggle de ad sets.
Primer gasto real: 20/04 ~03:00 ART. Token META_ADS_USER_TOKEN migrado de User Token LL (expirado) a System User Token (eterno).

### Dias 1-6 pauta — 20-25 de abril (en ejecucion)

| Dia | Fecha | Accion planificada (presupuesto-v3) |
|-----|-------|-------------------------------------|
| 2 | 20/04 | piece-06 organica. Ads corriendo. |
| 3 | 21/04 | piece-07 organica. Evaluacion 72h de piece-01 ads. |
| 4 | 22/04 | piece-08 organica. Primer email evaluacion con data. |
| 5 | 23/04 | piece-09 organica. **Activar C2 Regalos + ad set.** |
| 6 | 24/04 | piece-10 organica. |
| 7 | 25/04 | piece-11 organica. **Activar C3 Corporativo (si creative listo).** |

**Checkpoints fin de semana 1 (26/04):** primer reporte Bruno con data real de 6 dias de pauta (ajustado por incidente onboarding).

### REESTRUCTURACION URGENTE — 21/04/2026 (dia 2 de pauta)

**Trigger:** Reporte automatico dia 2 mostro $20,584 gastados con 0 follows, 0 leads, 0 profile visits, 0 DMs. Auditoria completa de Team 4 (Bruno + Marina + Franco + Auditor) identifico 3 fallas criticas y diseno plan de reestructuracion.

**Cambios ejecutados 21/04:**

| Accion | Detalle | Estado |
|--------|---------|--------|
| PAUSE AS_AWR_B2 (Outdoor) | 0 eng, overlap C1 | EJECUTADO via API |
| PAUSE AS_AWR_C1 (Turismo) | Geo Argentina amplia, 6 eng en $1,355 | EJECUTADO via API |
| PAUSE AS_AWR_A3 (Aspiracional) | "Lujo" desalineado con marca | EJECUTADO via API |
| PAUSE AS_LEA_C3 (Corporativo) | Prematuro, $7,145 → 0 leads | EJECUTADO via API |
| SCALE AS_AWR_A2 | $1,500 → $3,000/dia | EJECUTADO via API |
| SCALE AS_AWR_B1 | $2,500 → $3,500/dia (CBO $6,500) | EJECUTADO via API |
| SCALE AS_ENG_REEL | $3,000 → $5,000/dia | EJECUTADO via API |
| Crear presupuesto-v4 | Nueva distribucion: AWR 25% / ENG 45% / LEA 10% (diferido) / Reserva 20% | CREADO |

**Pivot creativo:** Video-first. Estaticos organic-only. CTA "Ver perfil" reemplaza "Escribinos".

**Nuevas fuentes de verdad:**
- Plan de pauta: `presupuesto-v4-reestructuracion.md`
- Decision gates: v4 seccion 7 (5 gates con metricas medibles)
- Gate 1: dia 6 (25/04) — follows > 30, ThruPlays > 500/dia
- Gate 2: dia 10 (29/04) — follows > 200, ER > 3%

**Pendientes post-reestructuracion:**
- [x] Jose: reescribir bio IG (conversion-focused) — HECHO 21/04, CTA + verticales + ubicacion
- [ ] Jose: pin story con clips reel "primera vez" — diferido
- [ ] Jose: fijar reel "4 horas" en grid IG — diferido
- [x] Verificar tamanos audiencia A2 y B1 en Ads Manager UI — HECHO 21/04. A2: 377K-443K, B1: 3.6M-4.2M. Ambas viables. Monitorear CBO distribution (B1 puede absorber >80% del budget por tamano).
- [x] Verificar C_LEA campaign PAUSED en UI — HECHO 21/04. Campana pausada manualmente.
- [x] Activar C2 Regalos dia 5 (23/04) — HECHO 23/04. Ad set + ad ACTIVE.
- [ ] Crear nuevos ads AWR con CTA "Ver perfil"
- [ ] Sole: caption variante reel 4h ("Seguinos para mas") deadline 24/04
- [ ] Dani: producir reel "Lo que nadie te dice" (material existente) deadline 30/04
- [ ] Dani: producir reel "Buenos Aires desde el agua" deadline 02/05
- [x] Plan "Todo a Follows" armado (23/04): 12 ads PAUSED, carruseles IG + collages FB renderizados, 95 assets nuevos en bank
- [x] Follow plan: crear 2 campanas separadas (ENBA_Follow_IG + ENBA_Follow_FB) — HECHO 22/04. Migrado con script `migrate-follow-campaigns.mjs`. Ads viejos DELETED de C_TRF/C_ENG.
- [x] Follow plan: micro-reel 15s — HECHO 22/04. v3 aprobado (7 clips + logo + musica kevin-graham). Subido a Meta (video ID 2118634122255418). Script `upload-video-to-ads.mjs` reutilizable. 4 ads microreel actualizados con creative real.
- [x] Follow plan: activar ads — HECHO 22/04 noche. 2 campanas, 4 ad sets, 12 ads ACTIVE. Corre en paralelo con ads existentes (no se pausaron). Budget diario total ~$45,250. Baseline: FB 23 follows, IG 11 follows. Revision 29/04.
- [x] Estaticos AWR pausados — HECHO 22/04 noche. piece01dp_A2 ($137/eng), piece01dp_B1 ($186/eng), piece03_B1 ($1,500/eng). CTR 0.01%-0.19%. Total gastado en estaticos: $10,732 por 31 engagements.
- [x] Intereses: Gastronomia/Caminatas/Excursionismo/Camping eliminados de todos los ad sets — VERIFICADO 26/04 via API. Todos los ad sets limpios. interest-ids.json sincronizado con estado real.
- [x] Geo actualizada: 18 ciudades — VERIFICADO 26/04 via API. Todos los ad sets activos tienen geo city-based (18 ciudades).
- [x] Edad actualizada: 18-65+ — VERIFICADO 26/04 via API. Todos los ad sets tienen age_min=18, age_max=65.
- [ ] Meta API: instagram_actor_id deprecado v22.0 — usar instagram_user_id

### Sesion 22/04 (noche continuacion) — Perfil IG + Highlights + Test C3 Follow

**Contexto:** Dia 3 pauta. $44,334 gastados. 0 follows IG (follow plan activado solo horas antes). Marina auditó perfil — bio incompleta, 0 highlights, 11 seguidores visibles.

**Acciones ejecutadas:**

| Accion | Detalle | Estado |
|--------|---------|--------|
| Perfil IG completado | Bio reescrita: hook + verticales + ubicacion + CTA (wa.me link) | HECHO 22/04 |
| 6 Highlight covers producidos | Dani: `scripts/render-highlight-covers.mjs` → 6 PNGs 1080x1080 con identidad ENBA | HECHO 22/04 |
| Highlights IG subidos | 6 highlights activos: Travesías / Paseos / Broker / Escuela / Services / ¿Quiénes somos? | HECHO 22/04 |
| Test ad C3 en Follow Plan | ENBA_ad_corporativo_IG_Cold creado en ENBA_Follow_IG_Cold. Creative: grupo-cockpit-cielo-azul-4x5.jpg. CTA: VIEW_INSTAGRAM_PROFILE. En PENDING_REVIEW. | HECHO 22/04 |
| package.json type:module | `"type": "module"` agregado — todos los .js del repo son ES modules | HECHO 22/04 |

**Veredicto Marina perfil (22/04):** APROBADO (post-fixes). Bio ✓, highlights ✓, foto de perfil ✓.

**Estado seguidores al cierre 22/04:**
- IG: 10 seguidores (baseline 11 — posible baja orgánica)
- FB: 23 seguidores (sin cambios)
- **Gate 1 (25/04):** necesita >30 follows IG. Faltan 3 dias.

**Pendientes inmediatos:**
- [ ] Monitorear ENBA_ad_corporativo_IG_Cold post PENDING_REVIEW
- [ ] Investigar micro-reels $0 delivery (misma causa que onboarding o budget absorption)
- [ ] Gate 1 check 25/04: follows >30, ThruPlays >500/dia

---

### Sesion 23/04 — Auditoría perfil IG + Plan reconciliado + Gate reactivación Follow IG

**Contexto:** Día 4 pauta. Follow rate IG = 1.0% (915 visitas → 9 follows). Benchmark: 15-35%. Plan reconciliado Bruno/Experto ejecutado (8/8 OK). Follow IG pausado. Marina convocada para auditoría de perfil.

**Hallazgos auditoría Marina 23/04:**
- Highlights: covers subidos pero **sin contenido adentro** — peor que no tener highlights
- Cover frames: bajo contraste fondo/texto, ilegibles a tamaño thumb
- Grid: reels enterrados en fila 2-3, primera fila 100% estáticos
- Stories: 0 activas al momento de la auditoría
- Social proof: ~20 seguidores — fricción cognitiva para visitante frío

**Acciones ejecutadas 23/04:**

| Accion | Detalle | Owner | Estado |
|--------|---------|-------|--------|
| Reel "4 horas" fijado en cuadrícula principal IG | Acceso desde perfil → tres puntos → "Fijar en cuadrícula principal" | Jose | HECHO 23/04 |
| Reel "primera vez" fijado en cuadrícula principal IG | Segundo post fijado | Jose | HECHO 23/04 |
| Plan "Todo a Follows" pausado (ig_cold + ig_retarget) | 8/8 acciones via API: pausas + reducción AS_ENG_REEL $7,250→$3,000 + escala fb_cold $8,400→$10,920 | Claude (API) | HECHO 23/04 |
| meta-ids.json actualizado | Nuevos estados post-plan reconciliado | Claude | HECHO 23/04 |

**Plan de perfil IG — tareas pendientes (gate reactivación Follow IG):**

| # | Tarea | Owner | Deadline | Verificación | Estado |
|---|-------|-------|----------|--------------|--------|
| P2 | Publicar stories diarias (≥1/día) | **Nico** | Desde hoy, permanente | Story activa antes de las 15:00 | ACTIVO — primera story publicada 23/04 |
| P3 | Push manual: pedir follow IG a 80-100 contactos (clientes anteriores, equipo, conocidos) | **Jose** | 48h | Seguidores IG ≥ 100 | HECHO 23/04 — pendiente confirmar ≥100 seguidores |
| P4 | Rediseño cover frames 6 highlights: mayor contraste, texto más grande, legible a thumb | **Dani** | 24h | Jose valida legibilidad en celular | HECHO 23/04 |
| P5 | Cargar contenido real en los 6 highlights (mín. 3 stories por highlight) | **Dani + Jose** | 48h | Tocar cada highlight → hay stories | HECHO — aprobado Marina |
| P6 | Procedure diaria stories: si no hay story al mediodía → Nico publica antes de 15:00 | **Nico** | Permanente | Checklist diario | PENDIENTE |

**Nota P3:** P1 (pin reel) ya HECHO. El push a contactos es condición necesaria para reactivar Follow IG — no hay pauta que compense <100 seguidores.

**Gate reactivación Follow IG (Bruno monitorea):**
- P4 y P5 completados
- Seguidores IG ≥ 100 (P3 ejecutado)
- Verificar follow rate 24h post-fixes
- Si follow rate ≥ 10% → reactivar ig_cold al 50% del budget original ($6,300/día), revisar 48h

**Procedimiento diario stories — Nico (permanente desde 23/04):**

| Frecuencia | Contenido sugerido | Formato |
|------------|-------------------|---------|
| Mínimo 1/día | Clip reel del día / pieza feed publicada / foto asset-bank | Story con texto o música |
| Ideal 2-3/día | Behind the scenes / testimonio / pregunta interactiva | Story nativa |
| Cada viernes | Encuesta o pregunta sobre próxima salida | Story interactiva |

**Publicacion organica 21/04:**
- piece-07 "A veces unas horas en el rio cambian la semana" publicada IG+FB 12:15 ART via n8n. IG post ID 18120377908649051.

**Stories highlights — ejecutadas 23/04:**

| Accion | Detalle | Estado |
|--------|---------|--------|
| Highlight covers rediseñados (P4) | labelSize 110-170px (vs 52-74px), icon reducido, contraste mejorado. `render-highlight-covers.mjs`. | HECHO 23/04 |
| 24 stories de highlights renderizadas | 6 highlights × 4 stories = 24 JPEGs 1080×1920. `render-highlight-stories.mjs`. | HECHO 23/04 |
| Push a contactos (P3) | Jose envió mensajes a ~80-100 contactos pidiendo follow IG. | HECHO 23/04 |
| Story #1 publicada (burst local) | travesias-story-01.jpg publicada 23/04 ~17:10 ART. | HECHO 23/04 |
| Stories #2 y #3 publicadas (triplicadas) | Processos zombie — ver incidentes abajo. | HECHO con incidente |
| Burst migrado a n8n | Workflow "ENBA - Stories Burst (n8n)" (ID: LBjxUFXarIPV2cIi) activo. Publica stories #4–#24, una por hora a los :10 ART. | HECHO 23/04 |

**Incidentes sesión 23/04:**

| Incidente | Causa | Impacto | Fix |
|-----------|-------|---------|-----|
| Meta rechaza PNG (error 36001/2207083) | Playwright screenshots PNG tienen metadata que Meta API no puede parsear | Stories no publicaban en primera ejecución del burst | Renderizar como JPEG quality 92. Re-renderizar 54 stories. |
| Cloudflare sirve HTML para rutas de rama no-main | Stories en rama `plan-crecimiento-10k`, Cloudflare deploya desde `main` — SPA fallback devuelve HTML con HTTP 200 | Meta API recibía HTML en vez de imagen — no alcanza con verificar HTTP 200 | Merge a main → push → verificar Content-Type: image/jpeg |
| Stories #2 (paseos) y #3 (escuela) triplicadas | `setTimeout` (3.6M ms) sobrevivió `kill` en Windows/Git Bash — 3 instancias corriendo en paralelo publicaron la misma story 3 veces | Contenido duplicado frente a seguidores reales | Burst migrado a n8n. Regla permanente: nunca procesos de publicación con intervalos en scripts locales. |
| Email webhook 404 | Burst script llamaba `enba-email-status` (inexistente) | Sin emails de status durante burst local | Creado workflow "ENBA - Email Notifier" (ID: yYnyrB7UI52Syf9x) con webhook `enba-email-notifier` |

**Estado burst al cierre sesión 23/04:**
- Story #1 (travesias-story-01.jpg): publicada 23/04 ~17:10 ART
- Story #2 (paseos-story-01.jpg): publicada × 3 — agregar solo UNA al highlight Paseos, ignorar duplicados
- Story #3 (escuela-story-01.jpg): publicada × 3 — agregar solo UNA al highlight Escuela, ignorar duplicados
- Stories #4–#24: publicando vía n8n, 1 por hora a los :10 ART. Fin estimado ~14:10 ART 24/04.

**Infraestructura n8n al cierre 23/04:**

| Workflow | ID | Estado |
|---|---|---|
| ENBA - Redes Publicación Diaria v7.2 | MipwleZNu8EG5v6C | Activo |
| ENBA - Stories Burst (n8n) | LBjxUFXarIPV2cIi | Activo — publicando #4-#24 |
| ENBA - Email Notifier | yYnyrB7UI52Syf9x | Activo |

**Pendientes próxima sesión:**
- [x] Agregar stories a highlights desde app IG — HECHO 25/04. Las 24 stories del burst están en los highlights.
- [x] Para #2 (paseos) y #3 (escuela): agregar solo UNA copia al highlight — HECHO 25/04.
- [x] Fase 2 stories (3x diarias × 10 días): `top: 72px → 200px` corregido, 30 stories re-renderizadas JPEG, 3 workflows n8n activos (q1nZVNrtEsxKEFni / pBP7tkXlD6nzx4wd / c8MHANGzW56GORAi). Primera story dispara 27/04 09:00 ART.
- [x] Gate reactivación Follow IG: P4 HECHO, P5 HECHO (highlights con contenido real, Marina OK), seguidores IG ≥ 100 (P3 ejecutado)

---

### Sesion 24/04 — Analisis performance dia 6 + optimizacion pauta

**Contexto:** Dia 6 de 27. Spend acumulado $132,198 ARS. Burn rate $22,033/dia vs target maximo $16,737/dia. Riesgo de agotamiento de budget el 10/05 (6 dias antes del cierre).

**Seguidores al 24/04:**
- FB: 423 (+400 desde baseline 22/04)
- IG: 46 (+35 desde baseline 22/04)
- Follow rate IG: 3.7% (944 visitas de perfil → 35 follows). Benchmark 15-35%. Problema en el perfil, no en los ads.

**Analisis ejecutado:**
- Bruno (agent Team 4): analisis performance dia 6 con datos del reporte automatico.
- Reporte ejecutivo (director performance): analisis con datos frescos de Meta Ads API v22.0, cuenta act_2303565156801569.

**Hallazgos criticos:**
- Microreel = creativo ganador absoluto en todos los segmentos (Hook 25-42%, CTR 8-11% FB, CPF $82-89 FB).
- IG follows NO son trackeables via Meta Ads API. El CPS de Follow_IG es proxy manual sin atribucion directa.
- Campana Leads (corporativo_C3): peor ad de la cuenta. CPL $7,472, CPM $5,470, Quality BELOW_AVERAGE_35. No estaba en el radar del reporte automatico.
- Awareness estaticos: 7 dias, CTR 0.01-0.19%, 0 acciones de negocio. Gasto ineficiente.
- reel4h_B1 en Awareness: Hook 1.4% vs el mismo reel en ENG/Follow con Hook 20-40%. Mismatch de audiencia/placement.

**13 ads pausados via API — APROBADOS Y EJECUTADOS 24/04:**

| Ad | ID | Motivo |
|---|---|---|
| piece02_C1 | 120239057858590139 | 7d, CTR 0.16%, BELOW_AVERAGE_35 |
| piece02_B2 | 120239057859170139 | 7d, CTR 0.01% |
| piece01dp_A2 | 120239058261910139 | 7d, CTR 0.19%, 0 acciones |
| piece01dp_B1 | 120239058262400139 | 7d, CTR 0.16% |
| piece03_A3 | 120239061361640139 | 7d, CTR 0.05% |
| piece03_B1 | 120239075118770139 | 7d, CTR 0.04% |
| reel4h_B1 | 120239287388330139 | Hook 1.4%, $10.5k sin retorno |
| nosotros_FB_Cold | 120239303666220139 | CPF $104 > target |
| destinos_FB_Retarget | 120239303669700139 | CPF $151 |
| destinos_IG_Retarget | 120239303663260139 | CPV $114 |
| nosotros_IG_Cold | 120239303662020139 | Reach 2, dead on arrival |
| nosotros_IG_Retarget | 120239303663740139 | Reach 2, dead on arrival |
| corporativo_C3 | 120239169468780139 | CPL $7,472, CPM $5,470 |

**Estado de la cuenta post-cortes:**
- Burn rate: $22,033 → ~$13,800/dia. Target $16,737 cumplido.
- Budget restante (~$368k): alcanza hasta ~21/05 (5 dias despues del plan).
- Ads RUNNING: microreel_FB_Cold, microreel_FB_Retarget, destinos_FB_Cold, nosotros_FB_Retarget, reel4horas_ENG.
- En evaluacion 24-72h: corporativo_IG_Cold (CPV $34, 2 dias), reel4hAlt_A2 (CTR 0.41%), nosotros_FB_Retarget (CPF $90).
- Winners confirmados: microreel_FB_Cold (CPF $82), destinos_FB_Cold (CPF $80).

**Gate 1 — verificar 25/04:**

| Metrica | Target | Accion si pasa |
|---------|--------|----------------|
| FB page likes del dia | > 30 | Escalar microreel_FB_Cold +25% |
| ThruPlays del dia | > 500 | Confirmar ENG activo |
| CPF microreel_FB_Cold | < $100 | OK |
| CPV corporativo_IG_Cold | < $60 | Aguantar; si > $60 pausar |
| CTR reel4hAlt_A2 | >= 0.8% | Mantener; si < 0.8% pausar |
| CPF nosotros_FB_Retarget | < $100 | Mantener; si > $100 pausar |

**Pendientes inmediatos:**
- [ ] Optimizar perfil IG: bio, grid, highlights — Marina + Franco — condicion para reactivar Follow_IG
- [ ] Verificar tamano D4 audience en Ads Manager (debe ser > 1,000 para activarse)
- [ ] Verificar que Retarget ad sets apuntan a D4 y no a audiencia generica de video viewers
- [ ] Verificar si reelPV_ENG tiene ad set padre pausado intencionalmente o por error
- [ ] Brief microreel v2 con hook textual — Franco + Marina — cuando haya margen de presupuesto

---

## 5. Timeline semana por semana — Semanas 2-4

> **NOTA (21/04):** Los montos de pauta vigentes estan en `presupuesto-v4-reestructuracion.md`. La estructura de contenido (que piezas, que dias) sigue siendo referencia valida.

### Semana 2 (22-28 abr): Optimizacion basada en datos

**Objetivo:** Duplicar lo que funciona, cortar lo que no. Primer reel publicado. 800-1.500 seguidores acumulados.

**Presupuesto pauta:** ARS 70.000 (IG ~52.500 / FB ~17.500)

**Contenido:**

| Fecha | Dia | Feed IG | Formato | Pauta IG | FB |
|-------|-----|---------|---------|----------|----|
| 22/04 | Mie | piece-08 "Cruzar a Colonia" | Estatico | -- | Si |
| 23/04 | Jue | piece-09 "Atardeceres desde cubierta" | Estatico | Pautar si ER alto | Si |
| 24/04 | Vie | carrusel-no-es-tour + piece-10 | Carrusel + Estatico | ARS 15.000 (carrusel) | Si (carrusel) |
| 25/04 | Sab | **reel "4 horas en el rio"** + piece-11 | Reel + Estatico | ARS 25.000 (reel, si cumple criterio) | Si |
| 26/04 | Dom | piece-12 "Si nunca navegaste" | Estatico | -- | Si + Evento FB |
| 27/04 | Lun | piece-13 "Aprender a navegar" | Estatico | -- | Si |
| 28/04 | Mar | piece-14 "No hace falta venir sabiendo" | Estatico | ARS 10.000 | Si |

**NOTA CRITICA — Ajuste de Marina integrado:**
El reel "4 horas en el rio" esta en dia 11 (25/04) como fecha limite. Si la filmacion se hizo en semana 1 y la edicion esta lista, adelantar a dia 4-5 (18-19 abr, semana 1). El calendario original de Franco tenia "Primera vez" el 25/04. **Se invierte:** "4 horas" va primero por score superior (8.5 vs 7). "Primera vez" se mueve a semana 3.

Si la filmacion NO se hizo en semana 1, el 25/04 es la fecha maxima para "4 horas". Si no esta listo para el 25/04, escalar a Jose: tenemos un problema critico de contenido de video.

**Tareas clave:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Editar reel "4 horas en el rio" (version completa + cortes 30s y 15s + subtitulos) | Dani (direccion Marina) | 24/04 |
| Disenar cover frame para reel en grid | Dani (direccion Marina) | 24/04 |
| Stagear carrusel-no-es-tour | Nico | 23/04 |
| Reporte semanal 1 — primer tier check | Bruno | 22/04 |
| Analisis de competidores (5-10 cuentas) | Bruno | 20/04 |
| Revisar insights semana 1 completa | Bruno + Franco | 22/04 |
| Ajustar audiencias de pauta segun datos reales | Jose + Bruno | 22/04 |
| Cerrar al menos 1 colaboracion con micro-influencer | Franco + Jose | 28/04 |
| Pedir 10-15 recomendaciones en FB a gente que ya navego | Jose | 24/04 |

**Pauta FB semana 2:** ARS 18.000. Split: ARS 10.000 Page Likes + ARS 8.000 boost del mejor post organico de semana 1.

**Gate de decision (fin semana 2):** Ubicar en que tier estamos. Si estamos en tier minimo, ajustar pauta agresivamente. Si estamos en tier realista, mantener y preparar escalado.

---

### Semana 3 (29 abr - 5 may): Escalar lo que funciona

**Objetivo:** Acelerar crecimiento. Segundo reel. Colaboracion con influencer. 2.500-4.000 seguidores acumulados.

**Presupuesto pauta:** ARS 80.000 (IG ~60.000 / FB ~20.000)

**Contenido:**

| Fecha | Dia | Feed IG | Formato | Pauta IG | FB |
|-------|-----|---------|---------|----------|----|
| 29/04 | Mie | piece-15 "Timonel se aprende mejor" | Estatico | -- | Si |
| 30/04 | Jue | piece-16 "Teoria, maniobra y rio" | Estatico | -- | Si |
| 01/05 | Vie | piece-17 "Empezar desde cero" (FERIADO) | Estatico | ARS 10.000 | Si |
| 02/05 | Sab | **reel "Primera vez"** + piece-18 | Reel + Estatico | ARS 35.000 (reel) | Si |
| 03/05 | Dom | carrusel-elegi-aventura + piece-19 | Carrusel + Estatico | ARS 15.000 (carrusel) | Si + Evento FB |
| 04/05 | Lun | piece-20 "Veleros que vale la pena mirar" | Estatico | -- | Si |
| 05/05 | Mar | piece-21 "Comparar bien" | Estatico | -- | Si |

**NOTA:** El reel "Primera vez" reemplaza a "4 horas" en esta posicion (por la inversion de orden). Si "4 horas" se publico en semana 1, excelente. Si se publico en semana 2, "Primera vez" va en semana 3 como estaba planeado originalmente.

**Tareas clave:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Editar reel "Primera vez" (3 versiones + subtitulos) | Dani (direccion Marina) | 01/05 |
| Cover frame para reel "Primera vez" | Dani | 01/05 |
| Stagear carrusel-elegi-aventura | Nico | 02/05 |
| Ejecutar colaboracion con influencer (si cerrada) | Jose + Franco + Marina | Semana 3 |
| Crear custom audience remarketing (todos los que interactuaron) | Jose | 29/04 |
| Lanzar campana de seguidores dedicada si numeros no estan en track | Bruno + Jose | 29/04 |
| Reporte semanal 2 | Bruno | 29/04 |
| Producir reel adicional "Buenos Aires desde el agua" o "Lo que nadie te dice" con material sobrante | Dani (direccion Marina) | 05/05 |

**Pauta FB semana 3:** ARS 22.000. Split: ARS 5.000 Page Likes + ARS 10.000 boost + ARS 7.000 trafico al sitio.

**Gate de decision (fin semana 3):**
- Si seguidores > 3.000: en track para tier realista. Escalar presupuesto si hay margen.
- Si seguidores < 1.000: ajustar target a tier minimo. Reunion de emergencia.

---

### Semana 4 (6-14 may): Consolidar y preparar mes 2

**Objetivo:** Cerrar fuerte, consolidar comunidad, extraer aprendizajes. Target: 3.000-5.000 seguidores acumulados (tier realista).

**Presupuesto pauta:** ARS 50.000 (IG ~37.500 / FB ~12.500) + reserva de ARS 20.000 para escalar winners.

**Contenido:**

| Fecha | Dia | Feed IG | Formato | Pauta IG | FB |
|-------|-----|---------|---------|----------|----|
| 06/05 | Mie | piece-22 "Las preguntas correctas" (broker) | Estatico | -- | Si |
| 07/05 | Jue | piece-23 "Ver el barco cambia todo" | Estatico | -- | Si |
| 08/05 | Vie | piece-24 "Navegar tranquilo" | Estatico | ARS 8.000 | Post exclusivo FB: "Lo que aprendimos en 3 semanas" |
| 09/05 | Sab | piece-25 "Prevenir cuesta menos" | Estatico | -- | Evento FB: salida cierre 10/05 |
| 10/05 | Dom | piece-26 "Poner a punto" | Estatico | -- | Si |
| 11/05 | Lun | piece-27 "Tu embarcacion merece" | Estatico | -- | -- |
| 12/05 | Mar | piece-28 "Equipo presente y rio real" | Estatico | ARS 10.000 | Si |
| 13/05 | Mie | piece-29 "Antes de cada salida" | Estatico | -- | Si |
| 14/05 | Jue | piece-30 "El rio te llama" (CIERRE) | Estatico | ARS 12.000 | Post exclusivo FB: "Gracias, primeros tripulantes" |

**Marina flaggeo:** Semana 4 es la mas debil creativamente (9 estaticos seguidos). Si hay un reel adicional listo ("Buenos Aires desde el agua" o "Lo que nadie te dice"), publicarlo esta semana para mantener momentum.

**Tareas clave:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Publicar reel adicional si esta listo | Dani + Nico | Semana 4 |
| Analisis metricas completas 4 semanas | Bruno | 14/05 |
| Identificar top 5 y bottom 5 posts | Bruno + Franco + Marina | 14/05 |
| Documentar aprendizajes formato/horario/copy/hashtags | Franco + Bruno | 14/05 |
| Planificar produccion mes 2 (proporcion corregida: mas reels, mas carruseles) | Franco + Marina | 14/05 |
| Evaluar segunda tanda de pauta sobre best-performers | Bruno | 14/05 |
| Reporte semanal 3 | Bruno | 06/05 |
| Reporte de cierre | Bruno | 15/05 |

**Pauta FB semana 4:** ARS 18.000. Split: ARS 5.000 boost cierre + ARS 13.000 trafico al sitio.

---

## 6. Matriz de responsabilidades

| Tarea | Responsable | Aprueba | Consulta |
|-------|-------------|---------|----------|
| Publicacion diaria IG (auto) | n8n | -- | Nico (verificar) |
| Publicacion diaria IG (manual fallback) | Nico | -- | Franco |
| Publicacion FB | Nico | -- | Franco |
| Engagement manual diario (55 min) | Jose (owner) | -- | Franco |
| Pauta / Ads Manager | Jose (owner) | Bruno | Franco, Marina |
| Filmacion reels | Jose + Dani | Marina | Franco |
| Edicion reels + cover frames + cortes | Dani | Marina | -- |
| Subtitulos funcionales para pauta | Dani | Marina | -- |
| Captions y copy | Sole | Franco | -- |
| QA y checklist cada pieza | Nico | -- | -- |
| Staging de carruseles | Nico | -- | Dani |
| Adaptacion script carruseles | Dani | -- | -- |
| Setup Meta Business Manager | Jose | Bruno | -- |
| Setup GA4 + GTM | Jose | Bruno | -- |
| Configuracion audiencias Meta Ads | Jose | Bruno | Franco |
| Reportes semanales | Bruno | -- | Franco, Marina |
| Analisis de competidores | Bruno | -- | Franco |
| Colaboracion micro-influencer (cierre) | Jose + Franco | Marina | -- |
| Colaboracion micro-influencer (brief visual) | Marina | -- | Franco |
| Posts exclusivos FB (bienvenida, encuestas, links) | Sole (copy) + Nico (publicar) | Franco | -- |
| Eventos FB | Nico | Franco | -- |
| Recomendaciones FB (pedir a conocidos) | Jose | -- | -- |
| Participacion en grupos FB | Jose | -- | Franco |
| Coordinacion general | Manu | -- | Todos |

---

## 7. Dependencias criticas — Estado

| Dependencia | Estado | Resolucion |
|-------------|--------|------------|
| Meta Business Manager configurado | **RESUELTO** | Business ID 814334400927137, Ad Account act_2303565156801569 |
| Cuenta publicitaria con metodo de pago | **RESUELTO** | Mastercard ····8307, limite $700K |
| IG y FB vinculados en Business Suite | **RESUELTO** | Vinculados |
| Meta Pixel en espacionautico.com.ar | **RESUELTO** | Event Data 1273048378266952 activo. Dominio autorizado 19/04. |
| GA4 en espacionautico.com.ar | **RESUELTO** | G-XVN36KPHBL instalado en enba-web/index.html |
| Script de carruseles | **RESUELTO** | `scripts/publish-carousel.mjs` creado 19/04, verificado dry-run |
| Filmacion reel "4 horas" | **RESUELTO** | Filmado, editado, publicado 17/04. Corriendo como ad engagement. |
| Filmacion reel "primera vez" | **RESUELTO** | v8 publicado IG+FB 21/04. QA PASS. |
| Definicion presupuesto | **RESUELTO** | $500K solo pauta. Produccion aparte. Confirmado 19/04. |

### Dependencias nuevas (19/04)

| Dependencia | Bloquea | Deadline |
|-------------|---------|----------|
| Creative para C3 Corporativo | Activacion ad set Leads (dia 8 = 26/04) | 25/04 |
| Pieza con ER > 1% para TopPerformers | Activacion ad set TopPerformers (dia 10 = 28/04) | Esperar data |
| ~~Edit-sheet reel "primera vez"~~ | ~~Produccion del segundo reel~~ | **RESUELTO 21/04** |

---

## 8. Triggers de escalacion

Estos son los momentos donde hay que tomar una decision fuera del plan normal.

| Momento | Condicion | Accion | Quien decide |
|---------|-----------|--------|-------------|
| Dia 3 | CPS > ARS 80 | Revisar creatividades y audiencias. Pausar ad sets con peor rendimiento. | Bruno + Jose |
| Dia 5 | CPS > ARS 100 despues de 5 dias | Alerta roja. Algo esta mal en segmentacion o contenido. Revisar todo. | Bruno + Franco + Marina |
| Dia 7 | Seguidores < 200 | Reunion de emergencia. Revisar pauta, contenido, audiencias, perfil. Activar Plan B de Franco (contenido mas nativo, stories intensificadas, reels 15s con stock). | Team 4 + Jose |
| Dia 7 | Engagement rate < 1% organico | Contenido no conecta. Devolver a Franco (estrategia) y Marina (direccion creativa) para pivot. | Franco + Marina |
| Dia 7 | Follow rate < 10% | Perfil no convence. Revisar bio, highlight covers, primeros 9 posts del grid. | Franco + Marina |
| Dia 14 | Seguidores < 1.000 | Ajustar target a tier minimo. Concentrar pauta en el top performer unico. Acelerar colaboracion influencer. | Bruno + Franco + Jose |
| Dia 14 | n8n falla 2+ dias | Activar publicacion manual con scripts de fallback. Investigar y reparar n8n. | Nico + Dani |
| Dia 21 | Seguidores > 3.000 | Escalar presupuesto si hay margen. Evaluar reel adicional. | Bruno + Jose |
| Dia 21 | Reel con > 10K views organicas y > 100 follows en 24h | Escalar con pauta hasta ARS 40K. Reasignar de reserva tactica. | Bruno + Jose |
| Dia 21 | Presupuesto > 75% gastado (> ARS 187.500) | Frenar todos los ad sets excepto top performer. Bajar budget diario a ARS 3-5K. Compensar con organico. | Bruno |
| Cualquier dia | Post se viraliza (> 10K views en 24h o > 500 shares) | Pautar con ARS 30-50K inmediatamente. 3-5 stories capitalizando. Responder TODOS los comentarios. | Franco + Bruno + Jose |
| Cualquier dia | Vocabulario prohibido detectado en post publicado | Devolver a Sole para correccion inmediata. No editar directamente. | Nico |

---

## 9. Resumen de presupuesto

**FUENTE DE VERDAD:** `presupuesto-v4-reestructuracion.md`. Este resumen es solo referencia rapida.

### Pauta (ARS 500.000 neto — confirmado 19/04, solo pauta)

| Dimension | Valor |
|-----------|-------|
| Split IG / FB | 75% / 25% (ARS 359.562 / ARS 119.854). Revision dia 10 (29/04). |
| Por objetivo | Awareness 25% ($119K) / Engagement 45% ($215K) / Leads 10% ($47K) / Reserva 20% ($95K) |
| Semana 1-4 | $55K / $130K / $165K / $129K (post-reestructuración v4) |
| CPS target | < ARS 45 promedio (calibrado v3) |
| Umbral de corte | CPS > $100 o ER < 1% o CTR < 0.4% (despues de 72h) |
| Umbral de escalado | CPS < $30 + ER > 3% → +25% cada 48h |
| Fatigue | Frecuencia > 3.5 → apagar |
| Max por pieza | 14 dias (excepcion: CPS < $20 + freq < 2 → extension 7 dias, aprobacion Bruno) |

### Impuestos Meta

Debito real en tarjeta: ~ARS 700.000 (impuestos ~40%). Tarjeta Mastercard ····8307, limite confirmado.

---

## 10. Reportes y medicion

### Calendario de reportes (Bruno)

| Reporte | Fecha | Contenido |
|---------|-------|-----------|
| Reporte 72 hs | 23/04 | Primer corte de datos, calibracion CPS y engagement |
| Reporte semanal 1 | 23/04 | Primera semana completa, tier check |
| Reporte semanal 2 | 30/04 | Segunda semana, datos para proyectar cierre |
| Reporte semanal 3 | 07/05 | Tercera semana, ajustes finales |
| Reporte de cierre | 16/05 | Resultado final, aprendizajes, plan mes 2 |

### KPIs primarios a mirar diariamente

| KPI | Fuente | Target |
|-----|--------|--------|
| Seguidores nuevos netos | IG Insights | Ver tabla de tiers por semana |
| CPS blended | Ads Manager (calculado) | < ARS 60 |
| Alcance total (org + pago) | IG Insights + Ads Manager | Ver tabla de tiers |

### KPIs secundarios (cada 3 dias / semanal)

| KPI | Target | Frecuencia |
|-----|--------|-----------|
| Engagement rate | > 5% sem 1-2, > 3.5% sem 3-4 | Cada 3 dias |
| Save rate | > 2% (> 4% excelente) | Semanal |
| Share rate | > 1% (> 2% excepcional, escalar inmediatamente) | Semanal |
| Follow rate (follows/profile visits) | 15-35% | Cada 3 dias |
| Retencion reels | > 50% promedio | Cada reel |
| Profile visits | Crecimiento semanal sostenido | Cada 3 dias |

---

## 11. Plan de contingencia

### Si n8n falla

Publicar manualmente usando el script de publicacion local. No perder ni un dia de publicacion. Nico es responsable de publicacion manual.

### Si los reels no se filman en el mes

Ejecutar Plan B de Franco:
1. Publicar reels de 15s con material del asset-bank + texto overlay
2. Intensificar stories a 8-10/dia
3. Pivotar a contenido mas "nativo" de IG (menos estetico, mas espontaneo)
4. Concentrar pauta en el mejor post estatico/carrusel

El plan funciona sin reels pero con crecimiento significativamente menor. Los reels son la diferencia entre tier minimo y tier realista.

### Si presupuesto se agota antes de fin de mes

1. Frenar todos los ad sets excepto el top performer
2. Bajar presupuesto diario a ARS 3.000-5.000
3. Compensar con organico: engagement manual 60+ min/dia, mas stories
4. No pedir mas presupuesto hasta reporte de cierre con datos

### Si nada funciona en 7 dias (< 200 seguidores, alcance < 500)

Diagnostico rapido:
- Hashtags indexados?
- Contenido se muestra a no-seguidores?
- CTAs generando accion?

Acciones:
1. Pivotar a contenido mas nativo/espontaneo
2. Intensificar stories a 8-10/dia
3. Reasignar 80% del budget al unico post/reel con mejor rendimiento relativo
4. Acelerar colaboracion con influencer
5. Considerar micro-campanas de mensajes directos (si hay capacidad de respuesta)

---

## 12. TikTok — Canal en configuración

**Estado al 27/04/2026**

| Item | Detalle |
|---|---|
| Cuenta | `@espacionauticobsas` creada |
| App Developer | "ENBA Social" — enviada a revisión |
| Sandbox | Configurado, cuenta ENBA agregada como test user |
| DNS | TXT record TikTok verificado en Cloudflare (`espacionautico.com.ar`) |
| Publicación via API | Bloqueada hasta aprobación — videos quedan privados en app no auditada |
| Publicación actual | Manual desde la app |

**Decisión operativa:** los primeros 30 días TikTok se publica manualmente. La integración con n8n se activa cuando TikTok apruebe la app.

**Post-aprobación — pasos pendientes:**
1. Hacer OAuth con cuenta ENBA → obtener access token
2. Configurar credencial en n8n
3. Integrar workflow de publicación TikTok
4. Definir KPIs y frecuencia según material disponible (coordinado con agente wip-tiktok-30d-pilot)

**Relación con el frente de producción TikTok:** existe un frente de trabajo paralelo produciendo el material de contenido (piezas, posters, scripts de curación). Cuando esté listo se integra a este frente.

---

## Nota de Manu

Este plan integra el trabajo de Bruno (diagnostico, presupuesto, KPIs, infraestructura, medicion), Franco (estrategia IG, estrategia FB, calendario), y Marina (analisis de reels, review creativa con ajustes). Los ajustes de Marina fueron adoptados donde corresponde y estan marcados en el texto.

Las dependencias mas criticas son: Meta Business Manager (sin esto no hay pauta) y filmacion de reels (sin esto perdemos el formato de mayor crecimiento). Ambas dependen del owner (Jose).

El plan esta disenado para que alguien pueda leerlo y saber exactamente que hacer cada dia, quien es responsable, y que hacer si algo sale mal.

---

*Plan maestro producido por Manu (Coordinador de Produccion) — 15 de abril de 2026*
*Actualizado: 23 de abril de 2026 — plan reconciliado Bruno/Experto (8/8), auditoría perfil IG, highlights P4 rediseñados, 24 stories renderizadas y burst iniciado (stories #1-#3 publicadas, #4-#24 vía n8n LBjxUFXarIPV2cIi), incidentes PNG/Cloudflare/zombie documentados, infraestructura n8n activa documentada*
*Actualizado: 24 de abril de 2026 — burst corregido y funcionando: credencial n8n faltaba `authentication: genericCredentialType` (Meta rechazaba token silenciosamente); email migrado de webhook a emailSend directo con Gmail ENBA (ExpressionExtensionError por `\n` literal en expresión). Stories #7 y #8 publicadas manualmente. Burst en curso: #10/24 con email de confirmación recibido. Credencial Meta: IGBqXMQRWJLxzh7f. Email: HpJBfNd1BCHaLYfY.*
*Actualizado: 24 de abril de 2026 (sesión tarde) — Auditoría creativa Marina sobre Follow_IG: carousel Destinos y Nosotros aprobados. Follow_IG activado: IG_Cold $4.000/día + IG_Retarget $1.500/día. Normalización jerarquía Meta Ads: todas las campañas y ad sets en ACTIVE, pausas solo a nivel ad. Burn rate actual: $23.020 ARS/día.*
*Actualizado: 26 de abril de 2026 — Incidente Gmail 25/04: App Password de credencial Gmail ENBA (`HpJBfNd1BCHaLYfY`) fue revocado por Google. Falló con error 535-5.7.8 BadCredentials. Workflows afectados: (1) Blog Automation `BTs8fTGvGqJE3shj` — post generado pero approval email no enviado → blog del 25/04 no publicado automáticamente. (2) Publicación Diaria `MipwleZNu8EG5v6C` — execución marcada como error, pero piece-11 SÍ se publicó en IG (Meta API corre antes del email). Credenciales reestablecidas por Jose el 26/04. Blog del 25/04 ("OpenCPN para navegantes recreativos") publicado manualmente via GitHub API el 26/04 con datePublished 2026-04-25. Consecutividad del feed no afectada.*
*Actualizado: 26 de abril de 2026 (sesión tarde) — P2/P3/P4 completados: verificación API confirma que Gastronomía ya había sido removida de B1 y ENG_REEL, Caminatas/Excursionismo/Camping de B2, geo 18-city y age 18-65 correctos en los 13 ad sets activos. interest-ids.json sincronizado. Fase 2 stories activa: 30 JPEG renderizados (top:200px), 3 workflows n8n q1nZVNrtEsxKEFni/pBP7tkXlD6nzx4wd/c8MHANGzW56GORAi activos, primera story 27/04 09:00 ART. CLAUDE.md actualizado: enba-web contacto reglas explícitas 4 puntos (excepción solo con autorización Jose + reconfirmación). Blog 25/04 OpenCPN publicado via GitHub API (commit d9bb7e5, datePublished 2026-04-25). Burn rate real post-cortes 24/04: ~$19.000–$19.500 ARS/día (promedio 24-25/04 con GET fresco). Target: $16.737/día — delta ~$2.500–$2.800 por encima. Seguidores al cierre: IG 55, FB 619.*
*Actualizado: 25 de abril de 2026 — Carrusel "no-es-tour" publicado IG (carrusel 6 slides, ID 18317065594280248) + FB (slide-04 imagen única, ID 1064806400040502_122110365644620656). Reporte ejecutivo performance generado (día 7/27): winners FB microreel (CPF $83-89), tracking IG ciego ($40K sin atribución). Pixel Meta implementado en enba-web: fbq Lead (formulario servicios exitoso), fbq Contact (click WhatsApp), fbq ViewContent (click CTA) — commit 55faaca en enba-web main, pendiente push + deploy + crear Custom Conversions en Meta Ads. Skill /redes actualizado: lee plan-maestro + meta-ids.json + presupuesto-v4 al iniciar. Seguidores IG verificados: 47.*
*Actualizado: 27 de abril de 2026 — Sesión Bruno día 8/27. Pixel stack completado: Custom Conversions creadas en Meta Ads vía API — Contact/click WhatsApp (ID 945609238261267), ViewContent/click CTA (ID 2216541158753262). Lead ya existía (ID 1634612341204888). Lead TEST (ID 1497440055361281, archivada, 0 eventos) eliminada. __missing_event bloqueado en Events Manager (1 disparo aislado el 24/04, no intencional). Estado pixel al 27/04: PageView funciona desde 15/04 (605 total), ViewContent 4 eventos (25-26/04 — clicks en CTAs), Contact 0 eventos (href WhatsApp a verificar). CAPI diferido a mes 2-3 — decisión vigente. Script de creación: scripts/create-missing-conversions.mjs.*
*Actualizado: 27 de abril de 2026 (sesión tarde) — D4 audience verificada vía API: 3.000-3.500 personas, estado "listo para usar" — umbral 1.000 superado, disponible para AS_ENG_ReelPrimeraVez_Warm (02/05). Fix Contact pixel: openWhatsappFallback en enba-web/src/lib/chat.ts usaba window.open() sin llamar fbq — event delegation de ga4-events.ts no lo capturaba. 9 componentes afectados (BookingSection, VeleroCard, VeleroDetailModal, BlogPost, DestinoDetalle, Destinos, EscuelaNautica, PaseosVelero, VeleroDetalle). Fix: window.fbq?.("track", "Contact") agregado antes de window.open(). Commit a9a2e67 pusheado a enba-web main — Cloudflare deploy iniciado. Verificar eventos Contact en Events Manager 24-48h post-deploy. Retarget ad sets verificados vía API: IG_Retarget y FB_Retarget tienen D1+D3+D4 en targeting — correcto. Stories Fase 2 verificadas: 3 workflows activos (Mañana 09:00/Tarde 14:00/Noche 20:00 ART). Secuencia INTACTA — workflow es date-based, no stateful counter. Story seq=1 publicada 26/04 a las 13:54 ART (5h tarde por fallo cron 09:00 ART — ejecución 16095 falló antes de llegar a nodo). Tarde y Noche del 26/04 publicaron en horario. Monitorear cron 09:00 ART hoy 27/04 (seq=4 escuela). Spike gasto 26/04 ($24.038 vs $19.567): benigno — ad sets madurando y alcanzando caps diarios. Deltas: ENG_REEL +61% ($1.943→$3.121), IG_Retarget +107% ($764→$1.584), IG_Cold +44% ($2.944→$4.246). Frecuencias bajas (1.0–1.3), sin fatiga. A burn rate actual presupuesto alcanza ~10 mayo. Decisión de ajuste diferida a Gate 2 (29/04): si follows justifican, mantener; si no, recortar IG_Cold y/o ENG_REEL. jq instalado en el entorno (winget install jqlang.jq) — disponible para futuras llamadas API.*
*Actualizado: 27 de abril de 2026 (sesión tarde/noche) — Automatización FB stories construida de punta a punta. (1) Patch quirúrgico en los 3 workflows de Fase 2 (q1nZVNrtEsxKEFni/pBP7tkXlD6nzx4wd/c8MHANGzW56GORAi): nodo "Log to Sheet" agregado después de "Email OK" — loguea date/slot/media_id/image_url/seq en Google Sheet `1DimMWT7rNXNd2jS_rnCNs0qHLqSahwYLc3s9m7wpw1U` tras cada publicación. (2) Nuevo workflow "ENBA - Stories FB Best IG" (ZGIGw47IYuwHv3Wh): corre 08:30 ART diario — lee sheet, consulta IG Insights reach de las 3 stories del día anterior, publica la ganadora en FB (2 pasos: upload photo unpublished → photo_stories). Confirma vía email. Primera ejecución: 28/04 08:30 ART. Credencial Google Sheets OAuth2 reautorizada. Aprendizajes técnicos: PUT n8n acepta solo {name, nodes, connections, settings}; credential googleSheetsOAuth2Api no compatible con HTTP Request node (usar nodo nativo); test story publicada en FB durante verificación del endpoint (incidente menor). Scripts en repo: scripts/patch-stories-add-sheets-log.mjs, scripts/n8n-stories-fb-best-ig.json. Seguidores al cierre: IG 64, FB 736.*
*Fuentes: Bruno, Franco, Marina — Team 4, ENBA*
