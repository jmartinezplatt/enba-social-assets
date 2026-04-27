const ENBA_GROUP_META = {
  1: {
    title: "Grupo 1 — Abrir mundo",
    description: "Cinco piezas para instalar el ángulo más amplio: Buenos Aires desde el agua, primera vez y experiencia real sin fricción.",
    pill: "Discovery + primera vez"
  },
  2: {
    title: "Grupo 2 — Escuela y aprendizaje",
    description: "Cinco piezas para mostrar que ENBA no es solo paseo: hay práctica real, timón, maniobra y escuela con río de verdad.",
    pill: "Escuela + autoridad cercana"
  },
  3: {
    title: "Grupo 3 — Regalo, grupo y deseo",
    description: "Cinco piezas para mover consulta: plan distinto, salida privada, regalo memorable y marca con atmósfera propia.",
    pill: "Deseo + consulta"
  },
  4: {
    title: "Grupo 4 — Navegación real y horizontes",
    description: "Cinco piezas para cerrar con más autoridad de río: navegación real, horizonte, diferencia experiencial y una salida de cierre para primera vez.",
    pill: "Autoridad náutica + aspiración"
  }
};

function renderNav(activeGroup) {
  const nav = document.getElementById("nav");
  if (!nav) return;
  nav.innerHTML = [1, 2, 3, 4]
    .map((group) => {
      const activeClass = group === activeGroup ? "is-active" : "";
      return `<a class="${activeClass}" href="preview-${String(group).padStart(2, "0")}.html">Grupo ${group}</a>`;
    })
    .join("");
}

function renderPieces(group) {
  const meta = ENBA_GROUP_META[group];
  const pieces = globalThis.ENBATiktokPieces.filter((piece) => piece.group === group);

  document.getElementById("group-title").textContent = meta.title;
  document.getElementById("group-description").textContent = meta.description;
  document.getElementById("group-pill").textContent = meta.pill;
  document.getElementById("piece-count").textContent = `${pieces.length} piezas`;

  const container = document.getElementById("pieces");
  container.innerHTML = pieces.map(renderPieceCard).join("");
}

function renderPieceCard(piece) {
  const media = piece.mediaType === "video"
    ? `<video src="${piece.media}" ${piece.poster ? `poster="${piece.poster}"` : ""} ${piece.mediaStyle ? `style="${piece.mediaStyle}"` : ""} autoplay muted loop playsinline preload="metadata"></video>`
    : `<img src="${piece.media}" alt="${piece.alt}" ${piece.mediaStyle ? `style="${piece.mediaStyle}"` : ""} loading="lazy">`;

  const screenText = piece.screenText
    .map((line) => `<div class="hook-line">${line}</div>`)
    .join("");

  const screenTextList = piece.screenText
    .map((line) => `<li>${line}</li>`)
    .join("");

  return `
    <article class="piece-card">
      <div class="phone-preview">
        ${media}
        <div class="overlay">
          <div class="badge-row">
            <span class="badge">${piece.pillar}</span>
            <span class="badge">${piece.objective}</span>
          </div>
          <div class="hook-stack">${screenText}</div>
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
            <div class="meta-label">Texto en pantalla</div>
            <ul class="meta-list">${screenTextList}</ul>
          </div>
          <div class="meta-block">
            <div class="meta-label">Caption / intención</div>
            <div class="meta-text">${piece.captionLead}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">CTA</div>
            <div class="meta-text">${piece.cta}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Asset local</div>
            <div class="meta-text">${piece.assetNote}</div>
          </div>
          <div class="meta-block">
            <div class="meta-label">Nota de edición</div>
            <div class="meta-text">${piece.editNote}</div>
          </div>
        </div>
      </div>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const group = Number(document.body.dataset.group);
  renderNav(group);
  renderPieces(group);
});
