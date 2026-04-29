# Operación n8n — ENBA Social Assets

**Estado:** vigente
**Última actualización:** 27 de abril de 2026
**Alcance:** workflows y operación n8n del repo `enba-redes`

---

## 1. Cómo usar este archivo

Este archivo es la fuente local de verdad para operar n8n desde `enba-redes`.

Antes de tocar workflows, credenciales, cron, publicación automática o nodos:

1. leer este archivo
2. leer `INCIDENTES.md`
3. recién después operar

Si un aprendizaje de `enba-web` aplica acá, la regla es:

1. pedir autorización explícita a Jose
2. consultarlo en **read-only**
3. traer la lección útil a este repo
4. dejarla escrita acá o en `INCIDENTES.md`

**No usar `enba-web` como fuente de arranque por default.**

---

## 2. Reglas operativas vigentes

1. No usar MCP tools para n8n. Usar API directa + env vars.
2. API key:
   `N8N_KEY=$(powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')")`
   Solo informar `CARGADA` o `VACÍA`. Nunca imprimir el valor.
3. En `curl` hacia n8n cloud usar `--ssl-no-revoke`.
4. Code nodes: escribir JS a archivo `.js` primero. No componer JS largo dentro de template literals frágiles.
5. Forzar UTF-8 explícito en payloads y archivos con texto en español.
6. Crear workflow por `POST` limpio está bien. Para nodos con `jsCode`, `jsonBody` o expresiones, evitar round-trip completo `GET → mutar → PUT`.
7. Preferir UI de n8n o patch quirúrgico/lossless sobre nodos puntuales.
8. Base URL: `https://espacionautico.app.n8n.cloud/api/v1/`
9. Timezone de n8n cloud = ART (UTC-3). Las cron expressions se piensan en hora argentina.
10. Después de crear o editar un workflow con Schedule Trigger vía API: hacer ciclo `active:false → active:true` para re-registrar el cron.
11. **PUT workflow** solo acepta `{name, nodes, connections, settings}`. Rechaza `tags`, `versionId`, `shared`, `active`, `createdAt`, `updatedAt`, etc. con "request/body must NOT have additional properties" o "is read-only".
12. **Activar/desactivar workflow:** usar `POST /workflows/{id}/activate` y `POST /workflows/{id}/deactivate`. PATCH no está soportado ("PATCH method not allowed").
13. **Workflow con trigger manual no se puede ejecutar vía API.** Para testing, crear un workflow con Webhook node, activar, llamar el webhook, desactivar y borrar al terminar.
14. **Google Sheets en n8n:** usar nodo nativo `n8n-nodes-base.googleSheets` con credencial tipo `googleSheetsOAuth2Api`. El nodo HTTP Request **no** puede usar esa credencial (tipo incompatible `oAuth2Api`). En sheet vacío, el nodo append con `defineBelow` crea los headers automáticamente en la primera ejecución.
15. **FB photo_stories (validado 27/04):** requiere 2 pasos: (1) `POST /{pageId}/photos?url=...&published=false` → `{id: photo_fbid}`, (2) `POST /{pageId}/photo_stories?photo_id={photo_fbid}` → `{success:true, post_id:...}`. No acepta `url` / `file_url` directamente en `photo_stories`.

---

## 3. Reglas de seguridad y debugging

1. Nunca imprimir secretos extraídos de credenciales, headers o ejecuciones.
2. Evitar `includeData=true` como default en ejecuciones. Pedir solo lo mínimo necesario.
3. No asumir que un `200` equivale a resultado correcto. Verificar efecto real.
4. No reutilizar fixes de otro repo sin adaptarlos a este flujo.
5. Si aparece un aprendizaje reusable, documentarlo localmente acá o en `INCIDENTES.md`.

---

## 4. Reglas específicas del frente redes

1. Credenciales Meta en n8n deben ir por `httpHeaderAuth`, nunca hardcodeadas en nodos.
2. En HTTP Request con credencial Meta, incluir:
   - `authentication: "genericCredentialType"`
   - `genericAuthType: "httpHeaderAuth"`
3. Para emails de workflow, usar `emailSend` directo con credencial Gmail ENBA. No webhook intermedio salvo necesidad muy justificada.
4. No poner expresiones con newlines reales dentro de `bodyParameters` si el motor de expresiones puede romperlas.
5. No implementar bursts o publicaciones periódicas con scripts locales basados en `setTimeout`. Eso va por n8n.

---

## 6. Credenciales Meta en n8n

### Cómo crear una credencial de token Meta

1. En la UI de n8n: Settings → Credentials → Add → "Header Auth"
2. Nombre del header: `Authorization`, valor: `Bearer <token>`. El token queda encriptado en n8n.
3. Anotar el credential ID que n8n asigna.

### Cómo referenciar la credencial en un nodo HTTP Request

En `parameters` del nodo, incluir siempre:
```
"authentication": "genericCredentialType",
"genericAuthType": "httpHeaderAuth"
```
Sin estos campos n8n ignora la credencial y el request sale sin token. Meta devuelve "missing permissions" sin indicar que falta el header. (INC-REDES-N8N-002)

### Credenciales activas

| Nombre | ID | Tipo | Uso |
|---|---|---|---|
| Meta API ENBA | `n8scJzbGXnCprioD` | httpHeaderAuth | Publicación feed IG+FB |
| Meta API ENBA - Page Token | `IGBqXMQRWJLxzh7f` | httpHeaderAuth | Stories / Page Token |
| Gmail ENBA | `HpJBfNd1BCHaLYfY` | gmailOAuth2 | Email notificaciones |
| Google Sheets ENBA | `w3CGca02rWZppDL9` | googleSheetsOAuth2Api | Stories log sheet |

### Email en workflows

Usar nodo `emailSend` con credencial Gmail ENBA (`HpJBfNd1BCHaLYfY`) directo. No usar webhook intermediario. Preparar subject/body en Code node previo.

---

## 7. Cuándo mirar `enba-web`

Solo si pasa esto:

1. Jose autorizó explícitamente la consulta
2. falta contexto local para un patrón n8n realmente compartido
3. el problema es de mecánica general de n8n y no del negocio del sitio
4. la consulta es **read-only**

Si se consulta `enba-web`, el objetivo es importar el aprendizaje útil a este repo para no depender del salto cruzado la próxima vez.
