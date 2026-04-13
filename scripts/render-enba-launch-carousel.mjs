import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultConfigPath = path.join(
  repoRoot,
  "social-media",
  "contenido-listo",
  "enba-carrusel-lanzamiento",
  "carousel.config.json",
);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function resolveProjectPath(relativePath) {
  return path.isAbsolute(relativePath)
    ? relativePath
    : path.join(repoRoot, relativePath);
}

async function buildDataUrl(relativePath) {
  const filePath = resolveProjectPath(relativePath);
  const buffer = await fs.readFile(filePath);
  return `data:${getMimeType(filePath)};base64,${buffer.toString("base64")}`;
}

function buildPhotoSlideHtml(slide, imageUrl, theme) {
  const titleTransform = slide.titleTransform ?? "uppercase";
  const logoHtml = theme.photoLogo
    ? `<img class="brand-logo" src="${theme.photoLogo}" alt="${escapeHtml(theme.photoLogoAlt ?? "Espacio Nautico Buenos Aires")}" />`
    : "";

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;600&family=Teko:wght@700&display=swap');

      :root {
        --navy: ${theme.navy};
        --white: ${theme.white};
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
        font-synthesis-weight: none;
        -webkit-font-smoothing: antialiased;
        text-rendering: geometricPrecision;
      }

      .bg, .photo, .overlay {
        position: absolute;
        inset: 0;
      }

      .bg {
        background: var(--navy);
      }

      .photo {
        background-image: url('${imageUrl}');
        background-size: cover;
        background-position: ${slide.backgroundPosition ?? "center center"};
        background-repeat: no-repeat;
        transform: scale(${slide.backgroundScale ?? 1.01});
      }

      .overlay {
        background: rgba(0, 0, 0, ${slide.overlayOpacity ?? theme.overlayOpacity});
      }

      .brand-logo {
        position: absolute;
        top: ${theme.photoLogoTop ?? 42}px;
        left: ${theme.photoLogoLeft ?? 42}px;
        width: ${theme.photoLogoWidth ?? 280}px;
        opacity: ${theme.photoLogoOpacity ?? 0.96};
        filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.22));
      }

      .copy {
        position: absolute;
        left: 50%;
        bottom: ${slide.copyBottom ?? theme.copyBottom}px;
        width: min(${theme.copyWidth}px, calc(100% - ${theme.copyPadding * 2}px));
        transform: translateX(-50%);
        color: var(--white);
        text-align: center;
      }

      .title {
        margin: 0;
        font-family: '${theme.titleFont}', sans-serif;
        font-size: ${slide.titleSize ?? theme.titleSize}px;
        font-weight: ${theme.titleWeight};
        line-height: ${theme.titleLineHeight};
        letter-spacing: ${theme.titleLetterSpacing};
        text-wrap: balance;
        text-transform: ${titleTransform};
        text-shadow: ${theme.titleShadow};
      }

      .subtitle {
        margin: ${theme.subtitleGap}px auto 0;
        max-width: ${theme.subtitleMaxWidth}px;
        font-family: '${theme.subtitleFont}', sans-serif;
        font-size: ${slide.subtitleSize ?? theme.subtitleSize}px;
        font-weight: ${theme.subtitleWeight};
        line-height: ${theme.subtitleLineHeight};
        text-wrap: balance;
        text-shadow: ${theme.subtitleShadow};
      }
    </style>
  </head>
  <body>
    <div class="bg"></div>
    <div class="photo"></div>
    <div class="overlay"></div>
    ${logoHtml}
    <div class="copy">
      <h1 class="title">${escapeHtml(slide.title)}</h1>
      <p class="subtitle">${escapeHtml(slide.subtitle)}</p>
    </div>
  </body>
</html>`;
}

function buildCoverSlideHtml(slide, logoUrl, theme) {
  const titleHtml = String(slide.title)
    .split("\n")
    .map((line) => `<span>${escapeHtml(line)}</span>`)
    .join("");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;600&family=Teko:wght@700&display=swap');

      :root {
        --navy: ${theme.navy};
        --white: ${theme.white};
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
        display: grid;
        place-items: center;
        font-synthesis-weight: none;
        -webkit-font-smoothing: antialiased;
        text-rendering: geometricPrecision;
      }

      .wrap {
        width: 100%;
        margin-top: ${slide.topOffset ?? 40}px;
        color: var(--white);
        text-align: center;
      }

      .logo {
        width: ${slide.logoWidth ?? 640}px;
        margin: 0 auto ${slide.logoBottom ?? 84}px;
        display: block;
      }

      .title {
        margin: 0;
        font-family: '${theme.titleFont}', sans-serif;
        font-size: ${slide.titleSize ?? 108}px;
        font-weight: ${theme.titleWeight};
        line-height: ${theme.titleLineHeight};
      }

      .title span {
        display: block;
      }

      .subtitle {
        margin: ${slide.subtitleGap ?? 44}px 0 0;
        font-family: '${theme.subtitleFont}', sans-serif;
        font-size: ${slide.subtitleSize ?? 37}px;
        font-weight: ${theme.subtitleWeight};
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <img class="logo" src="${logoUrl}" alt="${escapeHtml(slide.logoAlt ?? "ENBA")}" />
      <h1 class="title">${titleHtml}</h1>
      <p class="subtitle">${escapeHtml(slide.subtitle)}</p>
    </div>
  </body>
</html>`;
}

async function loadConfig(configPath) {
  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw);

  if (!config.outputDir) {
    throw new Error("La config debe definir outputDir.");
  }

  if (!Array.isArray(config.slides) || config.slides.length === 0) {
    throw new Error("La config debe definir slides no vacíos.");
  }

  return {
    theme: {
      width: 1080,
      height: 1350,
      navy: "#0a1520",
      white: "#e8edf2",
      overlayOpacity: 0.4,
      titleFont: "Teko",
      titleWeight: 700,
      titleLineHeight: 0.92,
      titleLetterSpacing: "0.01em",
      titleShadow: "0 2px 12px rgba(0, 0, 0, 0.28)",
      subtitleFont: "Barlow Semi Condensed",
      subtitleWeight: 400,
      subtitleLineHeight: 1.18,
      subtitleShadow: "0 2px 10px rgba(0, 0, 0, 0.28)",
      titleSize: 84,
      subtitleSize: 34,
      copyBottom: 230,
      copyWidth: 980,
      copyPadding: 60,
      subtitleGap: 12,
      subtitleMaxWidth: 880,
      photoLogo: await buildDataUrl("src/assets/ENBA-horizontal-claro.svg"),
      photoLogoAlt: "Espacio Nautico Buenos Aires",
      photoLogoTop: 42,
      photoLogoLeft: 42,
      photoLogoWidth: 280,
      photoLogoOpacity: 0.96,
      ...config.theme,
    },
    outputDir: resolveProjectPath(config.outputDir),
    slides: config.slides,
  };
}

export async function renderCarousel(configPathArg) {
  const configPath = configPathArg
    ? resolveProjectPath(configPathArg)
    : defaultConfigPath;
  const config = await loadConfig(configPath);

  await fs.mkdir(config.outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: config.theme.width, height: config.theme.height },
    deviceScaleFactor: 1,
  });

  for (const slide of config.slides) {
    let html = "";

    if (slide.kind === "cover") {
      html = buildCoverSlideHtml(slide, await buildDataUrl(slide.logo), config.theme);
    } else {
      html = buildPhotoSlideHtml(slide, await buildDataUrl(slide.image), config.theme);
    }

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(config.outputDir, `slide-${slide.id}.png`),
      type: "png",
    });
  }

  await browser.close();
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  renderCarousel(process.argv[2]).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
