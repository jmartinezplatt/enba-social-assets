#!/usr/bin/env node
// Produce 30 stories para Fase 2 (3/día × 10 días) con assets distintos al batch de highlights
// Output: campaigns/plan-crecimiento-10k/highlights/stories/fase2/
// Mismo sistema visual ENBA — base64 embedding (no file:// URLs)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, '..');
const assetBank = path.join(repoRoot, 'asset-bank');
const outDir    = path.join(repoRoot, 'campaigns', 'plan-crecimiento-10k', 'highlights', 'stories', 'fase2');

// 30 stories — 5 por categoría × 6 categorías
// Assets distintos a los usados en las 24 stories de highlights (Fase 1)
const fase2Stories = [
  // ── TRAVESÍAS (accent #2E817D) ──────────────────────────────────────────
  { id: 'travesias-f2-01', file: 'travesias-delta-signature.jpg',         label: 'TRAVESÍAS', accent: '#2E817D', caption: 'El Delta del Paraná, a pocas horas de BA.' },
  { id: 'travesias-f2-02', file: 'travesias-martin-garcia-aerea.jpg',      label: 'TRAVESÍAS', accent: '#2E817D', caption: 'Martín García: la isla del río.' },
  { id: 'travesias-f2-03', file: 'travesias-fondeadero-luna-atardecer.jpg',label: 'TRAVESÍAS', accent: '#2E817D', caption: 'Fondear y quedarse a dormir bajo las estrellas.' },
  { id: 'travesias-f2-04', file: 'travesias-flota-navegando-jarcia.jpg',   label: 'TRAVESÍAS', accent: '#2E817D', caption: 'Navegar en flota. Una experiencia única.' },
  { id: 'travesias-f2-05', file: 'travesias-bandera-uruguay-tormenta.jpg', label: 'TRAVESÍAS', accent: '#2E817D', caption: 'El Río de la Plata en todas sus caras.' },

  // ── PASEOS (accent #4DB8A0) ──────────────────────────────────────────────
  { id: 'paseos-f2-01', file: 'cuatro-amigos-cockpit-vela-nubes-rio.jpg',  label: 'PASEOS', accent: '#4DB8A0', caption: 'Invitá a tu gente. El río está esperando.' },
  { id: 'paseos-f2-02', file: 'familia-cockpit-charla-rio.jpg',            label: 'PASEOS', accent: '#4DB8A0', caption: 'Una tarde diferente en familia.' },
  { id: 'paseos-f2-03', file: 'selfie-trio-cockpit-navegando.jpg',         label: 'PASEOS', accent: '#4DB8A0', caption: 'Tres horas en el río. Sin experiencia previa.' },
  { id: 'paseos-f2-04', file: 'trio-cockpit-charla-navegando-skyline.jpg', label: 'PASEOS', accent: '#4DB8A0', caption: 'El skyline de Buenos Aires desde cubierta.' },
  { id: 'paseos-f2-05', file: 'duo-chalecos-mate-openwater-bandera.jpg',   label: 'PASEOS', accent: '#4DB8A0', caption: 'Mate, viento y río abierto.' },

  // ── BROKER (accent #D4A843) ──────────────────────────────────────────────
  { id: 'broker-f2-01', file: 'velero-fondeado-delta-reflejo.jpg',         label: 'BROKER', accent: '#D4A843', caption: '¿Soñás con tu propio velero?' },
  { id: 'broker-f2-02', file: 'velero-escorando-openwater.jpg',            label: 'BROKER', accent: '#D4A843', caption: 'El próximo velero puede ser tuyo.' },
  { id: 'broker-f2-03', file: 'velero-velas-desplegadas-bandera-uy.jpg',   label: 'BROKER', accent: '#D4A843', caption: 'Compramos y vendemos con criterio náutico.' },
  { id: 'broker-f2-04', file: 'veleros-amarrados-puente-luces-atardecer.jpg', label: 'BROKER', accent: '#D4A843', caption: 'Tu barco ideal, en el lugar correcto.' },
  { id: 'broker-f2-05', file: 'velero-proa-rio-delta-nublado.jpg',         label: 'BROKER', accent: '#D4A843', caption: 'Consultá nuestro stock disponible.' },

  // ── ESCUELA (accent #3A9FD4) ─────────────────────────────────────────────
  { id: 'escuela-f2-01', file: 'escuela-vela-contraluz-maniobra.jpg',      label: 'ESCUELA', accent: '#3A9FD4', caption: 'Maniobras reales desde el primer día.' },
  { id: 'escuela-f2-02', file: 'escuela-heeling-tripulacion.jpg',           label: 'ESCUELA', accent: '#3A9FD4', caption: 'Aprendés navegando, no leyendo.' },
  { id: 'escuela-f2-03', file: 'escuela-maniobra-condiciones.jpg',         label: 'ESCUELA', accent: '#3A9FD4', caption: 'En todas las condiciones. Eso se aprende.' },
  { id: 'escuela-f2-04', file: 'escuela-timonel-compas-gris.jpg',          label: 'ESCUELA', accent: '#3A9FD4', caption: 'Rumbo propio. Con brújula incluida.' },
  { id: 'escuela-f2-05', file: 'escuela-tripulacion-aprendizaje.jpg',      label: 'ESCUELA', accent: '#3A9FD4', caption: 'Un equipo que aprende junto en el río.' },

  // ── SERVICES (accent #2E817D) ────────────────────────────────────────────
  { id: 'services-f2-01', file: 'servicios-fernando-cubierta-mastil.jpg',  label: 'SERVICES', accent: '#2E817D', caption: 'Equipo propio. Trabajo a conciencia.' },
  { id: 'services-f2-02', file: 'servicios-belna-casco-quilla.jpg',        label: 'SERVICES', accent: '#2E817D', caption: 'Casco, quilla y obra viva en condiciones.' },
  { id: 'services-f2-03', file: 'servicios-belna-hidrolavado.jpg',         label: 'SERVICES', accent: '#2E817D', caption: 'Tu embarcación siempre lista para navegar.' },
  { id: 'services-f2-04', file: 'servicios-desacatao-varadero.jpg',        label: 'SERVICES', accent: '#2E817D', caption: 'Varadero con experiencia náutica real.' },
  { id: 'services-f2-05', file: 'servicios-cabina-exterior.jpg',           label: 'SERVICES', accent: '#2E817D', caption: 'Mantenimiento integral, dentro y fuera.' },

  // ── QUIÉNES SOMOS (accent #D4A843) ──────────────────────────────────────
  { id: 'quienes-f2-01', file: 'selfie-grupo-cockpit-marina.jpg',          label: '¿QUIÉNES SOMOS?', accent: '#D4A843', caption: 'Navegamos, enseñamos, cuidamos tu barco.' },
  { id: 'quienes-f2-02', file: 'brand-skyline-manifesto.jpg',              label: '¿QUIÉNES SOMOS?', accent: '#D4A843', caption: 'El Río de la Plata es nuestro lugar.' },
  { id: 'quienes-f2-03', file: 'backstage-charla-popa-chalecos.jpg',       label: '¿QUIÉNES SOMOS?', accent: '#D4A843', caption: 'Antes de cada salida, estamos con vos.' },
  { id: 'quienes-f2-04', file: 'backstage-celebracion-cubierta.jpg',       label: '¿QUIÉNES SOMOS?', accent: '#D4A843', caption: 'Celebramos cada travesía completada.' },
  { id: 'quienes-f2-05', file: 'capitan-popa-bandera-mate.jpg',            label: '¿QUIÉNES SOMOS?', accent: '#D4A843', caption: 'Costanera Norte, frente al Aeroparque.' },
];

function buildStoryHTML(photoBase64, caption, accent, label) {
  const photoUrl = 'data:image/jpeg;base64,' + photoBase64;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@600;700&family=Barlow+Semi+Condensed:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1920px; overflow: hidden; background: #0A1520; }
  .bg {
    position: absolute; inset: 0;
    background-image: url('${photoUrl}');
    background-size: cover; background-position: center;
  }
  .overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(10,21,32,0.35) 0%,
      rgba(10,21,32,0.0) 35%,
      rgba(10,21,32,0.0) 55%,
      rgba(10,21,32,0.82) 100%
    );
  }
  .top-brand {
    position: absolute; top: 200px; left: 0; right: 0;
    display: flex; align-items: center; justify-content: center; gap: 16px;
  }
  .top-label {
    font-family: 'Teko', sans-serif; font-size: 38px; font-weight: 700;
    color: rgba(232,237,242,0.90); letter-spacing: 6px; text-transform: uppercase;
  }
  .accent-dot { width: 8px; height: 8px; border-radius: 50%; background: ${accent}; }
  .bottom { position: absolute; bottom: 0; left: 0; right: 0; padding: 0 72px 100px; }
  .accent-line { width: 60px; height: 4px; background: ${accent}; border-radius: 2px; margin-bottom: 32px; }
  .caption {
    font-family: 'Barlow Semi Condensed', Arial, sans-serif;
    font-size: 52px; font-weight: 500; color: #FFFFFF; line-height: 1.2; letter-spacing: 0.5px;
  }
  .enba-tag {
    margin-top: 28px; font-family: 'Teko', sans-serif; font-size: 30px; font-weight: 600;
    color: rgba(232,237,242,0.55); letter-spacing: 4px; text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="overlay"></div>
  <div class="top-brand">
    <div class="accent-dot"></div>
    <div class="top-label">${label}</div>
    <div class="accent-dot"></div>
  </div>
  <div class="bottom">
    <div class="accent-line"></div>
    <div class="caption">${caption}</div>
    <div class="enba-tag">Espacio Náutico · Buenos Aires</div>
  </div>
</body>
</html>`;
}

async function render() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1920 });

  let ok = 0, skipped = 0;
  for (const s of fase2Stories) {
    const photoPath = path.join(assetBank, s.file);
    try { await fs.access(photoPath); } catch {
      console.log(`  SKIP (no encontrado): ${s.file}`);
      skipped++;
      continue;
    }
    const photoBase64 = (await fs.readFile(photoPath)).toString('base64');
    const html = buildStoryHTML(photoBase64, s.caption, s.accent, s.label);
    const outFile = path.join(outDir, `${s.id}.jpg`);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: outFile, type: 'jpeg', quality: 92 });
    console.log(`  ✓ ${s.id}`);
    ok++;
  }

  await browser.close();
  console.log(`\n${ok} stories renderizadas en highlights/stories/fase2/`);
  if (skipped > 0) console.log(`${skipped} skipped (asset no encontrado)`);
}

render().catch(e => { console.error(e); process.exit(1); });
