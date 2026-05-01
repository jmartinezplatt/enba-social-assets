# Brief de produccion — Creativos FB + IG

**Fecha:** 01/05/2026
**De:** Bruno (Team 4 — Growth Director)
**Para:** Manu (Team 3 — Coordinador) -> Dani (visual) + Sole (copy FB)
**Prioridad:** P0 — produccion inmediata
**Contexto:** Dia 13/27 campana seguidores. Pipeline de creativos agotado. FB tiene 2 ads activos, IG tiene 2. Necesitamos rotacion urgente.

---

## Objetivo

Producir 4 imagenes estaticas para ads de followers (FB PAGE_LIKES + IG VISIT_INSTAGRAM_PROFILE) y 1 reel para engagement.

**Criterio de exito por pieza:**
- FB: CPF <= $104 (benchmark: nosotros_FB_Cold)
- IG: CPV <= $25 (benchmark: corporativo_IG_Cold)

---

## Patron ganador a replicar

El WINNER actual es `grupo-cockpit-cielo-azul-4x5.jpg` (imagen estatica, grupo en cockpit, cielo azul, contexto real). CPV $25 en IG, ER 6.0%, reach 32K en 9 dias. En FB, el collage "nosotros" logro CPF $103.

**Formula que funciona:**
- Imagen estatica real (no video, no render)
- Grupo de personas en contexto nautico
- Luz natural, cielo visible
- Aspiracional pero accesible (no posado, no "lujo")
- 4x5 para feed

---

## Piezas a producir

### 1. IG-static-01 (para ig_cold)

**Foto base:** `asset-bank/grupo-cockpit-navegando-rio-sol.jpg`
**Formato:** 4x5 (crop desde horizontal)
**Tratamiento:** Crop centrado en el grupo, mantener rio y cielo. Sin texto overlay. Sin logo. La foto sola.
**Caption:** No aplica — IG follow ads no llevan caption visible, solo el ad text que ya existe.
**Owner visual:** Dani

### 2. IG-static-02 (para ig_cold)

**Foto base:** `asset-bank/pareja-cockpit-sunset-risas.jpg`
**Formato:** Ya es vertical, verificar que entre en 4x5 sin cortar caras.
**Tratamiento:** Sin texto overlay. Sin logo. Testea diferente demografia (pareja joven vs grupo).
**Caption:** No aplica.
**Owner visual:** Dani

### 3. FB-static-01 (para fb_cold)

**Foto base:** `asset-bank/travesias-grupo-cockpit-skyline.jpg`
**Formato:** 4x5 (crop desde vertical)
**Tratamiento:** Sin texto overlay. Sin logo.
**Caption FB:** Sole — caption para ad PAGE_LIKES. Formula: HOOK + VALOR + CTA. El CTA es implicito (el boton "Me gusta la pagina" lo pone Meta). El caption debe mostrar que ENBA es un espacio nautico real, accesible, en Buenos Aires.
**Owner visual:** Dani
**Owner copy:** Sole

### 4. FB-static-02 (para fb_cold)

**Foto base:** `asset-bank/cuatro-amigos-cockpit-vela-nubes-rio.jpg`
**Formato:** 4x5 (crop desde horizontal, centrar en grupo)
**Tratamiento:** Sin texto overlay. Sin logo.
**Caption FB:** Sole — mismo criterio que FB-static-01 pero diferente angulo. Esta foto tiene vela desplegada y bandera argentina — aprovechar.
**Owner visual:** Dani
**Owner copy:** Sole

### 5. REEL-01 (para AS_ENG_REEL)

**Objetivo:** Reel de engagement que alimente D4 (video viewers). Hook fuerte + arco narrativo en el cuerpo.
**Referencia hook:** AD_ENG_REEL_V2 tiene hook rate 84% — ese nivel de gancho.
**Referencia cuerpo:** reel4horas tenia hold rate 28% — necesitamos que el cuerpo del video cuente algo, no solo monte clips.
**Duracion:** 15-30 segundos.
**Audio:** Musica con ritmo, sin voz en off (a menos que Sole proponga algo que funcione).
**Owner:** Dani
**Prioridad:** P1 (despues de las 4 imagenes)

---

## Reglas

- Sin vocabulario prohibido (ver CLAUDE.md)
- Sin "Puerto Madero" — siempre "Costanera Norte"
- Sin precios
- Captions FB: informativo, calido, comunidad. Hasta 200 palabras.
- Hashtags FB: 3-5. Incluir 2 de descubrimiento.
- Las imagenes van directo como JPG al ad — no como render PNG de Playwright.

---

## Entrega

1. Dani entrega 4 JPGs en 4x5 (crop + ajuste basico si necesario)
2. Sole entrega captions FB para FB-static-01 y FB-static-02
3. Nico QA con checklist PASS
4. Subir a Meta como ads en fb_cold (FB) e ig_cold (IG)
5. REEL-01 en segunda tanda

---

## Datos de referencia para Sole

**Vertical:** Paseos/travesias
**URL para CTA:** espacionautico.com.ar/paseos-en-velero-buenos-aires
**Tono:** cercano, argentino (voseo), apasionado sin vender humo
**Lo que funciona en los ads actuales:** fotos reales de gente navegando, sin texto encima, sin promesas exageradas. La foto habla sola, el caption complementa con contexto y emocion.
