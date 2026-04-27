# STATUS — Frente REDES

**Última actualización:** 27 de abril de 2026
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

- La fuente de verdad de pauta vigente es `presupuesto-v4-reestructuracion.md`.
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

- Workflow de publicación diaria feed IG+FB v7.2: `MipwleZNu8EG5v6C`
- Workflow de evaluación diaria de ads: `1qRywsEWAl7VoO5o`
- Fase 2 de stories: documentada en `plan-maestro.md` como activa al 26/04

### Últimos hitos relevantes

- Pixel stack completado y Custom Conversions creadas en Meta Ads
- `Contact` todavía muestra 0 eventos; verificar href/flujo de WhatsApp antes de asumir que mide bien
- Burn rate real reportado por encima del target al cierre del 26/04
- `STATUS.md` pasa a ser la capa corta para arranque de sesión del frente redes

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
