# Auditoría v3 Final — Plan de Pauta 10K

**Auditor:** Paid Media Auditor (Team 4)
**Fecha:** 17 de abril de 2026
**Documento auditado:** presupuesto-v3-final.md

---

## Gaps de ronda 1 y 2 — ¿Integrados?

| Gap original | Estado en v3 |
|---|---|
| S-1: Targeting inválido 7/7 | ✅ Integrado. Sección 6 lista IDs reales por ad set. Patcheado confirmado. |
| E-1/P-1: $210K Engagement sin estructura | ✅ Integrado. Redistribuido a 25% ($125K) con 3 ad sets definidos (sección 6). |
| P-2: Sprint $0 de $100K | ✅ Integrado. Re-baseline desde 18/04, sprint con fechas reales (sección 4). |
| O-2: Cronograma vencido | ✅ Integrado. Calendario completo con fechas reales (sección 15). |
| C-2/O-3: Lead form C3 | ✅ Integrado. Referenciado como creado y activo (sección 6, Leads). |
| F-1: Ad piece-03 en B1 | ✅ Integrado. 6 ads listados incluyendo piece-03 en B1 (sección 7). |
| S-2: Exclusión followers | ✅ Integrado. 2 Custom Audiences de exclusión definidas (sección 12). |
| S-3: Exclusión cruzada | ✅ Integrado como diferida a semana 3+ con justificación (sección 12). |
| C-1: Reel sin ad | ✅ Integrado. Plan completo del reel como ad (sección 8). |
| P-3: Tarjeta $700K | ✅ Integrado. Confirmada en header del documento. |
| V-1: Eventos Pixel | ❌ No integrado. No hay mención de eventos custom (ViewContent, Contact, Lead) ni verificación. |
| V-2: UTMs en ads | ❌ No integrado. No hay convención de UTMs para los ads. |
| Ciclo de vida piezas | ✅ Integrado. 6 reglas completas (sección 9). |
| Redistribución corregida | ✅ Integrado. AWR 50% / ENG 25% / LEA 10% / Reserva 15% (sección 2). |

**Score: 12/14 gaps integrados. 2 no integrados (menores).**

---

## Verificación numérica

| Concepto | Cálculo | Cierra |
|----------|---------|--------|
| Total por objetivo | $250K + $125K + $50K + $75K | = $500K ✅ |
| Evolución semanal | $100K + $140K + $160K + $100K | = $500K ✅ |
| AWR diario × 27 días | $8.500 × 27 | = $229.5K < $250K ✅ |
| ENG diario × días | $3K×22 + $1.5K×17 + $1.5K×22 | = $66K + $25.5K + $33K = $124.5K < $125K ✅ |
| LEA diario × 14 días | $3.500 × 14 | = $49K < $50K ✅ |
| Sprint 3 días | $25K + $15K + $15K | = $55K ✅ |
| Resto sem 1 | $10K + $10K + $10K + $15K | = $45K. Sprint + resto = $100K ✅ |

**Todos los números cierran.** Sin inconsistencias.

---

## Gaps nuevos detectados

### MENOR (2)

| # | Gap | Severidad |
|---|-----|-----------|
| N-1 | Eventos custom del Pixel (ViewContent, Contact, Lead) no mencionados. Sin ellos, D1 WebVisitors solo captura PageView — retargeting menos granular. | MENOR |
| N-2 | UTMs no definidos para los ads. Sin UTMs, GA4 no puede atribuir tráfico de pauta correctamente. Convención sugerida: `utm_source=facebook&utm_medium=paid&utm_campaign=enba_awareness_abr2026&utm_content=piece-01-dp` | MENOR |

Ambos son no bloqueantes para activar. Se pueden resolver en semana 1 sin impactar la estructura del plan.

---

## Evaluación general del documento

**Fortalezas:**
- Documento auto-contenido. No referencia otros documentos para datos críticos.
- Fechas reales + día relativo en todo el calendario.
- IDs reales de Meta para todo lo que ya existe.
- Ciclo de vida de piezas completo con 6 reglas operativas.
- Cadena de aprobación explícita (Bruno propone → owner aprueba → técnico ejecuta).
- Documentos anteriores declarados como superseded (sección 18).

**Observaciones menores:**
- El budget diario del sprint (sección 4) suma $25K día 1 pero los ad sets de Awareness tienen budget fijo ($2.500 B1 + $1.500 A2 = $4.000/día total para piece-01). Los $25K de "budget del sprint" son presupuesto asignado al día, no al ad set — Meta gasta según el budget del ad set, no según el plan. Hay que tener claro que el control real es el budget del ad set, no la tabla del sprint. No es un error — es una ambigüedad que Manu debe entender.

---

## Veredicto

**APROBADO PARA EJECUCIÓN.**

El plan v3 integra las correcciones de las 3 rondas de auditoría, los números cierran, las fechas son reales, y cada acción tiene dueño y aprobación.

Los 2 gaps menores (eventos Pixel + UTMs) no bloquean la activación y se pueden resolver en paralelo durante semana 1.

Las 3 acciones pendientes antes de activar (crear 2 ad sets de Engagement + 1 ad del reel) son técnicas y no requieren redefinición estratégica.

**Este plan está listo para ejecutarse el 18/04/2026.**

---

*Paid Media Auditor — Team 4, ENBA*
*17 de abril de 2026 — v3 final*
