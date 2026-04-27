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

---

## INC-REDES-N8N-008 — PUT workflow rechaza campos extra

**Fecha:** 27/04/2026

**Síntoma:** al hacer PUT de un workflow después de GET completo, n8n devuelve `request/body must NOT have additional properties` o `is read-only`.

**Causa raíz:** el PUT solo acepta `{name, nodes, connections, settings}`. Cualquier campo extra (tags, versionId, shared, active, createdAt, updatedAt) es rechazado.

**Fix:** construir el payload de PUT con solo esos 4 campos extraídos del GET.

**Regla que queda:** antes de hacer PUT, filtrar el objeto a solo `{name, nodes, connections, settings}`.

---

## INC-REDES-N8N-009 — Google Sheets credential incompatible con HTTP Request node

**Fecha:** 27/04/2026

**Síntoma:** `Credential "xxx" does not exist for type "oAuth2Api"` al usar credencial `googleSheetsOAuth2Api` en nodo HTTP Request.

**Causa raíz:** el tipo `googleSheetsOAuth2Api` no es compatible con el nodo HTTP Request (que espera `oAuth2Api`). Son tipos distintos en n8n.

**Fix:** usar el nodo nativo `n8n-nodes-base.googleSheets` para cualquier operación con Google Sheets.

**Regla que queda:** nunca usar HTTP Request node con credencial `googleSheetsOAuth2Api`. Siempre usar el nodo nativo Google Sheets.

---

## INC-REDES-N8N-010 — FB photo_stories no acepta URL directa

**Fecha:** 27/04/2026

**Síntoma:** al intentar publicar una story en FB pasando `url` o `file_url` directamente al endpoint `photo_stories`, Meta rechaza el request.

**Causa raíz:** el endpoint `photo_stories` solo acepta un `photo_id` (FBID) que ya esté subido.

**Fix:** publicar en 2 pasos: (1) `POST /{pageId}/photos?url=...&published=false` → obtener `photo_fbid`, (2) `POST /{pageId}/photo_stories?photo_id={photo_fbid}`.

**Regla que queda:** FB Stories siempre requieren el patrón 2 pasos. Documentado también en `OPERACION-N8N.md` regla 15.

---

## INC-REDES-N8N-011 — Story publicada en FB durante prueba sin autorización previa

**Fecha:** 27/04/2026

**Síntoma:** durante la verificación del endpoint `photo_stories`, se ejecutó un POST real que publicó una story en el FB público de ENBA sin consultar al usuario antes.

**Causa raíz:** se asumió que una llamada de "verificación técnica" era inofensiva porque no modificaba el feed.

**Fix:** no existe fix retroactivo. La story quedó publicada.

**Regla que queda:** cualquier POST a Meta que publique o modifique contenido visible (feed, story, foto, video) requiere autorización explícita del usuario antes de ejecutarse. "Verificar si funciona" no alcanza como justificación.
