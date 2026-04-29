# TikTok Manual Publish

## Propósito

Mientras la app de TikTok siga en review o limitada a sandbox, este piloto se publica de forma manual desde el repo.

La fuente operativa para publicar es:

- `publish-ready.html`

## Qué contiene

Cada pieza tiene:

- preview del clip
- caption final
- hashtags aprobados
- archivo fuente local dentro del repo (`media/`)
- poster local

## Flujo recomendado

1. Abrir `publish-ready.html`.
2. Elegir la pieza a publicar.
3. Revisar el clip y confirmar que el asset sigue siendo el correcto.
4. Copiar el caption con el botón `Copiar caption`.
5. Abrir TikTok y subir el video manualmente.
6. Pegar el caption.
7. Verificar que los hashtags queden al final.
8. Publicar.

## Regla de operación

- No editar captions en TikTok sin reflejar ese cambio después en este repo.
- Si cambia el video final, actualizar también la pieza correspondiente en `tiktok-pieces.js`.
- Si una pieza deja de representar bien a ENBA, no improvisar arriba de la marcha: ajustar el manifiesto y volver a revisar el preview.

## Archivos clave

- `index.html`
- `publish-ready.html`
- `publish-ready.js`
- `tiktok-pieces.js`
- `media/`
- `preview-01.html`
- `preview-02.html`
- `preview-03.html`
- `preview-04.html`

## Estado esperado

Este paquete debe poder usarse sin depender de integración TikTok, n8n ni API pública.
