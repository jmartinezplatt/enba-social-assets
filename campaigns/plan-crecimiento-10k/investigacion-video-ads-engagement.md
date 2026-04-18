# Investigación: Video Ads en Campañas OUTCOME_ENGAGEMENT via Meta Marketing API

**Fecha:** 2026-04-17
**API Version:** v21.0+ (compatible hasta v25.0)
**Contexto:** Campaña ENBA engagement (ID 120238976548380139)

---

## TL;DR — Solución al problema

El error **"Tu campaña debe incluir un conjunto de anuncios con un objeto seleccionado para promocionar"** ocurre porque:

1. El ad set necesita `promoted_object: { "page_id": "<PAGE_ID>" }` **desde su creación** (es inmutable después).
2. El ad set necesita `destination_type` configurado correctamente (`ON_POST` o `ON_AD`).
3. El creative debe usar `object_story_id` (post existente en el feed de la Page) en vez de `object_story_spec` con `video_data` para engagement de post existente.

El error secundario **"No puedes usar el objetivo de rendimiento seleccionado con tu objetivo de campaña"** ocurre cuando se intenta **modificar** el `promoted_object` en un ad set ya creado — `promoted_object` es inmutable. Hay que crear un ad set nuevo.

---

## 1. promoted_object correcto para OUTCOME_ENGAGEMENT + POST_ENGAGEMENT

### Respuesta directa

Para campañas `OUTCOME_ENGAGEMENT` con optimization goal `POST_ENGAGEMENT`:

```json
"promoted_object": {
  "page_id": "<PAGE_ID>"
}
```

**El promoted_object es `page_id` — no `post_id`, no vacío.**

### Evidencia

- La documentación oficial de Meta indica que `promoted_object` describe qué promueve el ad set y es **inmutable después de la creación** (con excepciones limitadas para pixel_id y application_id).
- Para campañas de engagement tipo ON_POST y ON_AD, el `promotedObjectType` debe ser **PAGE**.
- Fuente confirmada: Sprinklr Facebook Ad Set docs — "Promoted Object Type must be set to PAGE for both ON_POST and ON_AD destination types within engagement campaigns."

### Configuración completa del ad set

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ENBA Engagement AdSet - Video Reel",
    "campaign_id": "<CAMPAIGN_ID>",
    "optimization_goal": "POST_ENGAGEMENT",
    "billing_event": "IMPRESSIONS",
    "daily_budget": "5000",
    "destination_type": "ON_POST",
    "promoted_object": {
      "page_id": "<PAGE_ID>"
    },
    "targeting": {
      "geo_locations": { "countries": ["AR"] },
      "age_min": 25,
      "age_max": 55
    },
    "status": "PAUSED",
    "access_token": "<ACCESS_TOKEN>"
  }' \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adsets"
```

### optimization_goals compatibles con OUTCOME_ENGAGEMENT + page_id

| optimization_goal | destination_type | Uso |
|---|---|---|
| `POST_ENGAGEMENT` | `ON_POST` | Engagement en un post existente del feed |
| `POST_ENGAGEMENT` | `ON_AD` | Engagement en el ad mismo |
| `THRUPLAY` | `ON_POST` / `ON_AD` | Vistas de video completas |
| `TWO_SECOND_CONTINUOUS_VIDEO_VIEWS` | `ON_POST` / `ON_AD` | Vistas de 2+ segundos |
| `PAGE_LIKES` | `ON_PAGE` | Likes a la Page |
| `EVENT_RESPONSES` | `ON_EVENT` | Respuestas a eventos |
| `REMINDERS_SET` | — | Recordatorios |
| `OFFSITE_CONVERSIONS` | — | Conversiones offsite (requiere pixel) |
| `LANDING_PAGE_VIEWS` | — | Vistas de landing page |
| `LINK_CLICKS` | — | Clicks en links |

**Bid strategies compatibles:** `LOWEST_COST`, `COST_CAP`
**Billing event:** siempre `IMPRESSIONS`

---

## 2. Cómo crear un video ad en campaña OUTCOME_ENGAGEMENT via API

### Hay 3 approaches distintos — cada uno con requisitos diferentes:

### Approach A: Promover un post de video EXISTENTE del feed de la Page (RECOMENDADO)

Este es el approach más limpio para engagement. Preserva social proof (likes, comments, shares acumulados).

**Paso 1:** El video debe estar publicado como post en el feed de la Page.

```bash
# Subir video Y publicarlo como post del feed
curl -X POST \
  "https://graph.facebook.com/v21.0/<PAGE_ID>/videos" \
  -F "source=@video.mp4" \
  -F "title=Navegación ENBA" \
  -F "description=Tu primer experiencia en velero" \
  -F "published=true" \
  -F "access_token=<PAGE_ACCESS_TOKEN>"
```

Respuesta: `{ "id": "<VIDEO_ID>" }`

**Paso 2:** Obtener el post_id del video publicado.

```bash
# El post_id tiene formato {page_id}_{video_id} o se obtiene del feed
curl "https://graph.facebook.com/v21.0/<PAGE_ID>/feed?fields=id,message,created_time&limit=5&access_token=<ACCESS_TOKEN>"
```

El `post_id` (también llamado `story_id` o `object_story_id`) tiene formato: `<PAGE_ID>_<POST_ID>`

**Paso 3:** Crear el ad creative usando `object_story_id`.

```bash
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adcreatives" \
  -F 'name=ENBA Video Post Engagement' \
  -F 'object_story_id=<PAGE_ID>_<POST_ID>' \
  -F 'access_token=<ACCESS_TOKEN>'
```

**Paso 4:** Crear el ad.

```bash
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/ads" \
  -F 'name=ENBA Reel Engagement Ad' \
  -F 'adset_id=<AD_SET_ID>' \
  -F 'creative={"creative_id":"<CREATIVE_ID>"}' \
  -F 'status=PAUSED' \
  -F 'access_token=<ACCESS_TOKEN>'
```

### Approach B: Crear un dark post con video (nuevo post no publicado en el feed)

Usa `object_story_spec` con `video_data`. Crea un "unpublished page post" que solo existe como ad.

```bash
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adcreatives" \
  -F 'name=ENBA Video Dark Post' \
  -F 'object_story_spec={
    "page_id": "<PAGE_ID>",
    "video_data": {
      "video_id": "<VIDEO_ID>",
      "image_url": "<THUMBNAIL_URL>",
      "message": "Navegá el Río de la Plata con ENBA",
      "call_to_action": {
        "type": "LEARN_MORE",
        "value": {
          "link": "https://espacionautico.com.ar/travesias"
        }
      }
    }
  }' \
  -F 'access_token=<ACCESS_TOKEN>'
```

**Importante:** El video debe estar subido al ad account (`POST /act_{AD_ACCOUNT_ID}/advideos`) o a la Page (`POST /{PAGE_ID}/videos`). El `video_id` que devuelve cualquiera de esos endpoints sirve para `video_data.video_id`.

### Approach C: Promover un reel de Instagram existente (ver sección 3)

---

## 3. Cómo promocionar un reel de IG como ad de Engagement

### El flow correcto

```bash
# Paso 1: Verificar elegibilidad del reel
curl "https://graph.facebook.com/v21.0/<IG_MEDIA_ID>?fields=boost_eligibility_info&access_token=<ACCESS_TOKEN>"
```

Si `boost_eligibility_info` indica que es elegible:

```bash
# Paso 2: Crear creative con source_instagram_media_id
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adcreatives" \
  -F 'object_id=<PAGE_ID>' \
  -F 'instagram_user_id=<IG_USER_ID>' \
  -F 'source_instagram_media_id=<IG_MEDIA_ID>' \
  -F 'access_token=<ACCESS_TOKEN>'
```

### Sobre el error "debes subirlo a Facebook antes de crear el anuncio"

Este error ocurre cuando:
1. El reel de IG contiene **música con copyright** que no es licenciable para ads.
2. El reel tiene **elementos interactivos** (filtros AR, stickers interactivos).
3. El contenido de IG **no pasa la verificación de `boost_eligibility_info`**.
4. El reel es muy reciente y Meta **aún no sincronizó** el video internamente.

**Workaround si el error persiste:**
- Descargar el video del reel.
- Subirlo a la Page como post de video (`POST /{PAGE_ID}/videos` con `published=true`).
- Usar Approach A (object_story_id del post del feed).
- Perder la conexión directa con el post orgánico de IG, pero el ad funciona.

### Lo que hace Ads Manager UI internamente al "Promocionar" un reel

Cuando un usuario hace tap en "Promocionar" en un reel de IG, la UI de Ads Manager:
1. Crea una campaña con `objective: OUTCOME_ENGAGEMENT`.
2. Crea un ad set con `promoted_object: { "page_id": "<PAGE_ID>" }` y `destination_type: ON_AD`.
3. Crea un creative con `source_instagram_media_id: <IG_MEDIA_ID>` + `object_id: <PAGE_ID>` + `instagram_user_id: <IG_USER_ID>`.
4. Crea el ad con status ACTIVE.

**Permisos requeridos:** `pages_manage_ads`, `ads_management`, `instagram_basic`, `instagram_content_publish` (o `instagram_manage_insights` para lectura).

---

## 4. Video subido via /videos vs post de video en el feed

### Son objetos DISTINTOS en Meta

| Aspecto | POST /{page_id}/videos (published=true) | POST /{page_id}/videos (published=false o no_story=true) |
|---|---|---|
| **Crea post en feed** | SI | NO |
| **Tiene post_id** | SI (`{page_id}_{post_id}`) | NO — solo tiene video_id |
| **Visible para seguidores** | SI | NO |
| **Usable con `object_story_id`** | SI | NO directamente* |
| **Usable con `video_data.video_id`** | SI | SI |
| **Promotable como post existente** | SI | NO |
| **Aparece en `/promotable_posts`** | SI (si pasa criterios) | NO |

*Un video no publicado se puede usar en `object_story_spec.video_data` para crear un dark post, pero no se puede referenciar con `object_story_id`.

### Por qué el video subido no era promotable

Si el video se subió con `POST /{PAGE_ID}/videos` con los parámetros por defecto (`published=true`), debería crear un post en el feed y ser promotable. Pero si se subió con:
- `published=false`
- `no_story=true`
- `hide_from_newsfeed=true`

Entonces **no hay post en el feed** y no se puede usar con `object_story_id`. Solo se puede usar el `video_id` dentro de `object_story_spec.video_data` para crear un dark post.

### Verificar si un video tiene post asociado

```bash
# Obtener el post_id del video (si existe)
curl "https://graph.facebook.com/v21.0/<VIDEO_ID>?fields=post_id,published,title,description&access_token=<ACCESS_TOKEN>"
```

### Obtener posts promotables de la Page

```bash
curl "https://graph.facebook.com/v21.0/<PAGE_ID>/promotable_posts?fields=id,message,created_time,is_eligible_for_promotion&access_token=<PAGE_ACCESS_TOKEN>"
```

---

## 5. Diferencia entre video subido a /videos y post de video en el feed

### Modelo de objetos en Meta

```
Page
├── /videos          → Devuelve Video objects (tienen video_id)
├── /feed            → Devuelve Post objects (tienen post_id = page_id_story_id)
└── /promotable_posts → Devuelve solo Posts elegibles para promoción
```

Un video subido con `published=true` (default) **crea AMBOS objetos**: un Video y un Post.
Un video subido con `published=false` crea **solo el Video**.

### El post es el objeto promotable, no el video

- Para `object_story_id` en ad creative: necesitás el **post_id** (formato `{page_id}_{story_id}`).
- Para `video_data.video_id` en object_story_spec: necesitás el **video_id**.
- Para `/promotable_posts`: solo aparecen **posts** del feed.

---

## 6. Compatibilidad optimization_goals con OUTCOME_ENGAGEMENT + page_id

### Tabla completa confirmada

| optimization_goal | destination_type | promoted_object | billing_event | bid_strategy |
|---|---|---|---|---|
| `POST_ENGAGEMENT` | `ON_POST` | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `POST_ENGAGEMENT` | `ON_AD` | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `THRUPLAY` | `ON_POST` / `ON_AD` | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `TWO_SECOND_CONTINUOUS_VIDEO_VIEWS` | `ON_POST` / `ON_AD` | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `PAGE_LIKES` | `ON_PAGE` | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `EVENT_RESPONSES` | `ON_EVENT` | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `REMINDERS_SET` | — | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `LINK_CLICKS` | — | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |
| `LANDING_PAGE_VIEWS` | — | `{ "page_id": "..." }` | `IMPRESSIONS` | `LOWEST_COST` / `COST_CAP` |

**Nota:** `OFFSITE_CONVERSIONS` requiere pixel_id en el promoted_object además de page_id.

---

## 7. Plan de acción para ENBA

### Problema diagnosticado

1. **Ad set existente** (en la campaña 120238976548380139) probablemente fue creado **sin `promoted_object`** o con un promoted_object incorrecto. Como es inmutable, no se puede arreglar — hay que crear uno nuevo.

2. **El creative** usa `video_data` con un `video_id` de un video subido a `/videos`. Si ese video no fue publicado como post del feed (`published=true`), el creative funciona como dark post pero puede haber conflicto con el ad set.

3. **El error del ad** dice que falta "objeto para promocionar" — significa que el ad set no tiene `promoted_object: { page_id }` configurado.

### Pasos concretos

```bash
# 1. Crear NUEVO ad set con promoted_object correcto
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ENBA Engagement Video - AdSet v2",
    "campaign_id": "120238976548380139",
    "optimization_goal": "POST_ENGAGEMENT",
    "billing_event": "IMPRESSIONS",
    "daily_budget": "5000",
    "destination_type": "ON_AD",
    "promoted_object": {
      "page_id": "<PAGE_ID>"
    },
    "targeting": {
      "geo_locations": { "countries": ["AR"] }
    },
    "status": "PAUSED",
    "access_token": "<ACCESS_TOKEN>"
  }' \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adsets"

# 2. Verificar si el video tiene post en el feed
curl "https://graph.facebook.com/v21.0/1435389215002068?fields=post_id,published,title&access_token=<ACCESS_TOKEN>"

# 3a. Si tiene post_id → usar object_story_id (mejor approach)
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adcreatives" \
  -F 'name=ENBA Reel Engagement Creative v2' \
  -F 'object_story_id=<PAGE_ID>_<POST_ID>' \
  -F 'access_token=<ACCESS_TOKEN>'

# 3b. Si NO tiene post_id → usar object_story_spec con video_data (dark post)
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adcreatives" \
  -F 'name=ENBA Reel Engagement Creative v2' \
  -F 'object_story_spec={
    "page_id": "<PAGE_ID>",
    "video_data": {
      "video_id": "1435389215002068",
      "message": "Tu primer experiencia en velero. Navegá el Río de la Plata con ENBA.",
      "call_to_action": {
        "type": "LEARN_MORE",
        "value": { "link": "https://espacionautico.com.ar/travesias" }
      }
    }
  }' \
  -F 'access_token=<ACCESS_TOKEN>'

# 4. Crear el ad con el nuevo ad set y creative
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/ads" \
  -F 'name=ENBA Reel Engagement Ad v2' \
  -F 'adset_id=<NEW_AD_SET_ID>' \
  -F 'creative={"creative_id":"<NEW_CREATIVE_ID>"}' \
  -F 'status=PAUSED' \
  -F 'access_token=<ACCESS_TOKEN>'
```

### Para el reel de IG (post_id 18585972517007777)

```bash
# 1. Verificar elegibilidad
curl "https://graph.facebook.com/v21.0/18585972517007777?fields=boost_eligibility_info,media_type,media_url&access_token=<ACCESS_TOKEN>"

# 2. Si es elegible, crear creative directamente
curl -X POST \
  "https://graph.facebook.com/v21.0/act_<AD_ACCOUNT_ID>/adcreatives" \
  -F 'object_id=<PAGE_ID>' \
  -F 'instagram_user_id=<IG_USER_ID>' \
  -F 'source_instagram_media_id=18585972517007777' \
  -F 'access_token=<ACCESS_TOKEN>'

# 3. Si da error de "upload to facebook", usar el workaround:
#    - Descargar el video del reel
#    - Subirlo a la Page como post del feed
#    - Usar object_story_id del nuevo post
```

---

## 8. Resumen de errores y soluciones

| Error | Causa raíz | Solución |
|---|---|---|
| "Tu campaña debe incluir un conjunto de anuncios con un objeto seleccionado para promocionar" | Ad set sin `promoted_object` | Crear nuevo ad set con `promoted_object: { "page_id": "..." }` |
| "No puedes usar el objetivo de rendimiento seleccionado con tu objetivo de campaña" | Intentar modificar `promoted_object` en ad set existente (es inmutable) | Crear nuevo ad set desde cero |
| "Al anunciar un video de Instagram existente, debes subirlo a Facebook" | El reel de IG tiene música con copyright, filtros interactivos, o no pasa boost_eligibility | Verificar `boost_eligibility_info` primero. Si no es elegible, descargar video y subirlo como post de la Page |
| Creative con video_data no funciona para engagement de post existente | `video_data` crea un dark post, no referencia un post existente | Usar `object_story_id` para posts existentes del feed |

---

## Sources

- [Ad Set Promoted Object - Meta for Developers](https://developers.facebook.com/docs/marketing-api/reference/ad-promoted-object)
- [Ad Set Reference (Graph API v25.0) - Meta for Developers](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/)
- [Ad Creative Reference - Meta for Developers](https://developers.facebook.com/docs/marketing-api/reference/ad-creative/)
- [Ad Creative Video Data - Meta for Developers](https://developers.facebook.com/docs/marketing-api/reference/ad-creative-video-data/)
- [Use Posts as Instagram Ads - Meta for Developers](https://developers.facebook.com/docs/instagram/ads-api/guides/use-posts-as-ads/)
- [Page Videos API - Meta for Developers](https://developers.facebook.com/docs/graph-api/reference/page/videos/)
- [Video API Overview - Meta for Developers](https://developers.facebook.com/docs/video-api/overview/)
- [Click to WhatsApp (OUTCOME_ENGAGEMENT example) - Meta for Developers](https://developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads/click-to-whatsapp/)
- [Facebook Ad Set Configuration - Sprinklr Help Center](https://www.sprinklr.com/help/articles/facebook/ad-set/686c8978f77c9b1aebd84795)
- [Facebook Python Business SDK - adset.py (enums)](https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/adobjects/adset.py)
- [6 Facebook Campaign Objectives (ODAX Guide) - Birch](https://bir.ch/blog/facebook-ad-objectives)
- [Engagement Video Ad Specs - Facebook Ads Guide](https://www.facebook.com/business/ads-guide/update/video/facebook-feed/outcome-engagement)
- [Meta's Maximize Interactions Goal Explained - Trackbee](https://www.trackbee.io/blog/metas-new-maximize-interactions-goal-explained)
- [Community Thread: Correct promoted_object for AdSet](https://developers.facebook.com/community/threads/444764449679594/)
