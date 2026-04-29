const ENBA_FINAL_CAPTIONS = {
  TT01: "No hace falta irte lejos para vivir algo así. A veces alcanza con mirar Buenos Aires desde el agua para que cambie todo.\n\nGuardalo para acordarte de que esto también es Buenos Aires.",
  TT02: "La primera vez no tiene que ser épica. Tiene que pasar.\n\nSi te da curiosidad subirte a un velero, este puede ser un muy buen comienzo. Escribinos si querés tener tu primera salida.",
  TT03: "Buenos Aires no desaparece: se reordena cuando la mirás desde el río.\n\nMisma ciudad, otra cabeza. Seguinos para ver Buenos Aires desde otro lugar.",
  TT04: "Una salida real arranca así: marina, embarque, río y barco de verdad.\n\nSin pose y sin vuelta larga. Mandáselo a quien se subiría con vos.",
  TT05: "No necesitás experiencia ni venir sabiendo.\n\nA veces alcanza con animarte una vez. Mandáselo a quien siempre dice “me da cosa”.",
  TT06: "Aprender a navegar no es memorizar todo primero.\n\nEs tocar cabos, mirar el río y practicar de verdad. Consultanos si querés aprender a navegar de verdad.",
  TT07: "Hay cosas de navegar que no se entienden en seco.\n\nSe entienden arriba del barco, con el viento y el río ahí. Seguinos si querés ver cómo se aprende en el río.",
  TT08: "El primer timón tiene algo difícil de explicar.\n\nPor eso hay que vivirlo. Guardalo si querés vivir ese primer click.",
  TT09: "No hace falta llegar sabiendo. Hace falta venir, probar y tener buenos instructores al lado.\n\nInstructores de primera. ¿Querés hacerlo? Vení a aprender en serio.",
  TT10: "Subirte a un velero cambia rápido lo que ves: horizonte, viento y ciudad.\n\nComentá qué te daría más ganas de subirte.",
  TT11: "Si siempre terminan haciendo lo mismo, tal vez esta vez el plan puede ser otro.\n\nRío, barco y una juntada que arranca distinto. Mandáselo a tu grupo y armate la próxima juntada.",
  TT12: "No otro objeto. No otro regalo que se guarda en un cajón.\n\nRegalá una salida distinta. Escribinos si querés regalar una experiencia así.",
  TT13: "Si querés armar una salida privada en velero, esto arranca así: marina, barco listo y tu gente arriba.\n\nPedinos opciones para armar su salida.",
  TT14: "El río no es solo un plan.\n\nA veces es otra velocidad, otra cabeza y otra forma de estar en Buenos Aires. Seguinos si te tira más este ritmo que el de siempre.",
  TT15: "No hace falta irte lejos para bajar un cambio.\n\nA veces Buenos Aires cambia apenas cambia el ritmo. Guardalo para cuando necesites bajar un cambio.",
  TT16: "Una foto ayuda, pero ver el barco en serio cambia todo.\n\nTamaño, proporción, río, contexto. Seguinos si querés ver más barco real, no solo fotos.",
  TT17: "Mirar el río desde la costa no es lo mismo que sentirlo a bordo.\n\nAhí cambia de verdad. Escribinos si querés sentirlo, vivilo a bordo.",
  TT18: "No todo es paseo armado.\n\nTambién hay navegación real, maniobra, río y tripulación. Seguinos si te interesa navegar de verdad.",
  TT19: "Salir al río cambia la escala del plan.\n\nDe golpe ya no es una salida más: es horizonte, aire y otra distancia. Guardalo si te gustaría hacer un plan así.",
  TT20: "Si nunca navegaste, no hace falta arrancar enorme.\n\nHace falta arrancar. Escribinos si querés dar ese primer paso."
};

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toLocalPath(fileUrl) {
  return fileUrl.startsWith("file:///") ? fileUrl.replace("file:///", "") : fileUrl;
}

function getFullCaption(piece) {
  const caption = ENBA_FINAL_CAPTIONS[piece.id] || piece.captionLead;
  const hashtags = (piece.hashtags || []).join(" ");
  return `${caption}\n\n${hashtags}`;
}

function renderPublishCard(piece, index) {
  const media = piece.mediaType === "video"
    ? `<video src="${piece.media}" ${piece.poster ? `poster="${piece.poster}"` : ""} autoplay muted ${piece.previewLoop === false ? "" : "loop"} playsinline preload="metadata"></video>`
    : `<img src="${piece.media}" alt="${piece.alt}" loading="lazy">`;
  const fullCaption = getFullCaption(piece);
  const safeCaption = escapeHtml(fullCaption);
  const hashtags = (piece.hashtags || []).join(" ");

  return `
    <article class="piece-card">
      <div class="phone-preview">
        ${media}
        <div class="overlay">
          <div class="badge-row">
            <span class="badge">Orden ${String(index + 1).padStart(2, "0")}</span>
            <span class="badge">${piece.pillar}</span>
          </div>
          <div class="hook-stack">
            ${piece.screenText.map((line) => `<div class="hook-line">${line}</div>`).join("")}
          </div>
        </div>
      </div>
      <div class="piece-body">
        <div class="piece-kicker">
          <div class="piece-id">${piece.id}</div>
          <div class="piece-format">${piece.format}</div>
        </div>
        <h3 class="piece-title">${piece.title}</h3>
        <p class="piece-hook">${piece.hook}</p>
        <div class="meta-grid">
          <div class="meta-block">
            <div class="meta-label">Caption final</div>
            <pre class="caption-box">${safeCaption}</pre>
            <div class="toolbar">
              <button class="copy-button" data-piece-id="${piece.id}">Copiar caption</button>
            </div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Hashtags</div>
            <div class="meta-text">${hashtags}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Archivo fuente</div>
            <div class="meta-text">${escapeHtml(toLocalPath(piece.media))}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Poster</div>
            <div class="meta-text">${piece.poster ? escapeHtml(piece.poster) : "Sin poster"}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Nota operativa</div>
            <div class="meta-text">Publicación manual desde repo. Si el clip no cambia, este copy ya está listo para usar tal cual.</div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function wireCopyButtons() {
  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const piece = globalThis.ENBATiktokPieces.find((item) => item.id === button.dataset.pieceId);
      if (!piece) return;
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(getFullCaption(piece));
        button.textContent = "Copiado";
      } catch {
        button.textContent = "No se pudo copiar";
      }
      setTimeout(() => {
        button.textContent = original;
      }, 1400);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("publish-pieces");
  container.innerHTML = globalThis.ENBATiktokPieces
    .map((piece, index) => renderPublishCard(piece, index))
    .join("");
  wireCopyButtons();
});
