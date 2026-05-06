# Carlos — Estrategia de Tráfico IG v1

**Fecha:** 05/05/2026 — Día 17/27 del plan
**Owner:** Carlos (Trafficker Digital & Paid Media Specialist)
**Estado:** P1 aprobado por Jose — pendiente ejecución Nico
**Revisión de hipótesis:** 08/05/2026 (72hs)
**ClickUp:** task en Folder "ENBA Redes" > List "Estrategia & Audiencias"

---

## 1. Diagnóstico raíz

El CPF implícito de IG es $852 por dos problemas apilados, no uno:

| Problema | Variable | Valor actual | Benchmark |
|---|---|---|---|
| Costo de traer la visita | CPV | $23 (corporativo) | $10–$30 — ACEPTABLE |
| Conversión visita → follow | Follow rate | 2.7% | 3–8% |
| **Resultado** | **CPF implícito** | **$852** | $150–$300 |

El targeting no está roto. Con Advantage+ Audience y CPV $23 estamos dentro del rango. El problema
es que de cada 100 personas que llegan al perfil, solo 2.7 siguen.

**Sensibilidad del CPF al follow rate (con CPV $23 constante):**

| Follow rate | CPF implícito |
|---|---|
| 2.7% (actual) | $852 |
| 4% | $575 |
| 6% | $383 |
| 8% | $288 |
| 10% | $230 |

Mejor targeting mejora marginalmente el follow rate (audiencia más calificada → más propensa a seguir),
pero el techo lo pone el perfil + social proof. El trabajo de targeting que propongo ataca principalmente
el volumen y la calidad de la audiencia, no va a resolver el follow rate por sí solo.

---

## 2. Audiencias propuestas

### A — LAL desde D4 (Video Viewers)

**Quién es:** personas similares al 1% de Argentina más parecido a quienes ya completaron 50%+ de
videos de ENBA (D4, 11.678 ThruPlays). Base mucho más representativa que LAL1 (desde ~1.000 FB likers).

**Justificación náutica:** D4 representa intención de consumo de contenido náutico ENBA activo y reciente.
Un LAL desde esa base va a encontrar personas que se parecen a quienes ya mostraron interés sostenido.

**Cómo encontrarlo:**
- Crear Lookalike 1% AR desde `ENBA_Custom_VideoViewers_30d` (ID `120239146204050139`)
- Nombre: `ENBA_LAL_1pct_VideoViewers` (LAL2)
- Desde Ads Manager UI: Audiences → Create Audience → Lookalike → Source: D4 → País: AR → 1%

**Dónde mostrarlo:** IG Feed + IG Reels. Exclusión D6 (IGFollowers).

**Cómo guardarlo:** queda automáticamente como Custom Audience en Ads Manager una vez creada.
ID a registrar en meta-ids.json como LAL2.

**Uso inmediato:** reemplazar LAL1 por LAL2 en ig_test_NAU (P2, cuando LAL2 esté lista).

---

### B — Audiencias indirectas "outdoor BA"

**Quién es:** porteños 25–45 años que buscan planes activos para el finde. No se identifican como náuticos
pero responden positivamente a velero + sol + río + gente pasándola bien.

**Justificación náutica:** en mayo/junio es fin de temporada náutica en AR — los intereses náuticos puros
se achican. Ampliar el tope del funnel con públicos indirectos da más volumen a menor CPV potencial.

**Intereses a testear (verificar disponibilidad en Meta antes de crear el ad set):**

| Interés | Prioridad |
|---|---|
| Windsurf / Kiteboarding | Alta — deporte acuático directo |
| Turismo de aventura | Alta — perfil outdoor |
| Actividades al aire libre + ubicación Buenos Aires | Alta |
| Vela (sailing) — si no está deprecado | Alta |
| Paracaidismo / Senderismo (adventure sports) | Media |
| Viajes y turismo + Buenos Aires + 25-45 | Media |

**Dónde mostrarlo:** IG Feed + IG Reels. Exclusión D6.

**Cómo guardarlo:** crear D7 (IG Engagers frescos 30d desde estos ads) para retarget futuro.

**Timing:** P3 — semana 4 del plan. No antes para no diluir aprendizajes de P1/P2.

---

### C — Expansión ig_retarget (D1 + D3)

**Problema actual:** ig_retarget tiene D2 (IG Engagers 90d, `too_small`) + D4. La audiencia es insuficiente
para gastar el budget asignado ($1.500/día) — probable underspend.

**Solución:** agregar D1 (WebVisitors_30d) + D3 (FBEngagers_90d) al targeting del ad set.

| Audiencia | ID | Estado | Justificación |
|---|---|---|---|
| D1 — WebVisitors_30d | `120239059710310139` | delivery: ready | Visitó el sitio web → intención directa |
| D3 — FBEngagers_90d | `120239060128140139` | delivery: ready | Interactuó con contenido FB → audiencia caliente |

**Dónde mostrarlo:** ig_retarget existente. No crear ad set nuevo — solo modificar targeting.

**Cómo guardarlo:** no requiere nueva audiencia. D1 y D3 ya existen en meta-ids.json.

---

## 3. Plan de targeting post-follow

| Audiencia | Estado | Para qué uso | Cuándo |
|---|---|---|---|
| D5 (FBPageLikers) | Activa ~1.000 | Exclusión cold, LAL1 ya creada | Ahora |
| D6 (IGFollowers) | Activa ~100 | Exclusión cold, retarget venta | Ahora |
| LAL1 desde D5 | Activa | fb_cold prospecting | Activa en ig_test_NAU |
| LAL2 desde D4 | **Crear P1** | ig_cold prospecting calificado | Crear hoy |
| LAL3 desde D6 | Pendiente (D6 ≥ 1.000) | Prospecting de alta calidad IG | Cuando IG tenga 1.000+ seguidores |
| D7 — IG Engagers frescos | Pendiente | Nurturing y retarget de venta | Semana 4 |

**Regla de nurturing por antigüedad del follow:**
- 0–30 días: solo contenido orgánico (stories + feed). No ads de conversión.
- 30–60 días: retarget suave con experiencias específicas (travesías, escuela).
- +60 días: retarget de conversión directa (DM, formulario consulta).

---

## 4. Plan de implementación

| Prioridad | Acción | Quién ejecuta | Fecha | Estado |
|---|---|---|---|---|
| **P1** | Crear LAL2 desde D4 | Nico via API | 05/05 | ✅ DONE — ID `120240030647240139` |
| **P1** | Agregar D1+D3 a ig_retarget | Nico via API | 02/05 | ✅ YA ESTABA — verificado API 05/05 |
| P2 | Reemplazar LAL1 por LAL2 en ig_test_NAU | Nico via API | 06/05 (~24hs) | ⏳ Pendiente — LAL2 necesita procesarse |
| P3 | Testear audiencia "outdoor BA" — ad set $1.000/día | Nico via API | Semana 4 | ⏳ Pendiente |
| P4 | Brief creativo retarget "Ya nos conocés" | Dani + Sole | Semana 4 | ⏳ Pendiente |

---

## 5. Hipótesis con criterio de validación — revisión 08/05 (72hs)

### H1 — LAL2 desde D4 en ig_test_NAU
> **Hipótesis:** LAL 1% desde D4 producirá CPV ≤ $30 y follow rate ≥ 4% (vs 2.7% actual),
> resultando en CPF implícito ≤ $750.

| Criterio | Verde | Rojo |
|---|---|---|
| CPV a 72hs | ≤ $30 → escalar a $2.000/día | > $40 → pausar, mantener solo Advantage+ |
| Follow rate | ≥ 4% | < 2.5% |

**Resultado real (completar 08/05):** CPV: ___ / Follow rate: ___ / Decisión: ___

---

### H2 — Expansión ig_retarget con D1+D3
> **Hipótesis:** agregar D1+D3 al targeting de ig_retarget eliminará el underspend y producirá
> follow rate ≥ 6% (audiencia caliente).

| Criterio | Verde | Rojo |
|---|---|---|
| Gasto efectivo a 72hs | ≥ $1.200/día (80% del budget) | Underspend persiste → audiencia combinada too_small |
| Follow rate | ≥ 5% | < 3% |

**Resultado real (completar 08/05):** Gasto: ___ / Follow rate: ___ / Decisión: ___

---

### H3 — Audiencia "outdoor BA" (P3, pendiente)
> **Hipótesis:** público "outdoor + turismo activo + pareja + 25-45 BA" producirá CPV ≤ $35
> (vs $23 corporativo) con mayor volumen de alcance y follow rate ≥ 3%.

| Criterio | Verde | Rojo |
|---|---|---|
| CPV a 72hs | ≤ $35 → mantener y escalar semana 4 | > $45 → pausar |
| Follow rate | ≥ 3% | < 2% |

**Resultado real (completar al activar P3):** CPV: ___ / Follow rate: ___ / Decisión: ___

---

## 6. Lo que NO cambia (por decisión explícita)

- **ig_cold / corporativo_IG_Cold:** WINNER con Advantage+. No tocar hasta tener reemplazo.
  Cambiar targeting ahora rompería learning phase.
- **Presupuesto IG total:** no escalar hasta que follow rate mejore. Más gasto con 2.7% = más desperdicio.
- **FB sigue siendo canal principal de follows** hasta que IG tenga más social proof.

---

## 7. Historial de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| v1 | 05/05/2026 | Plan inicial — P1 aprobado por Jose |
| v1.1 | 05/05/2026 | Ejecución P1: LAL2 creada via API (ID `120240030647240139`). Acción 2 (D1+D3 en ig_retarget) ya estaba ejecutada desde 02/05 — verificado API. P2 pendiente ~24hs para procesamiento LAL2. |
