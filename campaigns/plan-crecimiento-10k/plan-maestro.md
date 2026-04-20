# Plan Maestro — Crecimiento 10K seguidores en 30 dias

**Autor:** Manu (Coordinador de Produccion)
**Fecha original:** 15 de abril de 2026
**Ultima actualizacion:** 20 de abril de 2026
**Periodo:** 20 de abril - 16 de mayo de 2026 (27 dias, re-baselineado al primer gasto real)
**Plan de pauta vigente:** `presupuesto-v3-final.md` (fuente de verdad de pauta, reemplaza este resumen)
**Fuentes:** diagnostico-inicial (Bruno), estrategia-instagram (Franco), estrategia-facebook (Franco), analisis-reels (Marina), review-estrategia-ig (Marina), meta-business-setup (Bruno), google-analytics-medicion (Bruno), kpis (Bruno), presupuesto-v3-final (Bruno), reporte-semanal-template (Bruno), calendario-integrado.json

---

## 1. Resumen ejecutivo

**Objetivo declarado:** 10.000 seguidores en IG + FB en 27 dias.

**Target realista:** 7.000-10.000 seguidores (Bruno, presupuesto-v3, probabilidad 35-50%). Piso minimo: 5.900 pagados + 2.500 organicos.

**Presupuesto pauta:** ARS 500.000 neto para Meta Ads. Debito real en tarjeta ~ARS 700.000 (impuestos argentinos ~40%). Tarjeta Mastercard ····8307, limite confirmado. **500K es solo pauta, produccion es gasto aparte (confirmado 19/04).**

**Contenido disponible (actualizado 19/04):**
- 30 piezas estaticas: en staging, publicacion diaria via n8n. Pieces 01-05 ya publicadas.
- 3 carruseles organicos: slides renderizados, captions aprobados, QA PASS. Script `publish-carousel.mjs` listo.
- Reel "4 horas en el rio": editado, publicado IG+FB 17/04, corriendo como ad de engagement.
- Reel "primera vez": guion listo, material crudo + material de colega disponible, direccion creativa Marina (score 9/10), pendiente edit-sheet y edicion.
- 65 assets curados en asset-bank.
- Cortes de pauta reel 4h: 30s y 15s listos.

**Infraestructura (actualizado 19/04):**
- n8n workflow publicacion diaria activo (12:15 ART, ID `MipwleZNu8EG5v6C`, v7.2, 34 nodos). URLs de imagen apuntan a `enba-social-assets.pages.dev` (no custom domain, por bloqueo Cloudflare a crawler IG).
- n8n workflow evaluacion ads diaria activo (9:00 ART, ID `1qRywsEWAl7VoO5o`).
- Meta Ads: 2 campanas ACTIVE (AWR + ENG), 6 ad sets ACTIVE, 7 ads ACTIVE, $11.500/dia.
- Darkpost C2 Regalos creado (PAUSED, activacion 23/04).
- Credenciales n8n: Meta API ENBA (page token), Meta Ads API ENBA (ads token), Gmail ENBA.
- GA4 instalado (G-XVN36KPHBL), Pixel Event Data activo (1273048378266952).
- Dominio autorizado en Events Manager.

**Distribucion de pauta:** ver `presupuesto-v3-final.md` seccion 3 (tabla semanal con $500K, curva 20/28/32/20).

**Split plataformas (Bruno):** IG 75% / FB 25%. Revision dia 10 (28/04).

---

## 2. Decisiones del usuario — Estado

Todas las decisiones originales fueron resueltas. Pendientes nuevos al final.

| # | Decision | Estado | Respuesta |
|---|----------|--------|-----------|
| 1 | Presupuesto: solo pauta o incluye produccion? | **RESUELTO 19/04** | $500K solo pauta. Produccion es gasto aparte. |
| 2 | Filmacion de reels | **RESUELTO 17/04** | Reel "4 horas" filmado, editado y publicado. Reel "primera vez" tiene material crudo + material de colega. |
| 3 | Meta Business Manager | **RESUELTO 16/04** | Existe. Business ID 814334400927137, Ad Account act_2303565156801569. |
| 4 | GA4 instalado? | **RESUELTO 19/04** | Si, G-XVN36KPHBL en enba-web/index.html. |
| 5 | Accesos IG y FB | **RESUELTO** | Jose tiene todos los accesos. |
| 6 | Equipo de filmacion | **RESUELTO** | No se compro gimbal. Se filmo con celular, calidad aceptable. |
| 7 | Engagement manual | **RESUELTO 19/04** | Jose con su gente. |

### Decisiones pendientes nuevas (19/04) — Estado

| # | Decision | Estado | Respuesta |
|---|----------|--------|-----------|
| 8 | Que creative para C3 Corporativo (lead gen)? | **RESUELTO 19/04** | Lead form v2 (944664581514608) + creative con grupo-cockpit-cielo-azul-4x5.jpg + copy Sole. Campana C_LEA + ad set C3 + ad ACTIVE. |
| 9 | Cuando publicar carruseles organicos? | **RESUELTO 19/04** | cuanto-sale publicado IG (carrusel) + FB (slide-04 imagen unica) 19/04. no-es-tour 24/04. elegi-aventura 03/05. FB no soporta carruseles organicos: se publica slide hero como imagen unica (decision Marina). |
| 10 | Acceso a Google Photos | **EN PROGRESO** | Jose trabajando en compartir album. |
| 11 | Ad sets B1 y C1 sin gasto | **PENDIENTE** | 5 de 7 ad sets gastando. B1 ExperienciasBA y C1 TurismoBA siguen en $0 después del onboarding fix (20/04). Sin diferencias de config vs los que sí gastan. Verificar próxima sesión — si siguen en $0, evaluar duplicarlos. |

### Acciones sesion 19/04 (tarde)

- User token regenerado con 19 permisos (agregados: pages_manage_ads, leads_retrieval, pages_read_user_content, instagram_manage_insights, instagram_manage_comments, read_insights, pages_manage_metadata, catalog_management)
- Lead form v1 archivado, v2 creado (thank you page → home en vez de /travesias)
- TOS de lead gen aceptados en FB
- Ad C3 Corporativo creado y activado: campana C_LEA + ad set AS_LEA_C3 + ad AD_C3_CORP ACTIVE, $3.500/dia
- Carrusel cuanto-sale publicado IG (6 slides) + FB (slide-04 imagen unica, caption variante 4 de Sole)
- Regla FB: no publicar carruseles como album. Publicar slide hero como imagen unica (fbHeroSlide en captions.json)
- Script publish-fb-single.mjs creado para publicacion FB de imagen unica
- Captions FB reescritos para los 3 carruseles (sin referencia a "carrusel", URLs corregidas)
- Asset grupo-cockpit-cielo-azul-4x5.jpg creado (crop 4:5 para ad C3)

---

## 3. Contradicciones y gaps entre documentos

Como Coordinador de Produccion, estas son las inconsistencias que encontre entre los documentos del equipo. Las flaggeo y propongo resolucion.

### Contradiccion 1: Orden y timing de reels

**Franco (estrategia-instagram):** Reel "Primera vez" el 25/04 (semana 2), reel "4 horas" el 02/05 (semana 3). Argumento: no retrasar contenido estatico por esperar reels.

**Marina (review-estrategia-ig, analisis-reels):** Invertir el orden. "4 horas" primero (score 8.5 vs 7). Publicar entre dia 3-5 (17-19 abr). Filmar dia 1-2.

**Resolucion adoptada:** Marina tiene razon en el scoring y el impacto. **Adopto el ajuste de Marina.** El reel "4 horas en el rio" se filma lo antes posible y se publica en cuanto este editado (idealmente dia 3-5, pero depende de la disponibilidad de salida). "Primera vez" va segundo. Si no hay salida disponible en semana 1, se mantiene el orden de Franco como fallback pero con "4 horas" primero cuando este listo.

### Contradiccion 2: Distribucion de pauta en reels

**Marina (analisis-reels):** 60% del presupuesto a reel "4 horas", 20% retargeting, 20% estaticos.

**Bruno (presupuesto):** Semanas 1-2 sin reels: 60% estaticos, 25% carruseles, 15% retargeting. Semanas 3-4 con reels: 55% reels, 20% retargeting, 25% estaticos.

**Franco (estrategia-instagram):** ARS 50K semana 1 (todo estaticos), ARS 70K semana 2 (incluyendo reel si esta).

**Resolucion adoptada:** Bruno tiene la distribucion mas pragmatica porque contempla que los reels no estan listos al dia 1. **Adopto la distribucion de Bruno** con la salvedad de que si el reel "4 horas" esta listo antes de lo esperado, se reasigna presupuesto de estaticos al reel segun criterio de Marina (hasta ARS 40K para el reel si cumple criterio de escala).

### Contradiccion 3: Split IG/FB

**Franco:** 70/30

**Bruno:** 75/25

**Resolucion adoptada:** **Adopto el 75/25 de Bruno** con revision a los 10 dias. Si CPS en FB es significativamente menor que en IG, se reasigna hasta 35% a FB.

### Gap 1: Carruseles no estan en staging

**Estado:** Los 3 carruseles tienen QA PASS pero NO estan en staging y el script de publicacion NO soporta carruseles todavia.

**Impacto:** carrusel-cuanto-sale esta programado para el 18/04 (dia 4). Si no se adapta el script antes, se pierde la pieza con mayor potencial de guardado de semana 1.

**Responsable:** Dani (adaptar script) + Nico (stagear). Deadline: 17/04.

### Gap 2: Reels adicionales no integrados en calendario

**Marina** propone 5 reels adicionales (seccion 5 de su analisis). **Franco** no los integra en el calendario.

**Resolucion:** Para el mes 1, los 2 reels principales son la prioridad. Los reels adicionales ("Lo que nadie te dice", "Buenos Aires desde el agua") se producen en semanas 3-4 con material sobrante de las filmaciones, si hay capacidad. No bloquear nada por esto.

### Gap 3: Cover frames para reels en el grid

**Marina** requiere cover frames disenados en 1:1 con paleta de marca para que los reels no rompan la coherencia del grid.

**Responsable:** Dani. Debe disenar cover frames antes de publicar cada reel. Tarea a agregar al pipeline.

### Gap 4: Cortes alternativos y subtitulos para pauta de reels

**Marina** requiere 3 versiones por reel pautado (completa, 30s, 15s) + subtitulos funcionales.

**Responsable:** Dani (edicion) con direccion de Marina. Se produce despues de la edicion del reel principal.

---

## 4. Timeline dia a dia — Semana 1: LANZAMIENTO (ejecutada)

### Checklist de arranque — Estado real

- [x] Meta Business Manager creado y configurado (16/04)
- [x] Cuenta publicitaria creada: act_2303565156801569, ARS, AR (16/04)
- [x] Metodo de pago configurado: Mastercard ····8307, limite $700K confirmado
- [x] IG y FB vinculados en Business Suite
- [x] Meta Pixel instalado: Event Data 1273048378266952 activo (ENBA Pixel 830831356111912 no instalado, ignorar)
- [x] Dominio autorizado en Events Manager (19/04)
- [x] GA4 propiedad instalada: G-XVN36KPHBL en enba-web/index.html
- [x] 5 Custom Audiences creadas: D1 WebVisitors, D2 IGEngagers, D3 FBEngagers (API), D4 VideoViewers, D5 FBPageLikers (UI)
- [x] 5 Saved Audiences en ad sets: B1 Experiencias, A2 InteresNav, C1 Turismo, B2 Outdoor, A3 Aspiracional
- [x] n8n workflow publicacion verificado y activo (pieces 01-05 publicadas)
- [x] n8n workflow evaluacion ads creado y activo (9:00 ART diario)
- [x] Campanas Awareness + Engagement creadas y ACTIVE (19/04)
- [x] 6 ad sets ACTIVE + 7 ads ACTIVE
- [x] Script publish-carousel.mjs listo
- [x] Reel "4 horas" filmado, editado, publicado IG+FB (17/04), ad de engagement activo
- [x] Cortes pauta reel 4h: 30s y 15s listos
- [ ] ~~Gimbal~~ — no se compro, se filmo con celular
- [ ] ~~Eventos GA4 configurados~~ — pendiente verificar
- [ ] ~~UTMs en link bio~~ — pendiente verificar
- [ ] ~~Posts fijados FB~~ — pendiente verificar

---

### Ejecucion real — Pre-lanzamiento (15-18 abr, antes de pauta)

Publicacion organica via n8n desde 15/04. Pauta NO activa todavia.

| Fecha | Pieza | Estado |
|-------|-------|--------|
| 15/04 | piece-01 "El rio te llama" | Publicada IG+FB. CTAs viejos (irrecuperable). |
| 16/04 | piece-02 "Desde Costanera Norte" | Publicada IG+FB. CTAs viejos. |
| 17/04 | piece-03 "No salis con una marca" | Publicada IG+FB. CTAs viejos. Reel 4h publicado mismo dia. |
| 18/04 | piece-04 "Salir a navegar no deberia ser complicado" | Publicada IG+FB. CTAs viejos. |

Incidentes: CTAs duplicados en campaign.pieces.json detectados y corregidos (Sole reescribio 15, Marina+Franco aprobaron). Pieces 01-04 ya publicadas con CTAs viejos, no se pueden corregir. Pieces 05+ tienen CTAs corregidos.

### Dia 1 pauta — Sabado 19 de abril (activado, sin gasto hasta 20/04)

**Meta Ads activados a las 00:10 ART (primer gasto real: 20/04 ~03:00 ART, post incidente onboarding):**
- Campana AWR (Awareness) → ACTIVE
- Campana ENG (Engagement) → ACTIVE
- 5 ad sets Awareness: B1 ($2500), A2 ($1500), C1 ($1500), B2 ($1500), A3 ($1500)
- 1 ad set Engagement: Reel4horas ($3000)
- 7 ads: piece01dp x2, piece02 x2, piece03 x2, reel4horas x1
- Budget diario total: $11.500

**FEED organico:** piece-05 publicada 12:15 ART (primera con CTAs corregidos).

**Otras acciones dia 1:**
- Workflow evaluacion ads creado (n8n, 9:00 ART diario, email a jmartinezplatt@gmail.com)
- Darkpost C2 Regalos creado (PAUSED, activacion dia 5)
- Asset-bank ampliado 53→65 JPGs
- Script publish-carousel.mjs creado y verificado
- Cortes pauta reel 4h (30s + 15s) producidos
- Re-baseline presupuesto-v3: dia 1 = 20/04 (primer gasto real), fin = 16/05
- Direccion creativa reel "primera vez" completada (Marina, score 9/10)
- Captions darkpost regalos escritos (Sole) y aprobados

### Incidente onboarding Meta Ads (19-20/04)

Ads activados 19/04 00:10 ART. 48h con $0 gasto, columna Entrega vacía en Ads Manager.
Causa: cuenta nueva configurada 100% por API, checkpoints internos de onboarding no disparados.
Resolución: creación de campaña TEST_onboarding desde UI de Ads Manager + toggle de ad sets.
Primer gasto real: 20/04 ~03:00 ART. Token META_ADS_USER_TOKEN migrado de User Token LL (expirado) a System User Token (eterno).

### Dias 1-6 pauta — 20-25 de abril (en ejecucion)

| Dia | Fecha | Accion planificada (presupuesto-v3) |
|-----|-------|-------------------------------------|
| 2 | 20/04 | piece-06 organica. Ads corriendo. |
| 3 | 21/04 | piece-07 organica. Evaluacion 72h de piece-01 ads. |
| 4 | 22/04 | piece-08 organica. Primer email evaluacion con data. |
| 5 | 23/04 | piece-09 organica. **Activar C2 Regalos + ad set.** |
| 6 | 24/04 | piece-10 organica. |
| 7 | 25/04 | piece-11 organica. **Activar C3 Corporativo (si creative listo).** |

**Checkpoints fin de semana 1 (26/04):** primer reporte Bruno con data real de 6 dias de pauta (ajustado por incidente onboarding).

---

## 5. Timeline semana por semana — Semanas 2-4

> **NOTA (19/04):** Los montos de pauta en esta seccion son de la version $250K original. Los montos vigentes estan en `presupuesto-v3-final.md` (seccion 3, $500K). La estructura de contenido (que piezas, que dias) sigue siendo referencia valida pero las fechas corren +4 dias por re-baseline (dia 1 = 19/04 en vez de 15/04).

### Semana 2 (22-28 abr): Optimizacion basada en datos

**Objetivo:** Duplicar lo que funciona, cortar lo que no. Primer reel publicado. 800-1.500 seguidores acumulados.

**Presupuesto pauta:** ARS 70.000 (IG ~52.500 / FB ~17.500)

**Contenido:**

| Fecha | Dia | Feed IG | Formato | Pauta IG | FB |
|-------|-----|---------|---------|----------|----|
| 22/04 | Mie | piece-08 "Cruzar a Colonia" | Estatico | -- | Si |
| 23/04 | Jue | piece-09 "Atardeceres desde cubierta" | Estatico | Pautar si ER alto | Si |
| 24/04 | Vie | carrusel-no-es-tour + piece-10 | Carrusel + Estatico | ARS 15.000 (carrusel) | Si (carrusel) |
| 25/04 | Sab | **reel "4 horas en el rio"** + piece-11 | Reel + Estatico | ARS 25.000 (reel, si cumple criterio) | Si |
| 26/04 | Dom | piece-12 "Si nunca navegaste" | Estatico | -- | Si + Evento FB |
| 27/04 | Lun | piece-13 "Aprender a navegar" | Estatico | -- | Si |
| 28/04 | Mar | piece-14 "No hace falta venir sabiendo" | Estatico | ARS 10.000 | Si |

**NOTA CRITICA — Ajuste de Marina integrado:**
El reel "4 horas en el rio" esta en dia 11 (25/04) como fecha limite. Si la filmacion se hizo en semana 1 y la edicion esta lista, adelantar a dia 4-5 (18-19 abr, semana 1). El calendario original de Franco tenia "Primera vez" el 25/04. **Se invierte:** "4 horas" va primero por score superior (8.5 vs 7). "Primera vez" se mueve a semana 3.

Si la filmacion NO se hizo en semana 1, el 25/04 es la fecha maxima para "4 horas". Si no esta listo para el 25/04, escalar a Jose: tenemos un problema critico de contenido de video.

**Tareas clave:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Editar reel "4 horas en el rio" (version completa + cortes 30s y 15s + subtitulos) | Dani (direccion Marina) | 24/04 |
| Disenar cover frame para reel en grid | Dani (direccion Marina) | 24/04 |
| Stagear carrusel-no-es-tour | Nico | 23/04 |
| Reporte semanal 1 — primer tier check | Bruno | 22/04 |
| Analisis de competidores (5-10 cuentas) | Bruno | 20/04 |
| Revisar insights semana 1 completa | Bruno + Franco | 22/04 |
| Ajustar audiencias de pauta segun datos reales | Jose + Bruno | 22/04 |
| Cerrar al menos 1 colaboracion con micro-influencer | Franco + Jose | 28/04 |
| Pedir 10-15 recomendaciones en FB a gente que ya navego | Jose | 24/04 |

**Pauta FB semana 2:** ARS 18.000. Split: ARS 10.000 Page Likes + ARS 8.000 boost del mejor post organico de semana 1.

**Gate de decision (fin semana 2):** Ubicar en que tier estamos. Si estamos en tier minimo, ajustar pauta agresivamente. Si estamos en tier realista, mantener y preparar escalado.

---

### Semana 3 (29 abr - 5 may): Escalar lo que funciona

**Objetivo:** Acelerar crecimiento. Segundo reel. Colaboracion con influencer. 2.500-4.000 seguidores acumulados.

**Presupuesto pauta:** ARS 80.000 (IG ~60.000 / FB ~20.000)

**Contenido:**

| Fecha | Dia | Feed IG | Formato | Pauta IG | FB |
|-------|-----|---------|---------|----------|----|
| 29/04 | Mie | piece-15 "Timonel se aprende mejor" | Estatico | -- | Si |
| 30/04 | Jue | piece-16 "Teoria, maniobra y rio" | Estatico | -- | Si |
| 01/05 | Vie | piece-17 "Empezar desde cero" (FERIADO) | Estatico | ARS 10.000 | Si |
| 02/05 | Sab | **reel "Primera vez"** + piece-18 | Reel + Estatico | ARS 35.000 (reel) | Si |
| 03/05 | Dom | carrusel-elegi-aventura + piece-19 | Carrusel + Estatico | ARS 15.000 (carrusel) | Si + Evento FB |
| 04/05 | Lun | piece-20 "Veleros que vale la pena mirar" | Estatico | -- | Si |
| 05/05 | Mar | piece-21 "Comparar bien" | Estatico | -- | Si |

**NOTA:** El reel "Primera vez" reemplaza a "4 horas" en esta posicion (por la inversion de orden). Si "4 horas" se publico en semana 1, excelente. Si se publico en semana 2, "Primera vez" va en semana 3 como estaba planeado originalmente.

**Tareas clave:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Editar reel "Primera vez" (3 versiones + subtitulos) | Dani (direccion Marina) | 01/05 |
| Cover frame para reel "Primera vez" | Dani | 01/05 |
| Stagear carrusel-elegi-aventura | Nico | 02/05 |
| Ejecutar colaboracion con influencer (si cerrada) | Jose + Franco + Marina | Semana 3 |
| Crear custom audience remarketing (todos los que interactuaron) | Jose | 29/04 |
| Lanzar campana de seguidores dedicada si numeros no estan en track | Bruno + Jose | 29/04 |
| Reporte semanal 2 | Bruno | 29/04 |
| Producir reel adicional "Buenos Aires desde el agua" o "Lo que nadie te dice" con material sobrante | Dani (direccion Marina) | 05/05 |

**Pauta FB semana 3:** ARS 22.000. Split: ARS 5.000 Page Likes + ARS 10.000 boost + ARS 7.000 trafico al sitio.

**Gate de decision (fin semana 3):**
- Si seguidores > 3.000: en track para tier realista. Escalar presupuesto si hay margen.
- Si seguidores < 1.000: ajustar target a tier minimo. Reunion de emergencia.

---

### Semana 4 (6-14 may): Consolidar y preparar mes 2

**Objetivo:** Cerrar fuerte, consolidar comunidad, extraer aprendizajes. Target: 3.000-5.000 seguidores acumulados (tier realista).

**Presupuesto pauta:** ARS 50.000 (IG ~37.500 / FB ~12.500) + reserva de ARS 20.000 para escalar winners.

**Contenido:**

| Fecha | Dia | Feed IG | Formato | Pauta IG | FB |
|-------|-----|---------|---------|----------|----|
| 06/05 | Mie | piece-22 "Las preguntas correctas" (broker) | Estatico | -- | Si |
| 07/05 | Jue | piece-23 "Ver el barco cambia todo" | Estatico | -- | Si |
| 08/05 | Vie | piece-24 "Navegar tranquilo" | Estatico | ARS 8.000 | Post exclusivo FB: "Lo que aprendimos en 3 semanas" |
| 09/05 | Sab | piece-25 "Prevenir cuesta menos" | Estatico | -- | Evento FB: salida cierre 10/05 |
| 10/05 | Dom | piece-26 "Poner a punto" | Estatico | -- | Si |
| 11/05 | Lun | piece-27 "Tu embarcacion merece" | Estatico | -- | -- |
| 12/05 | Mar | piece-28 "Equipo presente y rio real" | Estatico | ARS 10.000 | Si |
| 13/05 | Mie | piece-29 "Antes de cada salida" | Estatico | -- | Si |
| 14/05 | Jue | piece-30 "El rio te llama" (CIERRE) | Estatico | ARS 12.000 | Post exclusivo FB: "Gracias, primeros tripulantes" |

**Marina flaggeo:** Semana 4 es la mas debil creativamente (9 estaticos seguidos). Si hay un reel adicional listo ("Buenos Aires desde el agua" o "Lo que nadie te dice"), publicarlo esta semana para mantener momentum.

**Tareas clave:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Publicar reel adicional si esta listo | Dani + Nico | Semana 4 |
| Analisis metricas completas 4 semanas | Bruno | 14/05 |
| Identificar top 5 y bottom 5 posts | Bruno + Franco + Marina | 14/05 |
| Documentar aprendizajes formato/horario/copy/hashtags | Franco + Bruno | 14/05 |
| Planificar produccion mes 2 (proporcion corregida: mas reels, mas carruseles) | Franco + Marina | 14/05 |
| Evaluar segunda tanda de pauta sobre best-performers | Bruno | 14/05 |
| Reporte semanal 3 | Bruno | 06/05 |
| Reporte de cierre | Bruno | 15/05 |

**Pauta FB semana 4:** ARS 18.000. Split: ARS 5.000 boost cierre + ARS 13.000 trafico al sitio.

---

## 6. Matriz de responsabilidades

| Tarea | Responsable | Aprueba | Consulta |
|-------|-------------|---------|----------|
| Publicacion diaria IG (auto) | n8n | -- | Nico (verificar) |
| Publicacion diaria IG (manual fallback) | Nico | -- | Franco |
| Publicacion FB | Nico | -- | Franco |
| Engagement manual diario (55 min) | Jose (owner) | -- | Franco |
| Pauta / Ads Manager | Jose (owner) | Bruno | Franco, Marina |
| Filmacion reels | Jose + Dani | Marina | Franco |
| Edicion reels + cover frames + cortes | Dani | Marina | -- |
| Subtitulos funcionales para pauta | Dani | Marina | -- |
| Captions y copy | Sole | Franco | -- |
| QA y checklist cada pieza | Nico | -- | -- |
| Staging de carruseles | Nico | -- | Dani |
| Adaptacion script carruseles | Dani | -- | -- |
| Setup Meta Business Manager | Jose | Bruno | -- |
| Setup GA4 + GTM | Jose | Bruno | -- |
| Configuracion audiencias Meta Ads | Jose | Bruno | Franco |
| Reportes semanales | Bruno | -- | Franco, Marina |
| Analisis de competidores | Bruno | -- | Franco |
| Colaboracion micro-influencer (cierre) | Jose + Franco | Marina | -- |
| Colaboracion micro-influencer (brief visual) | Marina | -- | Franco |
| Posts exclusivos FB (bienvenida, encuestas, links) | Sole (copy) + Nico (publicar) | Franco | -- |
| Eventos FB | Nico | Franco | -- |
| Recomendaciones FB (pedir a conocidos) | Jose | -- | -- |
| Participacion en grupos FB | Jose | -- | Franco |
| Coordinacion general | Manu | -- | Todos |

---

## 7. Dependencias criticas — Estado

| Dependencia | Estado | Resolucion |
|-------------|--------|------------|
| Meta Business Manager configurado | **RESUELTO** | Business ID 814334400927137, Ad Account act_2303565156801569 |
| Cuenta publicitaria con metodo de pago | **RESUELTO** | Mastercard ····8307, limite $700K |
| IG y FB vinculados en Business Suite | **RESUELTO** | Vinculados |
| Meta Pixel en espacionautico.com.ar | **RESUELTO** | Event Data 1273048378266952 activo. Dominio autorizado 19/04. |
| GA4 en espacionautico.com.ar | **RESUELTO** | G-XVN36KPHBL instalado en enba-web/index.html |
| Script de carruseles | **RESUELTO** | `scripts/publish-carousel.mjs` creado 19/04, verificado dry-run |
| Filmacion reel "4 horas" | **RESUELTO** | Filmado, editado, publicado 17/04. Corriendo como ad engagement. |
| Filmacion reel "primera vez" | **EN PROGRESO** | Material crudo disponible + material colega. Direccion creativa lista (Marina 9/10). Falta edit-sheet y edicion. |
| Definicion presupuesto | **RESUELTO** | $500K solo pauta. Produccion aparte. Confirmado 19/04. |

### Dependencias nuevas (19/04)

| Dependencia | Bloquea | Deadline |
|-------------|---------|----------|
| Creative para C3 Corporativo | Activacion ad set Leads (dia 8 = 26/04) | 25/04 |
| Pieza con ER > 1% para TopPerformers | Activacion ad set TopPerformers (dia 10 = 28/04) | Esperar data |
| Edit-sheet reel "primera vez" | Produccion del segundo reel | Esta semana |

---

## 8. Triggers de escalacion

Estos son los momentos donde hay que tomar una decision fuera del plan normal.

| Momento | Condicion | Accion | Quien decide |
|---------|-----------|--------|-------------|
| Dia 3 | CPS > ARS 80 | Revisar creatividades y audiencias. Pausar ad sets con peor rendimiento. | Bruno + Jose |
| Dia 5 | CPS > ARS 100 despues de 5 dias | Alerta roja. Algo esta mal en segmentacion o contenido. Revisar todo. | Bruno + Franco + Marina |
| Dia 7 | Seguidores < 200 | Reunion de emergencia. Revisar pauta, contenido, audiencias, perfil. Activar Plan B de Franco (contenido mas nativo, stories intensificadas, reels 15s con stock). | Team 4 + Jose |
| Dia 7 | Engagement rate < 1% organico | Contenido no conecta. Devolver a Franco (estrategia) y Marina (direccion creativa) para pivot. | Franco + Marina |
| Dia 7 | Follow rate < 10% | Perfil no convence. Revisar bio, highlight covers, primeros 9 posts del grid. | Franco + Marina |
| Dia 14 | Seguidores < 1.000 | Ajustar target a tier minimo. Concentrar pauta en el top performer unico. Acelerar colaboracion influencer. | Bruno + Franco + Jose |
| Dia 14 | n8n falla 2+ dias | Activar publicacion manual con scripts de fallback. Investigar y reparar n8n. | Nico + Dani |
| Dia 21 | Seguidores > 3.000 | Escalar presupuesto si hay margen. Evaluar reel adicional. | Bruno + Jose |
| Dia 21 | Reel con > 10K views organicas y > 100 follows en 24h | Escalar con pauta hasta ARS 40K. Reasignar de reserva tactica. | Bruno + Jose |
| Dia 21 | Presupuesto > 75% gastado (> ARS 187.500) | Frenar todos los ad sets excepto top performer. Bajar budget diario a ARS 3-5K. Compensar con organico. | Bruno |
| Cualquier dia | Post se viraliza (> 10K views en 24h o > 500 shares) | Pautar con ARS 30-50K inmediatamente. 3-5 stories capitalizando. Responder TODOS los comentarios. | Franco + Bruno + Jose |
| Cualquier dia | Vocabulario prohibido detectado en post publicado | Devolver a Sole para correccion inmediata. No editar directamente. | Nico |

---

## 9. Resumen de presupuesto

**FUENTE DE VERDAD:** `presupuesto-v3-final.md`. Este resumen es solo referencia rapida.

### Pauta (ARS 500.000 neto — confirmado 19/04, solo pauta)

| Dimension | Valor |
|-----------|-------|
| Split IG / FB | 75% / 25% (ARS 375.000 / ARS 125.000). Revision dia 10 (28/04). |
| Por objetivo | Awareness 50% ($250K) / Engagement 25% ($125K) / Leads 10% ($50K) / Reserva 15% ($75K) |
| Semana 1-4 | $100K / $140K / $160K / $100K (curva 20/28/32/20) |
| CPS target | < ARS 45 promedio (calibrado v3) |
| Umbral de corte | CPS > $100 o ER < 1% o CTR < 0.4% (despues de 72h) |
| Umbral de escalado | CPS < $30 + ER > 3% → +25% cada 48h |
| Fatigue | Frecuencia > 3.5 → apagar |
| Max por pieza | 14 dias (excepcion: CPS < $20 + freq < 2 → extension 7 dias, aprobacion Bruno) |

### Impuestos Meta

Debito real en tarjeta: ~ARS 700.000 (impuestos ~40%). Tarjeta Mastercard ····8307, limite confirmado.

---

## 10. Reportes y medicion

### Calendario de reportes (Bruno)

| Reporte | Fecha | Contenido |
|---------|-------|-----------|
| Reporte 72 hs | 23/04 | Primer corte de datos, calibracion CPS y engagement |
| Reporte semanal 1 | 23/04 | Primera semana completa, tier check |
| Reporte semanal 2 | 30/04 | Segunda semana, datos para proyectar cierre |
| Reporte semanal 3 | 07/05 | Tercera semana, ajustes finales |
| Reporte de cierre | 16/05 | Resultado final, aprendizajes, plan mes 2 |

### KPIs primarios a mirar diariamente

| KPI | Fuente | Target |
|-----|--------|--------|
| Seguidores nuevos netos | IG Insights | Ver tabla de tiers por semana |
| CPS blended | Ads Manager (calculado) | < ARS 60 |
| Alcance total (org + pago) | IG Insights + Ads Manager | Ver tabla de tiers |

### KPIs secundarios (cada 3 dias / semanal)

| KPI | Target | Frecuencia |
|-----|--------|-----------|
| Engagement rate | > 5% sem 1-2, > 3.5% sem 3-4 | Cada 3 dias |
| Save rate | > 2% (> 4% excelente) | Semanal |
| Share rate | > 1% (> 2% excepcional, escalar inmediatamente) | Semanal |
| Follow rate (follows/profile visits) | 15-35% | Cada 3 dias |
| Retencion reels | > 50% promedio | Cada reel |
| Profile visits | Crecimiento semanal sostenido | Cada 3 dias |

---

## 11. Plan de contingencia

### Si n8n falla

Publicar manualmente usando el script de publicacion local. No perder ni un dia de publicacion. Nico es responsable de publicacion manual.

### Si los reels no se filman en el mes

Ejecutar Plan B de Franco:
1. Publicar reels de 15s con material del asset-bank + texto overlay
2. Intensificar stories a 8-10/dia
3. Pivotar a contenido mas "nativo" de IG (menos estetico, mas espontaneo)
4. Concentrar pauta en el mejor post estatico/carrusel

El plan funciona sin reels pero con crecimiento significativamente menor. Los reels son la diferencia entre tier minimo y tier realista.

### Si presupuesto se agota antes de fin de mes

1. Frenar todos los ad sets excepto el top performer
2. Bajar presupuesto diario a ARS 3.000-5.000
3. Compensar con organico: engagement manual 60+ min/dia, mas stories
4. No pedir mas presupuesto hasta reporte de cierre con datos

### Si nada funciona en 7 dias (< 200 seguidores, alcance < 500)

Diagnostico rapido:
- Hashtags indexados?
- Contenido se muestra a no-seguidores?
- CTAs generando accion?

Acciones:
1. Pivotar a contenido mas nativo/espontaneo
2. Intensificar stories a 8-10/dia
3. Reasignar 80% del budget al unico post/reel con mejor rendimiento relativo
4. Acelerar colaboracion con influencer
5. Considerar micro-campanas de mensajes directos (si hay capacidad de respuesta)

---

## Nota de Manu

Este plan integra el trabajo de Bruno (diagnostico, presupuesto, KPIs, infraestructura, medicion), Franco (estrategia IG, estrategia FB, calendario), y Marina (analisis de reels, review creativa con ajustes). Los ajustes de Marina fueron adoptados donde corresponde y estan marcados en el texto.

Las dependencias mas criticas son: Meta Business Manager (sin esto no hay pauta) y filmacion de reels (sin esto perdemos el formato de mayor crecimiento). Ambas dependen del owner (Jose).

El plan esta disenado para que alguien pueda leerlo y saber exactamente que hacer cada dia, quien es responsable, y que hacer si algo sale mal.

---

*Plan maestro producido por Manu (Coordinador de Produccion) — 15 de abril de 2026*
*Actualizado: 20 de abril de 2026 — re-baseline dia 1 a 20/04 (primer gasto real), incidente onboarding documentado*
*Fuentes: Bruno, Franco, Marina — Team 4, ENBA*
