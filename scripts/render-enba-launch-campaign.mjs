import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultPackageDir = path.join(
  repoRoot,
  "campaigns",
  "lanzamiento-15-abr-2026",
);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTextWithBreaks(value) {
  return String(value)
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br />");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePath(filePath) {
  return path.resolve(filePath).replace(/\\/g, "/").toLowerCase();
}

function resolveProjectPath(relativePath) {
  return path.isAbsolute(relativePath)
    ? relativePath
    : path.join(repoRoot, relativePath);
}

function resolveCampaignPath(packageDir, relativePath) {
  if (!relativePath) return null;
  if (path.isAbsolute(relativePath)) return relativePath;
  const packageCandidate = path.join(packageDir, relativePath);
  if (existsSync(packageCandidate)) return packageCandidate;
  return path.join(repoRoot, relativePath);
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function relativeToPackage(packageDir, filePath) {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : resolveProjectPath(filePath);
  return toPosixPath(path.relative(packageDir, absolutePath));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}

async function buildDataUrl(packageDir, relativePath) {
  const filePath = resolveCampaignPath(packageDir, relativePath);
  const buffer = await fs.readFile(filePath);
  return `data:${getMimeType(filePath)};base64,${buffer.toString("base64")}`;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function buildAssetLookup(assetMap) {
  const lookup = new Map();
  for (const asset of assetMap.assets ?? []) {
    lookup.set(normalizePath(resolveProjectPath(asset.path)), asset);
  }
  return lookup;
}

function inferTemplate(piece) {
  if (piece.template) return piece.template;
  if (piece.vertical === "Cierre" || piece.vertical === "Marca") return "manifesto";
  if (["Broker", "Servicios", "Prueba", "Backstage"].includes(piece.vertical)) {
    return "proof-utility";
  }
  return "photo-hero";
}

function inferFileName(piece, index) {
  if (piece.fileName) return piece.fileName;
  const order = String(index + 1).padStart(2, "0");
  const stamp = piece.date ? slugify(piece.date.replaceAll("/", "-")) : `piece-${order}`;
  return `${order}-${stamp}-${slugify(piece.vertical)}.png`;
}

function getVerticalAccent(system, piece) {
  const accents = system.palette.accentByVertical ?? {};
  return accents[piece.vertical] ?? system.palette.teal;
}

function autoTitleSize(template, headline) {
  const length = String(headline).length;
  if (template === "manifesto") {
    if (length > 54) return 108;
    if (length > 42) return 118;
    return 132;
  }
  if (template === "proof-utility") {
    if (length > 62) return 68;
    if (length > 48) return 76;
    return 86;
  }
  if (length > 62) return 86;
  if (length > 48) return 96;
  return 118;
}

function autoSupportSize(template, support) {
  const length = String(support ?? "").length;
  if (template === "manifesto") {
    return length > 150 ? 27 : 31;
  }
  if (template === "proof-utility") {
    return length > 130 ? 23 : 26;
  }
  return length > 130 ? 24 : 28;
}

function buildCampaignTheme(system) {
  const brand = system.brand ?? {};
  const palette = system.palette ?? {};
  const canvas = system.canvas ?? {};
  const typography = system.typography ?? {};
  const templateSystem = system.templateSystem ?? {};
  const derivedLocation =
    [brand.primaryLocation, brand.locationSupport, brand.river]
      .filter(Boolean)
      .join(" · ") || "Costanera Norte · Rio de la Plata";
  const accentByVertical = palette.accentByVertical ?? {
    Marca: palette.gold500 ?? "#D4A843",
    Travesias: palette.teal500 ?? "#4DB8A0",
    Escuela: palette.blue500 ?? "#3A9FD4",
    Broker: palette.gold500 ?? "#D4A843",
    Servicios: palette.teal600 ?? "#2E817D",
    Prueba: palette.teal500 ?? "#4DB8A0",
    Backstage: palette.blue500 ?? "#3A9FD4",
    Cierre: palette.gold500 ?? "#D4A843",
  };

  return {
    width: canvas.width ?? canvas.widthPx ?? 1080,
    height: canvas.height ?? canvas.heightPx ?? 1350,
    safeArea: canvas.safeArea ?? canvas.safeAreaPx ?? 96,
    outerRadius: canvas.outerRadius ?? 36,
    palette: {
      ink: palette.ink ?? palette.ink900 ?? "#0f1f2f",
      paper: palette.paper ?? palette.cream200 ?? "#f3efe7",
      line: palette.line ?? "rgba(255,255,255,0.16)",
      navy: palette.navy ?? palette.navy900 ?? "#0a1520",
      navySoft: palette.navySoft ?? palette.navy700 ?? "#16324a",
      teal: palette.teal ?? palette.teal500 ?? "#4db8a0",
      tealStrong: palette.tealStrong ?? palette.teal600 ?? "#2f8f85",
      gold: palette.gold ?? palette.gold500 ?? "#d4a843",
      cream: palette.cream ?? palette.cream100 ?? "#edf2f4",
      accentByVertical,
    },
    fonts: {
      display: system.fonts?.display ?? typography.display?.family ?? "Teko",
      sans: system.fonts?.sans ?? typography.support?.family ?? "Barlow Semi Condensed",
    },
    brand: {
      displayName:
        system.brand?.displayName ??
        brand.publicName ??
        "Espacio Nautico Buenos Aires",
      location: system.brand?.location ?? derivedLocation,
      promise:
        system.brand?.promise ??
        brand.promiseMother ??
        "El rio te llama. Nosotros te llevamos.",
      mark:
        system.brand?.mark ??
        system.campaignId?.replaceAll("-", " ") ??
        "Lanzamiento 2026",
    },
    templates: {
      manifesto: {
        titleSize: system.templates?.manifesto?.titleSize ?? 132,
        supportSize: system.templates?.manifesto?.supportSize ?? 31,
        ...templateSystem.manifesto,
      },
      "photo-hero": {
        titleSize: system.templates?.["photo-hero"]?.titleSize ?? 118,
        supportSize: system.templates?.["photo-hero"]?.supportSize ?? 28,
        ...templateSystem.photoHero,
      },
      "proof-utility": {
        titleSize: system.templates?.["proof-utility"]?.titleSize ?? 86,
        supportSize: system.templates?.["proof-utility"]?.supportSize ?? 26,
        ...templateSystem.proofUtility,
      },
    },
    defaults: {
      backgroundPosition:
        system.defaults?.backgroundPosition ??
        templateSystem.photoHero?.defaultCrop?.backgroundPosition ??
        "50% center",
      backgroundScale:
        system.defaults?.backgroundScale ??
        templateSystem.photoHero?.defaultCrop?.backgroundScale ??
        1,
      overlayOpacity:
        system.defaults?.overlayOpacity ??
        templateSystem.photoHero?.defaultCrop?.overlayOpacity ??
        0.42,
      copyBottom:
        system.defaults?.copyBottom ??
        templateSystem.photoHero?.defaultCrop?.copyBottom ??
        220,
    },
  };
}

function buildPieceRecord(piece, index, system, assetLookup, packageDir) {
  const resolvedImage = resolveCampaignPath(packageDir, piece.image);
  const asset = assetLookup.get(normalizePath(resolvedImage)) ?? null;
  const template = inferTemplate(piece);
  const accent = getVerticalAccent(system, piece);

  return {
    ...piece,
    template,
    accent,
    fileName: inferFileName(piece, index),
    sourceImagePath: resolvedImage,
    sourceImageRelative: relativeToPackage(packageDir, resolvedImage),
    backgroundPosition:
      piece.backgroundPosition ??
      asset?.backgroundPosition ??
      system.defaults.backgroundPosition,
    backgroundScale:
      piece.backgroundScale ?? asset?.backgroundScale ?? system.defaults.backgroundScale,
    overlayOpacity:
      piece.overlayOpacity ?? asset?.overlayOpacity ?? system.defaults.overlayOpacity,
    copyBottom: piece.copyBottom ?? asset?.copyBottom ?? system.defaults.copyBottom,
    titleSize:
      piece.titleSize ??
      asset?.titleSize ??
      autoTitleSize(template, piece.headline),
    supportSize:
      piece.supportSize ??
      asset?.subtitleSize ??
      autoSupportSize(template, piece.support ?? piece.summary),
    safeTitleWidth: piece.safeTitleWidth ?? null,
    support: piece.support ?? piece.summary,
  };
}

function buildLockupHtml(theme, piece, options = {}) {
  const align = options.align ?? "left";
  const tone = options.tone ?? "light";
  const accent = options.accent ?? piece.accent;
  const mark = options.mark ?? theme.brand.mark;
  const logoUrl = options.logoUrl ?? null;
  const color = tone === "dark" ? theme.palette.navy : theme.palette.cream;
  const secondary = tone === "dark" ? "rgba(10,21,32,0.72)" : "rgba(237,242,244,0.72)";

  if (logoUrl) {
    return `
      <div class="lockup ${align} ${tone} logo-only">
        <img class="lockup-logo" src="${logoUrl}" alt="${escapeHtml(theme.brand.displayName)}" />
      </div>
    `;
  }

  return `
    <div class="lockup ${align} ${tone}">
      <div class="lockup-copy">
        <strong style="color:${color};">${escapeHtml(theme.brand.displayName)}</strong>
        <span style="color:${secondary};">${escapeHtml(theme.brand.location)}</span>
      </div>
    </div>
  `;
}

function baseFontsCss(theme) {
  return `@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&family=Teko:wght@500;600;700&display=swap');

    :root {
      --navy: ${theme.palette.navy};
      --navy-soft: ${theme.palette.navySoft};
      --teal: ${theme.palette.teal};
      --teal-strong: ${theme.palette.tealStrong};
      --gold: ${theme.palette.gold};
      --cream: ${theme.palette.cream};
      --paper: ${theme.palette.paper};
      --ink: ${theme.palette.ink};
      --line: ${theme.palette.line};
      --safe: ${theme.safeArea}px;
      --radius: ${theme.outerRadius}px;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      width: ${theme.width}px;
      height: ${theme.height}px;
      overflow: hidden;
      background: var(--navy);
    }

    body {
      position: relative;
      font-family: '${theme.fonts.sans}', sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
      font-synthesis-weight: none;
    }

    .lockup {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .lockup.center {
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .lockup-copy {
      display: grid;
      gap: 3px;
    }

    .lockup-mark {
      font-size: 18px;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--lockup-secondary);
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .lockup-mark::before {
      content: "";
      width: 34px;
      height: 1px;
      background: var(--lockup-accent);
      display: block;
    }

    .lockup strong {
      font-size: 44px;
      line-height: 0.92;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      font-family: '${theme.fonts.display}', sans-serif;
      font-weight: 600;
    }

    .lockup span:last-child {
      font-size: 24px;
      line-height: 1;
      letter-spacing: 0.05em;
    }

    .lockup-logo {
      width: 280px;
      display: block;
      filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.16));
    }
  `;
}

function buildManifestoHtml(piece, theme, resources) {
  const titleSize = piece.titleSize ?? theme.templates.manifesto?.titleSize ?? 132;
  const supportSize = piece.supportSize ?? theme.templates.manifesto?.supportSize ?? 31;
  const logoUrl = resources.logoManifesto ?? resources.logoLight;
  const backgroundImage = resources.imageUrl
    ? `<div class="image"></div><div class="veil"></div>`
    : "";

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      ${baseFontsCss(theme)}

      body {
        background:
          radial-gradient(circle at 20% 0%, rgba(77, 184, 160, 0.18), transparent 32%),
          linear-gradient(140deg, rgba(10, 21, 32, 0.98) 0%, rgba(18, 44, 68, 0.94) 100%);
      }

      .image,
      .veil,
      .frame,
      .texture {
        position: absolute;
        inset: 0;
      }

      .image {
        background-image: url('${resources.imageUrl ?? ""}');
        background-size: cover;
        background-position: ${piece.backgroundPosition};
        transform: scale(${piece.backgroundScale});
        opacity: 0.32;
        filter: saturate(0.7) contrast(1.05);
      }

      .veil {
        background:
          linear-gradient(180deg, rgba(10, 21, 32, 0.18) 0%, rgba(10, 21, 32, 0.88) 58%, rgba(10, 21, 32, 0.96) 100%),
          linear-gradient(120deg, rgba(77, 184, 160, 0.06), transparent 38%);
      }

      .texture {
        background:
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.02));
      }

      .frame {
        inset: var(--safe);
        border: 1px solid rgba(237, 242, 244, 0.14);
        border-radius: calc(var(--radius) - 6px);
      }

      .content {
        position: absolute;
        inset: calc(var(--safe) + 22px);
        display: grid;
        grid-template-rows: auto 1fr auto;
      }

      .topnote {
        justify-self: center;
        padding: 10px 18px;
        border-radius: 999px;
        border: 1px solid rgba(237, 242, 244, 0.12);
        background: rgba(10, 21, 32, 0.28);
        font-size: 18px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(237, 242, 244, 0.78);
      }

      .center {
        align-self: center;
        display: grid;
        gap: 28px;
        justify-items: center;
        text-align: center;
      }

      .kicker {
        font-size: 22px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: ${piece.accent};
      }

      h1 {
        margin: 0;
        max-width: ${piece.safeTitleWidth ?? 820}px;
        font-family: '${theme.fonts.display}', sans-serif;
        font-size: ${titleSize}px;
        line-height: 0.9;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: var(--cream);
        text-wrap: balance;
        text-shadow: 0 10px 28px rgba(0,0,0,0.24);
      }

      p {
        margin: 0;
      }

      .support {
        max-width: 760px;
        font-size: ${supportSize}px;
        line-height: 1.06;
        color: rgba(237, 242, 244, 0.84);
        text-wrap: balance;
      }

      .bottom {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: 24px;
      }

      .cta {
        color: ${piece.accent};
        font-size: 23px;
        line-height: 1;
        letter-spacing: 0.04em;
      }
    </style>
  </head>
  <body>
    ${backgroundImage}
    <div class="texture"></div>
    <div class="frame"></div>
    <div class="content">
      <div class="center">
        ${buildLockupHtml(theme, piece, { align: "center", tone: "light", accent: piece.accent, logoUrl })}
        <span class="kicker">${escapeHtml(theme.brand.promise)}</span>
        <h1>${renderTextWithBreaks(piece.headline)}</h1>
        <p class="support">${escapeHtml(piece.support)}</p>
      </div>
      <div class="bottom">
        <span class="cta">${escapeHtml(piece.cta)}</span>
      </div>
    </div>
  </body>
</html>`;
}

function buildPhotoHeroHtml(piece, theme, resources) {
  const titleSize = piece.titleSize ?? theme.templates["photo-hero"]?.titleSize ?? 118;
  const supportSize = piece.supportSize ?? theme.templates["photo-hero"]?.supportSize ?? 28;
  const logoUrl = resources.logoLight;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      ${baseFontsCss(theme)}

      .lockup strong { font-size: 42px; }

      .bg,
      .overlay {
        position: absolute;
        inset: 0;
      }

      .bg {
        background-image: url('${resources.imageUrl}');
        background-size: cover;
        background-position: ${piece.backgroundPosition};
        background-repeat: no-repeat;
        transform: scale(${piece.backgroundScale});
      }

      .overlay {
        background:
          linear-gradient(180deg, rgba(10, 21, 32, 0.14) 0%, rgba(10, 21, 32, 0.2) 28%, rgba(10, 21, 32, ${piece.overlayOpacity}) 62%, rgba(10, 21, 32, 0.92) 100%),
          linear-gradient(120deg, rgba(77, 184, 160, 0.12), transparent 42%);
      }

      .content {
        position: absolute;
        inset: var(--safe);
        display: grid;
        grid-template-rows: auto 1fr auto;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 24px;
      }

      .series {
        display: grid;
        gap: 10px;
        justify-items: end;
      }

      .badge {
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(10, 21, 32, 0.52);
        border: 1px solid rgba(237, 242, 244, 0.12);
        color: rgba(237, 242, 244, 0.78);
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 18px;
        line-height: 1;
      }

      .copy {
        align-self: end;
        width: min(${piece.safeTitleWidth ?? 760}px, calc(100% - 40px));
        padding-bottom: ${piece.copyBottom}px;
        display: grid;
        gap: 18px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        color: rgba(237, 242, 244, 0.84);
        font-size: 22px;
        line-height: 1;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .eyebrow::before {
        content: "";
        width: 52px;
        height: 3px;
        border-radius: 999px;
        background: ${piece.accent};
      }

      h1 {
        margin: 0;
        font-family: '${theme.fonts.display}', sans-serif;
        font-size: ${titleSize}px;
        line-height: 0.9;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: var(--cream);
        text-wrap: balance;
        text-shadow: 0 12px 28px rgba(0,0,0,0.28);
      }

      .support {
        margin: 0;
        max-width: 690px;
        color: rgba(237, 242, 244, 0.88);
        font-size: ${supportSize}px;
        line-height: 1.04;
        text-wrap: balance;
      }

      .cta-row {
        display: flex;
        align-items: center;
        gap: 18px;
      }

      .cta {
        color: ${piece.accent};
        font-size: 23px;
        line-height: 1;
        letter-spacing: 0.04em;
      }

      .date {
        color: rgba(237, 242, 244, 0.72);
        font-size: 22px;
        letter-spacing: 0.08em;
      }
    </style>
  </head>
  <body>
    <div class="bg"></div>
    <div class="overlay"></div>
    <div class="content">
      <div class="topbar">
        ${buildLockupHtml(theme, piece, { align: "left", tone: "light", accent: piece.accent, logoUrl })}
        <div class="series"></div>
      </div>
      <div></div>
      <div class="copy">
        <h1>${renderTextWithBreaks(piece.headline)}</h1>
        <p class="support">${escapeHtml(piece.support)}</p>
        <div class="cta-row">
          <span class="cta">${escapeHtml(piece.cta)}</span>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildProofUtilityHtml(piece, theme, resources) {
  const titleSize = piece.titleSize ?? theme.templates["proof-utility"]?.titleSize ?? 86;
  const supportSize = piece.supportSize ?? theme.templates["proof-utility"]?.supportSize ?? 26;
  const logoUrl = resources.logoDark;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      ${baseFontsCss(theme)}

      body {
        background:
          radial-gradient(circle at 85% 0%, rgba(77, 184, 160, 0.14), transparent 28%),
          linear-gradient(180deg, #f4efe6 0%, #ede6da 100%);
      }

      .shell {
        position: absolute;
        inset: var(--safe);
        border-radius: calc(var(--radius) - 6px);
        overflow: hidden;
        background: rgba(255,255,255,0.72);
        box-shadow: 0 26px 60px rgba(10, 21, 32, 0.16);
      }

      .visual {
        position: absolute;
        inset: 0 0 38% 0;
      }

      .visual::before,
      .visual::after {
        content: "";
        position: absolute;
        inset: 0;
      }

      .visual::before {
        background-image: url('${resources.imageUrl}');
        background-size: cover;
        background-position: ${piece.backgroundPosition};
        transform: scale(${piece.backgroundScale});
      }

      .visual::after {
        background:
          linear-gradient(180deg, rgba(10,21,32,0.12) 0%, rgba(10,21,32,${Math.min(
            piece.overlayOpacity + 0.1,
            0.78,
          )}) 100%),
          linear-gradient(135deg, rgba(77,184,160,0.12), transparent 40%);
      }

      .panel {
        position: absolute;
        inset: auto 0 0 0;
        min-height: 38%;
        padding: 34px 38px 36px;
        display: grid;
        gap: 18px;
        background: linear-gradient(180deg, rgba(245,240,232,0.94) 0%, rgba(250,247,242,0.98) 100%);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: end;
      }

      .chip {
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(10, 21, 32, 0.68);
        color: rgba(237, 242, 244, 0.86);
        font-size: 17px;
        line-height: 1;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        max-width: ${piece.safeTitleWidth ?? 820}px;
        color: var(--navy);
        font-family: '${theme.fonts.display}', sans-serif;
        font-size: ${titleSize}px;
        line-height: 0.92;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        text-wrap: balance;
      }

      .support {
        margin: 0;
        color: rgba(15, 31, 47, 0.78);
        font-size: ${supportSize}px;
        line-height: 1.08;
        text-wrap: balance;
      }

      .utility-row {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: 24px;
      }

      .cta {
        color: var(--navy);
        font-size: 23px;
        line-height: 1;
        letter-spacing: 0.04em;
        font-weight: 500;
      }

      .date {
        color: rgba(15, 31, 47, 0.62);
        font-size: 22px;
        letter-spacing: 0.08em;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="visual"></div>
      <div class="panel">
        ${buildLockupHtml(theme, piece, { align: "left", tone: "light", accent: piece.accent, logoUrl: resources.logoDark })}
        <h1>${renderTextWithBreaks(piece.headline)}</h1>
        <p class="support">${escapeHtml(piece.support)}</p>
        <div class="utility-row">
          <span class="cta">${escapeHtml(piece.cta)}</span>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildRenderHtml(piece, theme, resources) {
  if (piece.template === "manifesto") {
    return buildManifestoHtml(piece, theme, resources);
  }
  if (piece.template === "proof-utility") {
    return buildProofUtilityHtml(piece, theme, resources);
  }
  return buildPhotoHeroHtml(piece, theme, resources);
}

function previewTemplateMix(pieces) {
  return pieces.reduce((acc, piece) => {
    acc[piece.template] = (acc[piece.template] ?? 0) + 1;
    return acc;
  }, {});
}

function escapeForScript(value) {
  return JSON.stringify(value);
}

function buildPreviewHtml(campaign) {
  const previewData = {
    brand: campaign.theme.brand,
    pieces: campaign.pieces.map((piece) => ({
      id: piece.id,
      date: piece.date,
      vertical: piece.vertical,
      phase: piece.phase,
      template: piece.template,
      headline: piece.headline,
      summary: piece.summary,
      objective: piece.objective,
      cta: piece.cta,
      captionIg: piece.captionIg,
      captionFb: piece.captionFb,
      imageNote: piece.imageNote,
      output: `output/${piece.fileName}`,
      sourceImage: piece.sourceImageRelative,
      backgroundPosition: piece.backgroundPosition,
      backgroundScale: piece.backgroundScale,
      overlayOpacity: piece.overlayOpacity,
      accent: piece.accent,
    })),
    templateMix: previewTemplateMix(campaign.pieces),
  };

  return `<!doctype html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Campana Launch | Arte Final</title>
<style>
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Teko:wght@500;600;700&display=swap");
:root{--bg:#ecf0f2;--ink:#102436;--muted:#58707f;--paper:#ffffff;--line:rgba(16,36,54,.1);--navy:${campaign.theme.palette.navy};--teal:${campaign.theme.palette.teal};--gold:${campaign.theme.palette.gold};--cream:${campaign.theme.palette.cream};--shadow:0 24px 64px rgba(16,36,54,.12)}*{box-sizing:border-box}body{margin:0;font-family:"Barlow Condensed",sans-serif;background:radial-gradient(circle at top left,rgba(77,184,160,.14),transparent 24%),radial-gradient(circle at top right,rgba(212,168,67,.12),transparent 18%),linear-gradient(180deg,#f7fafb 0%,var(--bg) 100%);color:var(--ink)}.page{width:min(1360px,calc(100% - 40px));margin:24px auto 48px}.hero,.section{background:rgba(255,255,255,.84);border:1px solid var(--line);border-radius:30px;box-shadow:var(--shadow);backdrop-filter:blur(14px)}.hero{padding:34px;background:linear-gradient(140deg,rgba(16,36,54,.96) 0%,rgba(23,53,81,.92) 100%),rgba(16,36,54,.92);color:var(--cream)}.hero-top{display:flex;justify-content:space-between;gap:24px;align-items:start}.eyebrow{margin:0 0 12px;text-transform:uppercase;letter-spacing:.18em;font-size:14px;color:rgba(237,242,244,.72)}h1,h2,h3,h4{font-family:"Teko",sans-serif;letter-spacing:.02em}h1{margin:0;max-width:760px;font-size:clamp(54px,7vw,88px);line-height:.92;text-transform:uppercase}.hero p{margin:0;font-size:26px;line-height:1.06;color:rgba(237,242,244,.84)}.hero-grid,.system-grid,.stats,.meta-grid,.copies{display:grid;gap:14px}.hero-grid{margin-top:28px;grid-template-columns:minmax(0,1.3fr) minmax(320px,.9fr);gap:24px}.chips{display:grid;gap:12px}.chip{padding:16px 18px;border-radius:20px;border:1px solid rgba(237,242,244,.12);background:rgba(255,255,255,.06)}.chip strong,.system-card strong,.stat strong,.meta strong,.copy strong{display:block;margin-bottom:6px;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.hero .chip strong{color:rgba(237,242,244,.68)}.chip span,.system-card span,.system-card p,.stat span,.meta span{font-size:24px;line-height:1.04;margin:0}.hero .chip span{color:var(--cream)}.section{margin-top:24px;padding:28px}h2{margin:0 0 16px;font-size:42px;line-height:.95;text-transform:uppercase}.system-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.system-card,.stat,.meta,.copy{border:1px solid var(--line);border-radius:22px;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(247,250,251,.96) 100%)}.palette{display:flex;gap:10px;margin-top:14px}.swatch{width:48px;height:48px;border-radius:16px;border:1px solid rgba(16,36,54,.08)}.stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.filters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}.filter{padding:10px 16px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);font:inherit;font-size:19px;cursor:pointer}.filter.active{background:var(--navy);color:var(--cream);border-color:transparent}.pieces{display:grid;gap:18px}.piece{display:grid;grid-template-columns:360px minmax(0,1fr);border:1px solid var(--line);border-radius:26px;overflow:hidden;background:#fff}.piece-visual{position:relative;padding:18px;background:radial-gradient(circle at top left,rgba(77,184,160,.12),transparent 36%),linear-gradient(180deg,#edf2f4 0%,#e4eaed 100%)}.piece-visual img.render{width:100%;border-radius:18px;display:block;box-shadow:0 20px 44px rgba(16,36,54,.18)}.source-thumb{position:absolute;right:28px;bottom:28px;width:110px;border-radius:16px;border:3px solid #fff;box-shadow:0 16px 32px rgba(16,36,54,.18)}.piece-body{padding:20px 22px 22px}.badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.badge{padding:7px 11px;border-radius:999px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--cream)}.piece h3{margin:0 0 8px;font-size:40px;line-height:.96;text-transform:uppercase}.piece-summary{margin:0 0 16px;color:var(--muted);font-size:22px;line-height:1.08}.meta-grid{grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:16px}.copies{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.copy p{margin:0;white-space:pre-wrap;font-size:18px;line-height:1.12}@media (max-width:1100px){.hero-grid,.system-grid,.stats,.piece,.meta-grid,.copies{grid-template-columns:1fr}.source-thumb{width:96px}}
</style></head>
<body><div class="page">
<section class="hero"><div class="hero-top"><div><p class="eyebrow">Paquete profesional de validacion visual</p><h1>${escapeHtml(campaign.theme.brand.displayName)}</h1></div><p>${escapeHtml(campaign.theme.brand.promise)}</p></div>
<div class="hero-grid"><div class="chips"><div class="chip"><strong>Sistema Madre</strong><span>Editorial nautico premium, photo-led, con lockup fijo y 3 templates cerrados para las 30 piezas.</span></div><div class="chip"><strong>Paquete</strong><span>30 PNGs 1080×1350, 1 visual compartido IG+FB por pieza, preview ejecutiva y fuente de verdad en manifests JSON.</span></div></div><div class="chips"><div class="chip"><strong>Tipografia</strong><span>${escapeHtml(campaign.theme.fonts.display)} + ${escapeHtml(campaign.theme.fonts.sans)}</span></div><div class="chip"><strong>Lockup</strong><span>${escapeHtml(campaign.theme.brand.displayName)} · ${escapeHtml(campaign.theme.brand.location)}</span></div></div></div></section>
<section class="section"><h2>Reglas del Sistema</h2><div class="system-grid"><article class="system-card"><strong>Templates</strong><span>${escapeHtml(Object.entries(previewData.templateMix).map(([name, count]) => `${name} (${count})`).join(" · "))}</span></article><article class="system-card"><strong>Lockup</strong><p>Marca fija arriba, ubicacion Costanera Norte y promesa consistente en toda la serie.</p></article><article class="system-card"><strong>Paleta</strong><div class="palette"><span class="swatch" style="background:${campaign.theme.palette.navy}"></span><span class="swatch" style="background:${campaign.theme.palette.teal}"></span><span class="swatch" style="background:${campaign.theme.palette.gold}"></span><span class="swatch" style="background:${campaign.theme.palette.cream}"></span></div></article><article class="system-card"><strong>Canvas</strong><span>1080 × 1350 · Safe area ${campaign.theme.safeArea}px</span></article></div></section>
<section class="section"><h2>Resumen Ejecutivo</h2><div class="stats"><article class="stat"><strong>Piezas</strong><span>${previewData.pieces.length}</span></article><article class="stat"><strong>Salida</strong><span>IG + FB</span></article><article class="stat"><strong>Promesa</strong><span>${escapeHtml(campaign.theme.brand.promise)}</span></article></div></section>
<section class="section"><h2>Piezas Finales</h2><div class="filters" id="filters"></div><div class="pieces" id="pieces"></div></section></div>
<script>
const CAMPAIGN=${escapeForScript(previewData)};
const filters=[{key:"all",label:"Todas"},{key:"manifesto",label:"Manifesto"},{key:"photo-hero",label:"Photo Hero"},{key:"proof-utility",label:"Proof Utility"}];
const filtersRoot=document.getElementById("filters"); const piecesRoot=document.getElementById("pieces"); let activeFilter="all";
function renderFilters(){filtersRoot.innerHTML=filters.map(filter=>\`<button class="filter \${filter.key===activeFilter?"active":""}" data-filter="\${filter.key}">\${filter.label}</button>\`).join(""); filtersRoot.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{activeFilter=button.dataset.filter; renderFilters(); renderPieces();}));}
function renderPieces(){const items=CAMPAIGN.pieces.filter(piece=>activeFilter==="all"||piece.template===activeFilter); piecesRoot.innerHTML=items.map(piece=>\`<article class="piece"><div class="piece-visual"><img class="render" src="\${piece.output}" alt="\${piece.headline}" /><img class="source-thumb" src="\${piece.sourceImage}" alt="Fuente \${piece.headline}" /></div><div class="piece-body"><div class="badges"><span class="badge" style="background:\${piece.accent}">\${piece.date}</span><span class="badge" style="background:var(--navy)">\${piece.vertical}</span><span class="badge" style="background:rgba(16,36,54,.72)">\${piece.template}</span></div><h3>\${piece.headline}</h3><p class="piece-summary">\${piece.summary}</p><div class="meta-grid"><div class="meta"><strong>Objetivo</strong><span>\${piece.objective}</span></div><div class="meta"><strong>CTA</strong><span>\${piece.cta}</span></div><div class="meta"><strong>Crop</strong><span>\${piece.backgroundPosition} · scale \${piece.backgroundScale} · overlay \${piece.overlayOpacity}</span></div></div><div class="meta-grid"><div class="meta"><strong>Fase</strong><span>\${piece.phase}</span></div><div class="meta"><strong>Template</strong><span>\${piece.template}</span></div><div class="meta"><strong>Direccion Visual</strong><span>\${piece.imageNote}</span></div></div><div class="copies"><div class="copy"><strong>Caption IG</strong><p>\${piece.captionIg}</p></div><div class="copy"><strong>Caption FB</strong><p>\${piece.captionFb}</p></div></div></div></article>\`).join("");}
renderFilters(); renderPieces();
</script></body></html>`;
}

export async function renderCampaign(packageArg) {
  const packageDir = packageArg ? resolveProjectPath(packageArg) : defaultPackageDir;
  const systemPath = path.join(packageDir, "campaign.system.json");
  const piecesPath = path.join(packageDir, "campaign.pieces.json");
  const [systemRaw, piecesRaw] = await Promise.all([readJson(systemPath), readJson(piecesPath)]);
  const assetMapPath = resolveCampaignPath(
    packageDir,
    systemRaw.assetsMap ?? "assets-map.json",
  );
  const assetMap = await readJson(assetMapPath);
  const assetLookup = buildAssetLookup(assetMap);
  const theme = buildCampaignTheme(systemRaw);
  const pieces = piecesRaw.map((piece, index) => buildPieceRecord(piece, index, theme, assetLookup, packageDir));
  const outputDir = resolveCampaignPath(
    packageDir,
    systemRaw.outputDir ?? "output",
  );
  await fs.mkdir(outputDir, { recursive: true });
  const imageCache = new Map();
  async function getImageData(relativePath) {
    const assetPath = resolveCampaignPath(packageDir, relativePath);
    const key = normalizePath(assetPath);
    if (!imageCache.has(key)) imageCache.set(key, buildDataUrl(packageDir, relativePath));
    return imageCache.get(key);
  }
  async function getCampaignAsset(relativePath) {
    if (!relativePath) return null;
    const assetPath = resolveCampaignPath(packageDir, relativePath);
    const key = normalizePath(assetPath);
    if (!imageCache.has(key)) {
      const buffer = await fs.readFile(assetPath);
      imageCache.set(key, `data:${getMimeType(assetPath)};base64,${buffer.toString("base64")}`);
    }
    return imageCache.get(key);
  }
  const logoLight =
    (await getCampaignAsset(systemRaw.lockupRules?.photoHero?.asset)) ??
    (await getCampaignAsset(systemRaw.brandAssets?.defaultHorizontalOnDark)) ??
    (systemRaw.brand?.logoLight ? await getCampaignAsset(systemRaw.brand.logoLight) : null);
  const logoDark =
    (await getCampaignAsset(systemRaw.lockupRules?.proofUtility?.asset)) ??
    (await getCampaignAsset(systemRaw.brandAssets?.defaultHorizontalOnLight)) ??
    (systemRaw.brand?.logoDark ? await getCampaignAsset(systemRaw.brand.logoDark) : null);
  const logoManifesto =
    (await getCampaignAsset(systemRaw.lockupRules?.manifesto?.asset)) ??
    (await getCampaignAsset(systemRaw.brandAssets?.defaultStackedOnDark)) ??
    logoLight;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: theme.width, height: theme.height }, deviceScaleFactor: 1 });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("data:") || url.startsWith("about:")) {
      return route.continue();
    }
    return route.abort();
  });
  for (const piece of pieces) {
    console.log(`Rendering ${piece.fileName}`);
    const html = buildRenderHtml(piece, theme, {
      imageUrl: await getImageData(piece.image),
      logoLight,
      logoDark,
      logoManifesto,
    });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(outputDir, piece.fileName), type: "png" });
  }
  await browser.close();
  await fs.writeFile(path.join(packageDir, "preview.html"), buildPreviewHtml({ packageDir, theme, pieces }), "utf8");
  return { packageDir, outputDir, count: pieces.length, files: pieces.map((piece) => path.join(outputDir, piece.fileName)) };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  renderCampaign(process.argv[2]).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
