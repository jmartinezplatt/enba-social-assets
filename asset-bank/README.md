# Asset Bank — Local-First

El asset-bank contiene fotos y videos curados de ENBA, organizados en subcarpetas por vertical.

## Estructura

```
asset-bank/
├── buenos-aires-paisaje/   # Skylines, marina, atardeceres, paisaje urbano
├── destinos/               # Carmelo, Colonia, Delta, Martín García, etc.
├── escuela-aprendizaje/    # Clases, maniobras, timonel, práctica
├── grupos-experiencia/     # Grupos navegando, parejas, selfies, picadas a bordo
├── servicios/              # Varadero, hidrolavado, mantenimiento, taller
├── travesias-navegacion/   # Openwater, cruces, velas, cabos, detalle náutico
├── veleros-broker/         # Veleros en venta, perfil, interiores, marina
├── .video-thumbs/          # Thumbnails temporales para clasificador (ignorado)
└── README.md               # Este archivo
```

## Convención local-first

Las subcarpetas están en `.gitignore` por peso (~1.3 GB de fotos + ~3 GB de videos). Git no las trackea.

**Git trackea:** docs, scripts, manifests, piezas finales livianas, staging/.
**Git NO trackea:** asset-bank/subcarpetas (fotos/videos pesados), .video-thumbs/.

Los archivos viven en disco local y se acceden por filesystem. Los agentes deben usar rutas absolutas o relativas al repo, no `git ls-files`, para buscar assets.

## Naming

- Fotos: `descripcion-kebab-case.jpg` (ej: `grupo-cockpit-cielo-azul-4x5.jpg`)
- Videos: `descripcion-kebab-case.mp4` (ej: `navegando-cruce-buque-carguero-openwater.mp4`)
- Archivos sin renombrar (UUID o IMG_XXXX) son legítimos pero menos buscables.

## Herramientas de curación

- `preview-clasificar-fotos.html` — clasificador visual de fotos con reclasificación por categoría
- `preview-clasificar-videos.html` — clasificador visual de videos con thumbnails

Ambos generan scripts `.sh` con los `mv`/`rm` para aplicar cambios. Los HTMLs están en `.gitignore`.
