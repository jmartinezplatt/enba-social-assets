# STATUS — Frente REDES

**Última actualización:** 28 de abril de 2026 (sesión noche — día 10/27)
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

- `plan-crecimiento-10k`

### Estado general del frente

- La fuente de verdad de pauta vigente es `presupuesto-v4-reestructuracion.md` + **`presupuesto-v4.1-estado-dia10.md`** (parche operativo al día 10 — leer junto con v4).
- La fuente de verdad operativa y de decisiones sigue siendo `plan-maestro.md`.
- La fuente de verdad de infraestructura Meta Ads es `meta-ids.json`.
- El contrato de producción de contenido sigue siendo:
  - `campaign.pieces.json` para campañas
  - `carousel.config.json` + `captions.json` para carruseles

### Snapshot del repo al 27/04

- `asset-bank/`: 161 JPGs curados
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

1. Confirmar branch `plan-crecimiento-10k`.
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
