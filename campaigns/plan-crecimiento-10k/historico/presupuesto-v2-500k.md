> **HISTORICO — Superseded por `presupuesto-v3-final.md`. Este documento se conserva como registro de la version v2.**

# Presupuesto v2 — Recalibrado con ARS 500.000/mes

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 16 de abril de 2026
**Periodo:** 15 de abril — 14 de mayo de 2026
**Presupuesto total disponible:** ARS 500.000 (neto para Meta Ads, duplicado del original 250K)
**Contexto:** recalibrado con mínimos reales de Meta confirmados vía API + constraint técnico de Traffic.

---

## Nota sobre impuestos

Sigue aplicando: impuestos argentinos ~40% (IVA + impuesto PAIS + percepción ganancias). Débito real en tarjeta: **~ARS 700.000**. Verificar que el límite de la tarjeta lo soporte antes de activar.

---

## 1. Distribución IG vs FB

| Plataforma | % | Monto | Justificación |
|-----------|---|-------|--------------|
| Instagram | 75% | ARS 375.000 | Mismo criterio que v1: mayor CPS eficiente para el nicho, reels, audiencia activa 25-45 |
| Facebook | 25% | ARS 125.000 | Complemento awareness 35-55 + retargeting web visitors |

**Revisión:** al día 10, si FB supera a IG en CPS neto (posible en audiencia 40-55 con retargeting), reasignar hasta 35% a FB.

---

## 2. Distribución semanal

| Semana | Presupuesto | Diario promedio | Foco |
|--------|-------------|-----------------|------|
| 1 (15-21 abr) | ARS 100.000 | ~$14.285 | Awareness intensivo, calibración con margen holgado |
| 2 (22-28 abr) | ARS 140.000 | ~$20.000 | Primer reel + Engagement + arranque Leads |
| 3 (29 abr - 5 may) | ARS 160.000 | ~$22.857 | Escalar winners + retargeting + segundo reel |
| 4 (6-14 may) | ARS 100.000 | ~$11.111 | Consolidar + reserva para cierre fuerte |
| **Total** | **ARS 500.000** | — | |

Curva 20/28/32/20 preservada. Semana 3 sigue siendo la más alta — cuando ya hay data y los reels corren.

### Sprint primeros 3 días (ajustado)

| Día | Pieza | Presupuesto | Objetivo | Audiencia |
|-----|-------|-------------|----------|-----------|
| 15/04 | piece-01 "El rio te llama" | ARS 25.000 | Awareness | B1 Experiencias + A2 Interés Navegación |
| 16/04 | piece-02 "Desde Costanera Norte" | ARS 15.000 | Awareness | C1 Turismo BA + B2 Outdoor |
| 17/04 | piece-03 "No salis con una marca" | ARS 15.000 | Awareness | A3 Aspiracional + B1 |
| **Total sprint** | | **ARS 55.000** | | |

Los ARS 45.000 restantes de semana 1:
- Sábado 18: ARS 20.000 en carrusel cuanto-sale
- Domingo 19: ARS 10.000 en piece-04 o piece-05 según engagement organico
- Lunes-martes: ARS 15.000 reserva de semana 1

---

## 3. Distribución por objetivo de campaña

**Cambio clave vs v1:** descarto `OUTCOME_TRAFFIC` como categoría separada. Razón: con mínimo diario de ARS 27.865 en LINK_CLICKS / LANDING_PAGE_VIEWS, asignarle presupuesto suficiente para correr 15-20 días consume $500K solo esa campaña. No tiene sentido.

**Sustitución:** uso `OUTCOME_ENGAGEMENT` con destination = website. Mínimo $1.393,30/día. El algoritmo lleva al sitio pero prioriza engagement antes que click. El Pixel igual captura visitas para audiencia Web Visitors. Cumple la función sin romper el presupuesto.

| Objetivo | % del total | Monto | Rol |
|----------|-------------|-------|-----|
| **Awareness** (REACH) | 35% | ARS 175.000 | Instalar marca, calibrar creatividades, primeros seguidores |
| **Engagement/Followers** (POST_ENGAGEMENT + destination site) | 42% | ARS 210.000 | Crecimiento de comunidad + tráfico al sitio indirecto |
| **Leads** (LEAD_GENERATION) | 14% | ARS 70.000 | C3 Corporativo + conversión de engaged a consulta |
| **Reserva táctica** | 9% | ARS 45.000 | Escalar winners, compensar ajustes de Meta, margen real |
| **Total** | **100%** | **ARS 500.000** | |

**Nota operativa sobre Traffic:** la campaña `ENBA_Traffic_abr2026` queda creada en PAUSED pero **sin ad sets activos** en este plan. Si al día 15 hay un winner con ER >5% y querés empujarlo a sitio con OUTCOME_TRAFFIC puro, podés activar 2-3 días de burst con ARS 85K de la reserva táctica. Decisión futura según data.

### Evolución semanal por objetivo

| Objetivo | Semana 1 | Semana 2 | Semana 3 | Semana 4 | Total |
|----------|----------|----------|----------|----------|-------|
| Awareness | ARS 60.000 | ARS 50.000 | ARS 40.000 | ARS 25.000 | ARS 175.000 |
| Engagement/Followers | ARS 20.000 | ARS 60.000 | ARS 70.000 | ARS 60.000 | ARS 210.000 |
| Leads | ARS 0 | ARS 15.000 | ARS 30.000 | ARS 25.000 | ARS 70.000 |
| Reserva | ARS 20.000 | ARS 15.000 | ARS 20.000 | -ARS 10.000 | ARS 45.000* |
| **Total** | **ARS 100.000** | **ARS 140.000** | **ARS 160.000** | **ARS 100.000** | **ARS 500.000** |

*La reserva se consume a medida que los winners pidan escalado.

---

## 4. Activación por audiencia con mínimos respetados

Las 8 audiencias definidas en `audiencias-ampliadas.md` se mantienen sin cambios. Lo que cambia es qué budget se le asigna a cada una y cuándo se activa.

| Audiencia | Optimization | Budget diario | Mínimo Meta | Día activación | Budget mensual estimado |
|-----------|--------------|---------------|-------------|----------------|------------------------|
| **A2 Interés Navegación** | REACH | $1.500 | $1.393 ✓ | Día 1 | ~$45.000 |
| **B1 Experiencias BA** | REACH | $2.500 | $1.393 ✓ | Día 1 | ~$75.000 |
| **C1 Turismo BA** | REACH | $1.500 | $1.393 ✓ | Día 1 | ~$45.000 |
| **B2 Outdoor/Aventura** | REACH | $1.500 | $1.393 ✓ | Día 2 | ~$45.000 |
| **A3 Aspiracional Náutico** | REACH | $1.500 | $1.393 ✓ | Día 3 | ~$43.000 |
| **C2 Regalos Experienciales** | POST_ENGAGEMENT | $1.500 | $1.393 ✓ | Día 5 | ~$39.000 |
| **C3 Corporativo** | LEAD_GENERATION | $3.500 | $3.483 ✓ | Día 8 | ~$80.500 |
| **A1 Náutica Activa** | — | $0 | — | Nunca (fuente LAL) | $0 |
| **Retargeting Web Visitors** | POST_ENGAGEMENT | $2.000 | $1.393 ✓ | Día 14 (si Pixel > 100) | ~$32.000 |
| **LAL IG Engagers 1%** | POST_ENGAGEMENT | $2.000 | $1.393 ✓ | Día 10 (si source > 100) | ~$40.000 |
| **LAL Nautica Activa 1%** | REACH | $1.500 | $1.393 ✓ | Día 14 | ~$24.000 |

**Total estimado si todos corren sus días asignados:** ~$468.500, dejando ~$31.500 en reserva consumible.

**Nota:** los budgets son límites diarios, no obligación de gasto. Si un ad set no cumple criterio de delivery, Meta no lo consume. El criterio de corte/escalado (sección 7) regula la asignación real.

---

## 5. Qué se desbloquea con $500K vs $250K

| Capacidad | Con $250K | Con $500K |
|-----------|-----------|-----------|
| Ad sets Awareness simultáneos | 2-3 | **5-6** |
| Ad sets de Leads (LEAD_GEN) | 1 máximo | **2-3** (C3 + engaged + retargeting) |
| Ad sets de Retargeting | Diferidos a sem 3 | **Activables semana 2** |
| Reserva táctica real | Teórica ($25K) | **Real ($45K)** para escalar winners |
| Ventana de escalado | Apretada | **Holgada**: se pueden triplicar budgets sin romper plan |
| Audiencia corporativa (C3) | Inviable ($3.5K/día × 1 semana = $25K) | **Viable** 3+ semanas |
| Burst experimental de Traffic | Imposible | **Posible** ($85K de reserva, 3 días) si hay winner que lo justifique |

---

## 6. Decisión concreta sobre Traffic

**Descarto `OUTCOME_TRAFFIC` como categoría fija en el plan.**

Razón matemática:
- Mínimo diario: $27.865,87
- 15 días de corrida: $417.975 (84% del presupuesto)
- 10 días: $278.650 (56%)
- 5 días: $139.325 (28%)
- 3 días: $83.595 (17%)

Ningún escenario compite bien con alternativas.

**Reemplazo:**
- `OUTCOME_ENGAGEMENT` con destination site cumple la función de llevar al sitio con mínimo $1.393/día.
- El Pixel registra visitas igual.
- La audiencia Web Visitors se puebla igual (solo que la gente llega vía engagement, no click puro).

**Si en semana 3 hay un winner claro (CPS < $25, ER > 5%)**, la reserva táctica de $45K permite activar 1-2 días de OUTCOME_TRAFFIC puro como burst experimental para forzar tráfico a sitio. No es un objetivo fijo del plan, es una opción en la reserva.

**La campaña `ENBA_Traffic_abr2026` queda creada pero sin ad sets.** No se elimina — queda como infraestructura disponible.

---

## 7. Criterios de corte/escalado ajustados al nuevo escenario

Con presupuesto holgado puedo tolerar más ruido antes de apagar.

### APAGAR un ad set si después de 72h:

| Métrica | Umbral v1 ($250K) | Umbral v2 ($500K) |
|---------|-------------------|-------------------|
| CPS (costo por seguidor) | > ARS 80 | **> ARS 100** |
| CTR | < 0.5% | **< 0.4%** |
| Frecuencia | > 3.0 | **> 3.5** |

La lógica: con más margen absoluto, puedo bancar ad sets con CPS más alto durante más tiempo porque 1-2 escalones de optimización pueden bajarlo.

### DUPLICAR budget de un ad set si después de 72h:

| Métrica | Umbral v1 | Umbral v2 |
|---------|-----------|-----------|
| CPS | < ARS 30 | **< ARS 30** (sin cambio) |
| Engagement rate | > 3% | **> 3%** (sin cambio) |
| Follow rate | > 20% | **> 20%** (sin cambio) |

Los criterios de escalado no se aflojan — quiero winners reales, no ruido.

### Incremento de escalado
- Gradual: **+25%** cada 48h (antes +20%)
- Win sostenido 5 días → **triple scale** (+100% en 48h)

### TRIPLE SCALE permitido desde semana 2
Con $250K el triple scale era muy arriesgado (un ad set con triple podía consumir 40% del mes en una semana). Con $500K puedo bancar 2 triple scales simultáneos sin romper el plan.

---

## 8. Cambios estructurales que requieren Team 3 ejecutar

Para que este plan funcione, Team 3 (Manu + Dani/Sole/Nico) tiene que:

1. **Crear vía API en PAUSED:**
   - 4 Custom Audiences (D1 Web Visitors, D2 IG Engagers, D3 FB Engagers, D4 Video Viewers)
   - Ad sets para las 7 audiencias pautables (A2, A3, B1, B2, C1, C2, C3) con budgets y targeting de esta versión
   - Exclusión vía Custom Audience: D2 o D3 según la campaña (FB Page likers se excluyen con Custom Audience `page_liked` retention 0)

2. **Diferir hasta semana 2-3:**
   - Retargeting Web Visitors (activar cuando D1 > 100 personas)
   - LAL IG Engagers 1% (activar cuando D2 > 100)
   - LAL Nautica Activa 1% (requiere crear A1 como Saved Audience primero)

3. **Diferir indefinido:**
   - Ads con creatividades del lanzamiento (piece-01, piece-02, piece-03) — bloqueado hasta resolver post_ids reales con el frente lanzamiento
   - Ad de reel "4 horas en el río" — se puede crear ya si se publica el reel via API (es pieza propia de este frente)

---

## 9. Tests recomendados para las primeras 72h

**Test 1:** B1 Experiencias BA ($2.500/día) vs A2 Interés Navegación ($1.500/día), misma pieza (piece-01).
- **Hipótesis:** B1 da mejor CPS bruto (es más grande), A2 da mejor follow rate (más calificada).
- **Criterio de éxito:** al día 3, quedarse con la que tenga mejor CPS calificado (CPS × (1/follow_rate)).
- **Acción:** reasignar budget de la perdedora a la ganadora.

**Test 2:** C1 Turismo BA (geo Argentina completa) vs B2 Outdoor (geo CABA+GBA).
- **Hipótesis:** C1 gana en CPS bruto por mayor alcance, pero B2 gana en tasa de conversión a DM.
- **Criterio de éxito:** al día 5, evaluar DMs recibidos por audiencia.
- **Acción:** si B2 gana en DMs aunque CPS sea más alto, mantenerlo y escalar.

**Test 3:** C3 Corporativo con LEAD_GEN ($3.500/día, desde día 8).
- **Hipótesis:** el mínimo alto ($3.5K) se compensa con 2-3 consultas reales por semana (ticket alto).
- **Criterio de éxito:** al día 14, 3+ consultas corporativas recibidas.
- **Acción:** si cumple, escalar a $5K/día. Si no, apagar y reasignar a engagement.

---

## 10. Decisiones operativas para Manu

Resumen ejecutable para coordinación:

1. **Campañas:** las 4 ya existen en PAUSED. No recrear. Son:
   - `ENBA_Awareness_abr2026` (id 120238976548160139)
   - `ENBA_Engagement_abr2026` (id 120238976548380139)
   - `ENBA_Traffic_abr2026` (id 120238976549000139) — **queda sin ad sets**
   - `ENBA_Leads_abr2026` (id 120238976549780139)

2. **Custom Audiences:** crear 4 vía API con schema confirmado en preflight (D1-D4). La exclusión de followers se hace con una 5ta (`page_liked` retention 0).

3. **Ad Sets:** crear 7 en PAUSED con budgets de tabla sección 4. Incluir exclusión vía `excluded_custom_audiences`.

4. **Ads/Creatives:** bloqueados hasta resolver post_ids de lanzamiento. Excepción: el ad del reel "4 horas" se puede crear cuando el reel se publique orgánicamente (pieza propia del frente).

5. **Reporte mío a los 7 días:** lectura de data real, ajuste de tabla de activación, decisiones sobre cortar/escalar.

---

## 11. Métricas proyectadas con $500K (baseline)

Asumiendo CPS promedio de $45 ARS (mercado AR nicho experiencias para cuenta nueva, abril 2026):

- $500K / $45 = **~11.100 seguidores pagados teóricos**

Ajustando por:
- Ineficiencia de calibración semana 1 (~20% del gasto en aprendizaje): -$100K efectivo → -2.200 seguidores
- Algunos ad sets con CPS > $45 (C3 Corporativo alto, A3 tibio): -15% volumen → -1.500 seguidores
- Engagement/Leads no convierten 100% a follower: -20% → -1.500 seguidores

**Estimación realista con $500K: 5.500-7.000 seguidores pagados en 30 días.**

Sumando crecimiento orgánico esperado (los 30 posts + 3 carruseles + 1 reel): **+1.500-3.000 orgánicos adicionales**.

**Tier realista total: 7.000-10.000 seguidores en 30 días.**

**Cambio vs v1 ($250K):**
- Tier realista v1: 3.000-5.000 seguidores
- Tier realista v2: 7.000-10.000 seguidores

**El objetivo de 10K pasa de 5-10% de probabilidad a 35-50% de probabilidad.**

No es garantía. Es matemática basada en mínimos y benchmarks. Los datos reales de los primeros 7 días van a recalibrar estas estimaciones.

---

## 12. Síntesis operativa

Para el owner, en una sola línea:

**Con $500K, el plan pasa de "apretar con margen cero" a "ejecutar con reserva real". Los 5 ad sets de Awareness corren holgados, Leads B2B es viable, hay reserva táctica de $45K para escalar lo que funcione, y el tier realista sube de 3-5K a 7-10K seguidores proyectados. Traffic sigue descartado como categoría propia, pero queda como opción en reserva si aparece un winner claro. El objetivo de 10K pasa de aspiracional remoto a alcanzable con ejecución impecable.**

El plan es ejecutable. No reabre dirección creativa ni calendario. Solo recalibra números contra mínimos reales.
