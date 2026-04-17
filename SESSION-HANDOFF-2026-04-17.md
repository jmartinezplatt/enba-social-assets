# HANDOFF DE SESIÓN — 16/04/2026 → 17/04/2026

Prompt de continuidad para próximo agente. Leer completo antes de actuar.

---

## 1. CONTEXTO DEL PROYECTO

- **Repo:** `C:\Users\josea\enba-social-assets`
- **Remoto:** `origin = jmartinezplatt/enba-social-assets`
- **Dominio producción:** `social-assets.espacionautico.com.ar` (Cloudflare Pages, deploys desde `main`)
- **Repo NO relacionado:** `enba-web` — NO tocar
- **Rama paralela:** `plan-crecimiento-10k` — frente separado con otro agente, NO mezclar
- **CLAUDE.md del repo es fuente de verdad** (reglas, equipos, voz, vocabulario prohibido, URLs por vertical).

---

## 2. ESTADO ACTUAL — PUBLICACIÓN AUTOMÁTICA ACTIVA

### Workflow n8n
- **Nombre:** `ENBA - Redes Publicacion Diaria 12:15`
- **ID:** `oiFVJdy5VGlXtlMp`
- **Estado:** `active: true` — publicando automáticamente
- **Cron:** `15 15 * * *` (12:15 ART todos los días)
- **Timezone:** `America/Argentina/Buenos_Aires`
- **dryRun:** `"false"` (permanente)
- **Nodos:** 26 (versión v6)
- **Find Today Piece:** lógica original (`new Date()` + offset ART)
- **Credencial Meta:** `Meta API ENBA` (ID `n8scJzbGXnCprioD`, tipo httpHeaderAuth, Page LL válido expires:never)
- **Credencial email:** `Gmail ENBA`

### Patrón de publicación FB (v6)
Meta deprecó `POST /{pageId}/photos` default (published=true) en 2024/2025. El workflow usa patrón 2 pasos:
1. `FB Create Unpublished Photo`: `POST /{pageId}/photos?published=false&url=...`
2. `FB Publish Post`: `POST /{pageId}/feed?message=...&attached_media=[{media_fbid:...}]`

Esto fue validado con test real (POST + DELETE) y con publicación exitosa de piece-01 y piece-02.

### GitHub Actions
- `publish-daily.yml`: `disabled_manually` — NO reactivar. n8n es el orquestador oficial.

### Posts publicados

| Pieza | IG | FB |
|---|---|---|
| piece-01 (15-abr) | https://www.instagram.com/p/DXOk9o1AHhn/ | https://www.facebook.com/122109345308620656/posts/122109345206620656 |
| piece-02 (16-abr) | https://www.instagram.com/p/DXOl7hJCZMT/ | https://www.facebook.com/122109345308620656/posts/122109346046620656 |
| piece-03+ | automáticas desde el cron a 12:15 ART diario |

---

## 3. CONVENCIÓN DE TOKENS (COORDINADA CON FRENTE 10K)

### Regla principal
Secrets NO van en `.env`. Viven en Windows User scope o credenciales encriptadas de n8n.

### Variables Windows User scope

| Variable | Contenido | Owner | Len |
|---|---|---|---|
| `META_ACCESS_TOKEN` | Page Access Token LL (expires:never) | Frente lanzamiento/redes | 229 |
| `META_ADS_USER_TOKEN` | User Access Token LL (expires:never, scope ads) | Frente 10K/ads | 214 |
| `META_APP_ID` | App ID | Compartido | — |
| `META_APP_SECRET` | App Secret | Compartido | 32 |
| `META_IG_BUSINESS_ACCOUNT_ID` | IG Business Account ID | Compartido | 17 |
| `META_FB_PAGE_ID` | Facebook Page ID (`1064806400040502`) | Compartido | Corregido 17-abr |
| `META_FB_PORTFOLIO_ID` | Business Portfolio ID (`814334400927137`) | Compartido | Nuevo 17-abr |
| `N8N_API_KEY` | API key n8n cloud | Compartido | 267 |

### `.env` del repo
Solo IDs públicos (no secrets):
```
META_PAGE_ID=1064806400040502
META_IG_USER_ID=17841443139761422
META_APP_ID=4302352160025424
```

### Regla de regeneración
Si cualquier agente o Jose necesita regenerar un token en Graph API Explorer, debe avisar ANTES a ambos frentes. Regenerar puede invalidar tokens derivados de la misma App/usuario, rompiendo la credencial n8n y la publicación automática.

### Credencial n8n
- `Meta API ENBA` (ID `n8scJzbGXnCprioD`): httpHeaderAuth con `Authorization: Bearer <Page LL de META_ACCESS_TOKEN>`
- Solo se actualiza desde la UI de n8n (no por API). Owner: frente redes + Jose.

---

## 4. IDS ÚTILES

| Recurso | ID |
|---|---|
| Page ID (ENBA) | `1064806400040502` |
| IG Business Account | `17841443139761422` |
| App ID | `4302352160025424` |
| Business Manager ID | `814334400927137` |
| Workflow redes | `oiFVJdy5VGlXtlMp` |
| Workflow blog (referencia) | `BTs8fTGvGqJE3shj` |
| Credencial Meta n8n | `n8scJzbGXnCprioD` |
| Ad Account (10K) | `act_2303565156801569` |

---

## 5. QUÉ SE RESOLVIÓ EN ESTA SESIÓN

1. Diagnóstico causa raíz FB Publish: Meta deprecó POST /photos default, necesita patrón 2 pasos (photos?published=false + feed?attached_media)
2. Patch v6 al workflow: 25→26 nodos, FB Publish reemplazado por FB Create Unpublished Photo + FB Publish Post
3. Diagnóstico token expirado en credencial n8n: era un token distinto al de Windows, invalidado por regeneración en Graph API Explorer
4. Coordinación con Claude 10K: convención de tokens, migración de .env a Windows User scope
5. .env.example actualizado (sin secrets, solo IDs públicos)
6. Publicación exitosa piece-01 (IG + FB) — test real supervisado
7. Publicación exitosa piece-02 (IG + FB) — test real supervisado
8. Cron activado: publicación diaria automática desde 12:15 ART

---

## 6. PENDIENTES NO URGENTES

1. **Cleanup archivos temporales** — ~20 n8n-backup-*.json + 8 n8n-find-today-piece-original-*.txt en raíz. No commiteados, no molestan.
2. **Patch publicación parcial (IG OK + FB FAIL)** — no implementado. Si FB falla después de IG, no hay email ni protección anti-duplicado. Con patrón 2 pasos es poco probable pero posible (ej. token expirado).
3. **Scripts publish-*.mjs vestigiales** — apuntan a META_PAGE_ACCESS_TOKEN que no existe en .env, y usan endpoint FB viejo. No son pipeline vivo (n8n lo es). Deprecar o actualizar.
4. ~~**META_FB_PAGE_ID en Windows**~~ — RESUELTO 17-abr. Corregido a `1064806400040502` (Page). Agregada `META_FB_PORTFOLIO_ID` = `814334400927137` (Business Portfolio).
5. **Commit pendiente** — .env.example modificado + CLAUDE.md + scripts útiles (patch-v6, prep-test, restore).
6. **staticData.lastPublished** — el código está correcto pero solo persiste en ejecuciones de producción (cron), no manuales. Primera ejecución de cron (piece-03) lo grabará.

---

## 7. REGLAS DE TRABAJO

1. NUNCA commit/push sin aprobación explícita de Jose
2. NUNCA tocar `enba-web` ni `plan-crecimiento-10k`
3. NUNCA publicar en Meta sin aprobación (salvo el cron automático ya activado)
4. NUNCA regenerar tokens sin coordinación previa con ambos frentes
5. NUNCA exponer tokens ni API keys en la salida
6. Patrón blog (`ENBA - Blog Automation`, ID `BTs8fTGvGqJE3shj`) es referencia para n8n
7. Reglas operativas n8n de CLAUDE.md: API directa con curl, --ssl-no-revoke, JS a archivo, nunca GET→mutar→PUT completo

---

## 8. APP META

- **Nombre:** EspacioNauticoBot
- **ID:** 4302352160025424
- **Modo:** Development
- **Business:** Espacio Nautico BsAs (ID 814334400927137, NO verificado)
- **Tipo:** Negocios
- **pages_manage_posts:** Standard Access, 5+ calls activas
- **Verificación del negocio:** pendiente (no urgente para el workflow actual)

---

FIN DEL HANDOFF.
