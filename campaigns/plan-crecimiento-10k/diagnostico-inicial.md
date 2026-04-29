> **NOTA (19/04):** Este diagnostico fue escrito al dia 0 (15/04). Presupuesto actualizado a $500K en `historico/presupuesto-v3-final.md`. Inventario de contenido actualizado en `plan-maestro.md` seccion 1. Los datos de punto de partida (seguidores, estado de cuenta) siguen siendo referencia valida.

# Diagnostico inicial — Plan de crecimiento 10K seguidores

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 15 de abril de 2026
**Cuenta:** @espacionauticobsas (IG) + Espacio Nautico Buenos Aires (FB)
**Presupuesto mensual declarado:** ARS 250.000
**Objetivo declarado:** 10.000 seguidores en IG + FB en 30 dias (15 abr - 14 may)

---

## 1. Estado actual

### Inventario de contenido

| Tipo | Cantidad | Estado | Listo para publicar |
|------|----------|--------|---------------------|
| Piezas estaticas (campana lanzamiento) | 30 | QA PASS 30/30, PNGs renderizados, captions IG+FB aprobados | Si - en staging con manifests |
| Carruseles organicos | 3 | Slides renderizados, captions aprobados, QA PASS | Parcial - NO estan en staging, script de publicacion NO soporta carruseles todavia |
| Reels | 2 | Guiones escritos, SIN filmar | No - necesitan grabacion + edicion |
| Assets curados (asset-bank) | 45 | JPGs procesados | Disponibles para piezas futuras |
| Teaser pre-lanzamiento | 1 | Publicado 14/04 en IG+FB | Ya publicado |

**Contenido listo para publicar hoy (15/04):** 30 piezas estaticas. Eso es todo.

Los 3 carruseles necesitan staging + adaptacion del script para IG Carousel API. Los 2 reels necesitan que el owner grabe clips en una salida real. No hay contenido de video listo.

### Infraestructura

| Componente | Estado |
|------------|--------|
| n8n workflow (publicacion diaria 12:15 AR) | ACTIVO, primer test real hoy 15/04 |
| Meta API (IG + FB) | Configurada, token page-level |
| Cloudflare Pages | Deployeado en social-assets.espacionautico.com.ar |
| GitHub Actions | Obsoleto (n8n lo reemplazo), pendiente de limpieza |
| Script publicacion manual | Disponible como plan B |

### Calendario de publicacion

35 piezas distribuidas en 30 dias (15 abr - 14 may):
- 1 pieza diaria (30 piezas estaticas)
- 3 carruseles en fines de semana clave (18/04, 24/04, 03/05)
- 2 reels en sabados (25/04, 02/05)
- Dias con doble contenido: 6 dias tienen pieza + carrusel o pieza + reel

---

## 2. Datos que faltan

Antes de proyectar con precision, necesito datos que hoy no tenemos. Este diagnostico trabaja con estimaciones conservadoras del mercado argentino. Cuando tengamos datos reales de las primeras 72 horas, recalibramos.

### Lo que no tenemos

| Dato faltante | Por que importa | Como lo conseguimos |
|---------------|-----------------|---------------------|
| Benchmark de cuentas nauticas AR en IG | Para saber que tasa de crecimiento es realista en el nicho | Analisis manual de 5-10 competidores (seguidores, engagement rate, frecuencia) |
| Costo por seguidor (CPS) real en Argentina abr-2026 | Para proyectar cuantos seguidores compra el presupuesto | Lo vamos a medir en los primeros 3-5 dias de pauta |
| Engagement rate promedio del nicho experiencias BA | Para comparar nuestro rendimiento | Herramientas como Not Just Analytics o manualmente |
| CPM y CTR de referencia para nicho experiencias | Para estimar reach pagado | Primeras campanas nos lo van a dar |
| Datos del teaser del 14/04 | Para calibrar baseline organico | Revisar insights de Meta 24-48 hs despues de publicacion |

### Estimaciones de mercado que uso en este documento

Estas son estimaciones basadas en rangos tipicos del mercado argentino para cuentas nuevas en nichos de experiencias/turismo/lifestyle, abril 2026. No son datos propios todavia.

| Metrica | Rango estimado | Fuente |
|---------|---------------|--------|
| Costo por seguidor pagado (CPS) | ARS 25 - 80 | Promedio cuentas nuevas AR, nichos no masivos |
| CPM (costo por mil impresiones) | ARS 800 - 2.500 | Rango IG/FB Argentina, audiencia urbana |
| CTR promedio (ads awareness) | 0.8% - 2.5% | Benchmark Meta Ads nicho experiencias |
| Follow rate desde perfil visit | 15% - 35% | Cuentas nuevas con buen contenido, primeras semanas |
| Organic reach como % de seguidores | 20% - 60% | Cuentas chicas, primeras semanas (despues baja) |
| Engagement rate organico esperado | 3% - 8% | Cuentas nuevas con contenido de calidad |

---

## 3. Analisis de riesgo del objetivo 10K en 30 dias

### La matematica cruda

```
Objetivo:           10.000 seguidores
Plazo:              30 dias
Seguidores/dia:     ~333
Presupuesto total:  ARS 250.000
Presupuesto/dia:    ARS 8.333
```

### Escenario de presupuesto: todo a followers

Si pusieras los ARS 250K **exclusivamente** en campanas de seguidores:

| CPS | Seguidores pagados | Llega a 10K? |
|-----|-------------------|--------------|
| ARS 25 (optimista extremo) | 10.000 | Justo, sin margen |
| ARS 40 (optimista) | 6.250 | No, faltan 3.750 |
| ARS 60 (medio) | 4.166 | No, faltan 5.834 |
| ARS 80 (conservador) | 3.125 | No, faltan 6.875 |

### Pero no podes poner todo en followers

Una cuenta nueva necesita:
1. **Awareness** (que la gente sepa que existis) — 30-40% del presupuesto
2. **Engagement** (que interactuen con el contenido) — 20-30% del presupuesto
3. **Followers/conversiones** (que te sigan) — 30-40% del presupuesto

Si asignas 35% del presupuesto a followers = ARS 87.500 para seguidores pagados.

| CPS | Seguidores pagados (con 35% budget) | + organico estimado | Total estimado |
|-----|--------------------------------------|---------------------|----------------|
| ARS 25 | 3.500 | 500-1.500 | 4.000-5.000 |
| ARS 40 | 2.187 | 500-1.500 | 2.687-3.687 |
| ARS 60 | 1.458 | 500-1.500 | 1.958-2.958 |
| ARS 80 | 1.093 | 500-1.500 | 1.593-2.593 |

### El problema del organic reach en cuentas nuevas

- Una cuenta con 0 seguidores tiene 0 reach organico. No hay base.
- El algoritmo de IG necesita **senales de engagement** para empezar a distribuir contenido.
- Las primeras 2-4 semanas son las mas duras: publicas, casi nadie lo ve, el algoritmo todavia no "entiende" tu audiencia.
- Los Reels son la excepcion: pueden tener reach fuera de tu base. Pero tenemos 0 reels filmados.
- Los carruseles tienen buen save rate pero necesitan base de seguidores para arrancar.

### El factor tiempo

El algoritmo de Meta no es lineal. El crecimiento en los primeros 7-10 dias va a ser lento, y si algo funciona, se puede acelerar en la semana 3-4. Esto significa:

- **Semana 1:** 50-150 seguidores/dia (arranque frio, calibracion de ads)
- **Semana 2:** 100-250 seguidores/dia (ads optimizados, algo de traccion organica)
- **Semana 3:** 150-350 seguidores/dia (si el contenido conecta y los ads estan bien)
- **Semana 4:** 200-400 seguidores/dia (mejor escenario con todo funcionando)

Sumando esos rangos: **1.500 a 4.500 seguidores en 30 dias** es el rango realista.

---

## 4. Tres tiers de objetivo

### Tier 1: Optimista — 10.000 seguidores

**Que tendria que pasar:**
- Al menos 1-2 piezas se viralizan organicamente (reach 100K+)
- CPS pagado por debajo de ARS 30
- Los reels se filman, editan y publican en la semana 1 y tienen reach explosivo
- Se genera UGC (contenido de usuarios) que amplifica la marca
- Se consigue alguna colaboracion con cuenta grande del nicho experiencias BA
- La pauta rinde en el percentil top 10% del mercado

**Probabilidad estimada: 5-10%**

No es imposible, pero depende de factores fuera de nuestro control (viralidad, timing, suerte). Planificar para esto seria irresponsable.

### Tier 2: Realista — 3.000 a 5.000 seguidores

**Que tendria que pasar:**
- Contenido de calidad publicado consistentemente (lo tenemos)
- Pauta bien segmentada y optimizada desde la semana 1
- CPS en rango ARS 40-60
- Al menos 1 reel publicado con buen reach
- Engagement rate arriba de 4% en las primeras semanas
- Carruseles funcionan como piezas de save/share
- Se adapta el script de publicacion para carruseles a tiempo

**Probabilidad estimada: 55-65%**

Este es el rango donde deberiamos apuntar. Es ambicioso pero alcanzable con ejecucion impecable y presupuesto bien distribuido.

### Tier 3: Minimo aceptable — 1.000 a 2.000 seguidores

**Que tendria que pasar:**
- Publicacion consistente sin virales
- Pauta con CPS en rango ARS 60-80 (normal para cuenta nueva)
- Organic reach bajo, tipico de arranque
- Sin reels (si no se filman a tiempo)
- El algoritmo tarda mas de lo esperado en distribuir

**Probabilidad estimada: 85-90%**

Este baseline lo alcanzamos casi seguro si ejecutamos bien la pauta y mantenemos la frecuencia de publicacion. No es sexy, pero es una base solida para escalar.

### Resumen de tiers

| Tier | Seguidores | Probabilidad | Depende de |
|------|-----------|-------------|------------|
| Optimista | 10.000 | 5-10% | Viralidad + todo perfecto |
| Realista | 3.000-5.000 | 55-65% | Ejecucion impecable + pauta optimizada |
| Minimo | 1.000-2.000 | 85-90% | Consistencia basica + pauta decente |

### Mi recomendacion

**Apuntar al tier realista (3-5K) con plan de ejecucion del tier minimo como piso.** Si llegamos a 5K en 30 dias, es un exito rotundo para una cuenta que arranca de cero. Los 10K son un horizonte de 60-90 dias con crecimiento sostenido, no de 30 dias.

---

## 5. Prohibiciones explicitas

El usuario fue claro: crecimiento real o nada. Estas son las practicas prohibidas y por que cada una dana la cuenta.

### NO compra de seguidores

Cuentas que compran seguidores tienen engagement rate de 0.1-0.5%. Meta detecta la incongruencia entre seguidores y engagement, y **castiga el reach organico** de la cuenta permanentemente. Ademas, los seguidores falsos nunca compran, nunca interactuan, y ensucian los datos de audiencia que Meta usa para optimizar ads. Te sale mas caro todo despues.

### NO bots de engagement

Los bots de likes y comentarios generan interacciones vacias que el algoritmo de Meta identifica cada vez mejor. Resultado: tu contenido se muestra a cuentas de baja calidad, tu engagement real baja, y cuando Meta hace una limpieza (cada 2-3 meses), perdes de golpe miles de "seguidores" y la cuenta queda marcada.

### NO pods de likes/comentarios

Los pods (grupos donde todos se likean mutuamente) generan engagement concentrado en los primeros minutos, lo que parecia bueno en 2020 pero hoy el algoritmo de Meta lo detecta como patron artificial. Resultado: reach reducido y contenido mostrado a la audiencia incorrecta.

### NO follow/unfollow masivo

Meta tiene limites de acciones por hora (60 follows/hora, por ejemplo). Superarlos genera shadowban temporal o permanente. Ademas, los seguidores conseguidos asi tienen tasa de unfollow del 70-80% en 30 dias. Es esfuerzo desperdiciado que contamina metricas.

### NO comentarios automaticos

Comentarios genericos ("nice!", "love this!", emojis random) en cuentas ajenas son detectados por Meta como spam. Resultado: restricciones de accion en la cuenta, posible shadowban, y reputacion de marca danada si alguien lo nota.

### Principio general

Cada practica artificial optimiza una metrica de vanidad a costa de la salud de la cuenta. Una cuenta con 2.000 seguidores reales y 5% de engagement rate vale infinitamente mas que una con 10.000 seguidores falsos y 0.3% de engagement. Los seguidores reales compran, recomiendan y vuelven. Los falsos solo ocupan un numero.

---

## 6. Recomendaciones iniciales

### Primeros 3 dias (15-17 abril): arranque y calibracion

**Publicacion:**
- piece-01 hoy (15/04) via n8n automatico. Verificar que se publico a las 12:15.
- piece-02 manana, piece-03 el viernes. Son las 3 piezas de Marca, Fase 1. Instalan quien es ENBA.
- Si n8n falla, publicar manualmente con el script local. No perder ni un dia.

**Pauta:**
- Activar la primera campana de awareness en Meta Ads Manager **hoy mismo**.
- Objetivo de campana: **Awareness** (no followers todavia). Queremos que Meta aprenda quien es la audiencia.
- Presupuesto dia 1-3: ARS 5.000/dia (ARS 15.000 total). Conservador hasta calibrar.
- Audiencia inicial: Buenos Aires ciudad + GBA, 25-55 anos, intereses en navegacion, deportes nauticos, escapadas, planes de fin de semana, experiencias al aire libre.
- Creatividad: piece-01 (manifesto) como pieza principal. Es la mas fuerte para primer impacto.

**Medicion:**
- A las 24 hs de piece-01: revisar impresiones, alcance, visitas al perfil, follows.
- A las 48 hs: revisar datos del teaser del 14/04 + piece-01 juntos. Primer patron.
- A las 72 hs: primer reporte de calibracion. Con esos datos ajustamos todo lo que sigue.

### Donde concentrar el presupuesto (primeras 2 semanas)

```
Semana 1-2: ARS 120.000 (48% del presupuesto mensual)
├── Awareness:     ARS 50.000 (42%)  — Reach, impresiones, reconocimiento
├── Engagement:    ARS 35.000 (29%)  — Interacciones con posts
└── Followers:     ARS 35.000 (29%)  — Crecimiento de comunidad

Semana 3-4: ARS 130.000 (52% del presupuesto mensual)
├── Awareness:     ARS 30.000 (23%)  — Reducimos, ya hay base
├── Engagement:    ARS 35.000 (27%)  — Mantenemos
└── Followers:     ARS 65.000 (50%)  — Aceleramos con datos optimizados
```

La logica: las primeras 2 semanas son para que Meta aprenda. Las ultimas 2 semanas son para escalar lo que funciono. Por eso el presupuesto de followers sube en la segunda mitad.

### Metricas a mirar primero

| Metrica | Que me dice | Frecuencia de revision |
|---------|-------------|----------------------|
| Follows netos / dia | Velocidad de crecimiento real | Diaria |
| Profile visits | Cuanta gente llega al perfil (funnel top) | Diaria |
| Follow rate (follows / profile visits) | Calidad del perfil y contenido | Cada 3 dias |
| Engagement rate (interacciones / reach) | Si el contenido conecta | Cada 3 dias |
| CPS (costo por seguidor) | Eficiencia del gasto | Cada 3 dias |
| CPM (costo por mil impresiones) | Precio del mercado | Semanal |
| Save rate (saves / reach) | Calidad percibida del contenido | Semanal |
| Share rate (shares / reach) | Potencial viral del contenido | Semanal |

### Senales de alerta temprana

**Alerta roja — actuar inmediatamente:**
- CPS arriba de ARS 100 despues de 5 dias de pauta. Algo esta mal en la segmentacion o el contenido.
- Engagement rate por debajo de 1% en contenido organico. El contenido no conecta.
- Follow rate por debajo de 10%. El perfil no convence a quien llega.
- 0 follows organicos en 48 hs. Problema serio de distribucion o contenido.

**Alerta amarilla — monitorear y ajustar:**
- CPS entre ARS 60-100 despues de la primera semana. Normal al inicio, pero no deberia mantenerse.
- Menos de 50 seguidores nuevos por dia despues de la semana 1. Estamos en el tier minimo.
- Save rate por debajo de 2%. El contenido se ve pero no se guarda. Falta valor percibido.
- Los carruseles no estan listos para sus fechas de calendario. Perdemos las piezas de mayor engagement potencial.

**Senal verde — escalar:**
- CPS por debajo de ARS 40. Doblar presupuesto en esa audiencia.
- Engagement rate arriba de 5%. El contenido conecta, producir mas de ese tipo.
- Un post supera 10K de reach organico. Analizar por que y replicar la formula.
- Follow rate arriba de 25%. El perfil convierte bien, mandar mas trafico.

---

## 7. Proximos pasos inmediatos

| Prioridad | Accion | Owner | Deadline |
|-----------|--------|-------|----------|
| 1 | Verificar publicacion piece-01 hoy 12:15 | Nico | 15/04 12:30 |
| 2 | Activar primera campana awareness en Meta Ads | Jose (necesita acceso Ads Manager) | 15/04 |
| 3 | Adaptar script publicacion para carruseles | Dani | 17/04 (carrusel-cuanto-sale sale el 18/04) |
| 4 | Stagear carrusel-cuanto-sale | Nico | 17/04 |
| 5 | Primer reporte de calibracion (teaser + piece-01) | Bruno | 18/04 |
| 6 | Filmar clips para reel-primera-vez | Jose (proximo salida) | 23/04 (reel sale 25/04) |
| 7 | Analisis de competidores directos (5-10 cuentas) | Bruno | 20/04 |

---

## 8. Compromiso de medicion

Voy a producir reportes en estos momentos:

1. **Reporte 72 hs** (18/04): primer corte de datos, calibracion de CPS y engagement. Ajustes de pauta.
2. **Reporte semanal 1** (22/04): primera semana completa. Tier check: donde estamos parados.
3. **Reporte semanal 2** (29/04): segunda semana. Datos suficientes para proyectar cierre de mes.
4. **Reporte semanal 3** (06/05): tercera semana. Ajustes finales de presupuesto.
5. **Reporte de cierre** (15/05): resultado final, aprendizajes, plan para el mes 2.

Cada reporte va a tener: numeros reales, comparacion con proyeccion, que funciono, que no, y que cambiamos.

---

## Nota final

Voy a ser directo: 10K en 30 dias con ARS 250K y una cuenta que arranca de cero es un objetivo extremadamente ambicioso. No quiero decirte que es imposible porque no lo es — pero la probabilidad esta entre 5% y 10%.

Lo que si puedo decir con confianza: si ejecutamos bien, llegamos a 3.000-5.000 seguidores reales, con engagement genuino, una audiencia que nos sirve para el negocio, y una base solida para seguir creciendo.

Y 5.000 seguidores reales que interactuan, guardan, comparten y eventualmente reservan una travesia valen mas que 10.000 numeros vacios.

Los datos de los primeros 3-5 dias nos van a dar la verdad. Con esos datos, recalibro todo y ajustamos.

---

*Bruno — Social Growth & Performance Director, ENBA*
*15 de abril de 2026*
