# META-SPECS-2026 — Especificaciones técnicas por formato y placement

**Fuente:** Meta Business Help Center + guías actualizadas 2026
**Última actualización:** 03/05/2026
**Scope:** todos los formatos publicables en Meta (FB + IG) para ENBA

---

## Cambios clave 2026 (no ignorar)

- **Marzo 2026:** Stories y Reels unificaron safe zone en formato 9:16. Mismo lienzo, distintas zonas de UI.
- **Enero 2026:** Instagram Explore feed retirado. Tráfico migrado a Reels. Ads que corrían en Explore ahora sirven en Reels.
- **Safe zone Reels mayor de lo esperado:** bottom 35% (~670px) — más que Stories (20% / ~380px). Si diseñás para Stories y publicás en Reels, el CTA queda tapado.
- **Regla 20% texto eliminada oficialmente**, pero el algoritmo sigue penalizando creativos con texto excesivo.
- **Meta empuja 4:5 para feed** — más real estate en mobile, mejor performance.

---

## 1. Feed imagen — IG + FB

| Spec | Valor |
|---|---|
| Dimensiones recomendadas | 1080×1350 (4:5) |
| Dimensiones alternativas | 1080×1080 (1:1) |
| Formato | **JPEG Q92 — nunca PNG** (Meta API error 36001 con PNG) |
| Tamaño máx | 30 MB |
| Safe zone | Sin UI overlay en feed estático. Logo/CTA deben quedar en zona legible |
| Texto overlay | Permitido, pero el algoritmo penaliza exceso. Mantener mínimo |

---

## 2. Feed video — IG + FB

| Spec | Valor |
|---|---|
| Dimensiones recomendadas | 1080×1350 (4:5) |
| Dimensiones alternativas | 1080×1080 (1:1) |
| Formato | MP4, H.264, 30fps |
| Duración máx | 240 min (Feed) — para ads: sweet spot 15-30s |
| Tamaño máx | 4 GB (mantener < 1 GB para upload confiable) |
| Audio | Recomendado — 85% de usuarios ve sin sonido, usar captions |
| Captions/subtítulos | Recomendado fuertemente (aumentan viewing time 12%) |
| Thumbnail | Primer frame por defecto. Puede subirse custom |

---

## 3. Stories — IG + FB (imagen y video)

| Spec | Valor |
|---|---|
| Dimensiones | 1080×1920 (9:16) |
| Formato imagen | JPEG Q92 |
| Formato video | MP4, H.264, 30fps |
| Duración video | Máx 120s |
| Audio video | Recomendado |

### Safe zone Stories (actualizada marzo 2026)

```
Canvas: 1080×1920

▲ Top 270px (14%)    — perfil + timestamp de IG/FB — NO poner elementos aquí
│
│  ← 65px                                           65px →   laterales
│
│  ZONA SEGURA CENTRAL
│  Elementos críticos: entre y=270 y y=1540 (desde arriba)
│
▼ Bottom 380px (20%)  — botón CTA — NO poner elementos aquí
```

**Zona segura:** y=270 a y=1540 desde arriba (1270px de altura útil)

---

## 4. Reels — IG + FB (video)

| Spec | Valor |
|---|---|
| Dimensiones | 1080×1920 (9:16) |
| Formato | MP4, H.264, 30fps |
| Duración máx | **90s** (hard limit) — sweet spot ads: 15-30s |
| Tamaño máx | 4 GB (mantener < 1 GB) |
| Audio | **Obligatorio** — Meta penaliza Reels sin audio |
| Captions/subtítulos | Recomendado fuertemente |
| Thumbnail | Primer frame o custom |

### Safe zone Reels (actualizada marzo 2026)

```
Canvas: 1080×1920

▲ Top 270px (14%)    — usuario + botón seguir — NO poner elementos aquí
│
│  ← 65px                                      120px →   (botones like/comment/share)
│
│  ZONA SEGURA CENTRAL
│  Elementos críticos: entre y=270 y y=1250 (desde arriba)
│
▼ Bottom 670px (35%)  — like/comment/share/audio bar/caption del creador — NO poner elementos aquí
```

**Zona segura:** y=270 a y=1250 desde arriba (980px de altura útil)

> **IMPORTANTE para Remotion:** los valores `y` en Remotion son desde el top. Un overlay en `y:400` está a 1520px del fondo — bien dentro de la zona segura. El error histórico era poner overlays en `y:220-300` (zona del perfil arriba). Los overlays actuales de microreel-ig-v3 están en `y:400-440` — CORRECTO.

---

## 5. Carrusel — IG (no FB)

| Spec | Valor |
|---|---|
| Dimensiones | **1080×1080 (1:1) obligatorio** — Meta cropea 4:5 a 1:1 en carruseles |
| Formato | JPEG Q92 |
| Tamaño máx | 30 MB por card |
| Cards | 2 a 10 cards |
| Safe zone | Sin UI overlay — mantener elementos fuera de los bordes |
| FB | **No soporta carrusel** — publicar como imagen única con `publish-fb-single.mjs` |

---

## 6. Límites de copy por placement (para Sole)

| Placement | Campo | Límite recomendado |
|---|---|---|
| Feed (imagen/video) | Primary text | 50-150 caracteres |
| Feed (imagen/video) | Headline | ≤ 27 caracteres |
| Feed (imagen/video) | Description | ≤ 30 caracteres |
| Stories | Primary text | 50-125 caracteres |
| Reels | Primary text | 50-125 caracteres |
| Reels overlay | Headline | **≤ 10 caracteres** |
| Carrusel | Primary text | 50-150 caracteres |
| Carrusel | Headline por card | ≤ 27 caracteres |

> Los captions orgánicos (no ads) siguen las reglas de CLAUDE.md: IG 80-150 palabras, FB hasta 200 palabras.

---

## 7. Reglas transversales

| Regla | Detalle |
|---|---|
| JPEG siempre | Para Meta API — PNG genera error 36001/2207083 |
| Upload video con Python | Node.js Blob trunca binarios. Siempre `requests` multipart |
| Verificar `length` post-upload | Si `length = 0.4s` → el video está truncado. Re-subir |
| Audio en video | Obligatorio en Reels, recomendado en todo lo demás |
| Texto mínimo en creativos | El algoritmo penaliza exceso aunque la regla 20% fue eliminada |
| 4:5 para feed | Meta lo recomienda activamente sobre 1:1 en 2026 |
| Carrusel: siempre 1:1 | Meta cropea cualquier otra proporción |
| FB sin carrusel | Usar `publish-fb-single.mjs` con el hero slide |

---

*Ver `PRODUCTION-RUNBOOK.md` para el pipeline completo por tipo de pieza.*
*Ver `CLAUDE.md` para vocabulario prohibido, voz de marca y reglas de publicación.*
