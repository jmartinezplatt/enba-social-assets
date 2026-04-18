# Respuesta a la Auditoría — Bruno

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 17 de abril de 2026
**En respuesta a:** auditoria-plan-pauta.md del Paid Media Auditor

---

## Reconocimiento general

El auditor tiene razón. El plan que entregué es estratégicamente sólido pero operativamente incompleto. Escribí un plan de presupuesto sin verificar que la estructura en Meta pudiera ejecutarlo. Eso es mi error — no del equipo técnico que intentó implementarlo.

Los 7 gaps críticos son reales. Paso a responder las 10 preguntas y proponer acciones correctivas. **No ejecuto nada — solo propongo.**

---

## Respuestas a las 10 preguntas del Auditor

### Pregunta 1: Targeting de intereses inválido (7/7 ad sets)

**Respuesta:** No, los 18 interest IDs del preflight nunca se validaron contra `targeting_option_list`. Los IDs que se usaron al crear los ad sets fueron de una primera búsqueda no validada — algunos resultaron ser IDs que no existen en Meta. Es mi responsabilidad: debí exigir que se validaran antes de crear los ad sets.

**Acción correctiva:**
1. Tomar los 18 IDs que sí aparecieron en la segunda búsqueda (`interest-ids-raw.json`)
2. Validar cada uno contra `GET /search?type=adinterestvalid` o `targeting_option_list`
3. Actualizar los 7 ad sets existentes vía PATCH con los IDs validados
4. Si algún ad set no puede ser patcheado, eliminarlo y recrearlo

**Dependencias:** Validación técnica de los 18 IDs contra API antes de patchear. Aprobación del owner para ejecutar los cambios.

---

### Pregunta 2: $210K de Engagement sin estructura

**Respuesta:** Me equivoqué en la distribución. Asigné 42% a Engagement ($210K) pero solo creé 1 ad set de Engagement (C2 Regalos, $1.500/día). El plan mencionaba "OUTCOME_ENGAGEMENT con destination=website como reemplazo de Traffic" pero nunca definí cuántos ad sets ni con qué audiencias.

La realidad es que para una cuenta nueva sin data, **el 42% en Engagement es demasiado**. El objetivo primario es seguidores, y REACH (Awareness) genera seguidores de forma más directa que POST_ENGAGEMENT.

**Acción correctiva — redistribuir el presupuesto:**

| Objetivo | Plan v2 (errado) | Propuesta corregida | Monto |
|----------|------------------|---------------------|-------|
| Awareness (REACH) | 35% | **50%** | $250.000 |
| Engagement (POST_ENGAGEMENT) | 42% | **20%** | $100.000 |
| Leads (LEAD_GEN) | 14% | **10%** | $50.000 |
| Reserva táctica | 9% | **20%** | $100.000 |
| **Total** | 100% | **100%** | **$500.000** |

Justificación:
- **Awareness sube a 50%** porque REACH con buenas creatividades es lo que genera seguidores en cuenta nueva. Es el objetivo del plan.
- **Engagement baja a 20%** — cubre C2 Regalos + reel como ad + piezas con buen engagement orgánico que vale la pena escalar.
- **Leads baja a 10%** — C3 Corporativo es experimental, ticket alto pero bajo volumen. $50K es suficiente para testear.
- **Reserva sube a 20%** — con $100K de reserva puedo escalar 2-3 winners sin romper nada. La reserva de 9% ($45K) era insuficiente para un presupuesto de $500K.

**Ad sets de Engagement a crear:**
- `ENBA_Engagement_Reel4horas` → audiencia A2+B1, $3.000/día, creative del reel
- `ENBA_Engagement_TopPerformers` → audiencia B1, $1.500/día, creative rotativo (la pieza orgánica con mejor ER de cada semana)
- C2 Regalos ya existe ($1.500/día)

Total Engagement: $3.000 + $1.500 + $1.500 = $6.000/día × 17 días (desde día 1 real) = $102K. Entra en $100K.

**Dependencias:** Aprobación del owner para la redistribución. Validación técnica de que los ad sets se pueden crear con targeting funcional.

---

### Pregunta 3: Lead form para C3

**Respuesta:** No existe. Es mi error — LEAD_GENERATION requiere un Instant Form vinculado y no lo mencioné en el plan. Sin lead form, el ad set C3 no puede capturar datos.

**Acción correctiva:** Crear un Instant Form en Ads Manager (UI) con estos campos:
- Nombre de empresa (texto libre)
- Tipo de evento (opciones: Team Building, Despedida, Aniversario, Otro)
- Cantidad aproximada de personas (opciones: 5-10, 10-20, 20+)
- Fecha tentativa (texto libre)
- Nombre de contacto (auto-fill Meta)
- Email (auto-fill Meta)
- Teléfono (auto-fill Meta)

Mensaje de agradecimiento: "Gracias por tu consulta. Te contactamos en menos de 24h. Espacio Náutico Buenos Aires."

**Dependencias:** Lo crea el owner en la UI de Ads Manager. Después se vincula al ad de C3.

---

### Pregunta 4: Sprint semana 1: $0 de $100K

**Respuesta:** El sprint no se ejecutó porque los ads no se activaron. El cronograma basado en el 15/04 como "día 1" ya no existe.

**Acción correctiva — re-baseline completo:**

El "día 1" es el primer día en que los ads se activen realmente. Propongo que sea el **18/04** si se resuelven los gaps críticos hoy.

Nuevo cronograma:

| Semana | Fechas | Budget | Foco |
|--------|--------|--------|------|
| 1 | 18-24 abr (7 días) | $100.000 | Awareness intensivo + arranque Engagement |
| 2 | 25 abr - 1 may (7 días) | $140.000 | Reel + escalar winners |
| 3 | 2-8 may (7 días) | $160.000 | Escalar + retargeting + Leads |
| 4 | 9-14 may (6 días) | $100.000 | Consolidar + cierre |
| **Total** | **27 días** | **$500.000** | |

La curva sigue siendo 20/28/32/20 pero en 27 días en vez de 30. El presupuesto diario promedio sube de $16.666 a $18.518 — manejable.

**Activación escalonada re-basada:**

| Día real | Fecha | Activar |
|----------|-------|---------|
| 1 | 18/04 | A2, B1, B2, C1 (Awareness) |
| 3 | 20/04 | A3 (Awareness) |
| 5 | 22/04 | C2 Regalos (Engagement) + reel ad (Engagement) |
| 8 | 25/04 | C3 Corporativo (Leads) — solo si lead form existe |
| 10 | 27/04 | LAL IG Engagers si D2 > 100 |
| 14 | 1/05 | Retargeting Web Visitors si D1 > 100 |

**Dependencias:** Los gaps críticos 1 (targeting), 2 (estructura Engagement) y 3 (lead form) deben estar resueltos antes de activar.

---

### Pregunta 5: Carrusel cuanto-sale ($20K el 18/04)

**Respuesta:** Me equivoqué al incluirlo en el plan sin verificar si había infraestructura técnica. Los carruseles como ads de Meta requieren creative con child_attachments que el pipeline actual no soporta.

**Acción correctiva:** El carrusel NO se pauta el 18/04. Los $20K se reasignan a los ad sets de Awareness existentes (repartidos proporcionalmente entre A2, B1, B2, C1).

El carrusel se difiere hasta que:
1. Haya script para crear carousel ad creatives vía API
2. O se cree manualmente en Ads Manager (posible pero laborioso)

**Dependencias:** Ninguna — solo se reasigna el presupuesto.

---

### Pregunta 6: Reel como ad

**Respuesta:** Debí definir esto concretamente en el plan. Es la pieza más fuerte (8.5/10 Marina) y la dejé como "se puede crear cuando se publique" sin decir cómo.

**Acción correctiva:**

| Parámetro | Valor |
|-----------|-------|
| Campaña | ENBA_Engagement_abr2026 |
| Ad Set nuevo | `ENBA_Engagement_Reel4horas` |
| Audiencia | A2 Interés Navegación + B1 Experiencias BA (combinadas) |
| Optimization | POST_ENGAGEMENT |
| Budget | $3.000/día |
| Creative | `existing_post_id` del reel publicado (IG: `18585972517007777`) |
| Activación | Día 5 del re-baseline (22/04) |

El reel como ad de Engagement tiene mejor retención que estáticos → más video views → más follows → más volumen para Custom Audience D4 Video Viewers.

**Dependencias:** Crear el ad set y ad vía API. Validar que el `existing_post_id` funcione para ads de Engagement.

---

### Pregunta 7: Límite de tarjeta $700K

**Respuesta:** No puedo confirmar esto — es información del owner. Es un prerequisito bloqueante: sin tarjeta con límite suficiente, no se puede activar nada.

**Acción correctiva:** Preguntar al owner antes de activar.

**Dependencias:** Respuesta del owner.

---

### Pregunta 8: Documentos previos ($250K) no actualizados

**Respuesta:** Correcto, no los actualicé. Los documentos de $250K (diagnostico-inicial.md, audiencias-ampliadas.md) tienen tablas con montos que ya no aplican.

**Acción correctiva:** No reescribirlos — eso genera más confusión. Agregar una nota al inicio de cada uno:

> ⚠️ Este documento fue escrito con presupuesto $250K. El presupuesto vigente es $500K (ver presupuesto-v2-500k.md). Las proporciones aplican, los montos absolutos no.

**Dependencias:** Ninguna — es una edición de texto.

---

### Pregunta 9: Exclusión de followers

**Respuesta:** No está operativa. Las Custom Audiences de exclusión fallaron vía API. Las 3 creadas en UI (D1, D2, D3) son para retargeting, no para exclusión. Nadie creó las audiences de exclusión.

**Acción correctiva:** Crear en UI de Ads Manager:
- `ENBA_Exclusion_FBPageLikers` → Fuente: Página de Facebook, Evento: "Personas que les gusta tu página actualmente", Retención: sin límite
- `ENBA_Exclusion_IGEngaged365` → Fuente: Cuenta de Instagram, Evento: "Cualquier persona que interactuó", Retención: 365 días (proxy para followers — no hay evento directo de "follow")

Después, actualizar todos los ad sets agregando ambas en `excluded_custom_audiences`.

**Impacto si no se hace:** En cuenta nueva con pocos seguidores el leak es mínimo. Pero a medida que la cuenta crezca, la pauta va a gastar en gente que ya nos sigue. Prioridad: MEDIO — hacerlo antes de semana 2.

**Dependencias:** Owner crea las audiences en UI. Después se patchean los ad sets vía API.

---

### Pregunta 10: Exclusión cruzada entre audiencias

**Respuesta:** No está implementada. Las reglas que documenté en audiencias-ampliadas.md (A1 excluida de A2/A3, B1 excluye A1, etc.) dependen de que A1 exista como Custom Audience. A1 nunca se creó.

**Acción correctiva para ahora:** Diferir. La exclusión cruzada basada en A1 no es viable porque A1 no existe como audiencia en Meta. Se activará cuando:
1. Haya suficiente engagement para crear A1 como Custom Audience (prob. semana 3+)
2. Se creen Lookalikes desde A1

**Impacto si no se hace:** Los 5 ad sets de Awareness compiten internamente y hay overlap. Meta lo maneja con su propio algoritmo (asigna delivery al mejor predictor). No es ideal pero no es bloqueante.

**Dependencias:** Tiempo + volumen de engagement para crear A1.

---

## Resumen de acciones correctivas propuestas

### ANTES de activar (bloqueantes)

| # | Acción | Quién ejecuta | Aprobación |
|---|--------|---------------|------------|
| 1 | Validar 18 interest IDs y patchear 7 ad sets | Técnico (API) | Owner + Bruno |
| 2 | Redistribuir presupuesto (AWR 50%, ENG 20%, LEA 10%, Reserva 20%) | Bruno propone → owner aprueba | Owner |
| 3 | Crear 2 ad sets de Engagement (reel + top performers) | Técnico (API) | Owner + Bruno |
| 4 | Crear lead form C3 en UI | Owner (Ads Manager) | Owner |
| 5 | Re-baseline cronograma desde día 1 real (18/04 propuesto) | Bruno | Owner |
| 6 | Confirmar límite tarjeta $700K | Owner | Owner |

### ANTES de semana 2 (importantes no bloqueantes)

| # | Acción | Quién |
|---|--------|-------|
| 7 | Crear 2 Custom Audiences de exclusión en UI | Owner |
| 8 | Actualizar ad sets con exclusión de followers | Técnico (API) |
| 9 | Crear D4 Video Viewers (reel ya publicado) | Owner (UI) |
| 10 | Reasignar $20K del carrusel a Awareness | Bruno actualiza plan |

### DIFERIDAS (semana 3+)

| # | Acción |
|---|--------|
| 11 | Crear A1 Náutica Activa como Custom Audience cuando haya volumen |
| 12 | Implementar exclusión cruzada cuando A1 exista |
| 13 | Crear Lookalikes cuando sources > 100 personas |
| 14 | Pautar carruseles cuando haya infraestructura técnica |
| 15 | Agregar notas de "superseded" a documentos de $250K |

---

## Autocrítica

Tres errores míos que no repito:

1. **Escribí un plan de presupuesto sin verificar que la estructura en Meta lo pudiera ejecutar.** Debí validar targeting, lead forms y capacidad técnica antes de entregar el plan como "ejecutable".

2. **Asigné 42% a Engagement sin definir la estructura.** Es como asignar plata a una cuenta que no existe. Debí detallar cuántos ad sets, con qué audiencias y con qué piezas.

3. **No re-baseé el cronograma cuando las fechas se corrieron.** El sprint de 3 días con fechas fijas era frágil. Debí diseñar el plan con "día 1, día 2, día 3" relativos, no con fechas absolutas.

---

## Punto adicional 1: Redistribución corregida (Reserva 15%)

El owner tiene razón — 20% de reserva es plata parada. Acepto la corrección. Recalculo:

| Objetivo | Propuesta anterior | Propuesta corregida | Monto |
|----------|-------------------|---------------------|-------|
| Awareness (REACH) | 50% | **50%** | $250.000 |
| Engagement (POST_ENGAGEMENT) | 20% | **25%** | $125.000 |
| Leads (LEAD_GEN) | 10% | **10%** | $50.000 |
| Reserva táctica | 20% | **15%** | $75.000 |
| **Total** | 100% | **100%** | **$500.000** |

Qué cambia:
- Engagement sube de $100K a $125K. Eso me da margen para un tercer ad set de Engagement o para escalar el reel ad a $4.000-$5.000/día si performa bien.
- Reserva baja de $100K a $75K. Sigue siendo holgada — alcanza para 2 triple scales simultáneos ($75K / 2 = $37.5K cada uno, suficiente para 7-10 días de un ad set escalado).

Distribución de Engagement ($125K):

| Ad Set | Budget/día | Días estimados | Total |
|--------|-----------|----------------|-------|
| Reel "4 horas" (nuevo) | $3.000 | 22 (desde día 5) | $66.000 |
| Top Performers (nuevo) | $1.500 | 17 (desde día 10) | $25.500 |
| C2 Regalos (existente) | $1.500 | 22 (desde día 5) | $33.000 |
| **Total** | | | **$124.500** |

Entra en $125K con $500 de margen.

Evolución semanal corregida:

| Objetivo | Sem 1 | Sem 2 | Sem 3 | Sem 4 | Total |
|----------|-------|-------|-------|-------|-------|
| Awareness | $70K | $70K | $60K | $50K | $250K |
| Engagement | $15K | $35K | $40K | $35K | $125K |
| Leads | $0 | $10K | $20K | $20K | $50K |
| Reserva | $15K | $25K | $40K | -$5K | $75K* |
| **Total** | **$100K** | **$140K** | **$160K** | **$100K** | **$500K** |

*Reserva se consume progresivamente. Si llega a 0 antes de semana 4, no se gasta más de lo asignado por semana.

---

## Punto adicional 2: Ciclo de vida de las piezas en pauta

Error mío: no lo definí. Acá van las reglas operativas.

### Regla 1: Evaluación obligatoria a las 72h

Toda pieza que entra en pauta se evalúa a las 72h de corrida con estos criterios:

| Resultado | Acción |
|-----------|--------|
| CPS < $30 + ER > 3% | **WINNER** — sigue corriendo, candidata a escalado |
| CPS $30-$100 + ER > 1% | **VIABLE** — sigue corriendo sin cambios |
| CPS > $100 o ER < 1% o CTR < 0.4% | **CORTAR** — se apaga el ad |
| Frecuencia > 3.5 | **FATIGUE** — se apaga independientemente de otros KPIs |

### Regla 2: Las piezas del sprint NO corren indefinidamente

Las piezas del sprint (piece-01 darkpost, piece-02, piece-03) tienen un ciclo de vida máximo de **14 días** en pauta:

| Período | Qué pasa |
|---------|----------|
| Día 1-3 | Sprint. Corren todas. |
| Día 3 (72h) | Primera evaluación. Se apagan las que cumplan criterio de corte. |
| Día 7 | Segunda evaluación. Winners se mantienen, viables se reevalúan. |
| Día 14 | **Corte máximo.** Toda pieza del sprint se apaga, sin importar performance. Razón: creative fatigue — después de 14 días la misma imagen pierde impacto en la misma audiencia. |

Excepción: si a los 14 días una pieza tiene CPS < $20 y frecuencia < 2, se puede extender 7 días más (hasta día 21 máximo). Requiere aprobación mía.

### Regla 3: Incorporación de piezas nuevas

A medida que n8n publica piezas orgánicas (1/día), las que tengan buen engagement orgánico (ER > 1% en primeras 24h) se convierten en candidatas a pauta.

Proceso:
1. Al día siguiente de publicación, verificar ER orgánico
2. Si ER > 1%: crear ad con `existing_post_id` en el ad set más relevante (según vertical de la pieza)
3. Si ER < 1%: no pautar, dejar solo orgánica
4. Máximo 2 piezas nuevas por semana para no dispersar budget

### Regla 4: Convivencia de piezas dentro de un ad set

Un ad set puede tener **máximo 3 ads activos simultáneamente**. Meta rota automáticamente y asigna delivery al que predice mejor CTR.

| Situación | Acción |
|-----------|--------|
| Ad set con 1 ad | OK — corre solo |
| Ad set con 2 ads | OK — Meta hace A/B test natural |
| Ad set con 3 ads | OK — Meta rota entre los 3 |
| Ad set con 4+ ads | **NO** — se apaga el ad con peor CPS de los 4 |

Cuando una pieza nueva entra a un ad set que ya tiene 3 ads, se apaga la pieza con peor CPS.

### Regla 5: Rotación semanal

Cada lunes (o primer día de cada semana del plan):
1. Revisar todos los ads activos
2. Apagar los que cumplan criterio de corte o fatigue
3. Incorporar 1-2 piezas nuevas de las que cumplan criterio de incorporación (regla 3)
4. Actualizar `meta-ids.json` con el estado de cada ad

Responsable de la rotación: Bruno (propone) + owner (aprueba antes de ejecutar).

### Regla 6: Reemplazo obligatorio antes de apagar por fatigue

Ninguna pieza se apaga por fatigue (regla 2, día 14) si el ad set queda sin creative activo. Antes de apagar, tiene que haber reemplazo confirmado.

Protocolo:

| Día | Acción |
|-----|--------|
| Día 10 | **Alerta de fatigue inminente.** Bruno evalúa qué piezas llegan a día 14 en los próximos 4 días y verifica si hay reemplazo disponible. |
| Día 10-12 | **Producir reemplazo si no hay.** Tres opciones en orden de prioridad: |
| | 1. **Existing post con buen ER orgánico** (regla 3) → se crea ad con `existing_post_id`. Costo: cero producción, 5 minutos de API. |
| | 2. **Nuevo darkpost** con pieza visual distinta → Dani produce PNG con el renderer del frente 10K (`darkpost-render/`), Sole escribe caption de conversión. Costo: 1-2 horas de producción. |
| | 3. **Variante de la misma pieza** (mismo asset, distinto crop/headline/overlay) → Dani ajusta config JSON y re-renderiza. Costo: 30 minutos. Efecto: resetea fatigue porque Meta lo ve como creative nuevo. |
| Día 13 | **Reemplazo listo y aprobado.** El nuevo ad se crea en PAUSED dentro del ad set. |
| Día 14 | **Swap.** Se activa el reemplazo y se apaga la pieza fatigada en el mismo momento. El ad set nunca queda sin creative. |

**Caso específico piece-01 darkpost (A2 + B1):**

Piece-01 darkpost es la única pieza propia del frente 10K. Su reemplazo a día 14 debería ser:
- **Prioridad 1:** Si el reel "4 horas en el río" rinde bien en Engagement (CPS < $50), crear un ad del reel en A2 y B1 como reemplazo de awareness. Cambia el formato (video vs estático) lo cual resetea fatigue.
- **Prioridad 2:** Producir piece-01 variante B (mismo asset, distinto headline/crop — por ejemplo centrar más en el skyline, cambiar "El río te llama" por otro ángulo del brief de Franco). 30 minutos de producción.
- **Prioridad 3:** Si hay existing posts del lanzamiento con ER > 2% orgánico, usarlos como reemplazo en A2/B1.

**Regla dura:** si al día 13 no hay reemplazo listo, la pieza fatigada se extiende 3 días más (hasta día 17) pero se baja su budget un 50% para reducir frecuencia. No se extiende más allá de día 17 bajo ninguna circunstancia — a esa altura la frecuencia ya daña la percepción de marca.

---

*Bruno — Social Growth & Performance Director*
*17 de abril de 2026 — actualización regla 6*
