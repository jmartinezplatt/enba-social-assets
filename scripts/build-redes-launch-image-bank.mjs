import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const packageDir = path.join(
  repoRoot,
  "social-media",
  "contenido-listo",
  "campana-lanzamiento-15-abr-al-14-may-2026",
);
const outputDir = path.join(packageDir, "asset-bank");
const manifestPath = path.join(packageDir, "asset-bank-manifest.json");

const WIDTH = 1080;
const HEIGHT = 1350;
const RATIO = WIDTH / HEIGHT;

const assets = [
  {
    id: "brand-skyline-manifesto",
    source: "src/assets/paseos-skyline-buenos-aires.jpg",
    output: "asset-bank/brand-skyline-manifesto.jpg",
    focal: [0.54, 0.46],
    zoom: 1.06,
    grade: { saturation: 0.92, brightness: 0.98, contrast: 1.04 },
    overlays: { top: 0.08, bottom: 0.44, accent: "#173551", accentOpacity: 0.16 }
  },
  {
    id: "brand-costanera-hero",
    source: "src/assets/hero-sailing.jpg",
    output: "asset-bank/brand-costanera-hero.jpg",
    focal: [0.5, 0.5],
    zoom: 1.12,
    grade: { saturation: 0.94, brightness: 0.98, contrast: 1.06 },
    overlays: { top: 0.06, bottom: 0.34, accent: "#2E817D", accentOpacity: 0.12 }
  },
  {
    id: "brand-crew-costanera",
    source: "src/assets/travesia-crew.jpg",
    output: "asset-bank/brand-crew-costanera.jpg",
    focal: [0.52, 0.3],
    zoom: 1.18,
    grade: { saturation: 0.92, brightness: 0.99, contrast: 1.04 },
    overlays: { top: 0.1, bottom: 0.4, accent: "#D4A843", accentOpacity: 0.1 }
  },
  {
    id: "travesias-delta-signature",
    source: "src/assets/travesia-delta.jpg",
    output: "asset-bank/travesias-delta-signature.jpg",
    focal: [0.5, 0.5],
    zoom: 1.02,
    grade: { saturation: 0.96, brightness: 1.0, contrast: 1.04 },
    overlays: { top: 0.04, bottom: 0.24, accent: "#2E817D", accentOpacity: 0.08 }
  },
  {
    id: "travesias-colonia-openwater",
    source: "src/assets/colonia-sailing.jpg",
    output: "asset-bank/travesias-colonia-openwater.jpg",
    focal: [0.52, 0.48],
    zoom: 1.14,
    grade: { saturation: 0.94, brightness: 0.98, contrast: 1.06 },
    overlays: { top: 0.06, bottom: 0.28, accent: "#1A6FA0", accentOpacity: 0.1 }
  },
  {
    id: "travesias-city-horizon",
    source: "src/assets/travesia-navegando.jpg",
    output: "asset-bank/travesias-city-horizon.jpg",
    focal: [0.56, 0.5],
    zoom: 1.08,
    grade: { saturation: 0.93, brightness: 0.98, contrast: 1.06 },
    overlays: { top: 0.04, bottom: 0.2, accent: "#173551", accentOpacity: 0.08 }
  },
  {
    id: "travesias-first-time",
    source: "src/assets/travesia-velero.jpg",
    output: "asset-bank/travesias-first-time.jpg",
    focal: [0.49, 0.46],
    zoom: 1.02,
    grade: { saturation: 0.95, brightness: 1.0, contrast: 1.06 },
    overlays: { top: 0.02, bottom: 0.18, accent: "#D4A843", accentOpacity: 0.07 }
  },
  {
    id: "travesias-sunset-openwater",
    source: "src/assets/travesia-sunset.jpg",
    output: "asset-bank/travesias-sunset-openwater.jpg",
    focal: [0.62, 0.42],
    zoom: 1.18,
    grade: { saturation: 0.88, brightness: 0.97, contrast: 1.08 },
    overlays: { top: 0.06, bottom: 0.34, accent: "#D4A843", accentOpacity: 0.12 }
  },
  {
    id: "travesias-martin-garcia",
    source: "src/assets/martingarcia-destinos.jpg",
    output: "asset-bank/travesias-martin-garcia.jpg",
    focal: [0.5, 0.42],
    zoom: 1.18,
    grade: { saturation: 0.93, brightness: 0.98, contrast: 1.05 },
    overlays: { top: 0.05, bottom: 0.3, accent: "#D4A843", accentOpacity: 0.08 }
  },
  {
    id: "escuela-practica-rio",
    source: "src/assets/nautical-school.jpg",
    output: "asset-bank/escuela-practica-rio.jpg",
    focal: [0.58, 0.32],
    zoom: 1.34,
    grade: { saturation: 0.92, brightness: 0.99, contrast: 1.05 },
    overlays: { top: 0.06, bottom: 0.32, accent: "#1A6FA0", accentOpacity: 0.1 }
  },
  {
    id: "escuela-cubierta-accion",
    source: "src/assets/sailing-deck.jpg",
    output: "asset-bank/escuela-cubierta-accion.jpg",
    focal: [0.48, 0.3],
    zoom: 1.34,
    grade: { saturation: 0.9, brightness: 0.98, contrast: 1.05 },
    overlays: { top: 0.08, bottom: 0.36, accent: "#1A6FA0", accentOpacity: 0.12 }
  },
  {
    id: "escuela-tripulacion-aprendizaje",
    source: "src/assets/travesia-crew.jpg",
    output: "asset-bank/escuela-tripulacion-aprendizaje.jpg",
    focal: [0.62, 0.36],
    zoom: 1.3,
    grade: { saturation: 0.9, brightness: 0.98, contrast: 1.06 },
    overlays: { top: 0.08, bottom: 0.36, accent: "#1A6FA0", accentOpacity: 0.1 }
  },
  {
    id: "broker-signature",
    source: "src/assets/velero-4.jpg",
    output: "asset-bank/broker-signature.jpg",
    focal: [0.5, 0.48],
    zoom: 1.15,
    grade: { saturation: 0.9, brightness: 0.99, contrast: 1.08 },
    overlays: { top: 0.02, bottom: 0.16, accent: "#D4A843", accentOpacity: 0.1 }
  },
  {
    id: "broker-premium-deck",
    source: "src/assets/yacht-broker.jpg",
    output: "asset-bank/broker-premium-deck.jpg",
    focal: [0.44, 0.48],
    zoom: 1.22,
    grade: { saturation: 0.9, brightness: 0.99, contrast: 1.08 },
    overlays: { top: 0.04, bottom: 0.18, accent: "#D4A843", accentOpacity: 0.08 }
  },
  {
    id: "broker-marina-context",
    source: "src/assets/hero-broker.jpg",
    output: "asset-bank/broker-marina-context.jpg",
    focal: [0.54, 0.48],
    zoom: 1.46,
    grade: { saturation: 0.9, brightness: 0.98, contrast: 1.06 },
    overlays: { top: 0.04, bottom: 0.18, accent: "#173551", accentOpacity: 0.08 }
  },
  {
    id: "servicios-taller-confianza",
    source: "src/assets/boat-service.jpg",
    output: "asset-bank/servicios-taller-confianza.jpg",
    focal: [0.6, 0.45],
    zoom: 1.08,
    grade: { saturation: 0.88, brightness: 0.98, contrast: 1.06 },
    overlays: { top: 0.04, bottom: 0.22, accent: "#2E817D", accentOpacity: 0.08 }
  },
  {
    id: "servicios-cabina-exterior",
    source: "src/assets/Desacatao/IMG_1094.jpg",
    output: "asset-bank/servicios-cabina-exterior.jpg",
    focal: [0.5, 0.5],
    zoom: 1.12,
    grade: { saturation: 0.88, brightness: 0.99, contrast: 1.08 },
    overlays: { top: 0.04, bottom: 0.22, accent: "#2E817D", accentOpacity: 0.08 }
  },
  {
    id: "servicios-casco-amarrado",
    source: "src/assets/Desacatao/IMG_1070.jpg",
    output: "asset-bank/servicios-casco-amarrado.jpg",
    focal: [0.56, 0.44],
    zoom: 1.14,
    grade: { saturation: 0.87, brightness: 0.98, contrast: 1.08 },
    overlays: { top: 0.04, bottom: 0.2, accent: "#2E817D", accentOpacity: 0.08 }
  }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildGradientSvg({ width, height, top, bottom, accent, accentOpacity }) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(10,21,32,${top})"/>
        <stop offset="45%" stop-color="rgba(10,21,32,${Math.max(top, bottom * 0.38)})"/>
        <stop offset="100%" stop-color="rgba(10,21,32,${bottom})"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="${accent}" stop-opacity="${accentOpacity}"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#shade)"/>
    <rect width="${width}" height="${height}" fill="url(#accent)"/>
  </svg>`;
}

function buildNoiseSvg(width, height) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.018"/>
      </feComponentTransfer>
    </filter>
    <rect width="${width}" height="${height}" filter="url(#n)" opacity="0.55"/>
  </svg>`;
}

async function createAsset(entry) {
  const sourcePath = path.join(repoRoot, entry.source);
  const targetPath = path.join(packageDir, entry.output);
  const metadata = await sharp(sourcePath).metadata();
  const swapsAxes = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
  const sourceWidth = swapsAxes ? metadata.height : metadata.width;
  const sourceHeight = swapsAxes ? metadata.width : metadata.height;

  const zoom = entry.zoom ?? 1;
  const cropWidth = Math.round(sourceWidth / zoom);
  const cropHeight = Math.round(cropWidth / RATIO);
  const adjustedCropHeight =
    cropHeight > sourceHeight ? sourceHeight : cropHeight;
  const adjustedCropWidth = Math.round(adjustedCropHeight * RATIO);
  const left = clamp(
    Math.round(sourceWidth * entry.focal[0] - adjustedCropWidth / 2),
    0,
    sourceWidth - adjustedCropWidth,
  );
  const top = clamp(
    Math.round(sourceHeight * entry.focal[1] - adjustedCropHeight / 2),
    0,
    sourceHeight - adjustedCropHeight,
  );

  const gradientSvg = Buffer.from(
    buildGradientSvg({
      width: WIDTH,
      height: HEIGHT,
      ...entry.overlays,
    }),
  );
  const noiseSvg = Buffer.from(buildNoiseSvg(WIDTH, HEIGHT));

  await sharp(sourcePath)
    .rotate()
    .extract({
      left,
      top,
      width: adjustedCropWidth,
      height: adjustedCropHeight,
    })
    .resize(WIDTH, HEIGHT)
    .modulate({
      brightness: entry.grade.brightness,
      saturation: entry.grade.saturation,
    })
    .linear(entry.grade.contrast, -(128 * entry.grade.contrast) + 128)
    .composite([
      { input: gradientSvg, blend: "over" },
      { input: noiseSvg, blend: "soft-light" },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(targetPath);

  return {
    id: entry.id,
    source: entry.source,
    output: entry.output,
    width: WIDTH,
    height: HEIGHT,
    focal: entry.focal,
    zoom,
    grade: entry.grade,
  };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const manifest = [];
  for (const entry of assets) {
    manifest.push(await createAsset(entry));
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
