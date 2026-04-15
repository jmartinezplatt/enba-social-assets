# Google Analytics 4 + UTMs + Medicion

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 15 de abril de 2026
**Sitio:** espacionautico.com.ar
**Objetivo:** medir todo lo que importa, separar metricas de redes de metricas del sitio

---

## 1. Setup GA4

### Crear propiedad

1. Ir a [analytics.google.com](https://analytics.google.com)
2. Admin > Create Property
3. Nombre: **Espacio Nautico Buenos Aires**
4. Zona horaria: Argentina (GMT-3)
5. Moneda: ARS
6. Elegir "Web" como plataforma
7. URL: `https://espacionautico.com.ar`
8. Copiar el Measurement ID (formato: `G-XXXXXXXXXX`)

### Instalar el tag

**Opcion A — Google Tag Manager (recomendado):**
1. Crear cuenta en [tagmanager.google.com](https://tagmanager.google.com)
2. Container name: `espacionautico.com.ar`
3. Instalar el snippet de GTM en el `<head>` y `<body>` del sitio
4. Dentro de GTM: crear tag "GA4 Configuration" con el Measurement ID
5. Trigger: All Pages
6. Publicar el container

**Opcion B — Directo (si no hay GTM):**
1. Pegar el gtag.js snippet en el `<head>` de todas las paginas
2. Verificar con la extension Google Analytics Debugger o en Realtime de GA4

### Verificar instalacion

1. GA4 > Reports > Realtime — visitar el sitio y ver si aparece la sesion
2. Si no aparece en 5 minutos: verificar que el tag esta en el `<head>`, no bloqueado por ad-blocker, y que el Measurement ID es correcto

---

## 2. Convencion de UTMs

Cada link que publiquemos en redes sociales lleva UTMs. Sin UTMs, GA4 no puede atribuir el trafico a la pieza especifica que lo genero.

### Estructura

```
https://espacionautico.com.ar/[pagina]?utm_source=[fuente]&utm_medium=[medio]&utm_campaign=[campana]&utm_content=[pieza]
```

### Valores estandar

| Parametro | Valores posibles | Cuando usar |
|-----------|-----------------|------------|
| `utm_source` | `instagram`, `facebook` | Siempre — identifica la plataforma |
| `utm_medium` | `organic`, `paid`, `story`, `bio`, `reel` | Siempre — identifica el tipo de trafico |
| `utm_campaign` | `lanzamiento-abr-2026`, `plan-10k`, `[nombre-especifico]` | Siempre — identifica la campana |
| `utm_content` | `piece-01`, `carrusel-cuanto-sale`, `reel-4-horas`, etc. | Siempre — identifica la pieza exacta |

### Ejemplos concretos

**Piece-01 en IG (organico), link en bio apuntando a travesias:**
```
https://espacionautico.com.ar/travesias?utm_source=instagram&utm_medium=bio&utm_campaign=lanzamiento-abr-2026&utm_content=piece-01
```

**Carrusel cuanto-sale en FB (pago), link en ad:**
```
https://espacionautico.com.ar/paseos-en-velero-buenos-aires?utm_source=facebook&utm_medium=paid&utm_campaign=plan-10k&utm_content=carrusel-cuanto-sale
```

**Reel 4-horas en IG story (organico):**
```
https://espacionautico.com.ar/travesias?utm_source=instagram&utm_medium=story&utm_campaign=lanzamiento-abr-2026&utm_content=reel-4-horas
```

**Ad de awareness en IG (pago):**
```
https://espacionautico.com.ar/?utm_source=instagram&utm_medium=paid&utm_campaign=awareness-abr-2026&utm_content=piece-01
```

### Reglas de UTMs

1. **Siempre en minusculas** — GA4 es case-sensitive, `Instagram` y `instagram` son fuentes distintas
2. **Sin espacios** — usar guiones: `lanzamiento-abr-2026`, no `lanzamiento abr 2026`
3. **Nunca UTMs en links internos** del sitio — solo en links que vienen desde afuera
4. **Cada pieza tiene su utm_content unico** — asi podemos saber exactamente que pieza trajo a cada visitante
5. **Para pauta:** los UTMs se configuran en el ad dentro de Ads Manager (seccion URL Parameters)

### Link en bio de IG

El link en bio de IG debe apuntar a una landing o al home con UTMs permanentes:
```
https://espacionautico.com.ar/?utm_source=instagram&utm_medium=bio&utm_campaign=plan-10k
```

Si se usa un servicio de links multiples (Linktree, etc.), cada link individual lleva sus propios UTMs.

---

## 3. Eventos custom en GA4

### Eventos a configurar

Estos eventos se configuran en Google Tag Manager (o directamente en el codigo del sitio si no hay GTM).

| Evento | Trigger | Parametros | Prioridad |
|--------|---------|-----------|-----------|
| `contact_click` | Click en cualquier boton de contacto | `contact_method`: whatsapp/dm/email/phone | Alta — dia 1 |
| `whatsapp_click` | Click especifico en boton WhatsApp | `page_path`, `utm_content` | Alta — dia 1 |
| `form_submit` | Envio de formulario de contacto | `form_name`, `page_path` | Alta — dia 1 |
| `scroll_depth` | Scroll al 25%, 50%, 75%, 90% | `percent_scrolled`, `page_path` | Media — semana 1 |
| `vertical_view` | Visita a pagina de vertical especifica | `vertical`: travesias/escuela/broker/servicios | Media — semana 1 |
| `cta_click` | Click en CTA dentro de paginas | `cta_text`, `cta_destination` | Baja — semana 2 |

### Configuracion en GTM

**Para `contact_click` y `whatsapp_click`:**
1. Crear trigger: Click - All Elements
2. Condicion: Click URL contains `wa.me` o `whatsapp` (para WhatsApp)
3. O Click classes/ID que identifique el boton de contacto
4. Tag: GA4 Event con nombre `contact_click` y parametro `contact_method`

**Para `scroll_depth`:**
1. Crear trigger: Scroll Depth
2. Vertical Scroll Depths: 25, 50, 75, 90
3. Tag: GA4 Event con nombre `scroll_depth` y parametro `percent_scrolled`

**Para `form_submit`:**
1. Crear trigger: Form Submission
2. Condicion: Page Path o Form ID del formulario de contacto
3. Tag: GA4 Event con nombre `form_submit`

### Marcar como conversiones en GA4

1. GA4 > Admin > Events > marcar como conversion:
   - `contact_click`
   - `whatsapp_click`
   - `form_submit`
2. Esto permite que GA4 reporte estas acciones como objetivos cumplidos

---

## 4. Dashboard semanal en GA4

### Crear un dashboard con estos widgets

**Seccion 1: Adquisicion por canal**
- Usuarios por `Session source / medium`
- Filtrar: instagram/organic, instagram/paid, instagram/story, instagram/bio, facebook/organic, facebook/paid, direct, google/organic
- Periodo: ultimos 7 dias vs 7 dias anteriores

**Seccion 2: Paginas mas visitadas**
- Pageviews por `Page path`
- Top 10 paginas
- Incluir: engagement rate por pagina, tiempo promedio en pagina

**Seccion 3: Conversiones**
- Eventos de conversion por fuente
- `contact_click`, `whatsapp_click`, `form_submit`
- Desglose por `utm_content` para ver que pieza genera mas contactos

**Seccion 4: Comportamiento**
- Tasa de scroll (cuantos llegan al 50% y 90%)
- Bounce rate por fuente
- Paginas de salida

### Como crearlo

1. GA4 > Reports > Library > Create new report
2. O usar Looker Studio (gratis) conectado a GA4 para un dashboard mas flexible
3. **Recomendacion:** Looker Studio para el dashboard visual que se comparte, GA4 nativo para exploracion ad-hoc

---

## 5. Conexion Meta Ads + GA4

### Opcion 1: UTMs manuales (implementar ya)

Es lo que describimos arriba. Cada ad en Meta lleva UTMs, GA4 los lee automaticamente. No requiere configuracion adicional.

**Limitaciones:** no hay data de costo en GA4 (no sabes cuanto costo cada sesion de Meta Ads dentro de GA4). Para eso necesitas cruzar manualmente con los datos de Ads Manager.

### Opcion 2: Conversions API (CAPI) — implementar mes 2

CAPI envia eventos del servidor de espacionautico.com.ar directamente a Meta, sin depender del browser. Esto mejora la atribucion porque:
- No lo bloquean los ad-blockers
- No depende de cookies de terceros
- Meta puede optimizar mejor las campanas con datos mas completos

**Setup CAPI:**
1. En Events Manager > Settings > Conversions API
2. Requiere configuracion server-side (funcion en Cloudflare Workers o servidor propio)
3. Enviar al menos los eventos: `PageView`, `Lead`, `Contact`
4. Incluir datos de deduplicacion (event_id) para no contar doble

**Complejidad:** media-alta. Para el mes 1, UTMs alcanzan. CAPI es la evolucion natural para el mes 2-3.

### Opcion 3: Import de costos en GA4

GA4 permite importar datos de costos de Meta Ads manualmente (CSV upload) o via conectores de terceros. Esto permite ver en GA4: cuanto costo cada sesion de Meta, CPA real, etc.

**Para el mes 1:** no es necesario. El cruce manual entre Ads Manager + GA4 alcanza para el volumen de datos que vamos a tener.

---

## 6. Separar metricas de redes vs metricas del sitio

### Metricas de redes (fuente: Meta/IG Insights + Ads Manager)

| Metrica | Donde verla | Frecuencia |
|---------|------------|-----------|
| Seguidores nuevos | IG Insights > Audience | Diaria |
| Alcance por post | IG Insights > Content | Cada post |
| Engagement (likes, comments, saves, shares) | IG Insights > Content | Cada post |
| Impresiones/alcance de ads | Ads Manager | Diaria |
| CPS, CPM, CTR de ads | Ads Manager | Cada 3 dias |
| Retencion de reels | IG Insights > Reels | Cada reel |
| Profile visits | IG Insights > Activity | Diaria |

### Metricas del sitio (fuente: GA4)

| Metrica | Donde verla | Frecuencia |
|---------|------------|-----------|
| Sesiones totales y por fuente | GA4 > Acquisition | Semanal |
| Sesiones desde IG/FB (organico vs pago) | GA4 > Acquisition, filtrar por utm_source | Semanal |
| Paginas mas visitadas | GA4 > Engagement > Pages | Semanal |
| Conversiones (contacto, WhatsApp, form) | GA4 > Conversions | Semanal |
| Tiempo en pagina por vertical | GA4 > Engagement > Pages | Semanal |
| Scroll depth | GA4 > Events > scroll_depth | Semanal |
| Atribucion por pieza (utm_content) | GA4 > Acquisition > filtrar por utm_content | Semanal |

### Regla de oro

**No mezclar metricas de plataformas distintas en la misma tabla.**

Meta reporta impresiones, alcance y engagement dentro de su ecosistema. GA4 reporta sesiones, conversiones y comportamiento en el sitio. Son mundos distintos con definiciones distintas.

El cruce se hace en el reporte semanal, donde muestro ambas fuentes lado a lado y conecto: "esta pieza tuvo X alcance en IG y genero Y sesiones en el sitio con Z conversiones."

---

## 7. Template de reporte integrado

Ver `reporte-semanal-template.md` para el formato completo. La seccion de GA4 dentro del reporte incluye:

```
## Metricas de sitio (GA4)
| Metrica | Semana actual | Semana anterior | Delta |
|---------|--------------|-----------------|-------|
| Sesiones totales | | | |
| Sesiones desde IG (organico) | | | |
| Sesiones desde IG (pago) | | | |
| Sesiones desde FB (organico) | | | |
| Sesiones desde FB (pago) | | | |
| Contactos (contact_click) | | | |
| WhatsApp clicks | | | |
| Form submits | | | |
| Top pieza por sesiones (utm_content) | | | |
| Top pagina por tiempo en pagina | | | |
```

---

## 8. Checklist de setup GA4 (dia 1-3)

- [ ] Propiedad GA4 creada (moneda ARS, zona AR)
- [ ] Tag instalado en espacionautico.com.ar (via GTM o directo)
- [ ] Verificado con Realtime en GA4
- [ ] Evento `contact_click` configurado
- [ ] Evento `whatsapp_click` configurado
- [ ] Evento `form_submit` configurado
- [ ] Eventos marcados como conversiones en GA4
- [ ] Link en bio de IG con UTMs
- [ ] UTMs configurados en el primer ad de Meta
- [ ] Trigger de scroll depth configurado (puede esperar a semana 1)

---

*Bruno — Social Growth & Performance Director, ENBA*
*15 de abril de 2026*
