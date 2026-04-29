# TikTok 30D Pilot

## Qué es

Paquete de trabajo TikTok de ENBA armado en la rama `wip-tiktok-30d-pilot`.

Este frente concentra:

- 20 piezas curadas con assets reales
- previews editoriales
- captions finales
- hashtags aprobados
- videos fuente finales internalizados en `media/`
- guía de publicación manual
- calendario sugerido del primer mes

## Qué mirar primero

1. `index.html`
2. `publish-ready.html`
3. `MANUAL-PUBLISH.md`
4. `CALENDARIO-PUBLICACION.md`

## Archivos clave

- `index.html`
  índice general del paquete
- `preview-01.html` a `preview-04.html`
  revisión editorial por bloques de 5
- `publish-ready.html`
  las 20 piezas listas para publicar manualmente
- `publish-ready.js`
  captions finales por pieza
- `tiktok-pieces.js`
  manifiesto fuente de las 20 piezas
- `media/`
  videos finales aprobados, ya internalizados dentro del repo
- `MANUAL-PUBLISH.md`
  procedimiento de publicación manual
- `CALENDARIO-PUBLICACION.md`
  orden sugerido de salida para 4 semanas

## Estado

- Set de preview aprobado
- Captions y hashtags aprobados
- Publicación manual resuelta desde repo
- Integración con rama de trabajo principal pendiente para un paso posterior

## Regla de uso

Mientras TikTok siga con publicación manual:

- no editar captions en la app sin reflejar el cambio en este frente
- no reemplazar assets sin tocar `tiktok-pieces.js`
- usar `publish-ready.html` como fuente operativa única

## Nota

Este paquete está pensado para poder vivir solo, sin depender de API TikTok ni n8n, hasta que la app quede aprobada para producción.
