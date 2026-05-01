# Plan de Pauta v4 — Reestructuración Urgente

**Autor:** Bruno (Social Growth & Performance Director) + Auditor (Paid Media Auditor)
**Fecha original:** 22 de abril de 2026
**Ultima actualizacion:** 01 de mayo de 2026 (dia 13/27)
**Periodo:** 19 de abril — 16 de mayo de 2026 (27 dias)
**Presupuesto total campaña:** ARS 500,000 neto
**Gastado al dia 13:** ARS 258,271
**Restante:** ARS 241,729
**Burn rate actual:** ARS 13,000/dia (18 dias de margen)
**Versión:** v4.1 — actualización día 13 con hallazgos de arquitectura y pivot creativo. Reemplaza v3 como plan vigente.

---

## 1. Diagnóstico día 2 (trigger de reestructuración)

$20,584 gastados en 2 días. Resultados: 0 follows, 0 leads, 0 profile visits, 0 DMs.

Hallazgos del Auditor:
1. Funnel roto: awareness REACH no genera follows (48,909 reach → 0 follows)
2. Distribución ineficiente: 50% en estáticos awareness = impresiones vacías
3. Desajuste objetivo-mecanismo: objetivo es seguidores, campañas optimizan reach

Señal positiva: Reel "4 horas" = 4,919 eng en $4,617 (390x más eficiente que estáticos).

---

## 2. Distribución por objetivo (actualizada dia 13)

La distribución original por porcentaje fue reemplazada por ad sets con budgets fijos. La fuente de verdad de budgets es `meta-ids.json`.

| Objetivo | Campaña Meta | Ad sets activos con gasto | Budget/dia |
|---|---|---|---|
| Follow FB | ENBA_Follow_FB_abr2026 | fb_cold ($2,500) | $2,500 |
| Follow IG | ENBA_Follow_IG_abr2026 | ig_cold ($5,000) + ig_retarget ($1,500) | $6,500 |
| Engagement | ENBA_Engagement_abr2026 | AS_ENG_REEL ($4,000) | $4,000 |
| Awareness | ENBA_Awareness_abr2026 | 5 ad sets ACTIVE pero todos los ads PAUSED | $0 efectivo |
| Leads | ENBA_Leads_abr2026 | AS_LEA_C3 ACTIVE pero ad PAUSED | $0 efectivo |
| Traffic | ENBA_Traffic_abr2026 | Sin ad sets | $0 |
| **Total efectivo** | | | **$13,000/dia** |

fb_retarget ($3,600/dia budget) tiene TODOS sus ads pausados → $0 gasto. Riesgo: si se activa un ad ahi sin querer, arranca a gastar $3,600/dia.

---

## 3. Split IG / FB (actualizado dia 13)

**El split 75/25 original fue REVERTIDO por los datos.**

| Plataforma | Budget/dia | Ads activos | Follows nuevos | CPF real |
|---|---|---|---|---|
| Facebook | $2,500 | 4 (destinos, nosotros, static01, static02) | 947 | $110 blended |
| Instagram | $6,500 | 5 (corporativo, microreel cold x1, microreel retarget x1, static01, static02) | 67 | $926 implicito |

**FB es el canal principal de follows.** PAGE_LIKES alinea el objetivo Meta con el resultado (follow directo con 1 click). IG usa TRAFFIC+VISIT_INSTAGRAM_PROFILE que optimiza por visitas, no follows. No existe objetivo Meta que optimice por IG follows (verificado via API dia 13).

Follow rate IG: 2.7% (67 follows / 2,488 visitas). Estructural, no solo problema de perfil.

---

## 4. Presupuesto restante (dia 13)

| | |
|---|---|
| Gastado | $258,271 (dias 1-13) |
| Restante | $241,729 |
| Burn rate actual | $13,000/dia |
| Dias restantes del plan | 15 (hasta 16/05) |
| Dias de presupuesto al ritmo actual | 18 |

Presupuesto sobra. No hay riesgo de quedarse sin plata. El cuello de botella es creativos y conversion, no budget.

---

## 5. Ads activos al dia 13 (fuente de verdad: meta-ids.json)

### Follow FB — fb_cold ($2,500/dia, 4 ads)

| Ad | ID | Creative | CPF | Estado |
|---|---|---|---|---|
| destinos_FB_Cold | 120239303665020139 | collage destinos | $114 | ACTIVE |
| nosotros_FB_Cold | 120239303666220139 | collage nosotros | $104 | ACTIVE (reactivado 01/05) |
| FB_static01_01may | 120239854683430139 | grupo skyline nublado + logo | pendiente | ACTIVE (nuevo 01/05) |
| FB_static02_01may | 120239854684020139 | amigos vela bandera + logo | pendiente | ACTIVE (nuevo 01/05) |

### Follow IG — ig_cold ($5,000/dia, 4 ads)

| Ad | ID | Creative | CPV | Estado |
|---|---|---|---|---|
| corporativo_IG_Cold | 120239353874370139 | grupo-cockpit-cielo-azul-4x5 (WINNER) | $25 | ACTIVE |
| microreel_IG_Cold | 120239303661060139 | micro-reel 15s | $45 | ACTIVE |
| IG_static01_01may | 120239854682060139 | grupo rio sol + logo | pendiente | ACTIVE (nuevo 01/05) |
| IG_static02_01may | 120239854683020139 | pareja sunset + logo | pendiente | ACTIVE (nuevo 01/05) |

### Follow IG — ig_retarget ($1,500/dia, 1 ad)

| Ad | ID | Creative | CPV | Estado |
|---|---|---|---|---|
| microreel_IG_Retarget | 120239303662540139 | micro-reel 15s | $53 | ACTIVE |

### Engagement — AS_ENG_REEL ($4,000/dia, 1 ad)

| Ad | ID | Creative | Estado |
|---|---|---|---|
| AD_ENG_REEL_V2 | 120239691829210139 | reel-eng-v2 | ACTIVE (desde 29/04) |

### Ad sets con budget pero $0 gasto (todos los ads pausados)

| Ad Set | Budget/dia | Nota |
|---|---|---|
| fb_retarget | $3,600 | Todos los ads PAUSED. No activar sin intencion. |
| 5 ad sets AWR | $11,000 total CBO | Todos los ads PAUSED desde 22/04. |
| AS_ENG_C2, AS_ENG_TOP, AS_LEA_C3 | $1,500 + $1,500 + $3,500 | Ads PAUSED. |

---

## 6. Criterios de corte y escalado (sin cambios de v3)

### APAGAR (después de 72h)
- CPS > ARS 100
- CTR < 0.4%
- Frecuencia > 3.5

### ESCALAR (después de 72h)
- CPS < ARS 30 + ER > 3%
- Incremento: +25% cada 48h
- Win 5 días: triple scale

---

## 7. Decision Gates

### Gate 1 — Día 6 (25/04): 72h post-reestructuración

| Métrica | Fuente | Verde | Amarillo | Rojo |
|---|---|---|---|---|
| Follows netos nuevos | IG Insights | > 30 | 10-30 | < 10 |
| ThruPlays (video 75%+) | Ads Manager | > 500/día | 200-500 | < 200 |
| CTR ads AWR | Ads Manager | > 0.5% | 0.3-0.5% | < 0.3% |
| ER reel 4h | Ads Manager | > 5% | 2-5% | < 2% |

Rojo → revisar perfil IG (bio/grid/highlights).

### Gate 2 — Día 10 (29/04): 1 semana

| Métrica | Verde | Amarillo | Rojo |
|---|---|---|---|
| Follows acumulados | > 200 | 50-200 | < 50 |
| ER reel ads | > 3% | 1-3% | < 1% |
| CPS blended | < $80 | $80-$150 | > $150 |

Rojo → Plan B: pausar todo excepto mejor performer, micro-reels 15s, stories 8-10/día.

### Gate 3 — Día 14 (03/05): 2 semanas

| Métrica | Verde | Amarillo | Rojo |
|---|---|---|---|
| Follows acumulados | > 800 | 300-800 | < 300 |
| CPS blended | < $60 | $60-$100 | > $100 |
| Leads C3 (si activo) | > 3 | 1-3 | 0 |

### Gate 4 — Día 21 (10/05)
- Follows > 2,500 → en track. Follows < 1,000 → ajustar expectativas.

### Gate 5 — Día 27 (16/05)
- Target ajustado: 6,500 follows (Jose, dia 12). Techo realista: 3,500-4,500. Reporte final Bruno.

---

## 8. Estrategia creativa (actualizada dia 13)

**Hipotesis video-first FALSADA dia 10.** El WINNER es imagen estatica (corporativo_IG_Cold, CPV $25, ER 6%). Micro-reels en FB tienen CPM 4x mas caro que imagenes.

**Patron ganador identificado:**
- Imagen estatica real (no render, no video)
- Grupo de personas en contexto nautico
- Luz natural, cielo visible
- Sin texto overlay, con logo oficial ENBA
- Formato 4x5 para feed

**Regla operativa nueva (dia 13):** No pausar ningun ad activo sin tener el reemplazo subido y corriendo. El pipeline de creativos tiene que estar siempre lleno.

**Pipeline activo:**
- 4 imagenes estaticas nuevas subidas 01/05 (2 IG + 2 FB)
- REEL-01 pendiente produccion (P1, segunda tanda)
- Lookalike audience LAL1 creada, pendiente test

---

## 9. Proyeccion realista (recalibrada dia 13)

**Objetivo ajustado por Jose:** 6,500 seguidores (antes 10K).

**Datos reales dia 13:** 1,014 follows nuevos (947 FB + 67 IG). CPF FB blended $110. CPV IG $25 pero follow rate 2.7% = CPF implicito $926.

| Escenario | CPF FB | Follows FB | Follows IG | Total final |
|---|---|---|---|---|
| Conservador | $110 | +2,200 | +120 | ~3,330 |
| Con perfil IG mejorado (8% follow rate) | $110 | +2,000 | +500 | ~3,500 |
| Mejor caso (creativos nuevos bajan CPF a $90 + perfil IG mejorado) | $90 | +2,700 | +800 | ~4,500 |

**Techo realista con $241K restantes y 15 dias: 3,500-4,500 seguidores totales.** Llegar a 6,500 requeriria CPF blended de ~$44 — no alcanzable con la estructura actual.

Palancas para mejorar:
1. Creativos nuevos que bajen CPF FB por debajo de $100 (ads subidos hoy)
2. Perfil IG que suba follow rate de 2.7% a >5%
3. Tacticas complementarias: giveaway, reels organicos, micro-influencers

---

## 10. Documentos que este plan reemplaza

| Documento | Estado |
|---|---|
| historico/presupuesto-v3-final.md | **Histórico** — superseded por v4 |
| historico/presupuesto-v2-500k.md | **Histórico** |
| historico/presupuesto.md | **Histórico** |

---

*Bruno — Social Growth & Performance Director + Auditor — Paid Media Auditor*
*22 de abril de 2026 — v4 reestructuracion urgente*
*01 de mayo de 2026 — v4.1 actualizacion dia 13, pivot creativo + hallazgos arquitectura*
