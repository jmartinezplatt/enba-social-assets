# Auditoría del Plan de Pauta — Frente 10K

**Auditor:** Paid Media Auditor (Team 4)
**Fecha:** 17 de abril de 2026
**Material auditado:** presupuesto-v2-500k.md, audiencias-ampliadas.md, meta-ids.json, preflight-meta-api.md, diagnostico-inicial.md, kpis.md, meta-business-setup.md, decision-b-v2-propuesta.md
**Autor del plan:** Bruno (Social Growth & Performance Director)

---

## Inventario de lo que existe en Meta (realidad al 17/04)

### Campañas (4)

| ID | Nombre | Objetivo | Estado |
|----|--------|----------|--------|
| 120238976548160139 | ENBA_Awareness_abr2026 | OUTCOME_AWARENESS | PAUSED |
| 120238976548380139 | ENBA_Engagement_abr2026 | OUTCOME_ENGAGEMENT | PAUSED |
| 120238976549000139 | ENBA_Traffic_abr2026 | OUTCOME_TRAFFIC | PAUSED |
| 120238976549780139 | ENBA_Leads_abr2026 | OUTCOME_LEADS | PAUSED |

### Ad Sets (7)

| Key | Nombre | Campaña | Budget/día | Optimization | Estado |
|-----|--------|---------|------------|--------------|--------|
| AS_AWR_B1 | ENBA_Awareness_B1_ExperienciasBA | AWR | $2.500 | REACH | PAUSED |
| AS_AWR_A2 | ENBA_Awareness_A2_InteresNavegacion | AWR | $1.500 | REACH | PAUSED |
| AS_AWR_C1 | ENBA_Awareness_C1_TurismoBA | AWR | $1.500 | REACH | PAUSED |
| AS_AWR_B2 | ENBA_Awareness_B2_OutdoorAventura | AWR | $1.500 | REACH | PAUSED |
| AS_AWR_A3 | ENBA_Awareness_A3_AspiracionalNautico | AWR | $1.500 | REACH | PAUSED |
| AS_ENG_C2 | ENBA_Engagement_C2_RegalosExperienciales | ENG | $1.500 | POST_ENGAGEMENT | PAUSED |
| AS_LEA_C3 | ENBA_Leads_C3_Corporativo | LEA | $3.500 | LEAD_GENERATION | PAUSED |

### Ads (5)

| Key | Nombre | Ad Set | Creative | Estado |
|-----|--------|--------|----------|--------|
| AD_A2_P01 | ENBA_ad_piece01dp_A2 | AS_AWR_A2 | piece-01-darkpost | PAUSED |
| AD_B1_P01 | ENBA_ad_piece01dp_B1 | AS_AWR_B1 | piece-01-darkpost | PAUSED |
| AD_C1_P02 | ENBA_ad_piece02_C1 | AS_AWR_C1 | piece-02-existing | PAUSED |
| AD_B2_P02 | ENBA_ad_piece02_B2 | AS_AWR_B2 | piece-02-existing | PAUSED |
| AD_A3_P03 | ENBA_ad_piece03_A3 | AS_AWR_A3 | piece-03-existing | PAUSED |

### Ad Creatives (3)

| Key | ID | Estado |
|-----|-----|--------|
| piece-01-darkpost | 1292865366142826 | created |
| piece-02-existing | 4224600687684576 | created |
| piece-03-existing | 1902623290399897 | created |

### Custom Audiences (0 funcionales)

- D1 WebVisitors: **FAILED** via API (subtype incorrecto)
- D2 IGEngagers: **FAILED** via API (event name inválido)
- D3 FBEngagers: **FAILED** via API (event name inválido)
- D4 VideoViewers: **DEFERRED** (sin video_id publicado)
- D5 FBPageLikers (exclusión): **FAILED** via API (event name inválido)
- **3 Custom Audiences creadas en UI:** D1 WebVisitors, D2 IGEngagers, D3 FBEngagers (según contexto proporcionado)

### Reel publicado

- IG post_id: 18585972517007777
- FB post_id: 1435389215002068
- Timestamp: 2026-04-17T15:49:36

### Gasto acumulado: $0

---

## Área 1: Identificación de fuentes

### Hallazgos

1. **Todos los objetos mapeados en meta-ids.json coinciden con el plan.** Las 4 campañas, 7 ad sets y 5 ads están documentados con IDs reales.

2. **Falta 1 ad documentado en el plan:** piece-03 debía ir a A3 + B1 según presupuesto-v2-500k.md (sprint día 3: "piece-03 → A3 Aspiracional + B1"). Solo se creó en A3. **Falta el ad de piece-03 en B1.**

3. **Los ad sets en meta-ids.json incluyen errores de targeting en todos (7/7).** Los 7 ad sets se crearon pero todos registran errores de interest IDs inválidos. Esto significa que los ad sets existen como objetos pero sus audiencias de targeting probablemente no están configuradas correctamente.

4. **Custom Audiences: 0 de 5 creadas vía API tuvieron éxito.** Las 5 intentadas fallaron (D1 por subtype, D2/D3/D5 por event name, D4 diferida). Sin embargo, el contexto indica que 3 (D1, D2, D3) se crearon manualmente en la UI de Meta.

5. **Traffic sin ad sets (correcto).** La campaña ENBA_Traffic_abr2026 existe vacía, alineada con la decisión de Bruno de descartar OUTCOME_TRAFFIC.

6. **No hay ad sets de Engagement con destination=website** que el plan menciona como reemplazo de Traffic. El único ad set de Engagement es C2 (Regalos Experienciales) con POST_ENGAGEMENT, no con destination site.

### Gaps identificados

| # | Gap | Severidad |
|---|-----|-----------|
| F-1 | Falta ad piece-03 en B1 | MEDIO |
| F-2 | 7/7 ad sets con errores de interest IDs — targeting no validado | CRITICO |
| F-3 | No existe ad set de Engagement con destination=website (reemplazo de Traffic) | MEDIO |
| F-4 | D4 VideoViewers sigue diferida a pesar de que ya hay reel publicado (video_id disponible) | MENOR |

---

## Área 2: Análisis de estructura

### Hallazgos

1. **Estructura de campañas bien definida.** 3 campañas activas (AWR, ENG, LEA) + 1 reserva (TRF). Separación por objetivo es correcta y evita conflictos de optimization.

2. **5 de 7 ad sets están bajo AWR.** Esto concentra la competencia interna: los 5 ad sets de Awareness comparten el mismo objective y compiten entre sí por la subasta. Meta asigna delivery usando su propio criterio, no la proporción de budgets. Un ad set con mejor predicted CTR puede absorber delivery de los demás.

3. **Engagement tiene 1 solo ad set (C2).** Es inconsistente con el plan v2 que asigna 42% del presupuesto ($210K) a Engagement. Con un solo ad set de $1.500/día, Engagement ejecuta $45K/mes máximo — lejos de los $210K planificados.

4. **Leads tiene 1 ad set (C3) a $3.500/día.** Consistente con el plan. Budget mensual de ~$105K excede los $70K planificados, pero como tiene criterio de activación tardía (día 8), el gasto real sería menor.

5. **No hay ad sets para LAL ni retargeting.** El plan los activa en días 10-14, así que es prematuro crearlos. Pero no hay ningún trigger o proceso documentado para crearlos cuando llegue el momento.

### Gaps identificados

| # | Gap | Severidad |
|---|-----|-----------|
| E-1 | 42% del presupuesto asignado a Engagement ($210K) pero solo $45K en estructura real | CRITICO |
| E-2 | No hay proceso/trigger documentado para crear ad sets de LAL y retargeting en día 10-14 | MEDIO |
| E-3 | 5 ad sets de Awareness compiten internamente sin que el plan lo reconozca | MENOR |

---

## Área 3: Auditoría de segmentación y pujas

### Hallazgos

1. **Todos los interest IDs usados en la creación de ad sets son inválidos.** Los 7 ad sets registran error "El interés con el identificador X no es válido" en meta-ids.json. Esto significa que la segmentación por intereses no está operativa en ningún ad set. Si se activan tal cual, Meta va a servir a audiencia abierta (broad) o rechazar el delivery.

2. **El preflight documentó 18 interest IDs recomendados.** Pero no hay evidencia de que esos 18 IDs se hayan aplicado a los ad sets existentes. Los IDs que fallaron son distintos a los 18 recomendados.

3. **Mínimos de Meta respetados en todos los ad sets.** Cada ad set tiene budget diario >= al mínimo correspondiente a su optimization_goal.

4. **Leads (C3) con mínimo ajustado.** $3.500/día vs mínimo $3.483. Margen de $17 — funcional pero frágil. Si Meta actualiza el mínimo semanalmente (como indica preflight), un ajuste menor podría dejar al ad set por debajo del mínimo.

5. **El preflight dice que LEAD_GENERATION tiene mínimo entre $5.600-$7.000** (sección 1, tabla de "Orden de magnitud esperado"), pero el endpoint real devolvió $3.483. Hay inconsistencia interna en el documento de preflight. El dato del endpoint es el correcto, pero la discrepancia genera confusión.

6. **Exclusión de followers no implementada.** Las Custom Audiences de exclusión no se crearon vía API (todas fallaron). Las 3 creadas en UI (D1, D2, D3) no son de exclusión sino de retargeting. No existe la Custom Audience `page_liked` con retention 0 para excluir followers de FB. No existe proxy de exclusión para IG followers.

7. **Overlap entre audiencias.** Bruno documentó una matriz de overlap (audiencias-ampliadas.md) con reglas de exclusión cruzada. Pero los ad sets no tienen `excluded_custom_audiences` configuradas (las Custom Audiences necesarias no existen). Tampoco hay exclusión por intereses entre ad sets.

### Gaps identificados

| # | Gap | Severidad |
|---|-----|-----------|
| S-1 | 7/7 ad sets con targeting de intereses inválido — no se puede activar ninguno | CRITICO |
| S-2 | Exclusión de followers no implementada | MEDIO |
| S-3 | Exclusión cruzada entre audiencias no implementada | MEDIO |
| S-4 | Margen de C3 sobre mínimo de LEAD_GEN es de $17 — riesgo de quiebre si Meta ajusta | MENOR |
| S-5 | Inconsistencia en preflight: tabla estima LEAD_GEN $5.600-$7.000 pero endpoint real dice $3.483 | MENOR |

---

## Área 4: Revisión creativa

### Hallazgos

1. **3 creatives creados correctamente.** piece-01 como darkpost (imagen subida como ad_image), piece-02 y piece-03 como existing posts. Las 3 piezas del sprint están listas como creatives.

2. **Asignación pieza-audiencia tiene criterio.** piece-01 (manifesto) a A2+B1 (las más amplias), piece-02 (ubicación) a C1+B2 (turismo + outdoor), piece-03 (humano) a A3 (aspiracional). Hace sentido estratégico.

3. **No hay A/B test de creative dentro de un mismo ad set.** Cada ad set tiene un solo ad. Para testear creatividades habría que tener 2+ ads por ad set. El Test 1 del plan (B1 vs A2 con misma pieza piece-01) es un test de audiencia, no de creative.

4. **El reel "4 horas en el río" ya está publicado** (IG + FB) pero no tiene ad creative ni ad asociado. El plan de Bruno (sección 8, punto 4) dice "el ad del reel se puede crear cuando el reel se publique orgánicamente". Ya se publicó — falta crear el ad.

5. **Solo 3 piezas en pauta.** Con 30 piezas disponibles y 3 carruseles, la rotación creativa del plan inicial es extremadamente limitada. El plan de presupuesto menciona "carrusel cuanto-sale el sábado 18" pero no hay ad set ni ad para carruseles.

6. **No hay lead form para C3 Corporativo.** El ad set AS_LEA_C3 usa LEAD_GENERATION, lo que requiere un Instant Form vinculado al ad. No hay evidencia de que se haya creado un lead form.

### Gaps identificados

| # | Gap | Severidad |
|---|-----|-----------|
| C-1 | Reel publicado pero sin ad/creative asociado — plan dice crearlo al publicar | MEDIO |
| C-2 | No hay lead form para LEAD_GENERATION en C3 | CRITICO |
| C-3 | Rotación creativa limitada a 3 piezas, sin plan de incorporación de nuevas | MENOR |
| C-4 | No hay A/B de creative dentro de ad sets | MENOR |

---

## Área 5: Optimización del presupuesto

### Hallazgos

1. **El plan numérico no cierra con la estructura real.** La distribución de presupuesto-v2-500k.md asigna:
   - Awareness 35% = $175K
   - Engagement 42% = $210K
   - Leads 14% = $70K
   - Reserva 9% = $45K

   Pero la estructura real tiene:
   - Awareness (5 ad sets): $8.500/día x 30 = $255K (excede 35%)
   - Engagement (1 ad set): $1.500/día x 26 días (desde día 5) = $39K (lejos de 42%)
   - Leads (1 ad set): $3.500/día x 23 días (desde día 8) = $80.5K (excede 14%)
   - Total si todos corren sus días: $374.5K (sin contar LAL ni retargeting)

   **El gap de Engagement es de $171K** — no hay estructura para ejecutar esos fondos.

2. **La tabla de activación por audiencia (sección 4 del presupuesto v2) suma $468.5K si todos corren sus días asignados.** Pero eso incluye Retargeting Web Visitors, LAL IG Engagers 1% y LAL Nautica Activa 1% que no tienen ad sets creados ni Custom Audiences source funcionales.

3. **Sprint días 1-3 nunca ocurrió como planificado.** El plan decía: 15/04 piece-01 $25K, 16/04 piece-02 $15K, 17/04 piece-03 $15K = $55K sprint. En realidad, las 3 piezas se publicaron el 17/04, todas el mismo día, y los ads están en PAUSED con $0 gastado. Los $100K de semana 1 están intactos a día 3 de la semana.

4. **Semana 1 ya empezó (15-21 abr) con $0 ejecutado.** Quedan 4 días para gastar $100K de semana 1. Eso requeriría $25K/día — posible con la estructura actual ($8.5K de awareness + ad sets faltantes), pero requiere activar TODO de golpe en vez del arranque escalonado planificado.

5. **Impuestos: con $500K neto, el débito real es ~$700K.** El plan lo menciona (sección "Nota sobre impuestos") pero no hay confirmación de que la tarjeta soporte ese límite. El plan original ($250K) hablaba de $350K de débito; ahora son $700K.

### Gaps identificados

| # | Gap | Severidad |
|---|-----|-----------|
| P-1 | $171K asignados a Engagement sin estructura para ejecutarlos | CRITICO |
| P-2 | Sprint semana 1 no ejecutado: $0 de $100K planificados con 4 días restantes | CRITICO |
| P-3 | No hay confirmación de que la tarjeta soporte $700K de débito | MEDIO |
| P-4 | Plan de activación escalonada (día 1, 2, 3, 5, 8...) ya no es viable — los 3 primeros días se perdieron | MEDIO |

---

## Área 6: Verificación de conversiones

### Hallazgos

1. **GA4 y Pixel funcionando en producción** (confirmado en contexto). Eventos PageView se registran.

2. **No hay evidencia de eventos custom configurados.** El setup original (meta-business-setup.md) lista ViewContent, Contact, Lead, Schedule como eventos a configurar, más custom events (contact_click, whatsapp_click, scroll_depth). No hay confirmación de que estén activos.

3. **UTMs no mencionados en ningún ad.** Los 5 ads existentes no tienen UTMs documentados. Sin UTMs, GA4 no puede atribuir tráfico de ads correctamente.

4. **Custom Audiences no se pueblan.** Las 3 creadas en UI (D1 WebVisitors, D2 IGEngagers, D3 FBEngagers) deberían estar poblándose automáticamente si se configuraron correctamente. Pero sin confirmación de tamaño actual, es incierto.

5. **D4 VideoViewers ya es creable.** El reel tiene video_ids publicados (IG + FB). El plan la difería por falta de video publicado; esa condición ya se cumplió.

6. **Lead form para C3 no verificado.** Si no existe, LEAD_GENERATION no puede capturar datos. Los leads irían a la nada.

### Gaps identificados

| # | Gap | Severidad |
|---|-----|-----------|
| V-1 | Eventos custom del Pixel (ViewContent, Contact, Lead, etc.) no verificados | MEDIO |
| V-2 | UTMs no configurados en ads | MEDIO |
| V-3 | D4 VideoViewers creable pero no creada (reel ya publicado) | MENOR |
| V-4 | Tamaño de Custom Audiences D1/D2/D3 desconocido | MENOR |

---

## Área 7: Gaps operativos

### Hallazgos

1. **Nada se puede activar tal cual.** Los 7 ad sets tienen targeting inválido. Los 5 ads dependen de ad sets con targeting roto. Las Custom Audiences de exclusión no existen. El lead form de C3 no existe. Si alguien activa los ads mañana, Meta o los rechaza o los corre con targeting broad (sin los intereses segmentados que Bruno diseñó).

2. **El plan de presupuesto v2 ($500K) se escribió el 16/04, pero no se actualizó la estructura en Meta.** Los ad sets creados tienen budgets del Plan B original (decision-b-v2-propuesta.md), no del presupuesto v2. Ejemplo: B1 tiene $2.500/día en Meta pero el presupuesto v2 no define budgets por ad set (solo por audiencia, y B1 aparece como $2.500 en la tabla de sección 4).

3. **Documentos con números de presupuestos distintos no reconciliados:**
   - diagnostico-inicial.md: $250K
   - audiencias-ampliadas.md: $250K (tabla de redistribución)
   - presupuesto-v2-500k.md: $500K
   - decision-b-v2-propuesta.md: $250K (con mención de que excede)
   - Los documentos previos ($250K) nunca se actualizaron para reflejar los $500K

4. **El plan de activación escalonada requiere re-planificación.** El día 1 era el 15/04. Hoy es 17/04 (día 3). Los ad sets que debían activarse día 1 (B1, A2, B2, C1) siguen en PAUSED. A3 debía activarse hoy (día 3). C2 el día 5 (19/04). **El cronograma completo necesita re-baseline desde el día de activación real.**

5. **Dependencia no resuelta: post_ids para ads.** Los 5 ads que existen usan 3 creatives. piece-01 es darkpost (ok), piece-02 y piece-03 son "existing" (usan post_ids de publicaciones orgánicas). Si esos posts no existen o fueron publicados sin ads_management, los creatives podrían no servir para ads.

6. **Reel como ad: no hay plan concreto.** El reel se publicó hoy. Bruno dice que se puede crear ad cuando se publique. Ya se publicó. No hay instrucción concreta de: en qué campaña va, con qué ad set, con qué targeting, con qué budget. Es una pieza suelta.

7. **Carruseles en pauta: no hay plan.** El presupuesto v2 menciona "carrusel cuanto-sale sábado 18 con $20K" pero no hay ad set ni ad para carruseles. La publicación de carruseles vía API para ads tiene requisitos específicos (creative con child_attachments) que no se mencionan.

8. **El plan no define quién activa los ads.** Todo está en PAUSED. El plan dice "Manu coordina ejecución" pero no hay instrucción de "el día X, activar los ad sets Y y Z". Los criterios de activación están dispersos entre presupuesto-v2 y audiencias-ampliadas con fechas que ya pasaron.

9. **Preflight no valido interest IDs a usar.** El preflight (sección 5) recomienda validar IDs con `targeting_option_list` antes de lanzar. No se hizo. Los 18 IDs recomendados no se probaron contra la API.

### Gaps identificados

| # | Gap | Severidad |
|---|-----|-----------|
| O-1 | Ningún ad set es activable — targeting roto en 7/7 | CRITICO |
| O-2 | Plan de activación escalonada vencido — requiere re-baseline | CRITICO |
| O-3 | No hay lead form para C3 LEAD_GENERATION | CRITICO |
| O-4 | No hay ad sets de Engagement con destination=website para cubrir 42% del budget | CRITICO |
| O-5 | Interest IDs recomendados en preflight no validados contra API | MEDIO |
| O-6 | Reel publicado sin plan concreto de ad (campaña, ad set, targeting, budget) | MEDIO |
| O-7 | Carrusel del 18/04 ($20K) sin infraestructura de ad | MEDIO |
| O-8 | Documentos previos ($250K) no actualizados a $500K — genera confusión | MEDIO |
| O-9 | No hay instrucción operativa de quién activa qué y cuándo | MEDIO |
| O-10 | Límite de tarjeta para $700K no confirmado | MEDIO |

---

## Consolidado de gaps por severidad

### CRITICO (7)

| # | Gap | Área |
|---|-----|------|
| S-1 | 7/7 ad sets con targeting de intereses inválido | Segmentación |
| E-1 | $171K asignados a Engagement sin estructura real | Estructura |
| P-1 | $171K sin vehículo de ejecución | Presupuesto |
| P-2 | Sprint semana 1: $0 de $100K con 4 días restantes | Presupuesto |
| O-1 | Ningún ad set activable tal cual | Operativo |
| O-2 | Cronograma escalonado vencido | Operativo |
| C-2 / O-3 | No hay lead form para LEAD_GENERATION | Creativo / Operativo |

### MEDIO (11)

| # | Gap | Área |
|---|-----|------|
| F-1 | Falta ad piece-03 en B1 | Fuentes |
| F-3 | No hay ad set Engagement destination=website | Fuentes |
| E-2 | No hay proceso para crear ad sets LAL/retargeting en día 10-14 | Estructura |
| S-2 | Exclusión de followers no implementada | Segmentación |
| S-3 | Exclusión cruzada entre audiencias no implementada | Segmentación |
| C-1 | Reel publicado sin ad asociado | Creativo |
| P-3 | Tarjeta $700K no confirmada | Presupuesto |
| P-4 | Activación escalonada ya no viable como planificada | Presupuesto |
| V-1 | Eventos custom Pixel no verificados | Conversiones |
| V-2 | UTMs no configurados en ads | Conversiones |
| O-5 a O-10 | Varios operativos (ver detalle arriba) | Operativo |

### MENOR (7)

| # | Gap | Área |
|---|-----|------|
| F-4 | D4 VideoViewers creable pero no creada | Fuentes |
| E-3 | 5 ad sets AWR compiten internamente | Estructura |
| S-4 | Margen de C3 sobre mínimo LEAD_GEN: $17 | Segmentación |
| S-5 | Inconsistencia interna en preflight (tabla vs endpoint) | Segmentación |
| C-3 | Rotación creativa limitada a 3 piezas | Creativo |
| C-4 | No hay A/B de creative dentro de ad sets | Creativo |
| V-3 / V-4 | D4 creable, tamaño D1/D2/D3 desconocido | Conversiones |

---

## Preguntas concretas para Bruno

### Sobre estructura y ejecución

1. **Los 7 ad sets tienen interest IDs inválidos.** Los 18 IDs que recomendaste en preflight nunca se aplicaron. ¿Se validaron contra `targeting_option_list`? ¿Se actualizaron los ad sets con los IDs correctos, o están tal cual se crearon con los IDs que fallaron?

2. **$210K asignados a Engagement pero solo un ad set de $1.500/día ($45K máximo).** ¿Dónde se ejecutan los otros $165K? ¿Faltan ad sets de Engagement por crear? ¿El plan contemplaba ad sets de Engagement con destination=website que nunca se crearon?

3. **El lead form para C3 (LEAD_GENERATION): ¿existe?** Sin Instant Form, el ad set no puede capturar leads. ¿Está creado en Ads Manager? ¿Qué campos tiene?

### Sobre timing

4. **El sprint de semana 1 ($100K, 15-21 abr) lleva $0 ejecutados al día 3.** ¿El plan se re-baseline o los $100K se comprimen en los 4 días restantes? ¿Se redistribuyen a semanas 2-4?

5. **El carrusel cuanto-sale tiene pauta de $20K para el 18/04 (mañana).** ¿Hay infraestructura para pautarlo? No hay ad set ni ad de carrusel en meta-ids.json.

6. **El reel "4 horas en el río" ya se publicó.** Tu plan dice crear el ad cuando se publique. ¿A qué campaña va? ¿Qué ad set? ¿Qué audiencia? ¿Qué budget?

### Sobre presupuesto

7. **¿Se confirmó el límite de la tarjeta para $700K?** El plan lo menciona como pre-requisito pero no hay confirmación.

8. **Los documentos de audiencias-ampliadas.md y diagnostico-inicial.md trabajan con $250K.** ¿Quedan obsoletos o se leen ajustando proporciones al doble? Las tablas de CPS, redistribución y tiers tienen números de $250K.

### Sobre exclusiones

9. **Exclusión de followers: ¿está operativa?** Las Custom Audiences de exclusión fallaron vía API. Las 3 creadas en UI son para retargeting, no para exclusión. ¿Se creó la audience `page_liked` retention 0? ¿Se pasó como `excluded_custom_audiences` en los ad sets?

10. **Exclusión cruzada entre audiencias (A1 excluida de A2/A3, etc.): ¿implementada?** Bruno documentó reglas de exclusión en audiencias-ampliadas.md pero los ad sets no tienen `excluded_custom_audiences`.

---

## Veredicto

**GAPS DETECTADOS — No es ejecutable tal cual.**

El plan de Bruno es estratégicamente sólido. El diagnóstico, la definición de audiencias, la decisión de descartar Traffic, el framework de corte/escalado, y los KPIs son trabajo de calidad. El problema no es la dirección sino la implementación.

**La brecha entre el plan escrito y lo que existe en Meta es demasiado grande para activar.** Los 7 ad sets tienen targeting roto. El 42% del presupuesto ($210K de Engagement) no tiene estructura. El cronograma escalonado ya caducó. No hay lead form para C3. Las exclusiones no están implementadas.

**Para pasar a ejecutable se necesita:**

1. Validar los 18 interest IDs contra `targeting_option_list` y actualizar los 7 ad sets con targeting funcional.
2. Crear ad sets de Engagement (destination=website y/o POST_ENGAGEMENT con piezas orgánicas) para cubrir los $210K planificados.
3. Crear el lead form de C3 (Instant Form con campos relevantes para eventos corporativos).
4. Re-baseline el cronograma de activación desde el primer día real de ads activos.
5. Implementar exclusiones (page_liked retention 0 para FB, ig_business_profile_engaged como proxy IG) y pasarlas como excluded_custom_audiences.
6. Definir plan concreto para el reel como ad (campaña, ad set, targeting, budget).
7. Confirmar límite de tarjeta para $700K.

Hasta que se resuelvan al menos los ítems 1, 2, 3 y 4, no hay plan de pauta ejecutable. Hay un plan de pauta escrito y una estructura en Meta que no coinciden.

---

*Paid Media Auditor — Team 4, ENBA*
*17 de abril de 2026*
