# Auditoría Segunda Ronda — Plan de Pauta 10K

**Auditor:** Paid Media Auditor (Team 4)
**Fecha:** 17 de abril de 2026
**Material revisado:** historico/respuesta-auditoria-bruno.md (respuesta a los 7 gaps críticos + 2 puntos adicionales)

---

## Estado de los 7 gaps críticos originales

### S-1 / O-1: Targeting de intereses inválido (7/7 ad sets)

**Estado: PARCIALMENTE CERRADO**

Bruno reconoce el error y propone validar los 18 IDs contra API + patchear los 7 ad sets. La acción es correcta pero **no está ejecutada**. Los ad sets siguen con targeting roto hasta que alguien corra la validación + PATCH.

Observación: Bruno menciona `GET /search?type=adinterestvalid` — ese endpoint no existe. El correcto es `GET /search?type=adinterest` (que ya se usó para obtener los 18 IDs) o la validación se hace intentando crear/actualizar el ad set y verificando que Meta no rechace. La acción correcta es: tomar los IDs de `interest-ids-raw.json` que ya se obtuvieron, seleccionar los relevantes por audiencia, y patchear. No hace falta otra búsqueda.

**Para cerrar:** ejecutar el PATCH con IDs válidos. Acción técnica concreta.

---

### E-1 / P-1: $210K de Engagement sin estructura ($171K sin vehículo)

**Estado: CERRADO**

Bruno redistribuyó el presupuesto:
- Engagement baja de 42% ($210K) a 25% ($125K)
- Awareness sube a 50% ($250K)
- Reserva 15% ($75K)

Define 3 ad sets de Engagement concretos: reel $3K/día + top performers $1.5K/día + C2 regalos $1.5K/día = $124.5K. Los números cierran.

La redistribución es más realista para cuenta nueva. Awareness al 50% con REACH es la decisión correcta para crecimiento de seguidores.

**Sin observaciones adicionales.**

---

### P-2: Sprint semana 1: $0 de $100K

**Estado: CERRADO**

Bruno re-basea todo el cronograma desde el 18/04 como día 1 real. 27 días en vez de 30, misma curva 20/28/32/20. Activación escalonada con fechas reales: día 1 (18/04), día 3 (20/04), día 5 (22/04), día 8 (25/04).

La propuesta es viable siempre que los gaps bloqueantes (targeting + estructura) se resuelvan antes del 18/04.

**Sin observaciones adicionales.**

---

### O-2: Cronograma escalonado vencido

**Estado: CERRADO** (se resuelve con P-2 — mismo re-baseline)

---

### C-2 / O-3: No hay lead form para LEAD_GENERATION

**Estado: PARCIALMENTE CERRADO**

Bruno define los campos del Instant Form (nombre empresa, tipo evento, cantidad personas, fecha, contacto). La especificación es concreta y accionable.

**No está ejecutado.** El owner tiene que crearlo en la UI de Ads Manager. Es prerequisito para activar C3 Corporativo (día 8 del re-baseline = 25/04). Hay tiempo si se hace antes de esa fecha.

**Para cerrar:** owner crea el form en UI y lo vincula al ad de C3.

---

### O-4: No hay ad sets de Engagement con destination=website

**Estado: CERRADO**

Bruno abandonó la idea de "Engagement con destination=website como reemplazo de Traffic". En su lugar, redistribuyó el presupuesto y definió 3 ad sets de Engagement con POST_ENGAGEMENT puro. Es una decisión más limpia — no fuerza un objetivo de engagement a hacer el trabajo de traffic.

El tráfico al sitio se genera indirectamente vía clicks en bio/captions de los posts orgánicos + links en ads de awareness. El Pixel captura visitas igual.

**Sin observaciones adicionales.**

---

## Evaluación de los 2 puntos adicionales

### Redistribución corregida (AWR 50% / ENG 25% / LEA 10% / Reserva 15%)

**Evaluación: APROBADA**

La redistribución es sólida:
- 50% Awareness para cuenta nueva es agresivo pero correcto — el objetivo es seguidores.
- 25% Engagement ($125K) con 3 ad sets definidos cierra numéricamente ($124.5K).
- 10% Leads ($50K) es suficiente para testear C3 Corporativo.
- 15% Reserva ($75K) es holgada sin ser excesiva.

La evolución semanal cuadra con los totales. Sin inconsistencias numéricas.

---

### Ciclo de vida de piezas (6 reglas)

**Evaluación: APROBADA CON UNA OBSERVACIÓN**

Las 6 reglas cubren el ciclo completo:
1. Evaluación 72h con criterios claros → correcto
2. Máximo 14 días por pieza del sprint → correcto
3. Incorporación de piezas nuevas con criterio (ER > 1%) → correcto
4. Máximo 3 ads por ad set → correcto
5. Rotación semanal con aprobación del owner → correcto
6. Reemplazo obligatorio antes de apagar por fatigue → correcto, cierra el gap de piece-01 darkpost

**Observación:** La regla 3 dice "máximo 2 piezas nuevas por semana". Con 30 piezas publicándose orgánicamente (1/día) y un criterio de ER > 1%, es probable que haya 3-5 candidatas por semana. El límite de 2 puede ser conservador. Sugiero que Bruno lo revise después de semana 1 con data real — si hay 4 piezas con ER > 2%, no tiene sentido descartarlas por un límite arbitrario. El límite real debería ser el budget disponible y el máximo de 3 ads por ad set (regla 4), no un número fijo.

No es bloqueante. Es una optimización para semana 2+.

---

## Gaps que siguen abiertos

### De los originales

| # | Gap | Estado | Qué falta |
|---|-----|--------|-----------|
| S-1 | Targeting inválido | **PARCIAL** | Ejecutar PATCH con IDs válidos |
| C-2 | Lead form C3 | **PARCIAL** | Owner crea en UI |
| P-3 | Tarjeta $700K | **ABIERTO** | Owner confirma |

### Medios que siguen abiertos (no bloqueantes para activar)

| # | Gap | Estado |
|---|-----|--------|
| S-2 | Exclusión followers | Bruno propuso acción. Falta ejecutar (UI + PATCH). No bloqueante sem 1. |
| S-3 | Exclusión cruzada | Diferida a semana 3+. Aceptable. |
| C-1 | Reel sin ad | Bruno definió campaña/audiencia/budget para el reel ad. Falta ejecutar. |
| V-1 | Eventos Pixel | No abordado por Bruno. Sigue abierto. |
| V-2 | UTMs en ads | No abordado por Bruno. Sigue abierto. |
| O-8 | Docs $250K no actualizados | Bruno propuso nota de "superseded". Falta ejecutar. |

### Gaps que se cerraron completamente

| # | Gap |
|---|-----|
| E-1/P-1 | Engagement sin estructura → redistribución aprobada |
| P-2/O-2 | Sprint/cronograma → re-baseline aprobado |
| O-4 | Engagement destination=website → abandonado correctamente |
| F-1 | Ad piece-03 en B1 → creado |

---

## Preguntas pendientes

Solo 2 preguntas que Bruno no puede responder (dependen del owner):

1. **¿La tarjeta soporta $700K de débito?** Prerequisito bloqueante.
2. **¿Eventos custom del Pixel (ViewContent, Contact, Lead) están activos en el sitio?** Bruno no lo abordó. Si no están, las Custom Audiences D1 se pueblan solo con PageView (menos granularidad para retargeting). No es bloqueante para arrancar pero afecta la calidad del retargeting en semana 2+.

---

## Veredicto

**APROBADO PARA EJECUCIÓN — con 3 condiciones previas a la activación.**

El plan corregido de Bruno es ejecutable. La redistribución es sólida, el ciclo de vida de piezas está definido, el re-baseline es concreto. Los gaps estratégicos están cerrados.

**Las 3 condiciones son técnicas/operativas, no estratégicas:**

1. **Patchear los 7 ad sets con interest IDs válidos** — es un PATCH vía API con IDs que ya se obtuvieron. Estimado: 30 minutos de trabajo técnico.

2. **Crear lead form C3 en UI** — el owner lo crea en Ads Manager con los campos que Bruno definió. Estimado: 10 minutos. Puede esperar hasta día 8 (25/04) si no se quiere hacer ahora.

3. **Confirmar límite de tarjeta** — el owner verifica con su banco. 1 llamada.

**Una vez que esas 3 se cumplan, el plan se puede activar empezando por los 4 ad sets de Awareness (A2, B1, B2, C1) el día que el owner autorice.**

---

*Paid Media Auditor — Team 4, ENBA*
*17 de abril de 2026 — segunda ronda*
