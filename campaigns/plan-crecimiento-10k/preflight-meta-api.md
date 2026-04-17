# Preflight Meta Marketing API v21.0 - Campañas Ads Argentina

Fecha: 2026-04-16
Ad Account: `act_2303565156801569` (moneda ARS)
API version base: `v21.0` (estable en producción; v22+ también disponible)

---

## 1. Budget mínimo ARS por optimization_goal

### Hecho

No hay un "mínimo global" de Meta en ARS. El mínimo real lo calcula dinámicamente la plataforma según tres factores:

1. Moneda de la cuenta (ARS)
2. `optimization_goal` del ad set
3. `billing_event` (IMPRESSIONS, LINK_CLICKS, etc.)

Regla interna de Meta: el mínimo diario equivale a **2x el CPM/CPC/CPA estimado para esa optimización en ese mercado**. Para presupuestos totales (lifetime), el mínimo es el daily minimum x días de vigencia.

### El valor 1.393,30 ARS que te rechazó

Corresponde al mínimo para `REACH` o `IMPRESSIONS` en ARS al tipo de cambio Meta de abril 2026. Varía semana a semana porque Meta ajusta tipo de cambio.

### Endpoint oficial para consultar el mínimo exacto de tu cuenta

```
GET https://graph.facebook.com/v21.0/act_2303565156801569/minimum_budgets
  ?access_token=...
```

Respuesta devuelve un array `data[]` con objetos que contienen:

- `currency` (ARS)
- `min_daily_budget_imp` — mínimo para optimizaciones de impresión (REACH, IMPRESSIONS, AD_RECALL_LIFT, THRUPLAY, POST_ENGAGEMENT)
- `min_daily_budget_low_freq` — mínimo para eventos de baja frecuencia (LINK_CLICKS, LANDING_PAGE_VIEWS)
- `min_daily_budget_high_freq` — mínimo para eventos de alta frecuencia (OFFSITE_CONVERSIONS, LEAD_GENERATION, QUALITY_LEAD)
- `min_daily_budget_video_views` — mínimo para video

Para lifetime budget, multiplicar el `min_daily_budget_*` por número de días de la corrida.

### Orden de magnitud esperado en ARS (abril 2026, referencial)

| optimization_goal | Field | Estimado diario ARS |
|---|---|---|
| REACH / IMPRESSIONS / AD_RECALL_LIFT | min_daily_budget_imp | ~1.400 |
| POST_ENGAGEMENT / THRUPLAY | min_daily_budget_imp | ~1.400 |
| LINK_CLICKS / LANDING_PAGE_VIEWS | min_daily_budget_low_freq | ~2.800 |
| LEAD_GENERATION / QUALITY_LEAD | min_daily_budget_high_freq | ~5.600 – 7.000 |
| OFFSITE_CONVERSIONS | min_daily_budget_high_freq | ~5.600 – 7.000 |

**Acción obligatoria antes de crear ad sets:** hacer el GET a `/minimum_budgets` y usar esos valores exactos. No hardcodear.

### daily_budget vs daily_budget_in_cents

En ARS se envía en centavos: `daily_budget: 140000` = 1.400 ARS. Verificar que el script esté mandando en la unidad mínima.

---

## 2. Exclusión de followers / likers de Página (deprecated connections)

### Hecho confirmado (deprecation completa)

- `connections`, `excluded_connections`, `friends_of_connections` en `targeting_spec` fueron **deprecadas**. Meta dejó de permitir su uso en ad sets nuevos a partir de marzo/abril 2025.
- Todas las campañas legacy que las usaban pararon delivery en ese momento.
- No hay reemplazo nativo en `targeting_spec`: el mecanismo actual es 100% vía Custom Audiences.

### Método actual recomendado

Para "excluir followers de la página" hay que:

**Paso 1** — Crear una Custom Audience de engagement con el evento `page_engaged` (o `page_liked` si querés solo los que ya dieron like):

```json
POST /v21.0/act_2303565156801569/customaudiences
{
  "name": "ENBA_FB_Page_Likers",
  "subtype": "ENGAGEMENT",
  "rule": {
    "inclusions": {
      "operator": "or",
      "rules": [
        {
          "event_sources": [{"id": "<PAGE_ID>", "type": "page"}],
          "retention_seconds": 0,
          "filter": {
            "operator": "and",
            "filters": [
              {"field": "event", "operator": "eq", "value": "page_liked"}
            ]
          }
        }
      ]
    }
  },
  "prefill": 1
}
```

Notas:
- `retention_seconds: 0` para `page_liked` (no se acumula, es estado actual).
- Para "engaged last 30 days" usar `page_engaged` con `retention_seconds: 2592000`.
- El público tarda de minutos a horas en poblar. `prefill: 1` carga histórico.

**Paso 2** — Al crear el ad set, excluir esa audience en `targeting_spec`:

```json
{
  "targeting": {
    "geo_locations": {"countries": ["AR"]},
    "custom_audiences": [],
    "excluded_custom_audiences": [{"id": "<CUSTOM_AUDIENCE_ID>"}]
  }
}
```

Ya no se usa `connections: [...]` ni `excluded_connections: [...]` — si los mandás, la API tira el error que estás viendo.

### Para Instagram followers

No existe audience directa de "IG followers actuales" accesible por API. Lo más cercano es `ig_business_profile_all` o `ig_business_profile_engaged` con retention largo — aproxima al follower activo pero no es exclusión pura. Es la mejor aproximación disponible en 2026.

---

## 3. Custom Audiences de engagement — event names válidos v21.0

Tus event names fallaron porque **no existen como tal**: los correctos son distintos. Acá la tabla completa.

### Facebook Page (`event_sources.type = "page"`)

| event | Qué captura |
|---|---|
| `page_engaged` | **El más amplio**. Cualquier interacción con la página o posts (reacciones, shares, comentarios, clicks, visitas, mensajes). Usalo para retargeting general. |
| `page_visited` | Solo visitas al perfil de la página |
| `page_liked` | Likers actuales de la página (usar `retention_seconds: 0`) |
| `page_messaged` | Usuarios que mandaron mensaje |
| `page_cta_clicked` | Clicks en botón CTA |
| `page_or_post_save` | Guardaron página o post |
| `page_post_interaction` | Reaccionaron, compartieron, comentaron o clickearon en un post |

**Tu error `page_engaged` → Nombre de evento no válido** seguramente vino por:
- Usarlo con `type: "ig_business"` en vez de `type: "page"`
- No incluir `prefill: 1` y `subtype: "ENGAGEMENT"`
- Pasar el ID de la página como string sin formato correcto en `event_sources[].id`

### Instagram Business (`event_sources.type = "ig_business"`)

| event | Qué captura |
|---|---|
| `ig_business_profile_all` | **El más amplio**. Visitó perfil o interactuó con cualquier contenido o ad |
| `ig_business_profile_engaged` | Interactuó con el perfil (like, comment, save, share) |
| `ig_business_profile_visit` | Solo visitas al perfil |
| `ig_user_messaged_business` | Mandó DM al negocio |
| `ig_business_profile_ad_saved` | Guardó un post o ad |
| `ig_ad_like`, `ig_ad_comment`, `ig_ad_share`, `ig_ad_save`, `ig_ad_cta_click`, `ig_ad_carousel_swipe` | Interacciones granulares con ads |
| `ig_organic_like`, `ig_organic_comment`, `ig_organic_share`, `ig_organic_save`, `ig_organic_swipe`, `ig_organic_carousel_swipe` | Interacciones granulares con contenido orgánico |

**Tu error `ig_business_profile_follow` no existe** — no hay evento API para "siguió el perfil". No está expuesto. Lo más cercano es `ig_business_profile_engaged` con retention largo.

### Video viewers

No hay events dedicados — se crea una Custom Audience con `subtype: "VIDEO"`:

```json
POST /v21.0/act_2303565156801569/customaudiences
{
  "name": "ENBA_Video_50pct_30d",
  "subtype": "VIDEO",
  "content": {
    "video": {
      "inclusions": [
        {
          "object_id": "<VIDEO_ID>",
          "retention_days": 30,
          "lookback_event": "50_PERCENT_VIDEO_VIEWS"
        }
      ]
    }
  }
}
```

Valores válidos de `lookback_event`:
- `3_SECOND_VIDEO_VIEWS`
- `10_SECOND_VIDEO_VIEWS`
- `25_PERCENT_VIDEO_VIEWS`
- `50_PERCENT_VIDEO_VIEWS`
- `75_PERCENT_VIDEO_VIEWS`
- `95_PERCENT_VIDEO_VIEWS`
- `THRUPLAY`

**Tu `video_view_50_percent` fallo** porque el nombre correcto es `50_PERCENT_VIDEO_VIEWS` y va en subtype `VIDEO`, no como `event` en rule de engagement.

### Website visitors (Pixel)

Subtype `WEBSITE`, rule sobre pixel:

```json
POST /v21.0/act_2303565156801569/customaudiences
{
  "name": "ENBA_Web_Visitors_30d",
  "subtype": "WEBSITE",
  "rule": {
    "inclusions": {
      "operator": "or",
      "rules": [
        {
          "event_sources": [{"id": "<PIXEL_ID>", "type": "pixel"}],
          "retention_seconds": 2592000,
          "filter": {
            "operator": "and",
            "filters": [
              {"field": "url", "operator": "i_contains", "value": "espacionautico.com.ar"}
            ]
          }
        }
      ]
    }
  },
  "prefill": 1
}
```

Para filtrar por evento específico de pixel (ViewContent, Lead, Purchase):
```json
{"field": "event", "operator": "=", "value": "ViewContent"}
```

Operadores válidos en filters: `=`, `!=`, `>=`, `>`, `<=`, `<`, `contains`, `not_contains`, `i_contains`, `i_not_contains`, `is_any`, `is_not_any`, `i_is_any`, `i_is_not_any`, `starts_with`, `i_starts_with`, `regex_match`, `in_range`, `not_in_range`.

### Lead forms (ya que vas a correr lead gen)

```json
{
  "subtype": "ENGAGEMENT",
  "rule": {
    "inclusions": {
      "operator": "or",
      "rules": [
        {
          "event_sources": [{"id": "<FORM_ID>", "type": "lead"}],
          "retention_seconds": 7776000,
          "filter": {
            "operator": "and",
            "filters": [
              {"field": "event", "operator": "eq", "value": "lead_generation_opened"}
            ]
          }
        }
      ]
    }
  }
}
```

Events válidos para `type: "lead"` o `type: "ig_lead_generation"`:
- `lead_generation_opened`
- `lead_generation_submitted`
- `lead_generation_dropoff`

---

## 4. Objetivos v21.0 y optimization_goals válidos

### Objectives válidos en v21.0 (confirmado)

- `OUTCOME_AWARENESS` (reemplaza BRAND_AWARENESS, REACH)
- `OUTCOME_TRAFFIC` (reemplaza LINK_CLICKS)
- `OUTCOME_ENGAGEMENT` (reemplaza POST_ENGAGEMENT, PAGE_LIKES, EVENT_RESPONSES)
- `OUTCOME_LEADS` (reemplaza LEAD_GENERATION)
- `OUTCOME_SALES` (reemplaza CONVERSIONS, PRODUCT_CATALOG_SALES)
- `OUTCOME_APP_PROMOTION` (reemplaza APP_INSTALLS)

Los legacy (LINK_CLICKS, POST_ENGAGEMENT, REACH, LEAD_GENERATION como objective de campaña) están bloqueados para creación desde octubre 2024. Tus 4 campañas creadas deberían estar con OUTCOME_*.

### Mapping objective → optimization_goal válidos (v21.0)

#### OUTCOME_AWARENESS
Optimization goals válidos en ad set:
- `REACH`
- `IMPRESSIONS`
- `AD_RECALL_LIFT`
- `THRUPLAY` (solo si el ad es video)

Billing event recomendado: `IMPRESSIONS`

#### OUTCOME_TRAFFIC
Conversion location = `WEBSITE`:
- `LINK_CLICKS`
- `LANDING_PAGE_VIEWS`
- `IMPRESSIONS`
- `REACH`

Conversion location = `MESSAGING_APPS` (Messenger/IG Direct/WhatsApp):
- `CONVERSATIONS`
- `LINK_CLICKS`

Conversion location = `APP`:
- `LINK_CLICKS`

Billing event: `IMPRESSIONS` (LINK_CLICKS también válido pero más caro por click).

#### OUTCOME_ENGAGEMENT
El más complejo — depende del `destination_type` / conversion location:

Conversion location = `ON_POST` (post engagement, reactions, shares):
- `POST_ENGAGEMENT`
- `IMPRESSIONS`
- `REACH`

Conversion location = `ON_VIDEO`:
- `THRUPLAY`
- `TWO_SECOND_CONTINUOUS_VIDEO_VIEWS`

Conversion location = `ON_PAGE` (page likes):
- `PAGE_LIKES`

Conversion location = `ON_EVENT`:
- `EVENT_RESPONSES`

Conversion location = `MESSAGING_APPS`:
- `CONVERSATIONS`
- `LINK_CLICKS`

Conversion location = `WEBSITE` (conversions en web):
- `OFFSITE_CONVERSIONS`
- `LANDING_PAGE_VIEWS`

**Importante para tu caso (followers/engagement IG):** no existe optimization_goal para "ganar followers IG" — se aproxima con `OUTCOME_ENGAGEMENT` + `destination_type: ON_PAGE` (funciona para FB page likes) o con `OUTCOME_AWARENESS` + `optimization_goal: REACH` ruteando al perfil. Para IG followers puros no hay objetivo nativo; la táctica real es contenido + ad de engagement rankeando el perfil.

#### OUTCOME_LEADS
Conversion location = `ON_AD` (Instant Forms):
- `LEAD_GENERATION`
- `QUALITY_LEAD`

Conversion location = `WEBSITE`:
- `OFFSITE_CONVERSIONS` (con `promoted_object.custom_event_type: "LEAD"`)
- `LANDING_PAGE_VIEWS`

Conversion location = `MESSAGING_APPS`:
- `CONVERSATIONS`
- `LEAD_GENERATION`

Conversion location = `PHONE_CALL`:
- `QUALITY_CALL`

#### OUTCOME_SALES
- `OFFSITE_CONVERSIONS` (con `custom_event_type` en promoted_object: `PURCHASE`, `ADD_TO_CART`, etc.)
- `VALUE`
- `CONVERSATIONS` (si es conversion location messaging)

### Regla clave: billing_event

Para casi todo, `billing_event: "IMPRESSIONS"` es lo correcto. Solo usar:
- `LINK_CLICKS` en OUTCOME_TRAFFIC si querés CPC puro (más caro en ARS).
- `THRUPLAY` en video ad con OUTCOME_AWARENESS.

### promoted_object requerido

| objective | promoted_object obligatorio |
|---|---|
| OUTCOME_AWARENESS | no requerido |
| OUTCOME_TRAFFIC | no requerido (pero `page_id` si es messaging) |
| OUTCOME_ENGAGEMENT | depende: `page_id` para page likes, `pixel_id` + `custom_event_type` para conversions |
| OUTCOME_LEADS | `page_id` obligatorio (Instant Forms); `pixel_id` + `custom_event_type: LEAD` para web |
| OUTCOME_SALES | `pixel_id` + `custom_event_type` obligatorio |

---

## 5. Interest IDs — estabilidad y recomendación

### Estabilidad

Los interest IDs de Meta **son estables a lo largo del tiempo** (no cambian aunque cambie el nombre mostrado). Validados via `/search?type=adinterest` siguen siendo válidos para segmentación hasta que Meta los marque como deprecated — y lo avisa vía el endpoint `targeting_option_list` y el flag `delivery_paused` en `adset.targeting_state`.

**Acción**: antes de lanzar, correr un GET contra `targeting_option_list` con los IDs para confirmar `delivery_ok`. Meta deprecó muchos intereses "sensibles" en 2024-2025 pero los náuticos y lifestyle no están entre ellos.

### Review del archivo `interest-ids-raw.json`

**Recomendados (core náutico ENBA, alta relevancia):**

| ID | Nombre | Size (AR+global) | Uso |
|---|---|---|---|
| `6003187081552` | vela (deporte) | 2.5M–3M | core, audiencia de navegantes |
| `6004160148624` | Yacht racing | 342K–403K | core, nicho de regata |
| `6023137421020` | Motor Boat & Yachting | 415K–488K | core, pasión náutica |
| `6003161318055` | Princess Yachts | 1.4M–1.6M | lifestyle náutico aspiracional |
| `6769156181154` | Fabricación y ventas de embarcaciones | 850K–1M | broker / venta de veleros |
| `6002878991172` | Embarcación | 13.7M–16M | demasiado amplio, usar solo en combinación |

**Recomendados (lifestyle compatible):**

| ID | Nombre | Uso |
|---|---|---|
| `6002868021822` | Viajes de aventura | fit con travesías |
| `6003074033139` | Caminatas / outdoor | fit con audiencia outdoor |
| `6003252804967` | Excursionismo (naturaleza) | fit con outdoor |
| `6002985584323` | Recreación al aire libre | fit general |
| `6003523122770` | viaje de mochilero | fit con travesías low cost |
| `6003343712056` | Wine | fit con experiencia gastronómica a bordo |
| `6003259680957` | bodega de vino | fit con experiencia premium |
| `6003415019460` | Gastronomía | fit con experiencia a bordo |
| `6003409392877` | Bodas | fit con eventos privados en velero |
| `6003310766888` | Día de San Valentín | fit con salidas de pareja |
| `6003371567474` | Espíritu empresarial | fit con eventos corporativos en velero |
| `6003092932417` | Gestión de eventos | fit con eventos privados |

**Descartar (irrelevantes o ruido):**

| ID | Nombre | Por qué descartar |
|---|---|---|
| `6003352484519` | Sailor Moon | anime, nada que ver |
| `6009586966391` | Black Sails | serie TV, no sirve |
| `6003025268985` | Tatuajes | match falso por query "Sail" |
| `6781916710918` | Universidades USA | match falso por query "Sail" |
| `6003107699532` | Música soul | match falso por query "Wine" |
| `6003214105133` | Vampire Weekend | match falso por query "Weekend" |
| `6003222369667` | Startup weekend | match falso |
| `6004025448989` | Noruega | match falso por query "Trekking" |
| `6003197718872` | Singapur | match falso |
| `6003314955799` | Rock alternativo | match falso por query "Corporate" |
| `6003175578350` | Filipinas | match falso |
| `6787719539026` | Películas románticas | genérico, débil |
| `6003101445184` | romantic comedies | genérico, débil |
| `6002951587955` | Música clásica | match falso |
| `6003221212067` | Romantic fantasy | literatura, débil |
| `6006526034143` | Romantic thriller | literatura, débil |
| `6003713691560` | Corporaciones | demasiado amplio y poco accionable |
| `6003446827880` | Society Corporate Compliance | audiencia de 20K, desechable |
| `6003126562949` | Entrepreneurial network | 10K, desechable |
| `6004142186306` | Moto de agua | fuera de producto ENBA |
| `6003108826384` | Festivales de música | match falso por "Weekend" |
| `6861863500415` | Marcas de ropa mujer | match falso |
| `6836096590166` | Tienda de novias | ruido |
| `6774858830325` | Sitios web de boda | ruido |
| `6790797360113` | Comedias románticas TV | ruido |
| `6901133711723` | Telerrealidad de bodas | ruido |
| `6003396473977` | Zee Entertainment | match falso |
| `6002933324059` | Sony Pictures | match falso |
| `6003495261627` | Marvel Entertainment | match falso |
| `6003201772012` | Efectos visuales | match falso |
| `6005174809719` | Workpoint Entertainment | match falso |
| `6003349868805` | Travel Adventures (org) | match falso a organización específica |

### Alternativas adicionales sugeridas (recomendado pre-validar)

Correr `/search?type=adinterest&q=<query>&locale=es_LA` para:
- `Navegación a vela`
- `Cruceros de lujo`
- `Escuela de navegación`
- `Deportes acuáticos`
- `Aeroparque Jorge Newbery` (geo-afinidad por trabajo/residencia)
- `Puerto de Olivos`, `Club Náutico San Isidro` (geo comportamental)
- `Turismo náutico`
- `Turismo de aventura`
- `Yachting`
- `Kitesurf` / `Windsurf` (proxy lifestyle)
- `ABC Color Náutico`, `Revista Nautica` (si aparecen)

### Lookalike recomendados (prioridad alta)

Con las Custom Audiences definidas en §2 y §3 crear:
- LAL 1% de `ENBA_IG_Profile_Engaged_180d`
- LAL 1–3% de `ENBA_FB_Page_Engaged_180d`
- LAL 1% de `ENBA_Web_Visitors_90d` (cuando haya volumen de pixel)
- LAL 1% de `ENBA_Video_75pct_90d` (si corre video orgánico con tracción)

Los LAL suelen outperformar intereses en AR cuando la seed tiene ≥1.000 personas.

---

## Resumen operativo

1. Antes de cada ad set: `GET /act_2303565156801569/minimum_budgets` y usar los valores exactos devueltos.
2. Reemplazar todo uso de `connections` / `excluded_connections` por Custom Audiences de engagement con event names válidos (§3).
3. Para excluir "los que ya nos siguen": crear Custom Audience con `page_engaged` + `ig_business_profile_engaged` (retention 180d) y pasarla en `excluded_custom_audiences`.
4. Objectives: usar solo los 6 OUTCOME_* — los legacy están bloqueados.
5. Filtrar `interest-ids-raw.json` a los 18 IDs recomendados y agregar los lookalikes.
6. Re-validar IDs con `targeting_option_list` antes de lanzar.

---

## Fuentes

- [Meta Marketing API – Ad Account Minimum Budgets](https://developers.facebook.com/docs/marketing-api/reference/ad-account/minimum_budgets/)
- [Meta Marketing API – Budgets Overview](https://developers.facebook.com/docs/marketing-api/bidding/overview/budgets/)
- [Meta Marketing API – Ad Campaign (objective values)](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/)
- [Meta Marketing API – Audience Rules](https://developers.facebook.com/docs/marketing-api/audiences/guides/audience-rules/)
- [Meta Marketing API – Engagement Custom Audiences](https://developers.facebook.com/docs/marketing-api/audiences/guides/engagement-custom-audiences/)
- [Meta Marketing API – Deprecated Targeting Terms](https://developers.facebook.com/docs/marketing-api/audiences/reference/deprecated-targeting-terms/)
- [Meta Marketing API – Advanced Targeting](https://developers.facebook.com/docs/marketing-api/audiences/reference/advanced-targeting)
- [Meta Business Help – Updates to Detailed Targeting](https://www.facebook.com/business/help/458835214668072)
- [Swipe Insight – Meta restrictions on legacy objectives in API v21](https://web.swipeinsight.app/posts/how-marketing-api-v21-affects-original-objective-usage-10742)
- [Bïrch – 6 Facebook Campaign Objectives Explained (ODAX)](https://bir.ch/blog/facebook-ad-objectives)
- [Stackmatix – Meta Ads Minimum Daily Budget](https://www.stackmatix.com/blog/meta-ads-minimum-daily-budget-2026)
- [Wicked Reports – Meta Removes Detailed Targeting Exclusions](https://www.wickedreports.com/blog/meta-removes-detailed-targeting-exclusions-from-ad-campaigns)
- [Collective Measures – Facebook Removes Fan Targeting](https://www.collectivemeasures.com/insights/facebook-removes-fan-targeting)
- [Get Koro – Exclude Audiences Facebook Ads 2025](https://getkoro.app/blog/exclude-audiences-facebook-ads)
