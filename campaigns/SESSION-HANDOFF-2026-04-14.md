# Handoff de sesión REDES — 14 de abril de 2026

## Contexto
Sesión larga de producción social para Espacio Náutico Buenos Aires (ENBA). Se trabajó con Team 3 (producción) y Team 4 (expertos). Leé `CLAUDE.md` completo antes de hacer cualquier cosa — es la fuente de verdad del repo.

## Estado actual del repo

### Campaña de lanzamiento (15 abr – 14 may)
- **30 piezas** en `campaigns/lanzamiento-15-abr-2026/campaign.pieces.json` — fuente de verdad
- **Captions IG + FB**: revisados por Team 4 (Marina + Franco), voseo corregido, tildes, hashtags, meta-narrativa eliminada
- **QA de Nico**: PASS 30/30
- **PNGs renderizados**: `campaigns/lanzamiento-15-abr-2026/output/` — 30 PNGs con logo oficial
- **Staging**: 30 PNGs copiados a `staging/2026/04/` y `staging/2026/05/` con manifests en `manifests/`
- **Cloudflare Pages**: deployeado y sirviendo en `social-assets.espacionautico.com.ar`
- **Calendario integrado**: `campaigns/calendario-integrado.json` — 35 piezas (30 campaña + 3 carruseles + 2 reels)

### Teaser pre-lanzamiento
- **Publicado** el 14/04 en IG y FB — "Buenos Aires tiene costa."
- Pieza frankenstein: insight de Marina + diseño de Dani + captions de Nico
- Datos en `campaigns/teaser-frankenstein/pieza-final.json` (tiene los post IDs)

### Carruseles orgánicos (3)
- `campaigns/carruseles-organicos/carrusel-no-es-tour/` — 6 slides, captions aprobados, QA PASS
- `campaigns/carruseles-organicos/carrusel-cuanto-sale/` — 6 slides, captions aprobados, QA PASS
- `campaigns/carruseles-organicos/carrusel-elegi-aventura/` — 7 slides, captions aprobados, QA PASS
- Covers de carruseles 1 y 3 re-renderizados con foto real (eran navy sólido)
- **NO están en staging** — cuando toque publicarlos hay que stagearlos
- **El script de publicación no soporta carruseles** — IG carousel API es distinta a single image

### Reels
- 2 guiones en `campaigns/reels/`:
  - `reel-primera-vez/guion.json` — "Primera vez en un velero"
  - `reel-4-horas-en-el-rio/guion.json` — "4 horas en el río"
- Falta que el owner grabe clips en la próxima salida

### Propuestas de equipo
- 9 teasers en `campaigns/propuestas-equipo/` (3 por agente: Marina, Dani, Nico)
- Preview final: `campaigns/propuestas-equipo/preview-final.html`
- Se eligió el frankenstein que ya se publicó

## Pipeline de publicación automática

### n8n workflow
- **ID**: `oiFVJdy5VGlXtlMp`
- **Nombre**: "ENBA - Redes Publicacion Diaria 12:15"
- **Estado**: ACTIVO en `https://espacionautico.app.n8n.cloud`
- **Cron**: todos los días a las 12:15 Argentina (15:15 UTC)
- **Flujo**: lee calendario → busca pieza del día → publica en IG + FB → manda email a jmartinezplatt@gmail.com
- **Credenciales**: Meta API ENBA (`n8scJzbGXnCprioD`, httpHeaderAuth) + Gmail ENBA (`HpJBfNd1BCHaLYfY`, smtp)
- **Token Meta**: nunca expira (page token derivado de long-lived user token)
- **NO FUE TESTEADO END-TO-END** — el 15/04 a las 12:15 es el primer test real
- **Plan B**: `node scripts/publish-piece.mjs piece-01` (necesita `.env` con token vigente)

### Cloudflare Pages
- Conectado a GitHub repo `jmartinezplatt/enba-social-assets`, branch `main`
- Deploy automático en cada push
- Custom domain: `social-assets.espacionautico.com.ar`

### Meta API
- App: EspacioNauticoBot (ID: `4302352160025424`)
- Página FB: Espacio Náutico Buenos Aires (ID: `1064806400040502`)
- Cuenta IG: @espacionauticobsas (ID: `17841443139761422`)
- `.env` local tiene tokens (gitignored)

## Pendientes por prioridad

1. **Verificar que piece-01 se publicó a las 12:15 del 15/04** — si el workflow de n8n falló, publicar manualmente con el script local
2. **Adaptar script de publicación para carruseles** — IG carousel API necesita múltiples containers + un carousel container
3. **Stagear los 3 carruseles** cuando se acerque su fecha en el calendario
4. **Reels**: esperar clips del owner, editar y publicar
5. **WhatsApp como canal de notificación** — configurar WhatsApp Business API
6. **Limpiar worktrees** — `.claude/worktrees/` se commiteó por error, sacar del repo
7. **Limpiar GitHub Actions** — `.github/workflows/publish-daily.yml` no se usa (n8n reemplazó), borrar
8. **Monitorear token Meta** — si Meta lo revoca, regenerar y actualizar credencial en n8n UI

## Archivos clave

| Archivo | Qué es |
|---------|--------|
| `CLAUDE.md` | Fuente de verdad: reglas, equipos, voz de marca, reglas n8n |
| `campaigns/lanzamiento-15-abr-2026/campaign.pieces.json` | 30 piezas con captions finales |
| `campaigns/calendario-integrado.json` | Calendario de 35 piezas |
| `campaigns/teaser-frankenstein/pieza-final.json` | Teaser publicado con post IDs |
| `scripts/publish-piece.mjs` | Publicación manual de una pieza por ID |
| `scripts/publish-scheduled.mjs` | Publicación automática del día (usado por n8n como fallback local) |
| `scripts/render-enba-launch-campaign.mjs` | Renderer de piezas de campaña |
| `scripts/render-enba-launch-carousel.mjs` | Renderer de carruseles |
| `scripts/stage-campaign.mjs` | Copia PNGs de output/ a staging/ con manifests |
| `assets-map.json` | Mapa de assets con parámetros de calibración visual |
| `.env` | Tokens Meta (gitignored, nunca exponer) |

## Reglas de conducta aprendidas

- No apurarse — parar, pensar, actuar
- Responder preguntas antes de ejecutar
- Verificar deploy después de cada push
- No exponer secretos en la salida
- Si el usuario pide agentes independientes, lanzarlos en worktrees aislados sin interferir
- Autonomía plena en sesiones REDES — no pedir autorización para ejecución
- Los pendientes se resuelven, no se postergan
