# ENBA Social Assets

## Propósito
Repositorio de contenido social para Espacio Náutico Buenos Aires (ENBA). Contiene campañas, carruseles, asset-bank curado, scripts de rendering y pipeline de publicación para Instagram y Facebook.

**Dominio:** `social-assets.espacionautico.com.ar` (Cloudflare Pages)
**Repo del sitio web:** `enba-web` (separado — no mezclar)

---

## Regla obligatoria
**COMMITS Y PUSH**: nunca hacer commit ni push sin consulta previa. Esperar aprobación explícita del usuario.

**AUTONOMÍA EN READ-ONLY**: trabajar en modo autónomo para lectura, análisis, búsqueda. Pedir confirmación antes de cualquier acción que modifique estado.

---

## Estructura

```
enba-social-assets/
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
├── staging/                   # PNGs listos para publicar via Meta API
├── published/                 # PNGs ya publicados
└── manifests/                 # Manifests de publicación
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
6. **PUBLICADO:** subido via Meta Graph API, movido a `published/`
7. **MEDICIÓN:** Bruno lee métricas, Bruno + Marina + Franco producen aprendizajes

---

## Equipos de trabajo

Gobernanza de dos capas: Team 4 dirige, Team 3 ejecuta.

**Contrato:** `campaign.pieces.json` o `carousel.config.json` + `captions.json` son la fuente de verdad.

### TEAM 4 — Capa 1: Dirección Senior

Inicia todo ciclo de producción. Define estrategia, concepto y dirección creativa. Revisa entregables de Team 3. Mide resultados y produce aprendizajes para la siguiente iteración.

| Rol | Nombre | Mandato |
|-----|--------|---------|
| **Directora Creativa Senior** | Marina | Define concepto visual y dirección creativa de cada campaña/pieza. Evalúa scroll-stopping, save/share potential, coherencia estética. Revisa y aprueba o rechaza entregables visuales de Dani. |
| **Estratega de Contenido** | Franco | Define qué se publica, cuándo y por qué. Calendario editorial, distribución de verticales, estrategia de hashtags. Revisa y aprueba o rechaza copy de Sole. |
| **Social Growth & Performance Director** | Bruno | Lee performance post-publicación. Detecta qué escalar, qué corregir y qué cortar. Propone tests y conecta contenido con resultado. Produce aprendizaje cuantitativo accionable para la siguiente iteración. |

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

| Rol | Nombre | Mandato |
|-----|--------|---------|
| **Coordinador de Producción** | Manu | Recibe brief de Team 4, descompone en tareas, asigna a Dani/Sole/Nico, gestiona dependencias y secuencia. No produce contenido ni corrige entregables ajenos. |
| **Productor Visual** | Dani | Owner de renders, PNGs, assets, crops, calibración y brand compliance. Pipeline: JSON → Playwright → PNGs. |
| **Copywriter** | Sole | Owner de captions IG + FB, headlines, CTAs, hooks. Voz de marca, vocabulario prohibido, tono por plataforma. |
| **QA & Publisher** | Nico | Owner del checklist final, staging y publicación. Último gate antes de publicar. Paridad IG/FB, coherencia copy/visual, URLs, vocabulario prohibido. No publica sin PASS completo. |

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

---

## Errores a evitar

1. No mezclar contenido social con el repo del sitio web (`enba-web`)
2. No commitear fotos crudas — solo JPGs procesados en `asset-bank/`
3. No publicar precios exactos en captions sin aprobación
4. No usar "Puerto Madero" ni "Puerto Norte" — siempre "Costanera Norte"
5. No publicar sin PASS de Nico (QA)
6. No repetir en la caption lo que ya dicen los slides del carrusel
7. Captions IG complementan emocionalmente; captions FB informan y contextualizan

---

## Reglas operativas n8n

1. No usar MCP tools para n8n — siempre API directa con curl + env vars
2. API key leerla así, sin exponerla nunca:
   `N8N_KEY=$(powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')")`
   Solo decir CARGADA o VACÍA. Nunca imprimir, echar ni mostrar el valor.
3. `--ssl-no-revoke` en todos los curl a n8n cloud (exit code 35 sin esto)
4. Code nodes: escribir JS a archivo .js primero, nunca componer JS dentro de template literals de bash
5. Caracteres especiales / español — asegurar UTF-8 explícito en el payload
6. Crear workflow = POST limpio OK. Modificar nodos con jsCode/jsonBody/expresiones → hacerlo desde UI o patch quirúrgico, nunca GET completo → mutar → PUT completo
7. Base URL: `https://espacionautico.app.n8n.cloud/api/v1/`

---

## Meta API tokens en n8n cloud

1. Crear la credencial en la UI de n8n (Settings → Credentials → Add → "Header Auth" con nombre `Authorization` y valor `Bearer <token>`). El token queda encriptado en n8n.
2. Anotar el credential ID que n8n le asigna.
3. En los nodos HTTP Request del workflow, referenciar esa credencial por ID con `authentication: "genericCredentialType"` y `genericAuthType: "httpHeaderAuth"` — así el nodo la consume sin que el token aparezca en el JSON del workflow.
4. Nunca poner tokens en Code nodes, variables de workflow, ni en el body/URL como texto plano.
5. Nunca commitear, loguear ni exponer tokens de Meta — si se filtran, Meta los revoca automáticamente.
6. Credencial actual: `Meta API ENBA` (ID: `n8scJzbGXnCprioD`, tipo: `httpHeaderAuth`)

---

## Reglas operativas generales

1. Verificar deploy de Cloudflare después de cada push — no asumir que push = deploy
2. No exponer secretos (API keys, tokens, app secrets) en la salida — nunca
3. Tokens de Meta van en credenciales encriptadas de n8n (httpHeaderAuth), nunca en código ni en Code nodes
4. Después de publicar en Meta API, verificar que el post existe — no asumir que la respuesta 200 = post visible
