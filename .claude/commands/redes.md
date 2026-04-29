Arrancá por las fuentes vigentes en este orden:

1. `CLAUDE.md`
   Leé al menos estas secciones: branch activo, reglas obligatorias, voz de marca, URLs por vertical, pipeline de publicación, equipos y reglas n8n.

2. `campaigns/plan-crecimiento-10k/STATUS.md`
   Este es el snapshot corto de sesión. Tratá este archivo como punto de entrada operativo.

3. Profundizá según la tarea:
   - Estrategia, pendientes, timeline: `campaigns/plan-crecimiento-10k/plan-maestro.md`
   - Pauta vigente: `campaigns/plan-crecimiento-10k/presupuesto-v4-reestructuracion.md`
   - Infraestructura Meta Ads y estados reales: `campaigns/plan-crecimiento-10k/meta-ids.json`
   - QA / medición / analytics: `qa-report.md`, `kpis.md`, `google-analytics-medicion.md`
   - Handoffs fechados: solo como contexto histórico. Nunca pisan `STATUS.md`, `plan-maestro.md` ni `presupuesto-v4`.

Antes de cargar contexto REDES, resolvé el workspace correcto:
1. Verificá branch actual y worktrees (`git branch --show-current` + `git worktree list`).
2. Si ya estás en `plan-crecimiento-10k`, continuá.
3. Si `plan-crecimiento-10k` está abierto en otro worktree, cambiá a ese directorio y seguí la sesión ahí.
4. Si no existe otro worktree con ese branch, recién entonces intentá `git checkout plan-crecimiento-10k`.
5. Si no podés entrar al branch correcto o al worktree correcto, frená y reportá el bloqueo exacto.

Después hacé un relevamiento rápido del estado actual:
1. Confirmá que el workspace activo ya quedó en `plan-crecimiento-10k`.
2. Relevá campañas y piezas usando la estructura real:
   - `campaign.pieces.json` = campaña base
   - `carousel.config.json` + `captions.json` = carrusel listo
   - `carousel.config.json` sin `captions.json` = pendiente copy/QA
3. Contá JPGs en `asset-bank/`.
4. Revisá `staging/`, `published/` y `manifests/` para entender el estado del pipeline.
5. No anuncies `Contexto REDES cargado` hasta estar en el workspace correcto.

Luego confirmá con:
```text
Contexto REDES cargado ✓
- Branch: [branch activo]
- Snapshot: STATUS.md leído
- Campañas: [lista corta con estado]
- Asset-bank: [N] JPGs
- Pipeline: [staging/published/manifests]
- Equipos: Team 3 (producción) + Team 4 (dirección) activos
```
