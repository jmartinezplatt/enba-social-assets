# ENBA Social Assets

Repositorio de contenido social para Espacio Nautico Buenos Aires (ENBA). Contiene campanas, bancos de imagenes curados, scripts de rendering y pipeline de publicacion para Instagram y Facebook.

**Dominio:** `social-assets.espacionautico.com.ar` (Cloudflare Pages)
**Repo del sitio web:** `enba-web` (separado — no mezclar)
**Reglas completas:** ver `CLAUDE.md`
**Inicio de sesión del frente activo:** ver `campaigns/plan-crecimiento-10k/STATUS.md`

---

## Estructura

```text
enba-redes/
├── CLAUDE.md                   # Fuente de verdad operativa
├── README.md                   # Este archivo
├── asset-bank/                 # JPGs aprobados y listos para usar
├── material-bank/              # Biblioteca amplia de material curado
├── campaigns/                  # Campanas, carruseles y frentes activos
│   ├── lanzamiento-15-abr-2026/
│   ├── plan-crecimiento-10k/   # Frente activo: STATUS.md + plan + pauta + Meta IDs
│   ├── carruseles-organicos/
│   ├── reels/
│   ├── teaser-frankenstein/
│   └── calendario-integrado.json
├── staging/                    # PNGs listos para publicar via Meta API
├── published/                  # PNGs ya publicados
├── manifests/                  # Manifests de publicacion por pieza
├── scripts/                    # Renderers Playwright y utilidades
├── .claude/
│   ├── agents/                 # Prompts permanentes de agentes
│   └── commands/               # Slash commands del proyecto
└── assets-map.json             # Mapa de assets con parametros de calibracion
```

---

## Bancos de imagenes

### `asset-bank/`
Assets aprobados, limpios y listos para usar en campanas. JPGs procesados a Q92, max 2400px lado largo. Naming en kebab-case por contenido (`escuela-timonel-compas-gris.jpg`). Solo entran imagenes curadas — las fotos crudas viven fuera de git.

### `material-bank/`
Biblioteca amplia de material curado por album de origen. Clasificado por vertical (`escuela/`, `travesias/`, `marca/`, etc.) con carpetas separadas para `requires-consent/` y `maybe/`. Cada album tiene su `manifest.json` con trazabilidad al archivo original, status y tags.

No todo lo que esta en `material-bank/` esta listo para publicar. El `asset-bank/` es el subconjunto aprobado.

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
| `scripts/render-enba-launch-campaign.mjs` | Renderiza las 30 piezas de la campana de lanzamiento |
| `scripts/render-enba-launch-carousel.mjs` | Renderiza slides de carruseles |
| `scripts/stage-campaign.mjs` | Copia PNGs de output/ a staging/ con manifests |
| `scripts/publish-piece.mjs` | Publicacion manual de una pieza por ID |
| `scripts/build-redes-launch-image-bank.mjs` | Construye el banco de imagenes de lanzamiento |

Todos los renderers usan Playwright. Instalar dependencias con `npm install`.

---

## Reglas operativas

1. No hacer commit ni push sin aprobacion explicita
2. No publicar sin QA PASS de Nico
3. No exponer secretos (API keys, tokens) en la salida
4. No commitear fotos crudas — solo JPGs procesados en `asset-bank/`
5. No usar "Puerto Madero" ni "Puerto Norte" — siempre "Costanera Norte"
6. No mezclar contenido social con el repo del sitio web (`enba-web`)

Para reglas completas, voz de marca, vocabulario prohibido, URLs por vertical, reglas n8n y checklist de QA: ver `CLAUDE.md`.
