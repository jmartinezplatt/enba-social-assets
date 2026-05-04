# ENBA Social Assets

Repositorio de contenido social para Espacio Nautico Buenos Aires (ENBA). Contiene campanas, bancos de imagenes curados, scripts de rendering y pipeline de publicacion para Instagram y Facebook.

**Dominio:** `social-assets.espacionautico.com.ar` (Cloudflare Pages)
**Repo del sitio web:** `enba-web` (separado — no mezclar)
**Repo de render de video:** `enba-remotion` (separado, privado — Remotion para reels con texto/overlays)
**Reglas completas:** ver `CLAUDE.md`
**Inicio de sesión del frente activo:** ver `campaigns/plan-crecimiento-10k/STATUS.md`
**Qué herramienta usar por tipo de pieza:** ver `campaigns/plan-crecimiento-10k/PRODUCTION-RUNBOOK.md`

---

## Estructura

```text
enba-redes/
├── CLAUDE.md                   # Fuente de verdad operativa
├── README.md                   # Este archivo
├── asset-bank/                 # Fotos/videos curados, local-first (subcarpetas ignoradas por git, ~4 GB)
├── campaigns/                  # Campanas, carruseles y frentes activos
│   ├── lanzamiento-15-abr-2026/
│   ├── plan-crecimiento-10k/   # Frente activo: STATUS.md + plan + pauta + Meta IDs + PRODUCTION-RUNBOOK.md
│   ├── carruseles-organicos/
│   └── calendario-integrado.json
├── staging/                    # PNGs listos para publicar via Meta API
├── published/                  # Sin uso activo
├── manifests/                  # Manifests de publicacion por pieza
├── scripts/                    # Renderers, publishers, uploads y utilidades
└── .claude/
    ├── agents/                 # Prompts permanentes de agentes
    └── commands/               # Slash commands del proyecto

# Repo externo (separado, privado)
enba-remotion/                  # Render de video con Remotion — reels con texto, end cards, safe zone
```

---

## Asset bank

### `asset-bank/`
Fotos y videos curados, organizados en 7 subcarpetas por vertical (`destinos/`, `escuela-aprendizaje/`, `servicios/`, `travesias-navegacion/`, `buenos-aires-paisaje/`, `veleros-broker/`, `grupos-experiencia/`). Local-first: las subcarpetas son ignoradas por git (~1.3 GB fotos + ~3 GB videos). Git solo trackea docs y scripts livianos.

1,924 archivos al 03/05 (1,281 fotos + 643 videos). Ver `asset-bank/README.md`.

---

## Campanas

Cada campana vive en `campaigns/<nombre>/` y contiene:
- `campaign.pieces.json` — fuente de verdad con piezas, captions IG/FB y assets
- `campaign.system.json` — sistema de diseno (canvas, paleta, templates)
- `output/` — PNGs renderizados
- `preview.html` — preview visual de las piezas

Los carruseles standalone estan en `campaigns/carruseles-organicos/` con `carousel.config.json` + `captions.json` + slides PNG.

---

## Staging y publicacion

```text
BRIEF (Team 4) > PRODUCCION (Team 3) > QA (Nico) > REVISION SENIOR (Team 4) > STAGING > PUBLICADO > MEDICION
```

- `staging/YYYY/MM/<piece-id>/` — PNGs listos para publicar
- `published/YYYY/MM/<piece-id>/` — PNGs ya publicados
- `manifests/<piece-id>.json` — metadata por pieza (status, URLs, source)

Publicacion automatica via workflow n8n a las 12:15 AR. Deploy en Cloudflare Pages automatico con cada push a `main`.

---

## Agentes y gobernanza

El repo opera con un sistema de dos capas y 7 agentes. Prompts en `.claude/agents/`, commands en `.claude/commands/`.

**Team 4 — Capa 1: Direccion Senior**

| Agente | Rol |
|--------|-----|
| Marina | Directora Creativa Senior |
| Franco | Estratega de Contenido |
| Bruno  | Social Growth & Performance Director |

**Team 3 — Capa 2: Ejecucion Operativa**

| Agente | Rol |
|--------|-----|
| Manu   | Coordinador de Produccion |
| Dani   | Productor Visual |
| Sole   | Copywriter |
| Nico   | QA & Publisher |

Team 4 define estrategia, concepto y direccion. Team 3 ejecuta. Cada agente es owner de su entregable y trabaja en worktree independiente. Detalle completo en `CLAUDE.md` seccion "Equipos de trabajo".

---

## Scripts utiles

| Script | Que hace |
|--------|----------|
| `scripts/render-enba-launch-campaign.mjs` | Renderiza las 30 piezas de la campana de lanzamiento (Playwright) |
| `scripts/render-enba-launch-carousel.mjs` | Renderiza slides de carruseles (Playwright) |
| `scripts/build-reel-v8.sh` | Reel sin texto, battle-tested (ffmpeg) |
| `scripts/stage-campaign.mjs` | Copia PNGs de output/ a staging/ con manifests |
| `scripts/publish-piece.mjs` | Publicacion manual de una pieza por ID |
| `scripts/swap-ig-cold-v3.mjs` | Swap creativo puntual en un ad de Meta Ads |

Estáticas y carruseles usan Playwright (`npm install`). Reels con texto usan Remotion (`enba-remotion`). Ver `campaigns/plan-crecimiento-10k/PRODUCTION-RUNBOOK.md` e inventario completo en `scripts/README.md`.

---

## Reglas operativas

1. No hacer commit ni push sin aprobacion explicita
2. No publicar sin QA PASS de Nico
3. No exponer secretos (API keys, tokens) en la salida
4. No commitear fotos crudas — solo JPGs procesados en `asset-bank/`
5. No usar "Puerto Madero" ni "Puerto Norte" — siempre "Costanera Norte"
6. No mezclar contenido social con el repo del sitio web (`enba-web`)

Para reglas completas, voz de marca, vocabulario prohibido, URLs por vertical, reglas n8n y checklist de QA: ver `CLAUDE.md`.
