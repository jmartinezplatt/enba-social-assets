# Decisión B v2 — Propuesta ejecutiva

**Fecha:** 16 abril 2026
**Contexto:** rehacer Decisión B desde restricciones reales de Meta Marketing API. Preflight técnico completado.

---

## Hallazgos del preflight (datos duros)

### 1. Budget mínimo real por ad set (ARS) — confirmado vía endpoint oficial

Consultado `GET /act_2303565156801569/minimum_budgets`. Valores actuales para ARS:

| optimization_goal | Mínimo diario ARS | Uso |
|-------------------|-------------------|-----|
| **REACH / IMPRESSIONS / POST_ENGAGEMENT / THRUPLAY / VIDEO_VIEWS** | **$1.393,30** | Awareness, Engagement |
| **OFFSITE_CONVERSIONS / LEAD_GENERATION** | **$3.483,24** | Leads, conversiones |
| **LINK_CLICKS / LANDING_PAGE_VIEWS** | **$27.865,87** | Traffic (al sitio) |

Los valores son dinámicos (Meta los actualiza semanalmente con el tipo de cambio).

### 2. Hallazgo crítico: Traffic no es viable con ARS 250K

$27.865,87/día × 30 días = **$835K**. El mínimo para **un solo** ad set de traffic ya supera 3.3x nuestro presupuesto mensual total. **La campaña `ENBA_Traffic_abr2026` no se puede ejecutar** en esta cuenta con este presupuesto.

### 3. Exclusión de followers/likers — `connections` está deprecated desde marzo 2025

Reemplazo oficial: **100% vía Custom Audiences + `excluded_custom_audiences`**. No hay alternativa nativa en targeting.

- FB Page likers: `page_liked` con `retention_seconds: 0`
- IG followers directos: NO existe evento API (`ig_business_profile_follow` no existe). Lo más cercano: `ig_business_profile_engaged` con retention largo = aproximación (engagers ≠ solo followers).

### 4. Custom Audiences de engagement — esquema real v21.0

Event names válidos:
- **Page:** `page_engaged` (todo engagement), `page_liked`, `page_visited`, `page_post_interaction`, `page_cta_clicked`, `page_messaged`
- **IG Business:** `ig_business_profile_all`, `ig_business_profile_engaged`, `ig_business_profile_visit`, `ig_user_messaged_business`
- **Video:** no usa `event`, usa `subtype: "VIDEO"` con `lookback_event: "50_PERCENT_VIDEO_VIEWS"`
- **Pixel:** `subtype: "WEBSITE"` con filter por url o evento pixel

Mi error anterior: usé nombres que no existen (`ig_business_profile_follow`, `video_view_50_percent`, `page_engaged` con type incorrecto).

### 5. Objectives v21.0 (confirmado)

Los 4 que ya creamos son válidos: `OUTCOME_AWARENESS`, `OUTCOME_ENGAGEMENT`, `OUTCOME_TRAFFIC`, `OUTCOME_LEADS`.

### 6. Interest IDs

De los 79 consultados, **18 son utilizables** y estables. 30+ son matches falsos del search (Sailor Moon, Singapur, Marvel, etc.). Lista depurada abajo.

---

## Tres planes comparados

### PLAN A — Ideal viable

**Qué se ejecuta ahora:** 4 ad sets de Awareness (A2, B1, C1, A3) + 1 ad set de Leads (C3 Corporativo) en PAUSED. Todos con mínimos respetados.

| Ad Set | Campaña | Optimization | Budget/día | Min válido | Estado |
|--------|---------|--------------|------------|------------|--------|
| A2 InterésNavegación | AWR | REACH | $2.000 | ✓ | PAUSED |
| B1 ExperienciasBA | AWR | REACH | $3.000 | ✓ | PAUSED |
| C1 TurismoBA | AWR | REACH | $1.500 | ✓ | PAUSED |
| A3 AspiracionalNáutico | AWR | REACH | $1.500 | ✓ | PAUSED |
| C3 Corporativo | LEA | LEAD_GENERATION | $3.500 | ✓ | PAUSED |

**Total diario si todos corren:** $11.500/día
**Total mensual:** $345K (excede $250K por 38%)

**Custom Audiences:** 3 diferidas a una segunda pasada técnica:
- Web Visitors (Pixel) — schema resuelto, se puede crear
- IG Engagers 90d — schema resuelto (`ig_business_profile_all`)
- FB Page Engagers 90d — schema resuelto (`page_engaged`)

Video Viewers se crea cuando se publique el primer reel.

**Exclusión de followers:** se resuelve creando FB Page Likers Custom Audience (`page_liked`, retention 0) + IG Engagers como proxy. Se pasa vía `excluded_custom_audiences` en cada ad set.

**Ads/Creatives:** bloqueados hasta resolver post_ids del lanzamiento.

### PLAN B — Recortado

Lo que pediste: solo 4 ad sets (A2, B1, C1, A3), los otros diferidos.

| Ad Set | Budget/día |
|--------|------------|
| A2 InterésNavegación | $2.000 |
| B1 ExperienciasBA | $3.000 |
| C1 TurismoBA | $1.500 |
| A3 AspiracionalNáutico | $1.500 |
| **Total** | **$8.000/día** |

**Total mensual si corren 30 días:** $240K (**entra** en $250K — deja $10K de reserva).

**Custom Audiences:** todas diferidas (según tu instrucción).
**Exclusión followers:** diferida — los ads sin exclusión entran en producción en una segunda pasada.
**Ads/Creatives:** bloqueados.

### PLAN C — Plan original con Traffic

No es ejecutable. Queda documentado: `ENBA_Traffic_abr2026` no puede tener ad sets con el budget disponible. Esa campaña queda creada (ya existe en PAUSED) pero **sin ad sets** hasta que aumente el presupuesto o se redefina el rol de traffic en el plan.

---

## Impacto sobre objetivo (10K seguidores en 30 días)

### Qué cambia en capacidad real

| Capacidad | Plan A | Plan B |
|-----------|--------|--------|
| Audiencias de awareness corriendo | 4 + 1 leads | 4 |
| Presupuesto diario si todos corren | $11.500 (excede) | $8.000 (entra) |
| Trafico al sitio pagado | No (inviable por mínimo) | No |
| Retargeting web | Depende de Custom Audiences creadas | No en esta ronda |
| Exclusión de followers existentes | Sí | No (probable leak en ads a gente que ya nos sigue) |
| Captura de leads via ads | Sí (1 ad set C3) | No en esta ronda |

### Qué perdemos si recortamos a Plan B

1. **Leads B2B (Corporativo):** se pierde la captura de empresas/team building que Bruno marcó como ticket alto. Ese vector queda fuera hasta nueva ronda.
2. **Exclusión de followers:** en cuenta nueva con pocos seguidores el impacto es mínimo, pero escala a medida que crezca la cuenta. En mes 1 aceptable.
3. **Flexibilidad de retargeting:** sin Custom Audiences creadas, los primeros 10-14 días la pauta va 100% a audiencia fría. Esto es peor CPS que con retargeting, pero igual es el estado inicial natural.
4. **Diversidad de objetivos:** Plan B solo corre Awareness. Engagement y Leads se activan en segunda ronda.

### Qué queda diferido y por qué

- **Traffic (link clicks al sitio):** **no viable** con presupuesto actual. Requeriría aumentar presupuesto mensual a mínimo $850K para un solo ad set de traffic, o el plan vive sin traffic directo y se mide tráfico via clicks en links de bio/caption (orgánico) + DM conversión.
- **Custom Audiences:** diferidas según instrucción. Schema ya resuelto, se puede hacer en una segunda pasada.
- **Exclusión followers:** diferida. Se hace junto con las Custom Audiences.
- **Ads/Creatives:** bloqueados hasta resolver post_ids del lanzamiento (frente separado).
- **Lookalikes:** diferidos hasta que las Custom Audiences se creen y se pueblen (requieren >100 personas).

---

## Recomendación

**Recomiendo Plan A, no Plan B.**

Razones:

1. **C3 Corporativo aporta un vector comercial no cubierto por ningún otro ad set.** Ticket alto (eventos corporativos > travesías individuales). No agregarlo es dejar dinero en la mesa durante 30 días.

2. **Las 3 Custom Audiences resueltas técnicamente ya son creables hoy.** No hay razón técnica para diferirlas ahora que tengo el schema correcto. Crearlas vacías cuesta lo mismo que crearlas en una segunda pasada, pero las vuelve usables desde día 1 (aunque se pueblen después).

3. **Sin exclusión de followers en el Plan B**, la pauta va a gastar en seguidores actuales cada vez que el audience overlap los captura. Incluso con pocos seguidores, el FB Page tiene likers históricos que sí pueden ser alcanzados. Es un leak real, no teórico.

4. **$345K/mes del Plan A excede por 38%**, pero ese es el total **si todos los ad sets corren 30 días**. En la práctica, el criterio de corte/escalado de Bruno apaga los que rinden mal. Se gasta más cerca del presupuesto real.

5. **Plan A es el ejecutable más cercano al diseño original de Bruno.** Plan B sacrifica capacidad por prudencia que no está validada — la prudencia real se hace con el criterio de corte, no con no crear.

### Si aún preferís Plan B

Es válido. Lo ejecuto sin protesta. Pero quería dejar en claro que **el límite al Plan A no es técnico, es decisión de dirección**.

---

## Criterio de decisión

**Necesito tu elección:**

- **A)** Ejecutar Plan A (5 ad sets + 3 Custom Audiences + exclusión followers en PAUSED)
- **B)** Ejecutar Plan B (solo 4 ad sets en PAUSED, todo lo demás diferido)
- **C)** Reformular presupuesto antes de ejecutar (si querés habilitar Traffic o subir Plan A sin margen)

No avanzo hasta que me definas.

**No hay más prueba y error programado.** Cuando definas, ejecuto con los schemas validados del preflight. Si algo falla en ese punto, será por límites que el preflight no cubrió — no por improvisación.
