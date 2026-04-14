# Rationale visual — Teaser pre-lanzamiento ENBA

**Productor Visual:** Dani
**Fecha:** 2026-04-14
**Contexto:** Primera publicacion de la cuenta. Objetivo: curiosidad + follows antes del lanzamiento del 15 de abril.

---

## Estrategia general

Las 3 versiones son piezas individuales (no carrusel), cada una pensada como candidata para el primer post. La logica es: 3 enfoques compositivos distintos para que el equipo elija cual pega mejor como "primer impacto" de una cuenta que arranca de cero.

El sistema visual se apoya en 3 principios:
1. **Foto como protagonista** — ningun overlay tapa mas de lo necesario
2. **Tipografia como carteleria** — Teko en pesos grandes, pocas palabras, impacto inmediato
3. **Respiracion radical** — el espacio vacio comunica tanto como el texto

---

## Slide 1 — "ESTO NO ES UN FEED. ES UNA LINEA DE LARGADA."

**Asset:** `brand-skyline-manifesto.jpg` (skyline Buenos Aires desde el agua)

**Decisiones visuales:**
- `overlayOpacity: 0.22` — Lo suficiente para que el copy se lea, pero la foto respira. El skyline es el contexto: estamos en Buenos Aires, estamos en el agua.
- `backgroundScale: 1.08` — Push sutil que da sensacion cinematografica sin distorsionar. Saca la foto del registro "foto de celular".
- `backgroundPosition: center 40%` — Baja el horizonte para que el cielo tenga peso arriba y el copy quede en la zona de agua, donde hay menos competencia visual.
- `titleSize: 96` — Grande pero no descomunal. El headline es largo (5 lineas), necesita un size que permita leerlo entero sin que se sienta apretado.
- `copyBottom: 200` — Centrado bajo, deja aire arriba para el skyline y el logo.

**Intencion:** Manifesto fundacional. El copy declara intencion: no es una cuenta mas, es un arranque con proposito. La foto sin velero es deliberada — no mostramos producto todavia, mostramos el escenario.

---

## Slide 2 — "EL RIO NO ESPERA."

**Asset:** `navegando-picante-openwater.jpg` (velero con viento, accion)

**Decisiones visuales:**
- `overlayOpacity: 0.10` — Practicamente sin overlay. La foto es tan potente (viento, inclinacion, accion) que oscurecerla seria un crimen. El copy se lee porque la zona superior de la imagen tiene cielo claro.
- `backgroundScale: 1.12` — El scale mas agresivo de los 3. Amplifica la tension de la escena, te mete adentro del velero.
- `backgroundPosition: center 35%` — Sube la composicion para que el velero quede en el tercio inferior y el headline caiga sobre la zona de cielo/ciudad borrosa, donde tiene contraste.
- `titleSize: 128` — Solo 4 palabras. A este tamanio cada letra pesa. Es tipografia como carteleria de ruta.
- `copyBottom: 260` — Elevado para no competir con el casco del velero.

**Intencion:** Energia pura. Este slide dice "aca se navega de verdad". Sin explicaciones, sin bajada extensa. La foto hace el 80% del trabajo, el copy remata.

---

## Slide 3 — "MANANA ARRANCAMOS."

**Asset:** `travesias-sunset-openwater.jpg` (atardecer desde cubierta con vela)

**Decisiones visuales:**
- `overlayOpacity: 0.42` — El overlay mas alto de los 3, deliberado. Convierte el atardecer en una escena casi nocturna, misteriosa. Genera la sensacion de "algo viene" — que es exactamente el mensaje.
- `backgroundScale: 1.04` — Scale conservador. La calma de la escena no necesita amplificacion agresiva.
- `backgroundPosition: center 50%` — Centrado clasico. El sol queda arriba, la vela a un costado, el horizonte al medio.
- `titleSize: 138` — El mas grande de los 3 slides. Solo 2 palabras. Es un statement, no un headline. A este tamanio, "MANANA ARRANCAMOS." funciona como conteo regresivo visual.
- `copyBottom: 320` — El copy mas elevado de los 3. Genera una franja de respiracion abajo que refuerza la calma tensa de la escena.
- Subtitle "Lo que viene no se cuenta, se navega." — cierra con intriga y refuerza el follow.

**Intencion:** Anticipacion y urgencia temporal. Es la version mas "teaser" de las 3: overlay oscuro + headline minimo + bajada enigmatica. Si se publica la noche anterior al lanzamiento, funciona como conteo regresivo.

---

## Recomendacion de uso

| Slide | Mejor para | Timing ideal |
|-------|-----------|--------------|
| dani-01 | Post fundacional, manifiesto de marca | Primer post de la cuenta (manana temprano) |
| dani-02 | Story o reel cover, impacto inmediato | Cualquier momento del dia |
| dani-03 | Teaser nocturno pre-lanzamiento | La noche del 14, horas antes del lanzamiento |

Si tuviera que elegir uno solo para el primer post: **dani-01**. Es el que establece identidad sin mostrar producto. Los otros 2 son mas tacticos.

---

## Notas tecnicas

- Los 3 slides usan `titleShadow` reforzado (`0 4px 24px rgba(0,0,0,0.55)`) para garantizar legibilidad incluso con overlays bajos.
- El `subtitleShadow` tambien se elevo a `0.45` para que las bajadas no se pierdan.
- Fonts: Teko 700 (headlines) + Barlow Semi Condensed 400 (subtitles). Sistema tipografico consistente con la campana de lanzamiento.
- Canvas: 1080x1350 (4:5 Instagram portrait, optimo para feed).
