# Incidentes n8n — ENBA Social Assets

**Estado:** vigente
**Última actualización:** 27 de abril de 2026
**Uso:** memoria operativa local de incidentes y lecciones de n8n para este repo.

---

## Regla de mantenimiento

Cada vez que un incidente o aprendizaje de n8n cambie cómo conviene operar:

1. resumir síntoma
2. dejar causa raíz
3. anotar fix
4. registrar regla que queda

Si la lección vino de `enba-web`, marcarla como **importada** y adaptada.

---

## INC-REDES-N8N-001 — Cron corrido 3 horas por timezone mal interpretada

**Fecha:** 17/04/2026

**Síntoma:** una expresión cron pensada para 12:15 ART disparó a las 15:15 ART.

**Causa raíz:** se trató la cron como UTC cuando n8n cloud ya interpreta en ART.

**Fix:** usar la cron en hora argentina real.

**Regla que queda:** para publicar a las 12:15 ART usar `15 12 * * *`, no convertir a UTC.

---

## INC-REDES-N8N-002 — HTTP Request sin credencial efectiva

**Fecha:** 24/04/2026

**Síntoma:** Meta devolvía errores de permisos aunque la credencial existía en n8n.

**Causa raíz:** el nodo HTTP Request no tenía `authentication: "genericCredentialType"` y `genericAuthType: "httpHeaderAuth"` en `parameters`, así que el request salía sin header.

**Fix:** agregar ambos campos explícitamente en los nodos afectados.

**Regla que queda:** no asumir que seleccionar credencial alcanza; verificar los parámetros de auth del nodo.

---

## INC-REDES-N8N-003 — Expresiones con newline real rompían el nodo

**Fecha:** 24/04/2026

**Síntoma:** `ExpressionExtensionError: invalid syntax` en un flujo de email.

**Causa raíz:** el body se armaba con expresiones frágiles y newlines reales dentro de parámetros.

**Fix:** preparar `subject` y `body` antes, en un Code node, y usar `emailSend` directo.

**Regla que queda:** no confiar en expresiones largas con saltos de línea dentro de parámetros HTTP.

---

## INC-REDES-N8N-004 — Publicaciones duplicadas por `setTimeout`

**Fecha:** 23/04/2026

**Síntoma:** stories duplicadas por procesos zombie locales.

**Causa raíz:** usar scripts locales con timers persistentes para publicación periódica.

**Fix:** migrar bursts y periodicidad a n8n.

**Regla que queda:** cualquier publicación recurrente o burst va por workflow, no por script local temporizado.

---

## INC-REDES-N8N-005 — Secreto expuesto en debugging de ejecuciones

**Origen:** importado desde `enba-web`

**Síntoma:** al inspeccionar ejecuciones se puede terminar imprimiendo headers o secrets por accidente.

**Lección importada:** nunca volcar en salida valores de credenciales, headers o payloads sensibles extraídos de n8n.

**Regla que queda:** antes de mostrar datos de una ejecución, filtrar explícitamente secretos y headers.

---

## INC-REDES-N8N-006 — Round-trip completo de workflow corrompe nodos complejos

**Origen:** importado desde `enba-web`

**Síntoma:** workflows con `jsCode`, `jsonBody` o expresiones complejas pueden degradarse o corromperse al hacer `GET → editar afuera → PUT` del workflow completo.

**Lección importada:** los nodos complejos se corrigen por UI o patch lossless y acotado.

**Regla que queda:** evitar round-trip completo en workflows con expresiones o code nodes salvo caso extremadamente controlado.

---

## INC-REDES-N8N-007 — UTF-8 y mojibake en texto con tildes

**Origen:** importado desde `enba-web`

**Síntoma:** texto con tildes o caracteres especiales puede quedar corrupto tras una edición o serialización defectuosa.

**Lección importada:** cualquier cambio en código o payloads con español exige UTF-8 explícito y verificación posterior.

**Regla que queda:** si se toca texto sensible en n8n, verificar que no haya mojibake después del cambio.
