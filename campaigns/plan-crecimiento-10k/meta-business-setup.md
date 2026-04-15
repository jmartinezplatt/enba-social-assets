# Meta Business Suite — Guia de configuracion paso a paso

**Autor:** Bruno (Social Growth & Performance Director)
**Fecha:** 15 de abril de 2026
**Cuenta:** Espacio Nautico Buenos Aires
**Objetivo:** dejar la infraestructura publicitaria lista para pautar desde el dia 1

---

## 1. Meta Business Manager

### Acceso o creacion

1. Ir a [business.facebook.com](https://business.facebook.com)
2. Si ya tenes una cuenta Business Manager personal, crear una nueva para ENBA (Settings > Business Info > Create New)
3. Si no tenes ninguna, crear desde cero con el email asociado a la pagina de FB de ENBA
4. Nombre del Business Manager: **Espacio Nautico Buenos Aires**
5. Email de contacto: el email principal de la cuenta

### Vincular cuenta de Instagram

1. Business Settings > Accounts > Instagram Accounts > Add
2. Loguearse con las credenciales de @espacionauticobsas
3. Confirmar la vinculacion desde la app de IG (Settings > Account > Linked Accounts > Facebook)
4. Verificar que aparezca como "Connected" en Business Manager

### Vincular pagina de Facebook

1. Business Settings > Accounts > Pages
2. Si la pagina ya existe y vos sos admin: "Add Page" > seleccionar
3. Si la creo otra persona: "Request Access" y que el admin apruebe
4. Verificar que los roles esten correctos: el usuario principal debe ser Admin de la pagina

### Verificar permisos y roles

| Rol | Quien | Nivel |
|-----|-------|-------|
| Admin Business Manager | Jose (owner) | Full access |
| Admin de pagina FB | Jose | Admin |
| Admin cuenta IG | Jose | Full access |
| Analista (opcional) | Bruno/equipo | Analyst — solo lectura de datos |

**Verificacion:** Business Settings > People > verificar que cada persona tenga el nivel correcto. No dar Admin a quien no lo necesita.

### Activos a vincular

- [x] Pagina de Facebook
- [x] Cuenta de Instagram
- [ ] Cuenta publicitaria (crear si no existe)
- [ ] Meta Pixel
- [ ] Dominio (espacionautico.com.ar)

---

## 2. Cuenta publicitaria

### Crear cuenta publicitaria

1. Business Settings > Accounts > Ad Accounts > Add > Create a New Ad Account
2. Nombre: **ENBA - Ads Principal**
3. Moneda: **ARS (Peso argentino)** — IMPORTANTE: no se puede cambiar despues
4. Zona horaria: **America/Buenos_Aires (GMT-3)**
5. Asignar al Business Manager de ENBA

### Configurar metodo de pago

1. Ads Manager > Payment Settings (o Business Settings > Payments)
2. Agregar tarjeta de credito/debito
3. **Recomendacion:** usar tarjeta de credito (no debito) para evitar rechazos por limite diario
4. Configurar limite de gasto de cuenta: **ARS 300.000** (margen sobre los 250K para no quedar corto por impuestos/comisiones)
5. Meta cobra impuestos argentinos (~40% adicional al gasto neto). Con ARS 250K de presupuesto neto, el debito real en la tarjeta sera ~ARS 350.000. **Verificar con el banco que la tarjeta tenga ese limite.**

### Estructura de la cuenta

```
Business Manager: Espacio Nautico Buenos Aires
├── Ad Account: ENBA - Ads Principal (ARS)
├── Page: Espacio Nautico Buenos Aires (FB)
├── Instagram Account: @espacionauticobsas
├── Pixel: ENBA Pixel
├── Domain: espacionautico.com.ar
└── Credential n8n: Meta API ENBA (ID: n8scJzbGXnCprioD)
```

---

## 3. Meta Pixel

### Instalacion en espacionautico.com.ar

1. Events Manager > Connect Data Sources > Web > Meta Pixel
2. Nombre del pixel: **ENBA Pixel**
3. Copiar el codigo base del pixel
4. Instalar en el `<head>` de espacionautico.com.ar (todas las paginas)
5. Si el sitio usa un CMS (WordPress, etc.), usar el plugin oficial de Meta
6. Si es custom/static, pegar el snippet directamente en el template HTML principal

### Verificar instalacion

1. Instalar la extension **Meta Pixel Helper** en Chrome
2. Visitar espacionautico.com.ar — debe aparecer el pixel activo con evento `PageView`
3. En Events Manager, verificar que aparezcan eventos en tiempo real
4. Si no aparece: verificar que el codigo esta en el `<head>`, no en el `<body>`

### Eventos standard a configurar

| Evento | Donde se dispara | Como |
|--------|-----------------|------|
| `PageView` | Todas las paginas | Automatico con el pixel base |
| `ViewContent` | Paginas de verticales (/travesias, /escuela-nautica, etc.) | Agregar `fbq('track', 'ViewContent', {content_name: 'travesias'})` |
| `Contact` | Click en boton WhatsApp o DM | Agregar `fbq('track', 'Contact')` al onclick del boton |
| `Lead` | Envio de formulario de contacto | Agregar `fbq('track', 'Lead')` al submit del form |
| `Schedule` | Click en "Reservar" (si existe) | Agregar `fbq('track', 'Schedule')` |

### Eventos custom adicionales

| Evento custom | Trigger |
|---------------|---------|
| `contact_click` | Click en cualquier boton de contacto (WhatsApp, DM, email) |
| `whatsapp_click` | Click especifico en boton de WhatsApp |
| `scroll_depth_50` | Scroll al 50% de la pagina (con JS listener) |
| `scroll_depth_90` | Scroll al 90% de la pagina |

---

## 4. Verificacion de dominio

1. Business Settings > Brand Safety > Domains > Add Domain
2. Ingresar: `espacionautico.com.ar`
3. Verificar con meta-tag en el `<head>` del sitio o con DNS TXT record
4. **Recomendacion:** DNS TXT record es mas limpio y no requiere cambios en el HTML. Agregar el TXT record en Cloudflare (donde esta el DNS de ENBA).
5. Una vez verificado, configurar Aggregated Event Measurement para el dominio

---

## 5. Audiencias

### Custom Audiences (audiencias personalizadas)

Crear estas 4 audiencias el dia 1. Van a estar vacias al principio pero se llenan automaticamente a medida que hay trafico.

| Audiencia | Fuente | Ventana | Tamano estimado sem 1 |
|-----------|--------|---------|----------------------|
| **Web Visitors** | Pixel - todos los que visitaron el sitio | 30 dias | 0-200 |
| **IG Engagers** | Instagram - cualquier interaccion | 90 dias | 50-500 |
| **FB Page Engagers** | Pagina FB - cualquier interaccion | 90 dias | 20-200 |
| **Video Viewers** | Gente que vio >50% de cualquier video/reel | 30 dias | 0 (sin reels todavia) |

**Como crearlas:**
1. Ads Manager > Audiences > Create Audience > Custom Audience
2. Elegir fuente (Website, Instagram Account, Facebook Page, Video)
3. Definir la ventana de tiempo y el criterio de inclusion
4. Nombrar con convencion: `ENBA - [fuente] - [criterio] - [ventana]`

### Lookalike Audiences (audiencias similares)

Crear una Lookalike desde cada Custom Audience **cuando tenga al menos 100 personas**. Antes de eso, Meta no tiene suficiente data para modelar bien.

| Lookalike | Basada en | Tamano | Cuando crear |
|-----------|-----------|--------|-------------|
| LAL Web Visitors 1% | Web Visitors | 1% Argentina | Cuando Web Visitors > 100 |
| LAL IG Engagers 1% | IG Engagers | 1% Argentina | Cuando IG Engagers > 100 |
| LAL FB Engagers 1% | FB Page Engagers | 1% Argentina | Cuando FB Engagers > 100 |
| LAL Video Viewers 1% | Video Viewers | 1% Argentina | Cuando Video Viewers > 100 |

**Regla:** empezar siempre con 1% (la mas parecida). Solo ampliar a 2-3% si el 1% se agota (frecuencia > 3).

### Saved Audiences (audiencias guardadas por intereses)

Crear estas audiencias para la pauta de los primeros dias (cuando no hay custom audiences todavia):

| Audiencia | Ubicacion | Edad | Intereses |
|-----------|-----------|------|-----------|
| **Nautica BA** | Buenos Aires ciudad + GBA (40km) | 25-55 | Navegacion a vela, yachting, deportes nauticos, regata |
| **Experiencias BA** | Buenos Aires ciudad + GBA | 25-45 | Planes de fin de semana, experiencias al aire libre, turismo aventura, escapadas |
| **Lifestyle Parejas** | Buenos Aires ciudad + GBA | 25-40 | Planes en pareja, regalos originales, restaurantes Buenos Aires, outdoor activities |
| **Outdoor/Aventura** | Buenos Aires ciudad + GBA | 20-45 | Kayak, trekking, campamento, deportes al aire libre, naturaleza |

**Exclusion obligatoria en todas:** excluir a quienes ya siguen @espacionauticobsas (para no pagar por seguidores existentes).

---

## 6. Estructura de campanas

### Nomenclatura

```
Campana:    ENBA_[objetivo]_[mes-ano]
Ad Set:     ENBA_[audiencia]_[ubicacion]_[mes]
Ad:         ENBA_[pieza-id]_[formato]_[variante]
```

Ejemplos:
- Campana: `ENBA_Awareness_abr-2026`
- Ad Set: `ENBA_NauticaBA_IGFeed_abr`
- Ad: `ENBA_piece-01_estatico_v1`

### Por objetivo de campana

#### Awareness (Semanas 1-2: prioridad alta)

**Objetivo en Ads Manager:** Awareness > Reach o Brand Awareness
**Que logra:** que la gente sepa que ENBA existe. Maximiza impresiones y alcance.
**Cuando:** primeros 10 dias, con las piezas mas fuertes de marca (piece-01, piece-02, piece-03).
**Presupuesto:** 30% del total mensual (~ARS 75.000)

| Ad Set | Audiencia | Ubicacion | Budget diario |
|--------|-----------|-----------|---------------|
| Nautica BA | Saved: Nautica BA | IG Feed + Stories + Reels | ARS 2.000 |
| Experiencias BA | Saved: Experiencias BA | IG Feed + Stories + FB Feed | ARS 2.500 |
| Outdoor | Saved: Outdoor/Aventura | IG Feed + Stories | ARS 1.500 |

#### Consideration: Engagement (Semanas 1-4: constante)

**Objetivo en Ads Manager:** Engagement > Post Engagement o Video Views
**Que logra:** interacciones con el contenido, lo que alimenta las Custom Audiences.
**Cuando:** todo el mes, rotando las piezas con mejor performance organico.
**Presupuesto:** 25% del total (~ARS 62.500)

#### Consideration: Traffic (Semanas 2-4)

**Objetivo en Ads Manager:** Traffic > Website
**Que logra:** visitas al sitio, alimenta el Pixel y la audiencia Web Visitors.
**Cuando:** a partir de semana 2, cuando hay contenido que direcciona al sitio.
**Presupuesto:** 10% del total (~ARS 25.000)
**UTMs obligatorios:** ver documento `google-analytics-medicion.md`

#### Conversion: Leads / Mensajes (Semanas 2-4)

**Objetivo en Ads Manager:** Leads > Messages (Instagram Direct o WhatsApp)
**Que logra:** consultas directas, el paso mas cercano a una reserva.
**Cuando:** a partir de semana 2, con piezas de travesias y escuela.
**Presupuesto:** 35% del total (~ARS 87.500)
**Nota:** priorizar Instagram Direct sobre WhatsApp al inicio (mas datos de atribucion).

### Conjuntos de anuncios: segmentacion por audiencia y ubicacion

| Audiencia | IG Feed | IG Stories | IG Reels | FB Feed | FB Stories |
|-----------|---------|-----------|----------|---------|-----------|
| Nautica BA | Si | Si | Si | Si | No |
| Experiencias BA | Si | Si | Si | Si | Si |
| Lifestyle Parejas | Si | Si | No | Si | No |
| Outdoor | Si | Si | Si | No | No |
| LAL IG Engagers | Si | Si | Si | Si | Si |
| Retargeting Web | Si | Si | Si | Si | Si |

**Regla:** empezar con ubicaciones automaticas (Advantage+). Despues de 5 dias, revisar breakdown por ubicacion y cortar las que tengan CPS > 2x del promedio.

### Anuncios: que creatividades usar

**Semana 1:**
- piece-01 (manifesto de marca) — pieza principal, mayor presupuesto
- piece-02 (ubicacion Costanera Norte) — segunda pieza
- piece-03 (pieza humana) — tercera pieza

**Semana 2:**
- Carrusel cuanto-sale (si esta listo para pauta)
- Reel 4-horas-en-el-rio (si esta filmado y editado)
- Las 2-3 piezas con mejor engagement organico de semana 1

**Semana 3-4:**
- Reel primera-vez (como retargeting)
- Carrusel no-es-tour
- Top performers de semanas anteriores
- Rotar creatividades para evitar fatigue

---

## 7. Reglas de gestion de pauta

### Cuando APAGAR un ad/ad set

Apagar si cumple CUALQUIERA de estos despues de 72 horas de running:

| Metrica | Umbral de corte | Por que |
|---------|----------------|---------|
| CPS (costo por seguidor) | > ARS 80 | Ineficiente, el presupuesto rinde mas en otro lado |
| CTR (click-through rate) | < 0.5% | La creatividad no genera interes, la audiencia no reacciona |
| Frecuencia | > 3 | La misma persona ve el ad 3+ veces, genera fatigue y rechazo |
| Engagement rate del ad | < 0.3% | No genera ninguna interaccion, es invisible |
| CPM | > ARS 3.500 | El mercado esta caro para esa audiencia, probar otra |

**Proceso:** no apagar antes de 72 horas (Meta necesita tiempo para optimizar). Si a las 72h esta en umbral de corte, apagar y reasignar presupuesto.

### Cuando DUPLICAR un ad/ad set

Duplicar si cumple AL MENOS 2 de estos despues de 72 horas:

| Metrica | Umbral de duplicacion | Que hacer |
|---------|----------------------|-----------|
| CPS | < ARS 30 | Duplicar el ad set con 50% mas de presupuesto |
| Engagement rate | > 3% | Duplicar con nueva audiencia similar |
| CTR | > 2% | Duplicar en nuevas ubicaciones |
| Save rate | > 3% | Indica contenido de alto valor, escalar |

**Proceso de duplicacion:**
1. Duplicar el ad set (no el ad dentro del set)
2. Cambiar una variable: audiencia, ubicacion o presupuesto
3. Dejar correr 48 horas antes de evaluar el duplicado
4. No duplicar mas de 3 veces el mismo ad set (canibalismo de audiencia)

### Cuando ESCALAR

Escalar cuando un ad set esta rindiendo bien de forma sostenida (>5 dias consecutivos dentro de umbrales de duplicacion).

**Regla de escalado:** aumentar presupuesto maximo 20% cada 48 horas. No duplicar presupuesto de un dia para otro. El algoritmo de Meta necesita recalibrar despues de cada cambio.

```
Dia 1: ARS 3.000/dia
Dia 3: ARS 3.600/dia (+20%)
Dia 5: ARS 4.320/dia (+20%)
Dia 7: ARS 5.184/dia (+20%)
```

Si en algun punto el CPS sube por encima del umbral, frenar y volver al presupuesto anterior.

---

## 8. Conexion con n8n

### Credencial existente

- **Nombre:** Meta API ENBA
- **ID en n8n:** `n8scJzbGXnCprioD`
- **Tipo:** httpHeaderAuth
- **Uso:** publicacion automatica diaria via n8n workflow (12:15 ART)

### Separacion publicacion organica vs pauta

| Funcion | Herramienta | Automatizado |
|---------|------------|-------------|
| Publicacion organica diaria | n8n (workflow activo) | Si, 12:15 ART |
| Gestion de pauta | Meta Ads Manager (manual) | No — requiere decision humana |
| Reportes de performance | Meta Ads Manager + IG Insights | Manual, semanal |

**Regla:** la pauta NO se automatiza en esta etapa. Cada decision de activar, pausar o escalar un ad requiere analisis humano. La automatizacion aplica solo a la publicacion organica.

### Futuro: automatizacion de reportes

Cuando tengamos suficientes datos (semana 3+), se puede crear un workflow en n8n que:
1. Lea insights de IG via Graph API (endpoint: `/{ig-user-id}/insights`)
2. Lea metricas de ads via Marketing API
3. Genere un JSON con las metricas clave
4. Lo envie por email o lo grabe en un archivo

Esto es un nice-to-have para el mes 2, no una prioridad ahora.

---

## 9. Checklist de setup (dia 1)

- [ ] Business Manager creado y configurado
- [ ] Pagina de FB vinculada
- [ ] Cuenta de IG vinculada
- [ ] Cuenta publicitaria creada (moneda ARS, zona horaria AR)
- [ ] Metodo de pago configurado (verificar limite de tarjeta ~ARS 350K)
- [ ] Meta Pixel instalado en espacionautico.com.ar
- [ ] Pixel verificado con Meta Pixel Helper
- [ ] Dominio verificado en Business Settings
- [ ] 4 Custom Audiences creadas (vacias pero listas)
- [ ] 4 Saved Audiences creadas por intereses
- [ ] Primera campana de Awareness creada con piece-01
- [ ] Exclusion de seguidores existentes configurada en todos los ad sets

---

*Bruno — Social Growth & Performance Director, ENBA*
*15 de abril de 2026*
