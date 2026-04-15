# Plan Maestro — Crecimiento 10K seguidores en 30 dias

**Autor:** Manu (Coordinador de Produccion)
**Fecha:** 15 de abril de 2026
**Periodo:** 15 de abril - 14 de mayo de 2026
**Fuentes:** diagnostico-inicial (Bruno), estrategia-instagram (Franco), estrategia-facebook (Franco), analisis-reels (Marina), review-estrategia-ig (Marina), meta-business-setup (Bruno), google-analytics-medicion (Bruno), kpis (Bruno), presupuesto (Bruno), reporte-semanal-template (Bruno), calendario-integrado.json

---

## 1. Resumen ejecutivo

**Objetivo declarado:** 10.000 seguidores en IG + FB en 30 dias.

**Target realista:** 3.000-5.000 seguidores (tier realista de Bruno, probabilidad 55-65%). El objetivo de 10K tiene probabilidad del 5-10%. El piso minimo aceptable es 1.000-2.000 (probabilidad 85-90%).

**Presupuesto pauta:** ARS 250.000 neto para Meta Ads. Debito real en tarjeta ~ARS 350.000 (impuestos argentinos ~40%).

**Presupuesto produccion reels:** ARS 100.000-120.000 (gimbal + funda waterproof). **PENDIENTE: confirmar si es gasto separado o sale de los 250K.**

**Contenido disponible:**
- 30 piezas estaticas: QA PASS, renderizadas, captions aprobados, en staging con manifests. **Listas para publicar hoy.**
- 3 carruseles organicos: slides renderizados, captions aprobados, QA PASS. **NO estan en staging. Script de publicacion NO soporta carruseles todavia.**
- 2 reels: guiones escritos. **SIN FILMAR. Sin material de video.**
- 45 assets curados en asset-bank.
- 1 teaser pre-lanzamiento publicado 14/04.

**Infraestructura:**
- n8n workflow activo (publicacion diaria 12:15 ART).
- Meta API configurada con token page-level.
- Script de publicacion manual como fallback.

**Distribucion de pauta por semana (Franco + Bruno):**
| Semana | Presupuesto | Foco |
|--------|-------------|------|
| 1 (15-21 abr) | ARS 50.000 | Awareness, calibracion |
| 2 (22-28 abr) | ARS 70.000 | Primer reel + optimizacion |
| 3 (29 abr - 5 may) | ARS 80.000 | Escalar winners, segundo reel |
| 4 (6-14 may) | ARS 50.000 | Consolidar, cierre |

**Split plataformas (Bruno):** IG 75% (ARS 187.500) / FB 25% (ARS 62.500).

---

## 2. Decisiones pendientes del usuario

Estas decisiones bloquean o condicionan la ejecucion. Sin respuesta, avanzo con supuestos conservadores.

| # | Decision | Impacto | Supuesto si no hay respuesta |
|---|----------|---------|------------------------------|
| 1 | **Presupuesto: los ARS 250K son solo pauta o incluyen produccion de reels?** | Si incluyen produccion, la pauta baja a ~130K y los seguidores pagados estimados caen un 48% (Bruno). El tier realista baja a 2.000-3.500. | Asumo que son solo pauta y produccion es gasto aparte. |
| 2 | **Filmacion de reels: hay salida disponible en dia 1 o 2 (15-16 abr)?** | Marina pide reel "4 horas" publicado en dia 3-5. Sin filmacion temprana, el reel mas fuerte (score 8.5/10) se retrasa a semana 2-3. | Asumo que no hay salida inmediata. Reel "4 horas" se filma lo antes posible y se publica en cuanto este editado. |
| 3 | **Meta Business Manager: ya existe o hay que crearlo?** | Sin Business Manager no hay cuenta publicitaria, no hay pauta, no hay crecimiento pagado. | Asumo que hay que crearlo. Prioridad maxima dia 1. |
| 4 | **GA4: ya esta instalado en espacionautico.com.ar?** | Sin GA4 no hay medicion de trafico al sitio ni atribucion por pieza. | Asumo que no esta instalado. Setup en dias 1-3. |
| 5 | **Acceso a cuentas IG y FB: quien tiene los accesos?** | Sin acceso no hay vinculacion en Business Suite, no hay pauta. | Asumo que Jose (owner) tiene los accesos. |
| 6 | **Equipo de filmacion (gimbal ~ARS 100K): se compra ahora?** | Sin gimbal, las tomas en cubierta con viento son inutilizables (Marina). Los reels son el formato de mayor crecimiento. | Asumo que se compra. Si no, reels se filman con lo que haya y se ajusta calidad. |
| 7 | **Engagement manual (55 min/dia): quien lo hace?** | Franco asigna 45-60 min/dia de interaccion manual (seguir cuentas, comentar, responder DMs). Necesita una persona dedicada. | Asumo que Jose (owner) lo hace. |

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

## 4. Timeline dia a dia — Semana 1 (15-21 abr): LANZAMIENTO

### Antes de dia 1: Checklist de arranque

- [ ] Meta Business Manager creado y configurado
- [ ] Cuenta publicitaria creada (moneda ARS, zona horaria AR)
- [ ] Metodo de pago configurado (verificar limite tarjeta ~ARS 350K)
- [ ] IG y FB vinculados en Business Suite
- [ ] Meta Pixel instalado en espacionautico.com.ar
- [ ] Pixel verificado con Meta Pixel Helper
- [ ] Dominio verificado en Business Settings (DNS TXT en Cloudflare)
- [ ] GA4 propiedad creada e instalada (tag via GTM o directo)
- [ ] GA4 verificado con Realtime
- [ ] Eventos GA4 configurados: contact_click, whatsapp_click, form_submit
- [ ] Eventos marcados como conversiones en GA4
- [ ] 4 Custom Audiences creadas en Ads Manager (vacias pero listas: Web Visitors, IG Engagers, FB Page Engagers, Video Viewers)
- [ ] 4 Saved Audiences creadas (Nautica BA, Experiencias BA, Lifestyle Parejas, Outdoor/Aventura)
- [ ] UTMs definidos y documentados (ver google-analytics-medicion.md)
- [ ] Link en bio de IG con UTMs
- [ ] n8n workflow verificado (primer test exitoso con piece-01)
- [ ] Posts fijados en FB seleccionados: piece-01 (#1) + carrusel-cuanto-sale (#2, cuando se publique) + post bienvenida (#3)
- [ ] Bio de IG optimizada con CTA y link
- [ ] Primera campana Awareness creada con piece-01
- [ ] Exclusion de seguidores existentes configurada en todos los ad sets
- [ ] Filmacion de reels agendada (coordinar con Jose)
- [ ] Gimbal + funda waterproof comprados (si se aprobo la inversion)
- [ ] Script de carruseles adaptado para IG Carousel API (Dani, deadline 17/04)

**Responsable setup Meta:** Jose (owner, necesita accesos) con guia de Bruno (meta-business-setup.md)
**Responsable setup GA4:** Jose con guia de Bruno (google-analytics-medicion.md)
**Responsable n8n:** verificacion automatica, fallback manual con scripts

---

### Dia 1 — Miercoles 15 de abril

**FEED IG:**
- 12:15 ART — `piece-01` "El rio te llama. Nosotros te llevamos." (auto-publish via n8n)
- **Pauta IG:** ARS 15.000 — Awareness — Audiencias: Nautica BA + Experiencias BA

**FEED FB:**
- 10:00 ART — Post de bienvenida exclusivo FB (publicar manualmente). Texto cercano para los amigos que aceptaron la invitacion.
- 12:15 ART — `piece-01` (auto-publish). Fijar como post #1.

**Stories IG (manual):**
- 09:00 — Countdown "Hoy arrancamos" con sticker cuenta regresiva
- 12:30 — Compartir post a stories + encuesta "Alguna vez navegaste? Si/No"
- 15:00 — Behind the scenes: foto/video del muelle en Costanera Norte
- 18:00 — CTA "Seguinos para ver lo que viene"
- 21:00 — Repost del post + sticker pregunta

**Engagement manual (45 min):**
- 15 min: seguir 30-40 cuentas relevantes (nautica BA, veleros, planes BA)
- 15 min: 15-20 comentarios genuinos en cuentas de planes BA, turismo local
- 15 min: responder cada DM y comentario en menos de 1 hora

**Pauta FB:** ARS 12.000 en Page Likes con piece-01 como creatividad (parte del budget FB semana 1).

**Tareas operativas:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Verificar publicacion piece-01 a las 12:15 | Nico | 15/04 12:30 |
| Activar primera campana Awareness en Ads Manager | Jose | 15/04 |
| Publicar post de bienvenida FB | Jose / Nico | 15/04 10:00 |
| Pedir a 10-15 personas cercanas que comenten en piece-01 y post de bienvenida FB | Jose | 15/04 |
| Revisar datos del teaser 14/04 (24h) | Bruno | 15/04 noche |

**Objetivo dia 1:** 50-100 seguidores, primeras interacciones, baseline de alcance.

---

### Dia 2 — Jueves 16 de abril

**FEED IG:**
- 12:15 ART — `piece-02` "Desde Costanera Norte, el rio queda mucho mas cerca." (auto-publish)
- **Pauta IG:** ARS 8.000 — Awareness — Audiencias: Experiencias BA + Outdoor

**FEED FB:**
- 12:15 ART — `piece-02` (auto-publish)

**Stories IG:**
- 09:00 — Foto del rio a la manana, "Buenos dias desde Costanera Norte"
- 12:30 — Compartir post + quiz "Sabias que podes navegar desde Costanera Norte?"
- 16:00 — Mini video/foto del velero amarrado
- 20:00 — Encuesta: "Que plan te tienta mas?" A) Salida en velero B) Aprender a navegar

**Engagement manual (45 min):** Interactuar con stories de cuentas relevantes, comentar en posts lifestyle BA, responder todo.

**Tareas operativas:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Revisar insights piece-01 (24h) | Bruno | 16/04 |
| Coordinar salida de filmacion de reels | Jose + Manu | 16/04 |

**Objetivo dia 2:** 100-200 seguidores acumulados.

---

### Dia 3 — Viernes 17 de abril

**FEED IG:**
- 12:15 ART — `piece-03` "No salis con una marca. Salis con nosotros." (auto-publish)
- **Pauta IG:** ARS 8.000 — Awareness — Audiencias: Experiencias BA + Lifestyle Parejas

**FEED FB:**
- 12:15 ART — `piece-03` (auto-publish)

**Stories IG:**
- 09:00 — Presentacion del equipo
- 12:30 — Compartir post
- 15:00 — Encuesta: "Con cuantas personas vendrias?"
- 18:00 — Teaser del carrusel de manana: "Manana publicamos algo que muchos nos preguntan..."
- 21:00 — CTA "Si este finde no tenes plan, nosotros tenemos uno."

**Engagement manual (60 min — viernes es clave):**
- 20 min: comentar en cuentas planes de finde
- 20 min: buscar hashtags #PlanesBuenosAires #FinDeSemanaBA, comentarios relevantes
- 20 min: responder DMs, agradecer follows

**Tareas operativas:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Adaptar script publicacion para carruseles (IG Carousel API) | Dani | 17/04 |
| Stagear carrusel-cuanto-sale | Nico | 17/04 |
| Revisar datos teaser 14/04 (48h) + piece-01 (48h) + piece-02 (24h) | Bruno | 17/04 |

**Si filmacion de reel es posible hoy o manana:** Jose + Dani filman "4 horas en el rio" + "Primera vez" en la misma salida. Marina dirige creativamente (guiones impresos, tomas marcadas). Edicion en 24-48h.

**Objetivo dia 3:** 200-350 seguidores acumulados.

---

### Dia 4 — Sabado 18 de abril

**FEED IG:**
- 12:15 ART — `carrusel-cuanto-sale` "Cuanto sale navegar en Buenos Aires?" (publicar manualmente si script no esta listo, auto si esta)
- 12:15 ART — `piece-04` "Salir a navegar no deberia ser complicado." (auto-publish)
- **Pauta IG:** ARS 12.000 en carrusel-cuanto-sale

**FEED FB:**
- 12:15 ART — `carrusel-cuanto-sale` (publicar). Fijar como post #2.
- 10:00 ART — Evento FB: "Navegacion en velero — Sabado 19 abr"

**Stories IG:**
- Compartir carrusel a stories a las 18:00 (segunda ventana de visibilidad)
- Encuesta sobre el carrusel

**Engagement manual (45 min).**

**Si reel "4 horas" esta editado:** Publicarlo hoy en vez de manana. Es sabado = alto reach organico. Pautar con ARS 20.000-25.000 (reasignar de estaticos).

**Objetivo dia 4:** Primer carrusel activo, alto engagement por fin de semana.

---

### Dia 5 — Domingo 19 de abril

**FEED IG:**
- 12:15 ART — `piece-05` "Cuatro frentes, una misma forma de trabajar el rio." (auto-publish)
- **Pauta IG:** ARS 7.000

**FEED FB:**
- 12:15 ART — `piece-05` (auto-publish)

**Stories:** Contenido de fin de semana, behind the scenes si hubo filmacion.

**Engagement manual (45 min).**

---

### Dia 6 — Lunes 20 de abril

**FEED IG:**
- 12:15 ART — `piece-06` "Delta en velero desde Costanera Norte." (auto-publish)
- Sin pauta (lunes bajo rendimiento)

**FEED FB:**
- 12:15 ART — `piece-06` (auto-publish)

**Stories:** Inicio de semana, retomar ritmo.

**Engagement manual (55 min).**

---

### Dia 7 — Martes 21 de abril

**FEED IG:**
- 12:15 ART — `piece-07` "A veces unas horas en el rio cambian la semana." (auto-publish)
- Sin pauta

**FEED FB:**
- 19:00 ART — Encuesta exclusiva FB: "Que tipo de salida te tienta?"

**Engagement manual (55 min).**

**Checkpoints fin de semana 1:**
| Metrica | Target tier minimo | Target tier realista |
|---------|-------------------|---------------------|
| Seguidores acumulados | 150-300 | 300-500 |
| CPS blended | ARS 60-80 | ARS 40-60 |
| Engagement rate | > 4% | > 5% |
| Alcance total/semana | 5K-15K | 15K-30K |

**Tareas operativas:**
| Tarea | Responsable | Deadline |
|-------|-------------|----------|
| Primer reporte de calibracion (teaser + piece-01 a piece-05) | Bruno | 18/04 |
| Publicar evento FB para travesia 26/04 | Jose / Nico | 21/04 |
| Crear Lookalike de IG Engagers (si > 100) | Jose / Bruno | 21/04 |

**Trigger de escalacion:** Si seguidores < 200 al final de dia 7, reunion de emergencia. Revisar audiencias, creatividades, CPS, todo.

---

## 5. Timeline semana por semana — Semanas 2-4

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

## 7. Dependencias criticas

Estas dependencias son bloqueantes. Si no se resuelven, partes del plan no se pueden ejecutar.

| Dependencia | Bloquea | Responsable | Deadline | Fallback |
|-------------|---------|-------------|----------|----------|
| **Meta Business Manager configurado** | Toda la pauta pagada | Jose | 15/04 | Sin pauta, solo organico. Crecimiento cae a tier minimo bajo (500-1.000). |
| **Cuenta publicitaria con metodo de pago** | Activacion de ads | Jose | 15/04 | Misma que arriba. |
| **IG y FB vinculados en Business Suite** | Pauta cruzada, insights unificados | Jose | 15/04 | Pauta por separado, menos eficiente. |
| **Meta Pixel en espacionautico.com.ar** | Retargeting, audiencias de web visitors, optimizacion de ads | Jose | 17/04 | Pauta sin pixel funciona pero es mas cara y menos optimizada. |
| **GA4 en espacionautico.com.ar** | Medicion de trafico y conversiones del sitio | Jose | 17/04 | Sin GA4 se pierde atribucion pero las metricas de redes siguen midiendo. |
| **Script de carruseles adaptado** | Publicacion automatica de carruseles | Dani | 17/04 | Publicacion manual de carruseles. |
| **Filmacion de reels** | Publicacion de reels (formato de mayor crecimiento) | Jose + Dani | 25/04 max | Solo contenido estatico. Se pierde reach potencial significativo. |
| **Gimbal comprado** | Calidad de filmacion de reels | Jose | Antes de filmacion | Filmar con celular sin estabilizacion. Calidad menor pero funcional. |
| **Definicion presupuesto pauta vs produccion** | Planificacion de gasto real | Jose | 15/04 | Asumo pauta separada de produccion. |

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

### Pauta (ARS 250.000 neto)

| Dimension | Valor |
|-----------|-------|
| Split IG / FB | 75% / 25% (ARS 187.500 / ARS 62.500) |
| Semana 1 / 2 / 3 / 4 | ARS 50K / 70K / 80K / 50K |
| Por objetivo: Awareness / Engagement-Followers / Trafico / Leads / Reserva | 25% / 35% / 10% / 20% / 10% |
| CPS target | < ARS 60 promedio. Ideal < ARS 40 |
| Umbral de corte CPS | > ARS 80 (pausar despues de 72h) |
| Umbral de escalado CPS | < ARS 30 (escalar +20% cada 48h) |

### Produccion (SEPARADO de pauta — pendiente confirmacion)

| Item | Costo estimado |
|------|---------------|
| Gimbal celular (DJI OM 6 o similar) | ARS 80.000-120.000 |
| Funda waterproof | ARS 10.000-15.000 |
| Total produccion | ARS 90.000-135.000 |

### Impuestos Meta

Meta cobra ~40% adicional (IVA + impuesto PAIS + percepcion ganancias). Debito real en tarjeta: ~ARS 350.000. **Verificar limite de tarjeta.**

---

## 10. Reportes y medicion

### Calendario de reportes (Bruno)

| Reporte | Fecha | Contenido |
|---------|-------|-----------|
| Reporte 72 hs | 18/04 | Primer corte de datos, calibracion CPS y engagement |
| Reporte semanal 1 | 22/04 | Primera semana completa, tier check |
| Reporte semanal 2 | 29/04 | Segunda semana, datos para proyectar cierre |
| Reporte semanal 3 | 06/05 | Tercera semana, ajustes finales |
| Reporte de cierre | 15/05 | Resultado final, aprendizajes, plan mes 2 |

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
*Fuentes: Bruno, Franco, Marina — Team 4, ENBA*
