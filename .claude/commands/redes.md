Leé `CLAUDE.md` completo — es la fuente de verdad del repo: reglas, equipos (Team 3 + Team 4), voz de marca, vocabulario prohibido, URLs por vertical, pipeline de publicación y convenciones de naming.

Leé también estos archivos clave del branch activo — son fuentes de verdad que hay que leer completas antes de reportar nada:
- `campaigns/plan-crecimiento-10k/plan-maestro.md` — plan vivo, pendientes, decisiones, timeline
- `campaigns/plan-crecimiento-10k/meta-ids.json` — estado real de infraestructura Meta Ads (campañas, ad sets, ads, budgets, sesiones)
- `campaigns/plan-crecimiento-10k/presupuesto-v4-reestructuracion.md` — plan de pauta vigente

Después hacé un relevamiento rápido del estado actual:
1. Listá las campañas en `campaigns/` con cantidad de piezas y estado (buscar `captions.json` → aprobado, sin captions → pendiente copy)
2. Listá los assets disponibles en `asset-bank/` (cantidad de JPGs)
3. Verificá si hay algo en `staging/` o `published/` (pipeline de publicación)

Luego confirmá con:
```
Contexto REDES cargado ✓
— Campañas: [lista con estado]
— Asset-bank: [N] assets curados
— Pipeline: [staging/published status]
— Equipos: Team 3 (producción) + Team 4 (expertos) activos
```
