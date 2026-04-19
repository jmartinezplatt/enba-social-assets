> **NOTA (19/04):** KPIs vigentes. Los umbrales de corte/escalado fueron recalibrados en `presupuesto-v3-final.md` secciones 9-10 (CPS > $100 cortar, CPS < $30 + ER > 3% escalar). Usar v3 cuando haya discrepancia.

# KPIs — Plan Crecimiento 10K

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 15 de abril de 2026
**Etapa:** Lanzamiento de cuenta — primeros 30 dias
**Input de:** Franco (metricas de contenido), Marina (metricas creativas)

---

## Premisa

No todos los KPIs importan igual en todas las etapas. Una cuenta que arranca de cero tiene necesidades distintas a una cuenta con 50K seguidores. Medir todo es paralizante. Medir lo correcto es accionable.

Este documento define que medir, por que, y que accion tomar cuando el numero sube o baja. Si un KPI no tiene una accion asociada, no es un KPI, es un dato decorativo.

---

## 1. KPIs primarios — determinan exito o fracaso

Estos 3 KPIs son los que miro primero cada dia. Si estan bien, el plan funciona. Si estan mal, hay que actuar.

### 1.1 Seguidores nuevos netos

| Detalle | Valor |
|---------|-------|
| **Que mide** | Crecimiento real de la comunidad (nuevos - unfollows) |
| **Frecuencia de medicion** | Diaria |
| **Fuente** | IG Insights > Audience > Followers |
| **Target por tier** | Ver tabla de targets semanales abajo |

**Por que es primario:** es el objetivo declarado del plan. Todo lo demas (engagement, alcance, pauta) es medio para llegar a mas seguidores reales.

**Acciones:**
- Si esta por debajo del target 3 dias seguidos: revisar pauta (audiencia, creatividad, CPS)
- Si esta por encima del target: identificar que pieza/audiencia esta rindiendo y escalar
- Si hay un spike un dia: verificar que no sea bot/spam (revisar calidad de los nuevos seguidores)

### 1.2 Costo por seguidor (CPS)

| Detalle | Valor |
|---------|-------|
| **Que mide** | Cuanto sale cada seguidor ganado via pauta |
| **Frecuencia de medicion** | Cada 3 dias |
| **Fuente** | Ads Manager > columna personalizada (costo total / seguidores nuevos del periodo) |
| **Target** | < ARS 60 promedio mensual. Ideal: < ARS 40 |

**Por que es primario:** con ARS 250K de presupuesto, el CPS determina cuantos seguidores podemos comprar. La diferencia entre CPS 40 y CPS 80 es literalmente el doble de seguidores.

**Nota:** Meta Ads Manager no reporta "costo por seguidor" directamente. Hay que calcularlo: gasto total en el periodo / seguidores nuevos netos del periodo. No todos los seguidores nuevos vienen de pauta (algunos son organicos), asi que el CPS real pagado es mas bajo que este calculo. Pero para simplificar, uso el CPS blended (pagado + organico) como metrica principal.

**Acciones:**
- CPS < ARS 30: escalar esa audiencia/creatividad (aumentar budget 20% cada 48h)
- CPS ARS 30-60: mantener, esta en rango saludable
- CPS ARS 60-80: monitorear, buscar que ad set esta inflando el promedio y pausarlo
- CPS > ARS 80: alerta roja. Pausar los ad sets con peor rendimiento, reasignar a los mejores

### 1.3 Alcance total (organico + pago)

| Detalle | Valor |
|---------|-------|
| **Que mide** | Cuantas personas unicas vieron nuestro contenido |
| **Frecuencia de medicion** | Semanal |
| **Fuente** | IG Insights > Overview > Accounts Reached + Ads Manager > Reach |
| **Target** | Ver tabla de targets semanales |

**Por que es primario:** el alcance es el tope del funnel. Si nadie nos ve, nadie nos sigue. En una cuenta nueva, el alcance pagado compensa la falta de alcance organico.

**Acciones:**
- Alcance organico < 20% del total: el contenido no sale de la burbuja. Revisar hashtags, hora de publicacion, formato
- Alcance organico > 50% del total: el contenido conecta. Reducir proporcionalmente el gasto en awareness y redirigir a followers/leads
- Alcance pago con CPM > ARS 3.500: audiencia saturada o demasiado chica. Ampliar targeting o cambiar creatividad

---

## 2. KPIs secundarios — informan decisiones

Estos KPIs no determinan exito por si solos, pero me dicen POR QUE los primarios estan subiendo o bajando. Los reviso cada 3 dias o semanalmente.

### 2.1 Engagement rate

| Detalle | Valor |
|---------|-------|
| **Formula** | (likes + comments + saves + shares) / alcance x 100 |
| **Frecuencia** | Cada 3 dias |
| **Fuente** | IG Insights > Content > cada post |
| **Benchmark** | > 5% semana 1-2, > 3.5% semana 3-4 (baja naturalmente al crecer la audiencia) |

**Input de Franco:** mirar engagement rate por tipo de contenido (estatico vs carrusel vs reel) para saber que formato priorizar en la produccion del mes 2.

**Acciones:**
- ER > 5%: contenido excelente, producir mas de ese tipo/formato
- ER 3-5%: rango saludable para cuenta en crecimiento
- ER < 2%: el contenido no conecta. Revisar copy (Sole), revisar visual (Dani), revisar audiencia de pauta

### 2.2 Save rate

| Detalle | Valor |
|---------|-------|
| **Formula** | saves / alcance x 100 |
| **Frecuencia** | Semanal |
| **Fuente** | IG Insights > Content |
| **Benchmark** | > 2% es bueno, > 4% es excelente |

**Input de Marina:** el save rate es el indicador mas fiable de calidad creativa. Un save dice "quiero volver a esto" o "quiero mandarselo a alguien despues". Para Marina, si una pieza tiene alto save rate, la direccion creativa funciona.

**Acciones:**
- Piezas con save rate > 4%: candidatas a pauta y a replicar el formato/angulo
- Carruseles deberian tener save rate > 5% (son inherentemente guardables). Si tienen < 3%, el contenido del carrusel no esta aportando valor suficiente

### 2.3 Share rate

| Detalle | Valor |
|---------|-------|
| **Formula** | shares / alcance x 100 |
| **Frecuencia** | Semanal |
| **Fuente** | IG Insights > Content |
| **Benchmark** | > 1% es bueno, > 2% es excepcional |

**Input de Marina:** un share es mas valioso que un save. Es un endorsement personal. Si alguien comparte un reel, esta diciendo "mira esto" a su circulo. Es el equivalente digital del boca a boca.

**Acciones:**
- Piezas con share rate > 2%: escalar con pauta inmediatamente (redistributr presupuesto si es necesario)
- Si los reels tienen share rate < 0.5%: el contenido no genera la emocion suficiente para compartir. Revisar cierre/CTA

### 2.4 Profile visits y follow rate

| Detalle | Valor |
|---------|-------|
| **Profile visits** | Cuanta gente visita nuestro perfil |
| **Follow rate** | Seguidores nuevos / profile visits x 100 |
| **Frecuencia** | Cada 3 dias |
| **Fuente** | IG Insights > Activity |
| **Benchmark follow rate** | 15-35% para cuenta nueva con buen contenido |

**Acciones:**
- Follow rate < 10%: el perfil no convence. Revisar bio, highlight covers, primeros 9 posts del grid. La gente llega pero no se queda.
- Follow rate > 25%: el perfil convierte muy bien. Invertir mas en trafico al perfil (ads de awareness, interaccion manual)

### 2.5 Retencion de reels

| Detalle | Valor |
|---------|-------|
| **Que mide** | Que porcentaje del reel ve la gente antes de irse |
| **Frecuencia** | Cada reel publicado |
| **Fuente** | IG Insights > Reels > Retention curve |
| **Benchmark** | Retencion promedio > 50% del video |

**Input de Marina:** la curva de retencion dice exactamente donde falla el reel. Caida antes de 3s = hook malo. Caida a los 15s = el medio pierde tension. Caida al final = el cierre no engancha. Cada caida tiene una correccion creativa especifica.

**Input de Franco:** reels con retencion > 50% y > 100 follows organicos en 24h son candidatos a escalar con pauta (hasta ARS 40K por reel segun su criterio).

**Acciones:**
- Retencion > 60%: reel excelente. Escalar con pauta.
- Retencion 40-60%: aceptable. Analizar la curva para mejorar en el siguiente reel.
- Retencion < 40%: el reel no funciona. Aprender del error y no pautar.

### 2.6 Clicks al sitio y clicks a WhatsApp/DM

| Detalle | Valor |
|---------|-------|
| **Fuente clicks al sitio** | IG Insights > Activity > Website clicks + GA4 (sesiones desde IG/FB) |
| **Fuente clicks WhatsApp** | GA4 > Events > whatsapp_click |
| **Frecuencia** | Semanal |
| **Benchmark** | Dificil establecer uno al inicio. El target es crecimiento semanal sostenido. |

**Acciones:**
- Si clicks al sitio crecen pero conversiones (contacto) no crecen: hay un problema en el sitio (UX, CTA, velocidad de carga). No es problema de redes.
- Si WhatsApp clicks son > 50% de todos los clicks de contacto: la gente prefiere WhatsApp. Priorizar CTAs de WhatsApp sobre otros metodos.

---

## 3. KPIs que NO importan ahora (y por que)

### 3.1 ROAS (Return on Ad Spend)

**Que mide:** cuantos pesos de ingreso genera cada peso de pauta.

**Por que no importa ahora:** ENBA no vende un producto de e-commerce con conversion directa. La cadena es: ven el post > visitan el perfil > nos escriben > coordinamos > navegan. No hay pixel de compra, no hay carrito, no hay precio online. Intentar medir ROAS con una conversion tan larga y manual es engañoso. Un ROAS de 0 no significa que la pauta no funciona; significa que la conversion ocurre offline.

**Cuando va a importar:** cuando tengamos un sistema de reservas online con precios y pagos, y el pixel pueda trackear la conversion completa. Probablemente mes 4-6.

### 3.2 Conversion rate del sitio

**Que mide:** % de visitantes que completan una accion objetivo.

**Por que no importa ahora:** con ~200-500 visitas semanales al sitio (estimacion optimista para el mes 1), cualquier conversion rate que calculemos va a tener un margen de error enorme. Una semana 2 personas completan el formulario (CR = 0.4%) y la siguiente 5 (CR = 1%). ¿Mejoramos 2.5x? No, simplemente la muestra es tan chica que el dato no es estadisticamente significativo.

**Cuando va a importar:** cuando el sitio tenga > 1.000 visitas semanales de forma sostenida. Probablemente mes 3-4.

### 3.3 Impression share

**Que mide:** que porcentaje de las impresiones posibles en tu audiencia estamos capturando.

**Por que no importa ahora:** con un presupuesto de ARS 250K y audiencias amplias, nuestro impression share va a ser minimo (<1%). Medirlo no aporta nada accionable. Solo importa cuando competis en un nicho chico y queres dominar la atencion.

### 3.4 Frequency score de IG

**Que mide:** que tan consistente es tu publicacion segun el algoritmo.

**Por que no importa ahora:** con publicacion diaria automatizada via n8n, la frecuencia esta resuelta. No necesitamos medir algo que ya esta en piloto automatico.

---

## 4. Targets semanales alineados con los 3 tiers del diagnostico

### Tier Minimo (probabilidad 85-90%)

| Metrica | Semana 1 | Semana 2 | Semana 3 | Semana 4 | Total 30 dias |
|---------|----------|----------|----------|----------|---------------|
| Seguidores nuevos | 150-300 | 200-400 | 250-500 | 400-800 | 1.000-2.000 |
| Seguidores/dia | 21-43 | 29-57 | 36-71 | 57-114 | -- |
| Alcance total/semana | 5K-15K | 15K-40K | 30K-60K | 40K-80K | -- |
| CPS blended | ARS 60-80 | ARS 50-70 | ARS 45-65 | ARS 40-60 | ARS 50-70 |
| Engagement rate | > 4% | > 3.5% | > 3% | > 3% | -- |

### Tier Realista (probabilidad 55-65%)

| Metrica | Semana 1 | Semana 2 | Semana 3 | Semana 4 | Total 30 dias |
|---------|----------|----------|----------|----------|---------------|
| Seguidores nuevos | 300-500 | 500-1.000 | 800-1.500 | 1.400-2.000 | 3.000-5.000 |
| Seguidores/dia | 43-71 | 71-143 | 114-214 | 200-286 | -- |
| Alcance total/semana | 15K-30K | 40K-80K | 80K-150K | 100K-200K | -- |
| CPS blended | ARS 40-60 | ARS 35-50 | ARS 30-45 | ARS 25-40 | ARS 35-50 |
| Engagement rate | > 5% | > 4.5% | > 4% | > 3.5% | -- |

### Tier Optimista (probabilidad 5-10%)

| Metrica | Semana 1 | Semana 2 | Semana 3 | Semana 4 | Total 30 dias |
|---------|----------|----------|----------|----------|---------------|
| Seguidores nuevos | 500-800 | 1.500-2.500 | 2.500-3.500 | 3.000-4.000 | 7.500-10.000+ |
| Seguidores/dia | 71-114 | 214-357 | 357-500 | 429-571 | -- |
| Alcance total/semana | 30K-60K | 100K-200K | 200K-400K | 300K-500K | -- |
| CPS blended | < ARS 30 | < ARS 25 | < ARS 20 | < ARS 20 | < ARS 25 |
| Engagement rate | > 6% | > 5% | > 4.5% | > 4% | -- |

### Como usar esta tabla

1. Al final de cada semana, ubicar donde estamos en los 3 tiers
2. Si estamos en tier minimo: no entrar en panico, pero ajustar pauta agresivamente. Revisar audiencias, creatividades, CPS.
3. Si estamos en tier realista: el plan funciona. Mantener lo que funciona, escalar gradualmente.
4. Si estamos en tier optimista: algo esta funcionando muy bien. Identificar QUE y por que. Doblar la apuesta en eso.

---

## 5. Metricas de contenido (input Franco)

Franco definio en su estrategia las metricas que el quiere mirar para evaluar el contenido. Las incluyo aca porque informan mis decisiones de pauta:

| Metrica de Franco | Que me dice a mi (Bruno) |
|-------------------|-------------------------|
| Saves promedio/post > 10 (sem 1) a > 80 (sem 4) | Si el save rate crece, el contenido tiene valor percibido. Puedo pautar con mas confianza. |
| DMs recibidos/semana 10-20 (sem 1) a 80-150 (sem 4) | DMs son la metrica mas directa de interes comercial. Si crecen, la pauta esta trayendo audiencia correcta. |
| Engagement rate > 5% (sem 1) bajando a > 3% (sem 4) | La caida es natural al crecer. Si cae mas rapido que esto, el crecimiento no es saludable. |
| Top 3 posts por saves+shares+follows cada semana | Estos son los candidatos a pautar o a replicar. Los incluyo en el reporte semanal. |

---

## 6. Metricas creativas (input Marina)

Marina definio en su analisis de reels las metricas que ella quiere mirar. Las incluyo aca:

| Metrica de Marina | Que me dice a mi (Bruno) |
|-------------------|-------------------------|
| Scroll-stop rate (retencion al segundo 3 del reel) | Si > 70%, el hook funciona. Si < 50%, hay que cambiar el hook antes de pautar. |
| Save rate > 2% del alcance | Indicador de calidad creativa. Pieza guardable = pieza pauteable. |
| Share rate > 1% del alcance | Indicador de potencial viral. Pieza compartible = escalar con pauta. |
| Retencion promedio > 50% del reel | Si cumple, escalar. Si no, aprender y corregir antes de pautar el siguiente reel. |
| Ratio reproducciones/alcance > 1.5x | La gente ve el reel mas de una vez. Señal de contenido que engancha. |
| Alcance no-seguidores > 70% | El contenido sale de la burbuja. En cuenta nueva, esto deberia ser la norma. |

---

## 7. Resumen: que miro, cuando, y que hago

| KPI | Frecuencia | Accion si esta MAL | Accion si esta BIEN |
|-----|-----------|--------------------|--------------------|
| Seguidores/dia | Diaria | Revisar pauta y contenido | Mantener ritmo |
| CPS | Cada 3 dias | Pausar ad sets caros, reasignar | Escalar 20% cada 48h |
| Alcance total | Semanal | Mas pauta de awareness o cambiar creatividad | Reducir awareness, mas followers |
| Engagement rate | Cada 3 dias | Revisar contenido con Franco | Producir mas de lo que funciona |
| Save rate | Semanal | Revisar valor del contenido con Marina | Pautar las piezas con alto save |
| Share rate | Semanal | Revisar cierre/CTA | Escalar con pauta inmediatamente |
| Follow rate | Cada 3 dias | Revisar perfil (bio, grid, highlights) | Meter mas trafico al perfil |
| Retencion reels | Cada reel | Analizar curva, corregir para el siguiente | Pautar el reel |
| Clicks sitio | Semanal | Revisar CTAs y link en bio | Optimizar landing page |

---

*Bruno — Social Growth & Performance Director, ENBA*
*15 de abril de 2026*
