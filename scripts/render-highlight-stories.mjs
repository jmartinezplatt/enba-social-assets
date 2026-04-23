#!/usr/bin/env node
// Produce story-format images (1080x1920) para cargar en los 6 highlights de IG
// Output: campaigns/plan-crecimiento-10k/highlights/stories/

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, '..');
const assetBank = path.join(repoRoot, 'asset-bank');
const outDir    = path.join(repoRoot, 'campaigns', 'plan-crecimiento-10k', 'highlights', 'stories');

// 3-4 stories por highlight — assets seleccionados por relevancia
const highlights = [
  {
    slug: 'travesias',
    label: 'TRAVESÍAS',
    accent: '#2E817D',
    stories: [
      { file: 'destino-hero-travesias.jpg',           caption: 'Destinos reales. Navegación real.' },
      { file: 'travesias-colonia-openwater.jpg',       caption: 'Colonia, Martín García, Delta y más.' },
      { file: 'travesias-sunset-openwater.jpg',        caption: 'El Río de la Plata no tiene techo.' },
      { file: 'travesias-spinnaker-color.jpg',         caption: 'Travesías con pernocte disponibles.' },
    ]
  },
  {
    slug: 'paseos',
    label: 'PASEOS',
    accent: '#4DB8A0',
    stories: [
      { file: 'duo-cockpit-sunset-celular-rio.jpg',    caption: 'Salidas cortas desde Costanera Norte.' },
      { file: 'skyline-buenos-aires-desde-velero-rio.jpg', caption: 'Buenos Aires desde el río.' },
      { file: 'trio-cockpit-bandera-navegando.jpg',    caption: 'Paseos en velero para todos.' },
      { file: 'duo-chalecos-cockpit-vela-desplegada.jpg', caption: 'Sin experiencia previa necesaria.' },
    ]
  },
  {
    slug: 'broker',
    label: 'BROKER',
    accent: '#D4A843',
    stories: [
      { file: 'broker-premium-deck.jpg',               caption: 'Veleros en venta con asesoramiento.' },
      { file: 'broker-signature.jpg',                  caption: 'Comprá o vendé con respaldo náutico.' },
      { file: 'broker-velero-nocturno-reflejos.jpg',   caption: 'Tasaciones y gestión completa.' },
      { file: 'broker-yate-clasico-banderas.jpg',      caption: 'Consultá por nuestro stock.' },
    ]
  },
  {
    slug: 'escuela',
    label: 'ESCUELA',
    accent: '#3A9FD4',
    stories: [
      { file: 'escuela-instructor-cubierta.jpg',       caption: 'Aprendé a navegar desde cero.' },
      { file: 'escuela-timonel-golden-hour.jpg',       caption: 'Cursos de timonel en el río.' },
      { file: 'escuela-practica-rio.jpg',              caption: 'Práctica real, no solo teoría.' },
      { file: 'escuela-estudiantes-vela-abierta.jpg',  caption: 'Certificación náutica oficial.' },
    ]
  },
  {
    slug: 'services',
    label: 'SERVICES',
    accent: '#2E817D',
    stories: [
      { file: 'servicios-charly-cubierta-winche.jpg',  caption: 'Mantenimiento y reparación náutica.' },
      { file: 'servicios-antiincrustante-varadero.jpg',caption: 'Varadero, pintura, quilla y más.' },
      { file: 'servicios-trabajo-cubierta-marina.jpg', caption: 'Tu embarcación en buenas manos.' },
      { file: 'servicios-charly-tope-mastil.jpg',      caption: 'Trabajos en altura y aparejos.' },
    ]
  },
  {
    slug: 'quienes-somos',
    label: '¿QUIÉNES SOMOS?',
    accent: '#D4A843',
    stories: [
      { file: 'brand-crew-costanera.jpg',              caption: 'Espacio Náutico Buenos Aires.' },
      { file: 'grupo-cockpit-atardecer-escotilla.jpg', caption: 'Costanera Norte, frente al Aeroparque.' },
      { file: 'selfie-mastil-marina-panoramica-veleros.jpg', caption: 'Travesías · Paseos · Escuela · Broker · Servicios' },
      { file: 'brand-costanera-hero.jpg',              caption: 'Escribinos y navegá con nosotros.' },
    ]
  }
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
  body {
    width: 1080px; height: 1920px;
    overflow: hidden;
    background: #0A1520;
  }
  .bg {
    position: absolute;
    inset: 0;
    background-image: url('${photoUrl}');
    background-size: cover;
    background-position: center;
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(10,21,32,0.35) 0%,
      rgba(10,21,32,0.0) 35%,
      rgba(10,21,32,0.0) 55%,
      rgba(10,21,32,0.82) 100%
    );
  }
  .top-brand {
    position: absolute;
    top: 72px;
    left: 0; right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .top-label {
    font-family: 'Teko', sans-serif;
    font-size: 38px;
    font-weight: 700;
    color: rgba(232,237,242,0.90);
    letter-spacing: 6px;
    text-transform: uppercase;
  }
  .accent-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: ${accent};
  }
  .bottom {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0 72px 100px;
  }
  .accent-line {
    width: 60px; height: 4px;
    background: ${accent};
    border-radius: 2px;
    margin-bottom: 32px;
  }
  .caption {
    font-family: 'Barlow Semi Condensed', Arial, sans-serif;
    font-size: 52px;
    font-weight: 500;
    color: #FFFFFF;
    line-height: 1.2;
    letter-spacing: 0.5px;
  }
  .enba-tag {
    margin-top: 28px;
    font-family: 'Teko', sans-serif;
    font-size: 30px;
    font-weight: 600;
    color: rgba(232,237,242,0.55);
    letter-spacing: 4px;
    text-transform: uppercase;
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
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1920 });

  let total = 0;
  for (const hl of highlights) {
    console.log(`\n── ${hl.label} ──`);
    for (let i = 0; i < hl.stories.length; i++) {
      const s = hl.stories[i];
      const photoPath = path.join(assetBank, s.file);
      // verificar que el asset existe
      try { await fs.access(photoPath); } catch {
        console.log(`  SKIP (no encontrado): ${s.file}`);
        continue;
      }
      const photoBase64 = (await fs.readFile(photoPath)).toString('base64');
      const html = buildStoryHTML(photoBase64, s.caption, hl.accent, hl.label);
      const outFile = path.join(outDir, `${hl.slug}-story-0${i + 1}.jpg`);
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: outFile, type: 'jpeg', quality: 92 });
      console.log(`  ✓ story-0${i + 1}: ${s.file}`);
      total++;
    }
  }

  await browser.close();
  console.log(`\n${total} stories en campaigns/plan-crecimiento-10k/highlights/stories/`);
}

render().catch(e => { console.error(e); process.exit(1); });
