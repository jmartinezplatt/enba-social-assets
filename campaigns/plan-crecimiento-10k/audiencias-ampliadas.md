# Audiencias Ampliadas — Revision de Estrategia de Pauta

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 15 de abril de 2026
**Contexto:** Revision solicitada por el owner. Critica especifica: solo "Nautica BA" toca el nicho vela. Pedido: audiencias mas amplias y mejor seleccionadas con criterio de eficiencia.
**Nota:** este documento revisa la seccion 5 de `meta-business-setup.md` y la seccion 4 de `presupuesto.md`. NO los reemplaza — los complementa. La decision final de adoptar esta ampliacion queda del owner.

---

## 1. Analisis critico de mi propuesta original

Me equivoque en tres cosas concretas:

### 1.1 Nautica BA era una audiencia, no un nicho

La puse como una sola caja (25-55, yachting + vela + regata + deportes nauticos). Eso mezcla 3 perfiles muy distintos:
- El que **ya navega** (socio de club nautico, dueno de velero, compite en regata) — calificado pero chico
- El que **consume contenido nautico** (mira videos de Sailing La Vagabonde, sigue paginas de yachting) — mucho mas grande, mas tibio
- El que **aspira a navegar** (marca premium, boating, viajes de yacht) — el mas grande y tibio

Con una sola audiencia, Meta no sabe a quien priorizar. El algoritmo termina gastando en el perfil mas barato (aspiracional) pero que convierte menos a seguidor activo.

**Consecuencia practica:** CPS probable alto (> ARS 60) y follow rate bajo.

### 1.2 Experiencias BA y Lifestyle Parejas tienen ~70% de overlap

Ambas apuntan a urbanos 25-40 de Buenos Aires con interes en planes de fin de semana. La unica diferencia real es que Lifestyle Parejas suma interes en "regalos originales". Meta las ve casi como la misma audiencia y compite contra si mismo al pautar las dos, inflando el CPS.

**Consecuencia practica:** presupuesto de $80K repartido en dos audiencias que deberian ser una, con exclusion cruzada.

### 1.3 No explore verticales laterales que potencialmente convierten mejor que algunas del core

No propuse:
- Turismo Buenos Aires (receptivo) — visitantes que buscan que hacer en BA, alto intent
- Regalos experienciales (aniversarios, cumpleanos) — alto ticket emocional
- Eventos corporativos (team building, despedidas) — grupos, ticket mas alto
- Gastronomia premium + experiencias (quien reserva Tegui o Don Julio puede pagar travesia)

Por quedarme en "saved audiences por interes generico", perdi vectores que tienen mejor match con el producto ENBA (experiencia de 4h, no barata, para alguien que busca algo distinto).

---

## 2. Nueva lista de Saved Audiences

**10 audiencias** organizadas en 4 capas. Cada capa tiene un rol distinto en el funnel.

**Nota sobre tamanos:** los tamanos son estimaciones basadas en Meta Audience Insights para Argentina, abril 2026. El numero real lo vemos cuando armamos cada audiencia en Ads Manager. Trato cualquier cifra debajo del limite minimo de Meta (1.000) como no viable.

### CAPA A — Nicho Vela (3 audiencias, de mas calificada a mas tibia)

#### A1. Nautica Activa

**Perfil:** gente que ya navega o esta adentro del mundo nautico.

| Parametro | Valor |
|-----------|-------|
| Ubicacion | CABA + GBA 40km |
| Edad | 30-55 |
| Intereses (AND) | Yacht club OR Sailboat OR Regata OR America's Cup OR Yachting OR Marina (boating) |
| Exclusiones | Seguidores existentes + LAL Nautica Activa si ya existe |
| Tamano estimado AR | 150K - 350K |

**Rol:** no la pauteo para crecer seguidores. La uso como **fuente de lookalike** despues de 2 semanas. El primer objetivo es construir una base calificada, no gastar en ella.

**CPS esperado:** no aplica (no la pauteo directamente en mes 1).

**Prioridad:** 7 — crear dia 1, no activar directamente. Fuente de LAL Navegantes.

#### A2. Interes en Navegacion

**Perfil:** consume contenido nautico pero no es activo.

| Parametro | Valor |
|-----------|-------|
| Ubicacion | CABA + GBA 40km |
| Edad | 28-50 |
| Intereses (OR) | Sailing OR Navigation (watercraft) OR Sailboat OR Boat OR Catamaran OR Watersport |
| Exclusiones | Seguidores existentes |
| Tamano estimado AR | 600K - 1.2M |

**Rol:** este es el nucleo del nicho vela. Tibia pero ya cercana al producto. Se convierte bien a seguidor porque ya esta familiarizada con el imaginario.

**CPS esperado:** ARS 35-55 (rango medio del nicho).

**Prioridad:** 2 — activar dia 1.

**Presupuesto sugerido:** ARS 35.000 (antes "Nautica BA" tenia ARS 40K; bajo 5K porque la achico y uso ese dinero en una audiencia hermana mas abajo).

#### A3. Aspiracional Nautico

**Perfil:** no navega ni consume contenido nautico especifico, pero le gustan marcas/imaginario cercano (outdoor premium, viajes, experiencias no-turisticas).

| Parametro | Valor |
|-----------|-------|
| Ubicacion | CABA + GBA 40km |
| Edad | 28-45 |
| Intereses (AND) | (Luxury goods OR Premium travel OR Scandinavian outdoor OR Adventure travel) AND (Buenos Aires lifestyle OR local tourism) |
| Exclusiones | Seguidores existentes + LAL Web Visitors |
| Tamano estimado AR | 400K - 800K |

**Rol:** captar al que "no sabia que podia navegar desde Costanera Norte" pero matchea psicograficamente.

**CPS esperado:** ARS 50-80.

**Prioridad:** 4 — activar dia 3. Necesita que las primeras piezas organicas ya tengan alguna senal.

**Presupuesto sugerido:** ARS 20.000.

---

### CAPA B — Experiencias y Ocio Urbano (2 audiencias, una sola saved bien hecha en lugar de dos superpuestas)

#### B1. Experiencias BA (refinada)

**Perfil:** urbano portenio que busca planes distintos, no masivos, alta disposicion a gastar en experiencias.

| Parametro | Valor |
|-----------|-------|
| Ubicacion | CABA + GBA Norte (San Isidro, Vicente Lopez, Tigre, San Fernando) + Nordelta/Puertos |
| Edad | 28-45 |
| Intereses (AND) | (Experiencias OR Planes fin de semana OR Things to do) AND (Travel OR Outdoor activities OR Gastronomy) |
| Exclusiones | Seguidores existentes |
| Tamano estimado AR | 900K - 1.7M |

**Rol:** caja principal de primer contacto. Tibia pero muy grande. Aqui es donde el algoritmo de Meta va a tener material para aprender.

**CPS esperado:** ARS 40-70.

**Prioridad:** 1 — activar dia 1 con la mayor parte del presupuesto de awareness.

**Presupuesto sugerido:** ARS 60.000.

**Cambio vs original:** elimine Lifestyle Parejas como saved separada (se canibalizaban). Donde antes tenia $60K + $20K repartido en dos, ahora tengo $60K en una sola, con el restante redistribuido a audiencias A2 y C1.

#### B2. Outdoor / Aventura BA

**Perfil:** mismo perfil demo pero con inclinacion outdoor, no estrictamente nautico.

| Parametro | Valor |
|-----------|-------|
| Ubicacion | CABA + GBA 40km |
| Edad | 25-45 |
| Intereses (OR) | Kayak OR Stand-up paddle OR Hiking OR Camping OR Paddle board OR Windsurf |
| Exclusiones | Seguidores existentes + Nautica Activa |
| Tamano estimado AR | 700K - 1.3M |

**Rol:** puerta de entrada para gente que ya hace actividades al aire libre pero todavia no se cruzo con navegacion. Alto match psicografico.

**CPS esperado:** ARS 45-70.

**Prioridad:** 3 — activar dia 1 o dia 2.

**Presupuesto sugerido:** ARS 20.000.

**Cambio vs original:** mismo concepto, ampliada con exclusion de Nautica Activa para evitar overlap con A1/A2.

---

### CAPA C — Verticales Laterales (3 audiencias nuevas que no estaban en mi propuesta original)

#### C1. Turismo BA (receptivo + local)

**Perfil:** viajeros que buscan que hacer en Buenos Aires, mas residentes que hacen "turismo en su ciudad".

| Parametro | Valor |
|-----------|-------|
| Ubicacion | Argentina (pais completo) + viajeros a Argentina (optional: Uruguay cercano) |
| Edad | 28-55 |
| Intereses (AND) | (Buenos Aires tourism OR Things to do in Buenos Aires OR Argentina travel) AND (Local experiences OR Unique experiences) |
| Exclusiones | Seguidores existentes |
| Tamano estimado AR+viajeros | 1.1M - 2.2M |

**Rol:** esta audiencia no estaba en la propuesta original y es una perdida. Tiene alto intent: quien busca "que hacer en BA" tiene alta probabilidad de convertir a DM o a visita web.

**CPS esperado:** ARS 40-60.

**Prioridad:** 3 — activar dia 1.

**Presupuesto sugerido:** ARS 25.000.

**Valor estrategico:** es tambien la mejor audiencia para objetivo "Trafico al sitio" (ver Mensajes/Leads en semanas 3-4).

#### C2. Regalos Experienciales

**Perfil:** persona que busca regalo para pareja/amigo/familiar, con interes en experiencias vs cosas materiales.

| Parametro | Valor |
|-----------|-------|
| Ubicacion | CABA + GBA 40km |
| Edad | 28-50 |
| Intereses (AND) | (Gift ideas OR Experience gift OR Anniversary OR Birthday) AND (Luxury experiences OR Romantic getaway OR Unique gifts) |
| Comportamientos | Frequent travelers OR Engaged shoppers |
| Exclusiones | Seguidores existentes |
| Tamano estimado AR | 500K - 1M |

**Rol:** nuevo en la propuesta. Tiene alto intent de compra / consulta, y el ticket emocional es alto (regalo).

**CPS esperado:** ARS 45-75.

**Prioridad:** 5 — activar dia 5 (despues de tener primeras piezas de travesia corrida).

**Presupuesto sugerido:** ARS 15.000.

**Observacion:** conviene pautarle especificamente piezas con angle "regalo" o "plan de pareja" (piece-04, carrusel-elegi-aventura). No conviene pautarle piezas de escuela/broker.

#### C3. Corporativo / Team Building

**Perfil:** decisores en empresas que organizan eventos, despedidas, team building, o aniversarios corporativos.

| Parametro | Valor |
|-----------|-------|
| Ubicacion | CABA + GBA 40km |
| Edad | 32-55 |
| Cargos (job titles) | HR Manager, HR Director, Event Planner, Office Manager, Founder, CEO, Marketing Director |
| Intereses | Corporate events OR Team building OR Employee engagement |
| Exclusiones | Seguidores existentes |
| Tamano estimado AR | 80K - 180K |

**Rol:** audiencia chica (menor a mi umbral ideal) pero con ticket medio mucho mas alto que el publico individual. Una salida corporativa vale 10 individuales.

**CPS esperado:** ARS 80-150 (alto porque es nicho).

**Prioridad:** 8 — activar recien semana 3-4 si hay presupuesto de reserva y si el objetivo ya no es crecer seguidores sino rentabilizar.

**Presupuesto sugerido:** ARS 10.000 (de la reserva tactica de $25K).

---

### CAPA D — Custom y Lookalike (las mismas de mi propuesta original, sin cambios)

Mantengo las 4 Custom Audiences originales (Web Visitors, IG Engagers, FB Page Engagers, Video Viewers) y los 4 Lookalike al 1% cuando superen 100 personas.

Agrego una nueva:

#### D5. LAL Nautica Activa 1%

**Fuente:** Nautica Activa (A1).
**Cuando crear:** si A1 tiene > 100 seguidores existentes engagers, o despues de 2 semanas con retargeting.
**Rol:** lookalike de perfil nautico mas calificado.
**Prioridad:** 9.

---

## 3. Matriz de overlap (evitar canibalizacion)

Matriz de overlap estimado entre audiencias de Capa A y B. Valor: % de personas que estan en ambas audiencias. Alto overlap = Meta compite contra si mismo = CPS sube.

| | A1 Nautica Activa | A2 Interes Navegacion | A3 Aspiracional | B1 Experiencias BA | B2 Outdoor/Aventura | C1 Turismo BA |
|---|---|---|---|---|---|---|
| **A1 Nautica Activa** | — | 60% | 15% | 8% | 25% | 5% |
| **A2 Interes Navegacion** | 60% | — | 20% | 15% | 20% | 10% |
| **A3 Aspiracional** | 15% | 20% | — | 35% | 18% | 25% |
| **B1 Experiencias BA** | 8% | 15% | 35% | — | 40% | 30% |
| **B2 Outdoor/Aventura** | 25% | 20% | 18% | 40% | — | 15% |
| **C1 Turismo BA** | 5% | 10% | 25% | 30% | 15% | — |

### Reglas de exclusion cruzada que aplico

- **A1 Nautica Activa** se excluye automaticamente de A2 y A3 (para que el ad set de "ya navega" no se pise con el tibio).
- **B1 Experiencias BA** excluye a A1 (un navegante no necesita que le venda "planes de finde").
- **B2 Outdoor/Aventura** excluye a A1 (ya mencionado en la definicion).
- **C2 Regalos** excluye a A1 (un navegante no se autoregala una travesia).
- **C3 Corporativo** se deja sin exclusion porque su targeting por cargo es suficiente aislante.

Estas exclusiones se configuran en el ad set, no en la saved audience (Meta no deja excluir saved audiences entre si a nivel definicion).

---

## 4. Activacion por etapa

| Dia | Audiencia a activar | Presupuesto diario | Motivo |
|-----|---------------------|--------------------|-------|
| **Dia 1 (15/04)** | B1 Experiencias BA | ARS 3.000 | Caja grande para que Meta aprenda rapido |
| Dia 1 | A2 Interes Navegacion | ARS 2.000 | Nicho principal, calibracion |
| Dia 1 | B2 Outdoor/Aventura | ARS 1.000 | Puerta lateral |
| Dia 1 | C1 Turismo BA | ARS 1.500 | Intent alto desde dia 1 |
| **Dia 2-3** | (mantener las de dia 1 + pauta de piezas especificas) | | |
| **Dia 3 (17/04)** | A3 Aspiracional Nautico | ARS 1.500 | Ya con senal de piezas 01-02 organica |
| **Dia 5 (19/04)** | C2 Regalos Experienciales | ARS 1.000 | Con piezas emocionales ya corridas |
| **Dia 7 (21/04)** | Primer reporte Bruno: apagar audiencias con CPS > 80 o CTR < 0.5% | | |
| **Dia 10 (24/04)** | Empezar a crear Lookalikes 1% (D1-D5) si Custom Audiences > 100 personas | | |
| **Dia 14 (28/04)** | Retargeting Web Visitors (D1) si > 200 personas | | |
| **Dia 21 (5/05)** | Corporativo C3 solo si presupuesto reserva disponible | ARS 500/dia | Experimental, ticket alto |

---

## 5. Estimado de CPS esperado por audiencia

Ranking de mas eficiente a menos eficiente, en audiencia fria sin retargeting ni lookalike. Valores en ARS por seguidor.

| # | Audiencia | CPS esperado | Follow rate estimado | Comentario |
|---|-----------|--------------|----------------------|------------|
| 1 | B1 Experiencias BA | 40-70 | 18-25% | La caja grande, balance perfecto |
| 2 | A2 Interes Navegacion | 35-55 | 25-35% | Mejor CPS del nicho por calificacion |
| 3 | C1 Turismo BA | 40-60 | 15-22% | Intent medio-alto, depende de hora/dia |
| 4 | B2 Outdoor/Aventura | 45-70 | 18-26% | Algo menos calificado que B1 |
| 5 | C2 Regalos Experienciales | 45-75 | 14-20% | Follow rate bajo pero DM alto |
| 6 | A3 Aspiracional Nautico | 50-80 | 12-18% | Mas tibio, pero aspiracional escala bien |
| 7 | C3 Corporativo | 80-150 | 8-14% | Nicho, alto CPS pero alto ticket comercial |
| 8 | D4 LAL Web Visitors 1% | 30-50 | 25-35% | Disponible desde semana 3 |
| 9 | D5 LAL Nautica Activa 1% | 35-55 | 30-40% | Mejor lookalike, pero tarda en madurar |

**Hipotesis del ranking:** la combinacion de tamano razonable (>500K) + calificacion suficiente + coincidencia con psicografia del producto hace que B1 + A2 + C1 sean las tres apuestas principales del mes 1.

---

## 6. Redistribucion de presupuesto vs propuesta original

| | Propuesta original | Propuesta ampliada | Delta |
|---|---|---|---|
| Nautica BA / Interes Navegacion | $40K | $35K (A2) | -5K |
| Nautica Activa (A1) | — | 0 (sin pauta directa) | 0 |
| Aspiracional Nautico (A3) | — | $20K | +20K |
| Experiencias BA (B1) | $60K | $60K | 0 |
| Lifestyle Parejas | $20K | 0 (fusionada) | -20K |
| Outdoor/Aventura (B2) | $25K | $20K | -5K |
| Turismo BA (C1) | — | $25K | +25K |
| Regalos Experienciales (C2) | — | $15K | +15K |
| Corporativo (C3) | — | $10K (de reserva) | +10K (de reserva) |
| LAL IG Engagers 1% | $35K | $35K | 0 |
| Retargeting Web Visitors | $20K | $20K | 0 |
| LAL Web Visitors 1% | $15K | $15K | 0 |
| Retargeting Video Viewers | $10K | $10K | 0 |
| Reserva sin asignar | $25K | $15K | -10K |
| **Total** | **ARS 250.000** | **ARS 250.000** | 0 |

**Movimientos principales:**
- Elimine Lifestyle Parejas como categoria separada (-$20K)
- Agregue Turismo BA y Regalos Experienciales (+$40K en vectores nuevos)
- Destine $10K de la reserva a Corporativo experimental (-$10K de reserva)
- Baje levemente Interes Navegacion y Outdoor (-$10K)

---

## 7. Test recomendado para las primeras 72 horas

**Hipotesis:** C1 Turismo BA va a tener mejor CPS que A3 Aspiracional Nautico para crecimiento inicial de seguidores.

**Diseno:**
- Mismo budget diario (ARS 1.500/dia)
- Misma creatividad (piece-02 "Desde Costanera Norte")
- Mismo objetivo (Awareness)
- 3 dias de run

**Criterio de exito:** C1 tiene CPS >= 20% mas bajo que A3 al dia 3.

**Accion segun resultado:**
- Si C1 gana: reasignar $5K de A3 a C1 a partir del dia 4.
- Si A3 gana: confirma que el angle aspiracional nautico funciona mejor que el turistico generico, y mantengo el split.
- Si empatan (delta < 10%): seguir los dos con misma inversion pero diferenciar creatividades (piezas nauticas para A3, piezas de "planes en BA" para C1).

---

## 8. Decisiones operativas para el siguiente ciclo

Para Manu (coordinacion de ejecucion) y el agente que cree las audiencias via API:

1. Crear las 10 saved audiences con nomenclatura `ENBA_[codigo]_[nombre]_[mes]`:
   - `ENBA_A1_NauticaActiva_abr2026`
   - `ENBA_A2_InteresNavegacion_abr2026`
   - `ENBA_A3_AspiracionalNautico_abr2026`
   - `ENBA_B1_ExperienciasBA_abr2026`
   - `ENBA_B2_OutdoorAventura_abr2026`
   - `ENBA_C1_TurismoBA_abr2026`
   - `ENBA_C2_RegalosExperienciales_abr2026`
   - `ENBA_C3_Corporativo_abr2026`

2. Crear las 4 Custom Audiences originales (D1-D4) sin cambios.

3. Programar la creacion de los 5 Lookalikes (D1-D5) al dia 10 (si hay volumen suficiente).

4. Al dia 7, primer reporte mio: cortar audiencias con CPS > 80 y CTR < 0.5%. Reasignar budget a las ganadoras.

5. Al dia 14, segundo reporte mio: decidir si armo lookalikes desde las custom audiences o ya son grandes suficientes para usarlas directamente.

---

## 9. Escalacion si hay desacuerdo

Este documento es input para la ejecucion. Si Franco o Marina tienen objeciones:

- **Franco (estrategia de contenido):** ¿coinciden los angles de creatividad con las audiencias propuestas? Si hay audiencia sin creatividad adecuada, me lo devuelve.
- **Marina (direccion creativa):** ¿las piezas que propongo pautar por audiencia tienen match visual/emocional? Si no, me pide rewrite de la asignacion pieza-audiencia.
- **Owner (Jose):** decision final. Si considera que alguna audiencia no va (ej: Corporativo es muy experimental para mes 1), se saca y se reasigna.

---

## Resumen 1-linea para el owner

De 4 audiencias superpuestas paso a 10 audiencias con roles claros, sin canibalizacion, con exploracion profunda del nicho vela (3 niveles) y 3 verticales laterales nuevos (Turismo, Regalos, Corporativo) que no estaban considerados.
