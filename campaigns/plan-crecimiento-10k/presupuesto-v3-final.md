# Plan de Pauta v3 — Versión Final Ejecutable

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 17 de abril de 2026
**Periodo:** 18 de abril — 14 de mayo de 2026 (27 días)
**Presupuesto neto:** ARS 500.000
**Débito real estimado:** ~ARS 700.000 (impuestos argentinos ~40%)
**Tarjeta:** Mastercard ····8307, límite confirmado por el owner
**Versión:** v3 — consolida y reemplaza presupuesto-v1, v2 y respuesta-auditoria. Este es el plan vigente.

---

## 1. Split IG / FB

| Plataforma | % | Monto |
|-----------|---|-------|
| Instagram | 75% | ARS 375.000 |
| Facebook | 25% | ARS 125.000 |

Revisión al día 10 (27/04): si FB supera a IG en CPS neto, reasignar hasta 35% a FB.

---

## 2. Distribución por objetivo

| Objetivo | % | Monto | Rol |
|----------|---|-------|-----|
| **Awareness** (REACH) | 50% | $250.000 | Instalar marca, primeros seguidores |
| **Engagement** (POST_ENGAGEMENT) | 25% | $125.000 | Reel + top performers + regalos |
| **Leads** (LEAD_GENERATION) | 10% | $50.000 | C3 Corporativo |
| **Reserva táctica** | 15% | $75.000 | Escalar winners |
| **Total** | **100%** | **$500.000** | |

Traffic descartado como objetivo separado. Mínimo diario Meta LINK_CLICKS = $27.865 — inviable con este presupuesto. El tráfico al sitio se genera vía clicks en bio/captions + Pixel captura visitas desde ads de Awareness.

La campaña `ENBA_Traffic_abr2026` (ID `120238976549000139`) queda creada sin ad sets como infraestructura disponible. Si en semana 3 hay winner con ER > 5%, la reserva permite activar 1-2 días de burst OUTCOME_TRAFFIC.

---

## 3. Distribución semanal

Re-baseline: día 1 = 18/04/2026. El plan corre 27 días (no 30).

| Semana | Días | Fechas | Budget | Diario promedio | Foco |
|--------|------|--------|--------|-----------------|------|
| 1 | 7 | 18-24 abr | $100.000 | ~$14.285 | Awareness intensivo + arranque Engagement |
| 2 | 7 | 25 abr - 1 may | $140.000 | ~$20.000 | Reel + escalar winners |
| 3 | 7 | 2-8 may | $160.000 | ~$22.857 | Escalar + retargeting + Leads |
| 4 | 6 | 9-14 may | $100.000 | ~$16.666 | Consolidar + cierre |
| **Total** | **27** | | **$500.000** | | |

Curva 20/28/32/20 preservada.

### Evolución semanal por objetivo

| Objetivo | Sem 1 (18-24) | Sem 2 (25-1) | Sem 3 (2-8) | Sem 4 (9-14) | Total |
|----------|---------------|--------------|-------------|--------------|-------|
| Awareness | $70.000 | $70.000 | $60.000 | $50.000 | $250.000 |
| Engagement | $15.000 | $35.000 | $40.000 | $35.000 | $125.000 |
| Leads | $0 | $10.000 | $20.000 | $20.000 | $50.000 |
| Reserva | $15.000 | $25.000 | $40.000 | -$5.000 | $75.000* |
| **Total** | **$100.000** | **$140.000** | **$160.000** | **$100.000** | **$500.000** |

*La reserva se consume a medida que los winners pidan escalado. Si llega a 0 antes de semana 4, no se gasta más de lo asignado por semana.

---

## 4. Sprint días 1-3

| Día | Fecha | Pieza | Budget | Audiencias |
|-----|-------|-------|--------|------------|
| 1 | 18/04 (Vie) | piece-01 darkpost "El río te llama" | $25.000 | B1 Experiencias ($12.500) + A2 Interés Navegación ($12.500) |
| 2 | 19/04 (Sáb) | piece-02 "Desde Costanera Norte" | $15.000 | C1 Turismo BA ($7.500) + B2 Outdoor ($7.500) |
| 3 | 20/04 (Dom) | piece-03 "No salís con una marca" | $15.000 | A3 Aspiracional ($7.500) + B1 Experiencias ($7.500) |
| **Total sprint** | | | **$55.000** | |

### Resto de semana 1 (21-24 abr)

| Día | Fecha | Acción | Budget |
|-----|-------|--------|--------|
| 4 | 21/04 (Lun) | Evaluación 72h piece-01 — cortar/mantener | $10.000 en ad sets activos |
| 5 | 22/04 (Mar) | Activar reel "4 horas" en Engagement + C2 Regalos | $10.000 |
| 6-7 | 23-24 abr | Ajuste fino basado en data 72h | $10.000 |
| | | Reserva semana 1 | $15.000 |
| **Total sem 1** | | | **$100.000** |

El carrusel cuanto-sale NO se pauta en semana 1. Los $20K originalmente asignados al carrusel se reasignan a los ad sets de Awareness. El carrusel se difiere hasta que haya infraestructura técnica para carousel ads.

---

## 5. Campañas existentes

| ID | Nombre | Objetivo | Estado |
|----|--------|----------|--------|
| `120238976548160139` | ENBA_Awareness_abr2026 | OUTCOME_AWARENESS | PAUSED |
| `120238976548380139` | ENBA_Engagement_abr2026 | OUTCOME_ENGAGEMENT | PAUSED |
| `120238976549000139` | ENBA_Traffic_abr2026 | OUTCOME_TRAFFIC | PAUSED (sin ad sets) |
| `120238976549780139` | ENBA_Leads_abr2026 | OUTCOME_LEADS | PAUSED |

---

## 6. Ad Sets completos

### Awareness (5 existentes)

| Ad Set | ID | Audiencia | Optimization | Budget/día | Min Meta | Activación |
|--------|-----|-----------|-------------|-----------|---------|------------|
| `ENBA_Awareness_B1_ExperienciasBA` | `120238978173190139` | B1: Viajes, Gastronomía, Ocio, Recreación al aire libre. CABA+GBA 40km, 28-45. | REACH | $2.500 | $1.393 ✓ | Día 1 (18/04) |
| `ENBA_Awareness_A2_InteresNavegacion` | `120238978174670139` | A2: Vela, Motor Boat & Yachting, Sailing World, Yacht racing, Embarcación. CABA+GBA 40km, 28-50. | REACH | $1.500 | $1.393 ✓ | Día 1 (18/04) |
| `ENBA_Awareness_C1_TurismoBA` | `120238978175200139` | C1: Viajes, Viajes de aventura, Viajes Y Turismo. Argentina completa, 28-55. | REACH | $1.500 | $1.393 ✓ | Día 1 (18/04) |
| `ENBA_Awareness_B2_OutdoorAventura` | `120238978175860139` | B2: Kayaking, Excursionismo, Camping, Paddleboarding, Caminatas. CABA+GBA 40km, 25-45. | REACH | $1.500 | $1.393 ✓ | Día 2 (19/04) |
| `ENBA_Awareness_A3_AspiracionalNautico` | `120238978176270139` | A3: Artículos de lujo, Viajes de aventura, Recreación al aire libre. CABA+GBA 40km, 28-45. | REACH | $1.500 | $1.393 ✓ | Día 3 (20/04) |

Budget diario total Awareness: $8.500/día. Si corren 27 días: ~$229.500, encaja en $250K.

### Engagement (1 existente + 2 por crear)

| Ad Set | ID | Audiencia | Optimization | Budget/día | Min Meta | Activación |
|--------|-----|-----------|-------------|-----------|---------|------------|
| `ENBA_Engagement_C2_RegalosExperienciales` | `120238978177080139` | C2: Regalos, Día de San Valentín, Bodas. CABA+GBA 40km, 28-50. | POST_ENGAGEMENT | $1.500 | $1.393 ✓ | Día 5 (22/04) |
| `ENBA_Engagement_Reel4horas` | **POR CREAR** | A2 + B1 combinada (interés navegación + experiencias). CABA+GBA 40km, 25-50. | POST_ENGAGEMENT | $3.000 | $1.393 ✓ | Día 5 (22/04) |
| `ENBA_Engagement_TopPerformers` | **POR CREAR** | B1 (Experiencias BA). CABA+GBA 40km, 28-45. | POST_ENGAGEMENT | $1.500 | $1.393 ✓ | Día 10 (27/04) |

Budget diario total Engagement: $6.000/día. Si corren sus días asignados: ~$124.500, encaja en $125K.

### Leads (1 existente)

| Ad Set | ID | Audiencia | Optimization | Budget/día | Min Meta | Activación |
|--------|-----|-----------|-------------|-----------|---------|------------|
| `ENBA_Leads_C3_Corporativo` | `120238978180620139` | C3: Gestión de eventos, HR Professional, Espíritu empresarial. CABA+GBA 40km, 32-55. | LEAD_GENERATION | $3.500 | $3.483 ✓ | Día 8 (25/04) |

Budget mensual Leads: $3.500 × 20 días = $70K. Pero el plan asigna $50K → corta día 22 (9/05) o se baja a $2.500/día. Ajuste: **bajar C3 a $3.500/día pero correr solo 14 días** (25/04 al 8/05) = $49K. Entra en $50K.

Lead form: `ENBA_LeadForm_Corporativo` — creado y activo en Ads Manager.

### Diferidos (activación condicional semana 2-3)

| Ad Set | Cuándo | Condición |
|--------|--------|-----------|
| Retargeting Web Visitors | Día 14 (1/05) | D1 WebVisitors > 100 personas |
| LAL IG Engagers 1% | Día 10 (27/04) | D2 IGEngagers > 100 personas |
| LAL Nautica Activa 1% | Día 14 (1/05) | A1 creada como Custom Audience |

Estos ad sets **no están creados todavía**. Se crean cuando la condición se cumpla. Budget: sale de la reserva táctica ($75K).

---

## 7. Ads existentes (6)

| Ad | Ad Set | Creative | Tipo |
|----|--------|----------|------|
| `ENBA_ad_piece01dp_A2` | A2 Interés Navegación | piece-01 darkpost | image_hash |
| `ENBA_ad_piece01dp_B1` | B1 Experiencias BA | piece-01 darkpost | image_hash |
| `ENBA_ad_piece02_C1` | C1 Turismo BA | piece-02 existing | existing_post_id |
| `ENBA_ad_piece02_B2` | B2 Outdoor | piece-02 existing | existing_post_id |
| `ENBA_ad_piece03_A3` | A3 Aspiracional | piece-03 existing | existing_post_id |
| `ENBA_ad_piece03_B1` | B1 Experiencias BA | piece-03 existing | existing_post_id |

Todos en PAUSED, aprobados por Meta, $0 gastado.

### Ads por crear

| Ad | Ad Set | Creative | Cuándo |
|----|--------|----------|--------|
| Reel "4 horas" | `ENBA_Engagement_Reel4horas` (por crear) | existing_post_id IG `18585972517007777` | Cuando se cree el ad set (día 5 = 22/04) |
| Ad para C2 Regalos | `ENBA_Engagement_C2_RegalosExperienciales` | existing_post_id de pieza con ER > 1% | Día 5 (22/04) |
| Ad para C3 Corporativo | `ENBA_Leads_C3_Corporativo` | darkpost corporativo o existing post | Día 8 (25/04), con lead form vinculado |

---

## 8. Plan del reel como ad

| Parámetro | Valor |
|-----------|-------|
| Campaña | ENBA_Engagement_abr2026 (`120238976548380139`) |
| Ad Set | `ENBA_Engagement_Reel4horas` (por crear) |
| Audiencia | A2 + B1 combinada (interés navegación + experiencias BA) |
| Geo | CABA + GBA 40km |
| Edad | 25-50 |
| Optimization | POST_ENGAGEMENT |
| Budget | $3.000/día |
| Creative | existing_post_id del reel publicado (IG: `18585972517007777`) |
| Activación | Día 5 (22/04) |
| Justificación | Score 8.5/10 Marina. Mejor retención que estáticos. Alimenta D4 Video Viewers. |

---

## 9. Ciclo de vida de las piezas en pauta

### Regla 1: Evaluación obligatoria a las 72h

| Resultado | Acción |
|-----------|--------|
| CPS < $30 + ER > 3% | **WINNER** — sigue corriendo, candidata a escalado |
| CPS $30-$100 + ER > 1% | **VIABLE** — sigue corriendo sin cambios |
| CPS > $100 o ER < 1% o CTR < 0.4% | **CORTAR** — se apaga el ad |
| Frecuencia > 3.5 | **FATIGUE** — se apaga independientemente de otros KPIs |

### Regla 2: Máximo 14 días por pieza

Las piezas del sprint (piece-01 darkpost, piece-02, piece-03) tienen ciclo máximo de 14 días en pauta:

| Día | Acción |
|-----|--------|
| 1-3 | Sprint. Corren todas. |
| 3 (72h) | Primera evaluación. Cortar las que cumplan criterio. |
| 7 | Segunda evaluación. Winners se mantienen, viables se reevalúan. |
| 14 | **Corte máximo.** Se apaga sin importar performance (creative fatigue). |

Excepción: CPS < $20 + frecuencia < 2 a día 14 → extensión 7 días más (máximo día 21). Requiere aprobación de Bruno.

### Regla 3: Incorporación de piezas nuevas

Las piezas orgánicas (1/día vía n8n) con ER > 1% en primeras 24h son candidatas a pauta.

1. Día siguiente a publicación: verificar ER orgánico
2. ER > 1%: crear ad con `existing_post_id`
3. ER < 1%: solo orgánica
4. Máximo 2 piezas nuevas por semana (revisar con data real en semana 2)

### Regla 4: Máximo 3 ads por ad set

| Situación | Acción |
|-----------|--------|
| 1-3 ads | OK |
| 4+ ads | Se apaga el ad con peor CPS |

### Regla 5: Rotación semanal

Cada lunes (o primer día de cada semana):
1. Revisar todos los ads activos
2. Apagar los que cumplan criterio de corte o fatigue
3. Incorporar 1-2 piezas nuevas
4. Actualizar `meta-ids.json`

Responsable: Bruno propone → owner aprueba antes de ejecutar.

### Regla 6: Reemplazo obligatorio antes de fatigue

Ninguna pieza se apaga por fatigue si el ad set queda sin creative.

| Día | Acción |
|-----|--------|
| 10 | Alerta fatigue inminente. Verificar si hay reemplazo. |
| 10-12 | Producir reemplazo: (1) existing post con buen ER, (2) nuevo darkpost, (3) variante de la misma pieza |
| 13 | Reemplazo listo en PAUSED |
| 14 | Swap: activa reemplazo + apaga fatigada |

Caso piece-01 darkpost:
- Prioridad 1: reel como ad en A2/B1 (cambia formato, resetea fatigue)
- Prioridad 2: piece-01 variante B (distinto crop/headline, 30 min producción)
- Prioridad 3: existing post con ER > 2%

Regla dura: si al día 13 no hay reemplazo, extender 3 días más con budget -50%. Máximo absoluto día 17.

---

## 10. Criterios de corte y escalado

### APAGAR (después de 72h)

| Métrica | Umbral |
|---------|--------|
| CPS | > ARS 100 |
| CTR | < 0.4% |
| Frecuencia | > 3.5 |

### ESCALAR (después de 72h)

| Métrica | Umbral |
|---------|--------|
| CPS | < ARS 30 |
| Engagement rate | > 3% |
| Follow rate | > 20% |
| Incremento | +25% cada 48h |
| Win 5 días | Triple scale (+100% en 48h) |

---

## 11. Tests primeras 72h

**Test 1:** B1 Experiencias ($2.500/día) vs A2 Interés Navegación ($1.500/día), misma pieza (piece-01 darkpost).
- Hipótesis: B1 mejor CPS bruto, A2 mejor follow rate.
- Criterio: al día 3, quedarse con mejor CPS calificado.
- Acción: reasignar budget de la perdedora a la ganadora.

**Test 2:** C1 Turismo BA (geo Argentina) vs B2 Outdoor (geo CABA+GBA), misma pieza (piece-02).
- Hipótesis: C1 gana CPS por alcance, B2 gana en DMs.
- Criterio: al día 5, evaluar DMs por audiencia.
- Acción: si B2 gana en DMs aunque CPS más alto, mantenerlo.

**Test 3:** C3 Corporativo LEAD_GEN ($3.500/día, desde día 8).
- Hipótesis: mínimo alto se compensa con ticket alto.
- Criterio: al día 14, 3+ consultas corporativas.
- Acción: si cumple, escalar a $5K/día. Si no, apagar y reasignar.

---

## 12. Exclusiones

### Custom Audiences de exclusión (por crear en UI)

| Nombre | Fuente | Evento | Retención | Propósito |
|--------|--------|--------|-----------|-----------|
| `ENBA_Exclusion_FBPageLikers` | Página Facebook | Personas que les gusta tu página | Sin límite | Excluir likers actuales de FB |
| `ENBA_Exclusion_IGEngaged365` | Cuenta Instagram | Cualquier persona que interactuó | 365 días | Proxy para excluir followers IG |

Cuándo: crear antes de semana 2 (25/04). No bloqueante para activar semana 1 (impacto bajo con pocos seguidores).

Una vez creadas, actualizar todos los ad sets con `excluded_custom_audiences` vía API PATCH.

### Exclusión cruzada entre audiencias

Diferida a semana 3+. Depende de que A1 (Náutica Activa) exista como Custom Audience. Sin A1, los 5 ad sets de Awareness compiten internamente — Meta lo maneja con su algoritmo. No es ideal pero no es bloqueante.

---

## 13. Custom Audiences

| # | Nombre | Estado | Fuente |
|---|--------|--------|--------|
| D1 | ENBA_Custom_WebVisitors_30d | ✅ Creada en UI | Pixel, 30 días |
| D2 | ENBA_Custom_IGEngagers_90d | ✅ Creada en UI | IG engagement, 90 días |
| D3 | ENBA_Custom_FBEngagers_90d | ✅ Creada en UI | FB Page engagement, 90 días |
| D4 | ENBA_Custom_VideoViewers_30d | **Por crear** (reel ya publicado) | Video viewers, 30 días |

D4 se puede crear ahora en UI de Ads Manager: fuente "Video", seleccionar reel "4 horas en el río", retención 30 días.

Lookalikes se crean cuando D1/D2/D3 superen 100 personas (estimado: semana 2-3).

---

## 14. Acciones bloqueantes antes de activar

| # | Acción | Estado | Quién |
|---|--------|--------|-------|
| 1 | Targeting patcheado con IDs válidos (7 ad sets) | ✅ HECHO | Técnico |
| 2 | Lead form C3 creado | ✅ HECHO | Owner |
| 3 | Tarjeta $700K confirmada | ✅ HECHO | Owner |
| 4 | Crear ad set `ENBA_Engagement_Reel4horas` | **PENDIENTE** | Técnico (API) |
| 5 | Crear ad set `ENBA_Engagement_TopPerformers` | **PENDIENTE** | Técnico (API) |
| 6 | Crear ad del reel en el ad set nuevo | **PENDIENTE** | Técnico (API) |

**Una vez que se completen 4-6, se puede activar día 1 (18/04).**

Los ad sets de Awareness + sus ads ya están listos. Los de Engagement se activan en día 5 (22/04) — hay margen para crearlos.

---

## 15. Calendario de activación

| Día | Fecha | Qué se activa | Budget diario total |
|-----|-------|---------------|---------------------|
| 1 | 18/04 (Vie) | A2, B1, C1 (Awareness) | $5.500 |
| 2 | 19/04 (Sáb) | + B2 (Awareness) | $7.000 |
| 3 | 20/04 (Dom) | + A3 (Awareness) | $8.500 |
| 5 | 22/04 (Mar) | + Reel ad + C2 Regalos (Engagement) | $13.000 |
| 8 | 25/04 (Vie) | + C3 Corporativo (Leads) | $16.500 |
| 10 | 27/04 (Dom) | + LAL IG Engagers (si D2 > 100) | ~$18.500 |
| 14 | 1/05 (Jue) | + Retargeting Web + Top Performers (Engagement) | ~$21.500 |

Quién activa: Manu coordina → owner aprueba → técnico ejecuta el cambio de status PAUSED → ACTIVE.

---

## 16. Métricas proyectadas con $500K

CPS promedio estimado: $45 ARS (mercado AR, nicho experiencias, cuenta nueva, abril 2026).

| Concepto | Cálculo | Seguidores |
|----------|---------|------------|
| Teórico bruto | $500K / $45 | ~11.100 |
| Ajuste calibración sem 1 (-20%) | -$100K efectivo | -2.200 |
| Ajuste CPS variable (-15%) | CPS > $45 en C3, A3 | -1.500 |
| Ajuste conversión parcial (-20%) | Engagement/Leads no todos convierten | -1.500 |
| **Pagados realistas** | | **~5.900** |
| + Orgánico (30 posts + reel + carruseles) | | +2.500 |
| **Total realista** | | **7.000 - 10.000** |

Probabilidad de alcanzar 10K: **35-50%** (vs 5-10% con $250K original).

---

## 17. Decisiones operativas para Manu

### Antes de día 1 (18/04)

| # | Acción | Quién | Aprobación |
|---|--------|-------|------------|
| 1 | Crear ad set `ENBA_Engagement_Reel4horas` vía API | Técnico | Owner + Bruno |
| 2 | Crear ad set `ENBA_Engagement_TopPerformers` vía API | Técnico | Owner + Bruno |
| 3 | Crear ad del reel con existing_post_id | Técnico | Owner |
| 4 | Activar ad sets A2, B1, C1 (cambiar PAUSED → ACTIVE) | Técnico | Owner |

### Día 5 (22/04)

| # | Acción |
|---|--------|
| 5 | Activar reel ad + C2 Regalos |
| 6 | Crear D4 Video Viewers en UI (si no se hizo antes) |

### Día 7 (24/04)

| # | Acción |
|---|--------|
| 7 | Primer reporte Bruno: evaluación 72h de Awareness |
| 8 | Cortar ad sets/ads que cumplan criterio |
| 9 | Crear 2 Custom Audiences de exclusión en UI |

### Día 8 (25/04)

| # | Acción |
|---|--------|
| 10 | Activar C3 Corporativo con lead form vinculado |

### Día 10 (27/04)

| # | Acción |
|---|--------|
| 11 | Crear LAL IG Engagers 1% si D2 > 100 |
| 12 | Activar Top Performers si hay pieza con ER > 1% |

### Semanal (cada lunes)

| # | Acción |
|---|--------|
| 13 | Bruno entrega reporte semanal |
| 14 | Rotación de piezas (regla 5) |
| 15 | Incorporación de nuevas piezas (regla 3) |
| 16 | Actualizar meta-ids.json |

### Toda acción de activación requiere:
1. Bruno propone
2. Owner aprueba
3. Técnico ejecuta

Nadie activa nada sin aprobación del owner.

---

## 18. Documentos que este plan reemplaza

| Documento | Estado |
|-----------|--------|
| presupuesto.md ($250K, v1) | **Histórico** — superseded |
| presupuesto-v2-500k.md ($500K, v2) | **Histórico** — superseded |
| respuesta-auditoria-bruno.md | **Histórico** — integrado acá |
| audiencias-ampliadas.md (tablas $250K) | **Histórico** — proporciones válidas, montos superseded |

Este documento es la **fuente de verdad única** del plan de pauta del frente 10K.

---

*Bruno — Social Growth & Performance Director*
*17 de abril de 2026 — v3 final*
