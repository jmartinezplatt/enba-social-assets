# ENBA Social Assets

## Propósito
Repositorio de contenido social para Espacio Náutico Buenos Aires (ENBA). Contiene campañas, carruseles, asset-bank curado, scripts de rendering y pipeline de publicación para Instagram, Facebook y TikTok.

**Dominio:** `social-assets.espacionautico.com.ar` (Cloudflare Pages)
**Repo del sitio web:** `enba-web` (separado — no mezclar)

---

## Branch de trabajo activo

**Branch:** `main`
**Fuentes de verdad del frente:**
- `campaigns/plan-crecimiento-10k/STATUS.md` — snapshot corto vigente para inicio de sesión
- `campaigns/plan-crecimiento-10k/plan-maestro.md` — plan vivo, pendientes, timeline
- `campaigns/plan-crecimiento-10k/presupuesto-v4-reestructuracion.md` — plan de pauta vigente
- `campaigns/plan-crecimiento-10k/meta-ids.json` — infraestructura Meta Ads

**Frente TikTok:** integrado a `main` (merge `wip-tiktok-30d-pilot` completado). Restricción de publicación activa arriba.

Al arrancar sesión:
1. Verificar branch actual y worktrees (`git branch --show-current` + `git worktree list`).
2. Si ya estás en `main`, continuar.
3. Si `main` está abierto en otro worktree, usar ese directorio como workspace correcto de la sesión.
4. Si no podés entrar al branch correcto o al worktree correcto, frenar y reportar el bloqueo exacto.
Orden de lectura recomendado para este frente: `CLAUDE.md` → `STATUS.md` → documento específico según tarea.

---

## Regla obligatoria
**COMMITS Y PUSH**: nunca hacer commit ni push sin consulta previa. Esperar aprobación explícita del usuario.

**AUTONOMÍA EN READ-ONLY**: trabajar en modo autónomo para lectura, análisis, búsqueda. Pedir confirmación antes de cualquier acción que modifique estado.

**TIKTOK — RESTRICCIÓN ACTIVA**: mientras la app "ENBA Social" esté en review en TikTok Developer Portal, no asumir que la publicación via API es pública. Videos publicados por apps no auditadas quedan en modo privado. Publicación manual hasta recibir aprobación explícita de TikTok.

---

## Estructura

```
enba-redes/
├── CLAUDE.md                  # Este archivo
├── campaigns/
│   ├── lanzamiento-15-abr-2026/   # Campaña 30 piezas (15 abr – 14 may)
│   │   ├── campaign.pieces.json    # Fuente de verdad: 30 piezas con captions
│   │   ├── campaign-base.json      # Config base original
│   │   ├── campaign.system.json    # Sistema de diseño (canvas, paleta, templates)
│   │   ├── asset-bank-manifest.json
│   │   ├── brand/                  # SVGs de lockup
│   │   ├── output/                 # 30 PNGs renderizados
│   │   └── preview.html
│   └── carruseles-organicos/       # Carruseles standalone
│       ├── carrusel-no-es-tour/
│       ├── carrusel-cuanto-sale/
│       ├── carrusel-elegi-aventura/
│       └── preview-carruseles.html
├── asset-bank/                # JPGs curados y procesados (no crudos)
├── scripts/                   # Renderers Playwright
│   ├── render-enba-launch-campaign.mjs
│   ├── render-enba-launch-carousel.mjs
│   └── build-redes-launch-image-bank.mjs
├── staging/                   # PNGs servidos por Cloudflare Pages — destino final post-publicación
├── published/                 # (sin uso activo — el pipeline actual no mueve archivos aquí)
└── manifests/                 # Manifests de publicación (registro estático, no actualizado por n8n)
```

---

## Voz de marca

**Nombre completo:** Espacio Náutico Buenos Aires
**Sigla interna:** ENBA
**Ubicación:** Costanera Norte, frente al Aeroparque
**Tono:** cercano, argentino (voseo), profesional sin ser corporativo, apasionado sin vender humo
**No somos:** elitistas, vendedores agresivos, un tour, un paseo en catamarán

### Vocabulario prohibido

| Evitar | Por qué | En su lugar |
|--------|---------|-------------|
| "Lujo" | Somos accesibles | "Experiencia única" |
| "Barato" | Desvaloriza | "Accesible", "al alcance" |
| "Paseo" | Minimiza la experiencia | "Travesía", "navegación", "salida" |
| "Tour" | Muy genérico | "Travesía", "escapada náutica" |
| "Cliente" (en posts) | Muy comercial | "Tripulante", "navegante" |
| "Puerto Madero" | INCORRECTO | "Costanera Norte, frente al Aeroparque" |
| "Puerto Norte" | Descartado | "Costanera Norte" |
| Precios exactos | Sin aprobación | "Consultá por DM o WhatsApp" |

### Tono por plataforma

| Plataforma | Tono | Largo |
|------------|------|-------|
| Instagram | Aspiracional, estético | 80-150 palabras |
| Facebook | Informativo, cálido, comunidad | hasta 200 palabras |

### Caption: fórmula
HOOK + VALOR + CTA + HASHTAGS

### Hashtags

**Fijos de marca:** `#EspacioNautico #ENBA #NavegaElRioDeLaPlata`

**Pool de nicho:** `#VelerosBuenosAires #RioDeLaPlata #SailingArgentina #TravesiaEnVelero #EscuelaNautica #BrokerNautico #NavegacionReal`

**Pool de descubrimiento (rotar):** `#PlanesBuenosAires #FinDeSemanaBA #QuéHacerEnBuenosAires #ExperienciasBuenosAires #SalidaDistinta #PlanDeFinde #PlanDePareja #RegaloOriginal`

**Regla:** IG 8-15 hashtags · FB 3-5. Siempre incluir 3-4 de descubrimiento.

---

## URLs por vertical (para captions)

| Contenido | URL |
|-----------|-----|
| Travesías, destinos, navegaciones con pernocte | `/travesias` |
| Salidas cortas, paseos urbanos de día | `/paseos-en-velero-buenos-aires` |
| Escuela, cursos, timonel | `/escuela-nautica` |
| Veleros en venta, broker | `/veleros-en-venta` |
| Servicios técnicos | `/servicios-nauticos` |
| General / primer contacto | `/contacto` o DM |

Dominio base: `espacionautico.com.ar`

---

## Convenciones de naming

### Campañas
`campaigns/<nombre-campaña>/` — ej: `lanzamiento-15-abr-2026`

### Carruseles standalone
`campaigns/carruseles-organicos/<nombre-carrusel>/` — ej: `carrusel-no-es-tour`

Cada carrusel contiene:
- `carousel.config.json` — config del renderer
- `captions.json` — captions IG + FB aprobados
- `slide-01.png` ... `slide-NN.png` — PNGs renderizados

### Asset-bank
`asset-bank/<descripcion-kebab-case>.jpg` — ej: `navegando-picante-openwater.jpg`

Solo entran JPGs procesados y curados. Las fotos crudas viven fuera de git (`C:\Users\josea\enba-fotos-crudas\`).

---

## Pipeline de publicación

```
BRIEF (Team 4) → PRODUCCIÓN (Team 3) → QA (Nico) → REVISIÓN SENIOR (Team 4) → STAGING → PUBLICADO → MEDICIÓN
```

1. **BRIEF:** Team 4 define estrategia, concepto y dirección creativa
2. **PRODUCCIÓN:** Dani renderiza PNGs, Sole escribe captions IG + FB
3. **QA:** Nico valida con checklist completo
4. **REVISIÓN SENIOR:** Team 4 aprueba, ajusta o pide rewrite
5. **STAGING:** PNGs copiados a `staging/YYYY/MM/<piece-id>/`, captions grabados en `captions.json`
6. **PUBLICADO:** subido via Meta Graph API. Los archivos se quedan en `staging/` (Cloudflare Pages los sirve desde ahí). Post IDs se registran en `captions.json` (`igPostId`, `fbPostId`, permalinks y timestamps).
7. **MEDICIÓN:** Bruno lee métricas, Bruno + Marina + Franco producen aprendizajes

---

## Equipos de trabajo

Gobernanza de dos capas: Team 4 dirige, Team 3 ejecuta.

**Contrato:** `campaign.pieces.json` o `carousel.config.json` + `captions.json` son la fuente de verdad.

### TEAM 4 — Capa 1: Dirección Senior

Inicia todo ciclo de producción. Define estrategia, concepto y dirección creativa. Revisa entregables de Team 3. Mide resultados y produce aprendizajes para la siguiente iteración.

| Rol | Nombre | Prompt operativo |
|-----|--------|-----------------|
| **Directora Creativa Senior** | Marina | `.claude/agents/marina.md` |
| **Estratega de Contenido** | Franco | `.claude/agents/franco.md` |
| **Social Growth & Performance Director** | Bruno | `.claude/agents/bruno.md` |
| **Paid Media Auditor** | Auditor | `.claude/agents/auditor.md` |

**Entrega de Team 4 → Team 3:** brief de producción por campaña o lote:
- Objetivo de la pieza/campaña
- Dirección creativa (Marina)
- Estrategia de contenido y calendario (Franco)
- Métricas de referencia y aprendizajes de iteraciones anteriores (Bruno)

**Reglas de Capa 1:**
- Marina, Franco y Bruno opinan dentro de su especialidad pero pueden confrontar entre sí
- Si no se ponen de acuerdo, escalan al usuario
- Veredictos: APROBADO / APROBADO CON AJUSTE / REQUIERE REWRITE
- Ajustes deben ser exactos (texto antes/después), no vagos
- Al final de una ronda, se sintetiza y se presenta al usuario
- No ejecutan producción. No editan captions, no tocan PNGs, no mueven staging/published.

**Cuándo entra Team 4:**
1. Al inicio de cada campaña/lote — produce el brief
2. Después de producción — revisa entregables de Team 3
3. Post-publicación — Bruno lee métricas y produce aprendizaje cuantitativo, Marina + Franco + Bruno sintetizan decisiones para la siguiente iteración

### TEAM 3 — Capa 2: Ejecución Operativa

Recibe brief de Team 4 y ejecuta de punta a punta hasta publicación. No arranca producción sin brief.

| Rol | Nombre | Prompt operativo |
|-----|--------|-----------------|
| **Coordinador de Producción** | Manu | `.claude/agents/manu.md` |
| **Productor Visual** | Dani | `.claude/agents/dani.md` |
| **Copywriter** | Sole | `.claude/agents/sole.md` |
| **QA & Publisher** | Nico | `.claude/agents/nico.md` |

**Entrega de Team 3 → Team 4:** piezas completas (PNG + captions IG + captions FB) listas para revisión senior.

**Reglas de Capa 2:**
- Paridad IG/FB obligatoria — toda pieza tiene caption para ambos canales
- Sole y Nico aplican vocabulario prohibido siempre
- Nico no aprueba sin checklist completo
- Cada agente es owner de su entregable — si hay que corregir, se devuelve al owner, no se corrige en su lugar

**Checklist de PASS por pieza (Nico):**
- [ ] captionIg presente y completo
- [ ] captionFb presente y completo
- [ ] URLs correctas según tabla de verticales
- [ ] Sin vocabulario prohibido
- [ ] Sin precios exactos
- [ ] Sin "Puerto Madero" ni "Puerto Norte"
- [ ] PNG renderizado = asset + template del JSON
- [ ] Hashtags dentro de rango (IG 8-15, FB 3-5)
- [ ] CTA claro y coherente con el objetivo de la pieza

### Restricciones por rol

| Agente | No puede |
|--------|----------|
| Manu | Editar captions, retocar PNGs, overridear QA, definir estrategia, definir dirección creativa |
| Dani | Escribir captions, decidir qué se publica, aprobar su propio trabajo |
| Sole | Retocar visuales, definir calendario, aprobar su propio trabajo |
| Nico | Cambiar copy sin devolver a Sole, cambiar PNGs sin devolver a Dani, publicar sin checklist PASS |
| Marina | Ejecutar producción, editar archivos, tocar staging/published |
| Franco | Ejecutar producción, editar archivos, tocar staging/published, medir performance (owner: Bruno) |
| Bruno | Ejecutar producción, editar archivos, tocar staging/published, redefinir tono de marca (owner: Marina), escribir captions (owner: Sole) |
| Auditor | Escribir planes propios, ejecutar producción, editar archivos, tocar staging/published, definir creatividad ni calendario. Solo audita y devuelve veredicto. |

### Worktrees y ownership

Los agentes de Team 3 trabajan en worktrees independientes cuando la tarea requiere edición, producción o iteración real de archivos.

**Reglas de worktree:**
- Cada agente es owner de su worktree y de su entregable
- Ningún agente puede editar dentro del worktree de otro agente
- Si un entregable necesita cambios, se devuelve al agente owner — no se corrige por invasión
- Manu coordina pero no invade worktrees ajenos
- Marina, Franco y Bruno dirigen, revisan y devuelven criterio, pero no ejecutan producción dentro de worktrees ajenos
- La coordinación entre agentes se da por artefactos y handoffs claros, no por intervención manual sobre archivos de otros

### Ciclo operativo

```
ESTRATEGIA (Franco) → CONCEPTO (Marina) → BRIEF (Team 4 → Manu)
→ PRODUCCIÓN (Dani) → COPY (Sole) → QA (Nico) → REVISIÓN SENIOR (Team 4)
  └─ si AJUSTE o REWRITE → vuelve a PRODUCCIÓN o COPY
→ PUBLICACIÓN (Nico) → MEDICIÓN (Bruno) → APRENDIZAJE (Bruno + Marina + Franco)
→ NUEVA ITERACIÓN
```

### Invocación de agentes

Siempre usar el slash command correspondiente (`/bruno`, `/marina`, `/franco`, `/auditor`, `/manu`, `/dani`, `/sole`, `/nico`) que carga CLAUDE.md + prompt operativo completo desde `.claude/agents/`. No improvisar prompts manuales que salteen la definición formal del agente.

---

## Errores a evitar

1. No mezclar contenido social con el repo del sitio web (`enba-web`)
2. No commitear fotos crudas — solo JPGs procesados en `asset-bank/`
3. No commitear videos MP4 — Cloudflare Pages tiene límite de 25 MB por archivo. Un solo MP4 rompió 7 días de deploys (incidente 22/04/2026). Los MP4 ya están en `.gitignore`. Los videos van directo a Meta via API.
4. No publicar precios exactos en captions sin aprobación
5. No usar "Puerto Madero" ni "Puerto Norte" — siempre "Costanera Norte"
6. No publicar sin PASS de Nico (QA)
7. No repetir en la caption lo que ya dicen los slides del carrusel
8. Captions IG complementan emocionalmente; captions FB informan y contextualizan
9. No asumir que push = deploy. Verificar Cloudflare Pages dashboard o hacer HEAD request a pages.dev después de cada push importante.
10. No renderizar stories/imágenes para Meta API como PNG — Meta rechaza screenshots PNG de Playwright con error 36001/2207083. Siempre usar `type: 'jpeg', quality: 92`. (Incidente 23/04/2026)
11. Cloudflare Pages deploya desde `main`, no desde ramas feature. Antes de usar una URL en Meta API: (1) mergear a main, (2) esperar que Cloudflare termine el deploy, (3) verificar `Content-Type: image/jpeg` con HEAD request — el SPA fallback devuelve HTML con HTTP 200 para rutas inexistentes, HTTP 200 solo no alcanza. (Incidente 23/04/2026)
12. Nunca implementar procesos de publicación con intervalos como scripts locales con `setTimeout`. `setTimeout` sobrevive `kill` en Windows/Git Bash — causa procesos zombie y publicaciones duplicadas. Usar n8n para cualquier burst o publicación periódica. (Incidente 23/04/2026: stories #2 y #3 publicadas × 3 frente a seguidores reales)

---

## Reglas operativas n8n

> **Memoria local obligatoria para n8n:**
>
> 1. Antes de cualquier trabajo no trivial de n8n, leer `automatizaciones/n8n-workflows/OPERACION-N8N.md` y `automatizaciones/n8n-workflows/INCIDENTES.md`.
> 2. Si un aprendizaje de `enba-web` aplica acá, importarlo a esta memoria local. No usar `enba-web` como fuente de arranque por default.
> 3. `enba-web` **no se consulta sin autorización explícita de Jose**. Ni siquiera en read-only.
> 4. Si Jose autoriza la consulta, `enba-web` solo se puede mirar en **READ ONLY estricto** y de forma excepcional, cuando falte contexto local para un patrón general de n8n.
> 5. **Ninguna modificación bajo ninguna circunstancia** en `enba-web`, ya sea editando archivos locales, haciendo commits, pushes, o llamando APIs externas (GitHub API, scripts, n8n workflows, etc.) que resulten en cambios en ese repo.
> 6. **Excepción solo con autorización explícita de Jose + reconfirmación.** Si Jose pide algo que implique modificar `enba-web`, confirmar la acción concreta antes de ejecutar ("Para X necesito hacer Y en enba-web. ¿Autorizás?") y esperar un "sí" explícito. "Publicá", "hacelo", "procedé" no alcanzan.
> 7. Incidente 26/04/2026: se publicó un post de blog en `enba-web` vía GitHub API sin pedir autorización explícita, interpretando "publicamos la entrada blog directamente" como aprobación implícita. No repetir.

Las reglas técnicas operativas (curl, flags, Code nodes, API patterns, credenciales, timezone, cron) viven en `automatizaciones/n8n-workflows/OPERACION-N8N.md`. Leer ese archivo — y `INCIDENTES.md` — antes de cualquier trabajo no trivial de n8n.

---

## Seguridad de tokens Meta en n8n

**Nunca poner tokens en Code nodes, variables de workflow, ni en el body/URL como texto plano.**
**Nunca commitear, loguear ni exponer tokens de Meta — si se filtran, Meta los revoca automáticamente.**

Para el patrón técnico de creación y referencia de credenciales en nodos HTTP Request, ver `automatizaciones/n8n-workflows/OPERACION-N8N.md` sección 6.

---

## Convención de tokens Meta — ownership por frente

Secrets NO van en `.env`. Viven en Windows User scope o credenciales encriptadas de n8n.

### Variables Windows User scope

| Variable | Contenido | Owner | Notas |
|---|---|---|---|
| `META_ACCESS_TOKEN` | Page Access Token LL (expires:never) | Frente lanzamiento/redes | Fuente para credencial n8n |
| `META_ADS_USER_TOKEN` | System User Token (expires:never, 41 scopes) | Frente 10K/ads | System User "Conversions API System User" del BM. Reemplaza User Token LL que expiraba cada 60 días. |
| `META_APP_ID` | App ID | Compartido | No es secret |
| `META_APP_SECRET` | App Secret | Compartido | Secret |
| `META_IG_BUSINESS_ACCOUNT_ID` | IG Business Account ID | Compartido | No es secret |
| `META_FB_PAGE_ID` | Facebook Page ID (`1064806400040502`) | Compartido | No es secret |
| `META_FB_PORTFOLIO_ID` | Business Portfolio ID (`814334400927137`) | Compartido | No es secret |
| `N8N_API_KEY` | API key n8n cloud | Compartido | Secret |

### `.env` del repo
Solo IDs públicos (no secrets). Los scripts leen secrets de Windows User scope con:
`powershell -Command "[System.Environment]::GetEnvironmentVariable('NOMBRE','User')"`

### Regla de regeneración de tokens
**NUNCA regenerar token en Graph API Explorer sin avisar a ambos frentes.** Regenerar invalida tokens derivados de la misma App/usuario. Incidente documentado: 16-abr-2026, una regeneración no coordinada invalidó la credencial n8n y rompió publicación automática.

### Patrón FB publish (v6)
Meta deprecó `POST /{pageId}/photos` default en 2024/2025. Usar patrón 2 pasos:
1. `POST /{pageId}/photos?url=...&published=false` → obtiene `photo_fbid`
2. `POST /{pageId}/feed?message=...&attached_media=[{"media_fbid":"<photo_fbid>"}]` → publica

---

## Reglas operativas generales

1. Verificar deploy de Cloudflare después de cada push — no asumir que push = deploy
2. No exponer secretos (API keys, tokens, app secrets) en la salida — nunca
3. Tokens de Meta van en credenciales encriptadas de n8n (httpHeaderAuth), nunca en código ni en Code nodes
4. Después de publicar en Meta API, verificar que el post existe — no asumir que la respuesta 200 = post visible
5. **Meta Ads — pausar y despausar solo a nivel ad (último nivel).** Campañas y ad sets se mantienen siempre `ACTIVE`. Nunca pausar a nivel ad set ni campaña. Esto permite leer el estado de la cuenta con un solo nivel de lectura. (Regla establecida 24/04/2026)
