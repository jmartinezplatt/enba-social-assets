#!/usr/bin/env node
// Stories Fase 3 — "Esto vivís" — 20 stories (2/día × 10 días)
// Slots: manana (09:00) + noche (20:00) ART
// Nuevo template: franja navy #0D2B4E 85% opacidad en tercio inferior
// Output: campaigns/plan-crecimiento-10k/highlights/stories/fase3/
//
// ANTES DE RENDERIZAR: completar el campo `file` de cada story con la
// ruta relativa desde asset-bank/ (incluir subcarpeta).
// Ej: 'grupos-experiencia/IMG_1556.jpg'
// Usar preview-fase3-candidatas.html para selección visual con Jose.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, '..');
const assetBank = path.join(repoRoot, 'asset-bank');
const outDir    = path.join(repoRoot, 'campaigns', 'plan-crecimiento-10k', 'highlights', 'stories', 'fase3');

// 20 stories — arco emocional "Esto vivís"
// campo `file`: ruta relativa desde asset-bank/ — COMPLETAR ANTES DE RENDERIZAR
// campo `text`: texto overlay aprobado por Sole
// campo `slot`: 'manana' | 'noche'
const fase3Stories = [
  // DÍA 1 — Curiosidad
  { id: 'f3-01-manana', day: 1, slot: 'manana', file: 'buenos-aires-paisaje/brand-skyline-manifesto.jpg', text: '¿Cómo se ve Buenos Aires desde el río?' },
  { id: 'f3-02-noche',  day: 1, slot: 'noche',  file: 'destinos/B40D4C02-D46F-42D6-A0EA-EDCD5209A3A7.jpg', text: 'Hoy alguien lo vio por primera vez. Mañana podés ser vos.' },

  // DÍA 2 — Barrera ("no sé nada")
  { id: 'f3-03-manana', day: 2, slot: 'manana', file: 'escuela-aprendizaje/647573CC-55EF-44BF-8736-86A0A3F811D5.jpg', text: 'No hace falta saber nada. Cero.' },
  { id: 'f3-04-noche',  day: 2, slot: 'noche',  file: 'escuela-aprendizaje/3B79333A-4296-4AB7-A4B6-4FEE8D59FE89.jpg', text: 'La primera vez siempre te cambia algo.' },

  // DÍA 3 — El grupo
  { id: 'f3-05-manana', day: 3, slot: 'manana', file: 'grupos-experiencia/FE3B5406-513A-4CE4-BF72-3BFD2617BD9A.jpg', text: 'Con tus amigos. Con tu pareja. El río recibe a todos.' },
  { id: 'f3-06-noche',  day: 3, slot: 'noche',  file: 'grupos-experiencia/79CB395F-9592-413C-B54A-BB5BE6AF53EC.jpg', text: 'Algunas salidas se convierten en planes fijos.' },

  // DÍA 4 — Experiencia concreta
  { id: 'f3-07-manana', day: 4, slot: 'manana', file: 'travesias-navegacion/1e3b0841-74c1-4d19-baa4-328dd67b57dc.jpg', text: 'Salís. Navegás. Volvés distinto.' },
  { id: 'f3-08-noche',  day: 4, slot: 'noche',  file: 'buenos-aires-paisaje/41507763-A3F3-4BCD-BEB7-2686A81B4656.jpg', text: 'Tres horas que se sienten como tres días.' },

  // DÍA 5 — El destino
  { id: 'f3-09-manana', day: 5, slot: 'manana', file: 'destinos/47BCD95D-61A3-4A35-9AF6-41C11FBFAD74.jpg', text: 'A cuatro horas de Buenos Aires. Sin subir a un avión.' },
  { id: 'f3-10-noche',  day: 5, slot: 'noche',  file: 'destinos/destino-martin-garcia.jpg', text: 'Hay una isla esperándote en el río.' },

  // DÍA 6 — Aprendizaje real
  { id: 'f3-11-manana', day: 6, slot: 'manana', file: 'destinos/IMG_5259.jpg', text: 'Empezás desde cero. Terminás con rumbo propio.' },
  { id: 'f3-12-noche',  day: 6, slot: 'noche',  file: 'grupos-experiencia/IMG_1556.jpg', text: 'La náutica no se aprende en un libro.' },

  // DÍA 7 — Comunidad
  { id: 'f3-13-manana', day: 7, slot: 'manana', file: 'escuela-aprendizaje/366F1B75-E7D7-4CBF-B986-BDFBCBAD024A.jpg', text: 'El río no te pide CV. Solo ganas.' },
  { id: 'f3-14-noche',  day: 7, slot: 'noche',  file: 'escuela-aprendizaje/5FF3E0FE-6586-44BE-BB9F-FC3324E29155.jpg', text: 'Cada travesía suma tripulantes para la próxima.' },

  // DÍA 8 — El lugar
  { id: 'f3-15-manana', day: 8, slot: 'manana', file: 'buenos-aires-paisaje/635BFF82-D671-4C82-9E02-A0F84474388C.jpg', text: 'Costanera Norte, frente al Aeroparque. A 20 minutos de Palermo.' },
  { id: 'f3-16-noche',  day: 8, slot: 'noche',  file: 'travesias-navegacion/0d66ea8a-47e5-4f5d-be7f-00eeed870d3d.jpg', text: 'Salís de la ciudad sin salir de la ciudad.' },

  // DÍA 9 — La decisión
  { id: 'f3-17-manana', day: 9, slot: 'manana', file: 'travesias-navegacion/1ab2a95b-753a-45f5-818c-f8ed6e09f564.jpg', text: 'El único paso que falta es el primero.' },
  { id: 'f3-18-noche',  day: 9, slot: 'noche',  file: 'buenos-aires-paisaje/6e603539-0564-4622-bf77-c1a006a3a114.jpg', text: 'El río está ahí. La pregunta es cuándo.' },

  // DÍA 10 — CTA
  { id: 'f3-19-manana', day: 10, slot: 'manana', file: 'destinos/duo-cockpit-sunset-celular-rio.jpg', text: 'Tu próxima salida empieza con un mensaje.' },
  { id: 'f3-20-noche',  day: 10, slot: 'noche',  file: 'destinos/IMG_1645.jpg', text: 'Escribinos. Contamos los cupos con los dedos.' },
];

function buildStoryHTML(photoBase64, text) {
  const photoUrl = 'data:image/jpeg;base64,' + photoBase64;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1920px; overflow: hidden; background: #0A1520; }
  .bg {
    position: absolute; inset: 0;
    background-image: url('${photoUrl}');
    background-size: cover; background-position: center;
  }
  /* Gradiente suave arriba para respirar la foto */
  .overlay-top {
    position: absolute; top: 0; left: 0; right: 0; height: 400px;
    background: linear-gradient(to bottom, rgba(10,21,32,0.25) 0%, rgba(10,21,32,0) 100%);
  }
  /* Franja navy en tercio inferior — firma visual de la serie */
  .franja {
    position: absolute;
    top: 1080px; left: 0; right: 0;
    height: 460px;
    background: rgba(13,43,78,0.68);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 32px;
    padding: 40px 72px 32px;
  }
  .story-text {
    font-family: 'Barlow Semi Condensed', Arial, sans-serif;
    font-size: 54px; font-weight: 600;
    color: #FFFFFF; line-height: 1.25;
    letter-spacing: 0.3px; text-align: center;
  }
  .enba-logo {
    width: 280px; opacity: 0.75; display: block; flex-shrink: 0;
  }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="overlay-top"></div>
  <div class="franja">
    <div class="story-text">${text}</div>
    <img class="enba-logo" src="data:image/svg+xml;base64,PHN2ZyBpZD0iaC1kYXJrIiB3aWR0aD0iMTAwJSIgdmlld0JveD0iMCAwIDQ0MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICAgICAgICA8bGluZSB4MT0iMzQiIHkxPSI2IiB4Mj0iMzQiIHkyPSI2MiIgc3Ryb2tlPSIjNGRiOGEwIiBzdHJva2Utd2lkdGg9IjEuOCIvPg0KICAgICAgICAgIDxwYXRoIGQ9Ik0zNCA4IEwxMiA1NiBMMzQgNTYgWiIgZmlsbD0iIzRkYjhhMCIgb3BhY2l0eT0iMC45Ii8+DQogICAgICAgICAgPHBhdGggZD0iTTM0IDIwIEw1MiA1MiBMMzQgNTIgWiIgZmlsbD0iIzNhOWZkNCIgb3BhY2l0eT0iMC43NSIvPg0KICAgICAgICAgIDxwYXRoIGQ9Ik02IDY1IFExNCA2MCAyMiA2NSBRMzAgNzAgMzggNjUgUTQ2IDYwIDU0IDY1IFE1OSA2OCA2MyA2NSIgc3Ryb2tlPSIjNGRiOGEwIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+DQogICAgICAgICAgPGxpbmUgeDE9Ijc0IiB5MT0iMTIiIHgyPSI3NCIgeTI9IjY4IiBzdHJva2U9InJnYmEoNzcsMTg0LDE2MCwwLjI1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+DQogICAgICAgICAgPHRleHQgeD0iODYiIHk9IjM4IiBmb250LWZhbWlseT0iJ1Rla28nLCdCZWJhcyBOZXVlJyxzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjZThlZGYyIiBsZXR0ZXItc3BhY2luZz0iMyI+RVNQQUNJTyBOw4FVVElDTyBCc0FzPC90ZXh0Pg0KICAgICAgICAgIDxjaXJjbGUgY3g9Ijg4IiBjeT0iNTciIHI9IjIuNSIgZmlsbD0iIzRkYjhhMCIvPg0KICAgICAgICAgIDx0ZXh0IHg9Ijk4IiB5PSI2MiIgZm9udC1mYW1pbHk9IidCYXJsb3cgQ29uZGVuc2VkJyxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iMzAwIiBmaWxsPSJyZ2JhKDIzMiwyMzcsMjQyLDAuNCkiIGxldHRlci1zcGFjaW5nPSIyLjUiPjM0wrAzNidTIMK3IDU4wrAyMidPPC90ZXh0Pg0KICAgICAgICA8L3N2Zz4=" alt="ENBA">
  </div>
</body>
</html>`;
}

async function render() {
  // Verificar que no haya TBDs sin completar
  const pending = fase3Stories.filter(s => s.file === 'TBD');
  if (pending.length > 0) {
    console.error(`\n❌ ${pending.length} stories sin foto asignada:`);
    pending.forEach(s => console.error(`   ${s.id} (día ${s.day} ${s.slot})`));
    console.error('\nCompletá el campo `file` con la ruta relativa desde asset-bank/');
    console.error('Usá preview-fase3-candidatas.html para selección visual.\n');
    process.exit(1);
  }

  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1920 });

  let ok = 0, skipped = 0;
  for (const s of fase3Stories) {
    const photoPath = path.join(assetBank, s.file);
    try { await fs.access(photoPath); } catch {
      console.log(`  SKIP (no encontrado): ${s.file}`);
      skipped++;
      continue;
    }
    const photoBase64 = (await fs.readFile(photoPath)).toString('base64');
    const html = buildStoryHTML(photoBase64, s.text);
    const outFile = path.join(outDir, `${s.id}.jpg`);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: outFile, type: 'jpeg', quality: 92 });
    console.log(`  ✓ ${s.id} — día ${s.day} ${s.slot}`);
    ok++;
  }

  await browser.close();
  console.log(`\n${ok}/20 stories renderizadas en highlights/stories/fase3/`);
  if (skipped > 0) console.log(`${skipped} skipped (asset no encontrado)`);
}

render().catch(e => { console.error(e); process.exit(1); });
