import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "campaigns", "plan-crecimiento-10k", "highlights");

const highlights = [
  { label: "Travesías",      accent: "#2E817D", icon: "anchor"   },
  { label: "Paseos",         accent: "#4DB8A0", icon: "wave"     },
  { label: "Broker",         accent: "#D4A843", icon: "star"     },
  { label: "Escuela",        accent: "#3A9FD4", icon: "helm"     },
  { label: "Services",       accent: "#2E817D", icon: "wrench"   },
  { label: "¿Quiénes somos?",accent: "#D4A843", icon: "compass"  },
];

// SVG icon paths (centered in ~200x200 viewBox)
const icons = {
  anchor: `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Stock (barra superior) -->
    <line x1="62" y1="58" x2="138" y2="58" stroke="ACCENT" stroke-width="8" stroke-linecap="round"/>
    <!-- Anilla superior -->
    <path d="M88 58 A12 12 0 0 1 112 58" stroke="ACCENT" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Mástil vertical -->
    <line x1="100" y1="58" x2="100" y2="162" stroke="ACCENT" stroke-width="8" stroke-linecap="round"/>
    <!-- Brazo izquierdo con punta -->
    <path d="M100 162 Q72 148 62 132" stroke="ACCENT" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M62 132 Q56 122 68 118" stroke="ACCENT" stroke-width="7" stroke-linecap="round" fill="none"/>
    <!-- Brazo derecho con punta -->
    <path d="M100 162 Q128 148 138 132" stroke="ACCENT" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M138 132 Q144 122 132 118" stroke="ACCENT" stroke-width="7" stroke-linecap="round" fill="none"/>
    <!-- Barra transversal media -->
    <line x1="70" y1="110" x2="130" y2="110" stroke="ACCENT" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
  </svg>`,

  wave: `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 88 Q55 66 82 88 Q109 110 136 88 Q163 66 172 88" stroke="ACCENT" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M28 118 Q55 96 82 118 Q109 140 136 118 Q163 96 172 118" stroke="ACCENT" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.5"/>
  </svg>`,

  star: `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 30 L116 76 L166 76 L126 104 L142 150 L100 122 L58 150 L74 104 L34 76 L84 76 Z" stroke="ACCENT" stroke-width="7" stroke-linejoin="round" fill="none"/>
  </svg>`,

  helm: `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="60" stroke="ACCENT" stroke-width="7" fill="none"/>
    <circle cx="100" cy="100" r="18" stroke="ACCENT" stroke-width="7" fill="none"/>
    <line x1="100" y1="40" x2="100" y2="82" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
    <line x1="100" y1="118" x2="100" y2="160" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
    <line x1="40" y1="100" x2="82" y2="100" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
    <line x1="118" y1="100" x2="160" y2="100" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
    <line x1="57" y1="57" x2="83" y2="83" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
    <line x1="117" y1="117" x2="143" y2="143" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
    <line x1="143" y1="57" x2="117" y2="83" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
    <line x1="83" y1="117" x2="57" y2="143" stroke="ACCENT" stroke-width="7" stroke-linecap="round"/>
  </svg>`,

  wrench: `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Engranaje exterior -->
    <circle cx="100" cy="100" r="52" stroke="ACCENT" stroke-width="7" fill="none"/>
    <!-- Centro -->
    <circle cx="100" cy="100" r="20" stroke="ACCENT" stroke-width="7" fill="none"/>
    <!-- Dientes del engranaje (8 dientes) -->
    <rect x="93" y="38" width="14" height="18" rx="3" fill="ACCENT"/>
    <rect x="93" y="144" width="14" height="18" rx="3" fill="ACCENT"/>
    <rect x="38" y="93" width="18" height="14" rx="3" fill="ACCENT"/>
    <rect x="144" y="93" width="18" height="14" rx="3" fill="ACCENT"/>
    <rect x="120" y="44" width="14" height="18" rx="3" fill="ACCENT" transform="rotate(45 127 53)"/>
    <rect x="66" y="138" width="14" height="18" rx="3" fill="ACCENT" transform="rotate(45 73 147)"/>
    <rect x="138" y="66" width="18" height="14" rx="3" fill="ACCENT" transform="rotate(45 147 73)"/>
    <rect x="44" y="120" width="18" height="14" rx="3" fill="ACCENT" transform="rotate(45 53 127)"/>
  </svg>`,

  compass: `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="68" stroke="ACCENT" stroke-width="7" fill="none"/>
    <polygon points="100,40 112,100 100,90 88,100" fill="ACCENT"/>
    <polygon points="100,160 112,100 100,110 88,100" fill="ACCENT" opacity="0.4"/>
    <circle cx="100" cy="100" r="8" fill="ACCENT"/>
    <text x="100" y="38" text-anchor="middle" fill="ACCENT" font-family="Teko, sans-serif" font-size="18" font-weight="700">N</text>
    <text x="100" y="174" text-anchor="middle" fill="ACCENT" font-family="Teko, sans-serif" font-size="18" font-weight="700" opacity="0.5">S</text>
    <text x="168" y="106" text-anchor="middle" fill="ACCENT" font-family="Teko, sans-serif" font-size="18" font-weight="700" opacity="0.5">E</text>
    <text x="32" y="106" text-anchor="middle" fill="ACCENT" font-family="Teko, sans-serif" font-size="18" font-weight="700" opacity="0.5">O</text>
  </svg>`,
};

// ENBA sail icon (from brand SVG, simplified)
const sailIcon = (accent) => `
  <svg width="120" height="100" viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="210" y1="30" x2="210" y2="116" stroke="${accent}" stroke-width="3"/>
    <path d="M210 32 L174 112 L210 112 Z" fill="${accent}" opacity="0.94"/>
    <path d="M210 50 L240 104 L210 104 Z" fill="#3A9FD4" opacity="0.86"/>
    <path d="M144 138 C160 128 176 128 192 138 C208 148 224 148 240 138 C256 128 272 128 288 138" stroke="${accent}" stroke-width="2.8" stroke-linecap="round"/>
  </svg>
`;

function buildHTML(h) {
  const iconSvg = icons[h.icon].replaceAll("ACCENT", h.accent);
  const labelSize = h.label.length > 12 ? 52 : h.label.length > 8 ? 62 : 74;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;600;700&family=Barlow+Semi+Condensed:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1080px;
    background: #0A1520;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .cover {
    width: 1080px; height: 1080px;
    background: #0A1520;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 0;
    position: relative;
  }
  .bg-glow {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, ${h.accent}18 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
  .sail-wrap {
    margin-bottom: 32px;
    opacity: 0.28;
  }
  .icon-wrap {
    margin-bottom: 48px;
    position: relative;
    z-index: 2;
  }
  .label {
    font-family: 'Teko', 'Bebas Neue', sans-serif;
    font-size: ${labelSize}px;
    font-weight: 700;
    color: #E8EDF2;
    letter-spacing: 4px;
    text-transform: uppercase;
    text-align: center;
    line-height: 1;
    position: relative;
    z-index: 2;
    padding: 0 60px;
  }
  .accent-line {
    width: 60px; height: 3px;
    background: ${h.accent};
    margin-top: 32px;
    border-radius: 2px;
    position: relative;
    z-index: 2;
  }
  .sub {
    font-family: 'Barlow Semi Condensed', Arial, sans-serif;
    font-size: 20px;
    font-weight: 500;
    color: rgba(232,237,242,0.45);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 20px;
    position: relative;
    z-index: 2;
  }
</style>
</head>
<body>
<div class="cover">
  <div class="bg-glow"></div>
  <div class="sail-wrap">${sailIcon(h.accent)}</div>
  <div class="icon-wrap">${iconSvg}</div>
  <div class="label">${h.label}</div>
  <div class="accent-line"></div>
  <div class="sub">Espacio Náutico · Buenos Aires</div>
</div>
</body>
</html>`;
}

async function render() {
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1080 });

  for (const h of highlights) {
    const html = buildHTML(h);
    const slug = h.label
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const outPath = path.join(outDir, `highlight-${slug}.png`);

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: outPath, type: "png" });

    console.log(`✓ ${h.label} → ${path.basename(outPath)}`);
  }

  await browser.close();
  console.log(`\n6 covers en campaigns/plan-crecimiento-10k/highlights/`);
}

render().catch((e) => { console.error(e); process.exit(1); });
