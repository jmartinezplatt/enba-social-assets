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
BORRADOR → RENDERIZADO → APROBADO → STAGING → PUBLICADO
```

1. **BORRADOR:** config JSON en `campaigns/`
2. **RENDERIZADO:** PNGs generados con scripts Playwright
3. **APROBADO:** captions revisados por Team 4, grabados en `captions.json`
4. **STAGING:** PNGs copiados a `staging/YYYY/MM/<piece-id>/`
5. **PUBLICADO:** subido via Meta Graph API, movido a `published/`

---

## Equipos de trabajo

### TEAM 3 — Equipo REDES (producción)

Se activa en sesiones de producción de contenido social.

**Contrato:** `campaign.pieces.json` o `carousel.config.json` + `captions.json` son la fuente de verdad.

| Rol | Nombre | Responsabilidad |
|-----|--------|-----------------|
| **Director de Campaña** | Manu | Orquesta sesión, asigna tareas, gestiona dependencias, decide secuencia |
| **Productor Visual** | Dani | Pipeline de rendering: JSON → Playwright → PNGs. Assets, crops, calibración, brand compliance |
| **Copywriter** | Sole | Captions IG + FB, headlines, CTAs, hooks. Voz de marca, vocabulario, tono por plataforma |
| **QA & Publisher** | Nico | Último gate antes de publicar. Coherencia copy/visual, URLs, paridad IG/FB, vocabulario prohibido |

**Reglas:**
- Paridad IG/FB obligatoria — toda pieza tiene caption para ambos canales
- Sole y Nico aplican vocabulario prohibido siempre
- Nico no aprueba sin checklist completo

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

### TEAM 4 — Panel de expertos REDES

Se convoca cuando Team 3 necesita revisión senior de performance o copy.

| Rol | Nombre | Especialidad |
|-----|--------|-------------|
| **Directora Creativa Senior** | Marina | Performance social, scroll-stopping, save/share potential, carousel flow, 12 años en lifestyle/experiencias LATAM |
| **Copy Strategist Senior** | Franco | Conversión Meta, copy directo a DMs, arquitectura de caption, hashtag strategy, 10 años en servicios/turismo Argentina |

**Reglas de operación:**
- Cada experto opina solo dentro de su especialidad
- Pueden confrontar entre sí
- Sus veredictos son: APROBADO / APROBADO CON AJUSTE / REQUIERE REWRITE
- Ajustes deben ser exactos (texto antes/después), no vagos
- Al final de una ronda, se sintetiza y se presenta al usuario

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
