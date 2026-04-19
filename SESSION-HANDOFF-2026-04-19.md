# HANDOFF DE SESION — 19/04/2026

Prompt de continuidad para proximo agente. Leer `plan-maestro.md` para estado completo.

---

## 1. CONTEXTO

- **Repo:** `C:\Users\josea\enba-social-assets`
- **Branch activo:** `plan-crecimiento-10k` (declarado en CLAUDE.md)
- **Fuente de verdad pauta:** `campaigns/plan-crecimiento-10k/presupuesto-v3-final.md`
- **Fuente de verdad plan:** `campaigns/plan-crecimiento-10k/plan-maestro.md` (actualizado 19/04)
- **Fuente de verdad infra Meta:** `campaigns/plan-crecimiento-10k/meta-ids.json`

---

## 2. QUE SE HIZO EN ESTA SESION

### Meta Ads — Activacion
- Campanas AWR + ENG activadas (PAUSED → ACTIVE)
- 5 ad sets Awareness + 1 ad set Reel4horas → ACTIVE
- 7 ads → ACTIVE. Budget diario total: $11.500
- Re-baseline presupuesto-v3: dia 1 = 19/04, fin = 15/05
- Darkpost C2 Regalos creado: foto `grupo-merienda-atardecer-cockpit.jpg` + caption Sole + creative `2238943696639456` + ad `120239165409650139` (PAUSED, activacion 23/04)

### Automatizacion
- Workflow n8n evaluacion ads diaria creado (ID `1qRywsEWAl7VoO5o`, 9:00 ART, email a jmartinezplatt@gmail.com)
- Credencial Meta Ads API ENBA creada en n8n (ID `6LxWcVxeyZgsBTUU`)
- Aprendizaje n8n: activar workflow con `POST /workflows/{id}/activate`, no PATCH

### Contenido
- Script `publish-carousel.mjs` creado y verificado (dry-run OK)
- Asset-bank ampliado: 53 → 65 JPGs (12 fotos nuevas de grupo, mate, picada, interior cabina)
- Reel "primera vez": material descomprimido, clips revisados (Dani), direccion creativa (Marina score 9/10)
- Cortes pauta reel 4h: 30s y 15s producidos con ffmpeg
- Preview HTML creado: `campaigns/preview-contenido-pendiente.html`
- 3 carruseles previsualizados y aprobados por Jose

### Infraestructura
- Dominio autorizado en Events Manager (espacionautico.com.ar + subdominios)
- Pixel verificado: Event Data activo, ENBA Pixel inactivo (no instalado, ignorar)
- GA4 verificado: G-XVN36KPHBL instalado

### Documentacion
- CLAUDE.md: agregada seccion "Branch de trabajo activo"
- plan-maestro.md: actualizado secciones 1, 2, 4, 5, 7, 9 con estado real
- 4 docs superseded marcados como HISTORICO (presupuesto v1, v2, decision-b, respuesta-auditoria)
- 4 docs referencia con nota de contexto (diagnostico, meta-business-setup, ga4, kpis)

---

## 3. PENDIENTES

Ver `plan-maestro.md` secciones 2 y 7 para lista completa. Resumen rapido:

| # | Pendiente | Deadline |
|---|-----------|----------|
| 1 | Activar C2_v2 + ad regalos | 23/04 (dia 5) |
| 2 | Creative + ad para C3 Corporativo | 25/04 (dia 8) |
| 3 | Ad para TopPerformers (esperar pieza con ER > 1%) | 28/04 (dia 10) |
| 4 | Reel "primera vez": edit-sheet + edicion | Esta semana |
| 5 | Publicar carruseles organicos | Cuando Jose decida |
| 6 | Google Photos acceso | Jose trabajando en eso |

---

## 4. ERRORES Y LECCIONES

- **Worktrees aislados:** no usar `isolation:worktree` para agentes que revisan ediciones pendientes (no ven cambios no commiteados)
- **n8n API activate:** usar `POST /workflows/{id}/activate`, no PATCH con `active:true` (read-only en PUT)
- **Meta creative API:** `photo_data.message` no es campo valido. Usar `link_data` con `image_hash` + `message` + `link` + `call_to_action` (copiar patron de piece-01 darkpost)
- **instagram_actor_id:** el ID de IG Business Account (`17841443139761422`) no es el mismo que el IG actor para ads. Omitir el campo y Meta lo resuelve solo.
- **Plan-maestro desactualizado:** al cerrar sesion, SIEMPRE actualizar plan-maestro.md (memoria guardada en feedback_plan_maestro_update.md)
- **No asumir aprobacion:** un "ok" conversacional NO es aprobacion para editar archivos (memoria guardada en feedback_never_assume_approval.md)
- **Agentes reales:** siempre invocar con skill (/marina, /sole, etc.), nunca simular (memoria guardada en feedback_invoke_agents_real.md)

---

## 5. IDS UTILES

| Recurso | ID |
|---|---|
| Ad Account | act_2303565156801569 |
| Page ID | 1064806400040502 |
| IG Business Account | 17841443139761422 |
| Business Manager | 814334400927137 |
| Workflow redes (publicacion v7.2) | MipwleZNu8EG5v6C |
| ~~Workflow redes v6 (ELIMINADO)~~ | ~~oiFVJdy5VGlXtlMp~~ |
| Workflow ads (evaluacion) | 1qRywsEWAl7VoO5o |
| Credencial Meta API n8n (page token) | n8scJzbGXnCprioD |
| Credencial Meta Ads n8n (ads token) | 6LxWcVxeyZgsBTUU |
| Credencial Gmail n8n | HpJBfNd1BCHaLYfY |
| Darkpost regalos creative | 2238943696639456 |
| Darkpost regalos ad | 120239165409650139 |
| Pixel Event Data | 1273048378266952 |
| GA4 | G-XVN36KPHBL |

---

## 6. REGLAS DE TRABAJO

1. NUNCA commit/push sin aprobacion explicita de Jose
2. NUNCA asumir que "ok" = aprobacion para editar
3. NUNCA simular agentes — invocar con skill real
4. Al cerrar sesion: actualizar plan-maestro.md
5. Branch activo: plan-crecimiento-10k (declarado en CLAUDE.md)
6. Reglas n8n: ver CLAUDE.md + memory/reference_n8n_rules.md
7. Tokens: nunca exponer. Convención en CLAUDE.md seccion tokens.

---

## 7. TRABAJO DEL OTRO AGENTE (sesion paralela 19/04)

Otro agente Claude trabajo en paralelo en el frente de publicacion organica. Su trabajo fue integrado en esta sesion.

### Que hizo
- Diagnostico fallo publicacion IG piece-05 (error 9004): Cloudflare Pages custom domain devuelve 403 al crawler IG de Meta
- Fix: URLs de imagen cambiadas de `social-assets.espacionautico.com.ar` a `enba-social-assets.pages.dev`
- Publicacion manual piece-05 IG via script (Post ID `18101246075501063`)
- Creacion workflow v7.2 (ID `MipwleZNu8EG5v6C`, 34 nodos): pre-warm imagen, retry 3x, publicacion independiente IG/FB, anti-dup por plataforma
- Eliminacion workflows viejos: v6 (`oiFVJdy5VGlXtlMp`), v7, v7.1
- Cambio Cloudflare: "Instruct AI bot traffic with robots.txt" → "Content Signals Policy"

### Archivos nuevos (sin commitear)
- `automatizaciones/n8n-workflows/nodes/set-ig-result.js`
- `automatizaciones/n8n-workflows/nodes/set-ig-failed.js`
- `automatizaciones/n8n-workflows/nodes/set-ig-skipped.js`
- `automatizaciones/n8n-workflows/nodes/set-fb-result.js`
- `automatizaciones/n8n-workflows/nodes/set-fb-failed.js`
- `automatizaciones/n8n-workflows/nodes/set-fb-skipped.js`
- `automatizaciones/n8n-workflows/nodes/collect-results.js`
- `scripts/create-n8n-publish-v7.mjs`
- `scripts/publish-piece05-ig.mjs`
- `n8n-publish-v7-*.json` (3 backups)

### Lecciones del otro agente
- Cloudflare Pages custom domain bloquea crawler IG (facebookexternalhit) con 403 invisible. Fix: usar pages.dev.
- FB Photos API no tiene este problema (crawlers diferentes).
- El bloqueo se activo/endurecio entre 17-19 abril (changelog Cloudflare 17-abr-2026).
- No improvisar prueba-error: investigar con fuentes antes de proponer cambios, restablecer config original si un cambio no resolvio.

---

FIN DEL HANDOFF.
