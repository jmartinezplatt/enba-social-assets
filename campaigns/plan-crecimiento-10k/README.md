# Plan Crecimiento 10K — Índice de Documentación

**Estado del frente:** activo
**Inicio de sesión recomendado:** leer primero `STATUS.md`
**Objetivo de este archivo:** mapear rápido qué documento usar, cuál manda y cuáles quedaron históricos.

---

## Orden de lectura recomendado

1. `STATUS.md`
   Snapshot corto vigente para arrancar sesión.

2. `../../CLAUDE.md`
   Reglas permanentes del repo: voz, equipos, guardrails, n8n, pipeline, branch.

3. Documento específico según tarea:
   - `plan-maestro.md` para plan, timeline, pendientes y decisiones
   - `presupuesto-v4-reestructuracion.md` para pauta vigente
   - `meta-ids.json` para infraestructura Meta Ads e IDs reales
   - `qa-report.md` para QA
   - `kpis.md` y `google-analytics-medicion.md` para medición

---

## Documentos vigentes

| Archivo | Para qué usarlo | Nivel |
|---|---|---|
| `STATUS.md` | Arranque rápido de sesión | Operativo |
| `plan-maestro.md` | Estado vivo, pendientes, timeline, decisiones | Operativo |
| `presupuesto-v4-reestructuracion.md` | Plan de pauta vigente | Normativo |
| `meta-ids.json` | Estado real de campañas, ad sets, ads e IDs | Infraestructura |
| `qa-report.md` | Criterios y reportes de QA | Soporte |
| `kpis.md` | Marco de medición y targets | Soporte |
| `google-analytics-medicion.md` | Medición sitio + UTMs + GA4 | Soporte |

---

## Documentos de apoyo todavía útiles

Estos documentos no son el punto de entrada, pero pueden seguir sirviendo para contexto o trabajo puntual:

| Archivo | Uso |
|---|---|
| `analisis-reels.md` | Dirección y criterios para reels |
| `estrategia-instagram.md` | Estrategia base de contenido IG |
| `estrategia-facebook.md` | Estrategia base FB |
| `diagnostico-inicial.md` | Contexto del problema original |
| `meta-business-setup.md` | Setup de negocio / cuenta |
| `preflight-meta-api.md` | Verificaciones de integración |
| `interest-ids.json` | Intereses ya sincronizados / auditados |
| `reporte-semanal-template.md` | Plantilla de reporting |

---

## Históricos o superseded

Estos archivos no deben leerse primero ni citarse como fuente principal si contradicen los vigentes:

| Archivo | Estado |
|---|---|
| `historico/presupuesto.md` | Histórico |
| `historico/presupuesto-v2-500k.md` | Superseded |
| `historico/presupuesto-v3-final.md` | Superseded por v4 |
| `historico/decision-b-v2-propuesta.md` | Contexto histórico |
| `historico/respuesta-auditoria-bruno.md` | Contexto histórico |
| `historico/auditoria-v3-final.md` | Histórico |

Si un handoff o documento histórico contradice `STATUS.md`, `plan-maestro.md` o `presupuesto-v4-reestructuracion.md`, manda el documento vigente.

---

## Subcarpetas

| Ruta | Contenido |
|---|---|
| `carousel-destinos/` | Carrusel Follow plan |
| `carousel-nosotros/` | Carrusel Follow plan |
| `darkpost-render/` | Renders y config de darkposts |
| `highlights/` | Historias destacadas / assets |
| `historico/` | Documentos superseded y contexto de decisiones pasadas |
| `reels/` | Reels y variantes de trabajo |
| `video-thumbs/` | Thumbs y exploración visual |

---

## Convención práctica

- Si la tarea es de estrategia o gestión diaria: `STATUS.md` + `plan-maestro.md`
- Si la tarea es de pauta: `STATUS.md` + `presupuesto-v4-reestructuracion.md` + `meta-ids.json`
- Si la tarea es de QA o medición: `STATUS.md` + doc de soporte específico
- Si la tarea pide contexto completo: abrir vigentes primero y recién después históricos

---

## Estado de la limpieza

La separación principal ya quedó hecha:

1. los superseded viven en `historico/`
2. el nivel principal quedó reservado para vigentes y soporte real
3. este índice pasa a ser la puerta de entrada del frente

Próximo paso opcional si más adelante querés afinar todavía más:

1. agrupar algunos documentos de soporte en subcarpetas temáticas (`ads/`, `medicion/`, `creatividad/`)
2. dejar `plan-maestro.md` más corto y mover parte del changelog a un archivo separado
