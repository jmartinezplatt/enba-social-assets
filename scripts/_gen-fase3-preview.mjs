import fs from 'node:fs';

const ASSET = 'file:///C:/Users/josea/enba-redes/asset-bank/';
// Logo oficial — 03-LOGOS-BASE/ENBA-horizontal-oscuro.svg embebido como base64
const LOCKUP = 'data:image/svg+xml;base64,PHN2ZyBpZD0iaC1kYXJrIiB3aWR0aD0iMTAwJSIgdmlld0JveD0iMCAwIDQ0MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICAgICAgICA8bGluZSB4MT0iMzQiIHkxPSI2IiB4Mj0iMzQiIHkyPSI2MiIgc3Ryb2tlPSIjNGRiOGEwIiBzdHJva2Utd2lkdGg9IjEuOCIvPg0KICAgICAgICAgIDxwYXRoIGQ9Ik0zNCA4IEwxMiA1NiBMMzQgNTYgWiIgZmlsbD0iIzRkYjhhMCIgb3BhY2l0eT0iMC45Ii8+DQogICAgICAgICAgPHBhdGggZD0iTTM0IDIwIEw1MiA1MiBMMzQgNTIgWiIgZmlsbD0iIzNhOWZkNCIgb3BhY2l0eT0iMC43NSIvPg0KICAgICAgICAgIDxwYXRoIGQ9Ik02IDY1IFExNCA2MCAyMiA2NSBRMzAgNzAgMzggNjUgUTQ2IDYwIDU0IDY1IFE1OSA2OCA2MyA2NSIgc3Ryb2tlPSIjNGRiOGEwIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+DQogICAgICAgICAgPGxpbmUgeDE9Ijc0IiB5MT0iMTIiIHgyPSI3NCIgeTI9IjY4IiBzdHJva2U9InJnYmEoNzcsMTg0LDE2MCwwLjI1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+DQogICAgICAgICAgPHRleHQgeD0iODYiIHk9IjM4IiBmb250LWZhbWlseT0iJ1Rla28nLCdCZWJhcyBOZXVlJyxzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjZThlZGYyIiBsZXR0ZXItc3BhY2luZz0iMyI+RVNQQUNJTyBOw4FVVElDTyBCc0FzPC90ZXh0Pg0KICAgICAgICAgIDxjaXJjbGUgY3g9Ijg4IiBjeT0iNTciIHI9IjIuNSIgZmlsbD0iIzRkYjhhMCIvPg0KICAgICAgICAgIDx0ZXh0IHg9Ijk4IiB5PSI2MiIgZm9udC1mYW1pbHk9IidCYXJsb3cgQ29uZGVuc2VkJyxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iMzAwIiBmaWxsPSJyZ2JhKDIzMiwyMzcsMjQyLDAuNCkiIGxldHRlci1zcGFjaW5nPSIyLjUiPjM0wrAzNidTIMK3IDU4wrAyMidPPC90ZXh0Pg0KICAgICAgICA8L3N2Zz4=';

// Franja opacity: 0.68 (was 0.85) — más transparente, imagen respira más
// Safe zone META Stories: top 270px + bottom 380px dead zone (de 1920px total)
// Franja: top=1080px, height=460px → bottom edge = 1540px from top = 380px from bottom (límite exacto safe zone)
// Logo: dentro de la franja, en la parte baja → siempre dentro de safe zone

const stories = [
  { id:'f3-01-manana', day:1,  slot:'manana', file:'buenos-aires-paisaje/brand-skyline-manifesto.jpg',            text:'¿Cómo se ve Buenos Aires desde el río?' },
  { id:'f3-02-noche',  day:1,  slot:'noche',  file:'destinos/B40D4C02-D46F-42D6-A0EA-EDCD5209A3A7.jpg',           text:'Hoy alguien lo vio por primera vez. Mañana podés ser vos.' },
  { id:'f3-03-manana', day:2,  slot:'manana', file:'escuela-aprendizaje/647573CC-55EF-44BF-8736-86A0A3F811D5.jpg', text:'No hace falta saber nada. Cero.' },
  { id:'f3-04-noche',  day:2,  slot:'noche',  file:'escuela-aprendizaje/3B79333A-4296-4AB7-A4B6-4FEE8D59FE89.jpg', text:'La primera vez siempre te cambia algo.' },
  { id:'f3-05-manana', day:3,  slot:'manana', file:'grupos-experiencia/FE3B5406-513A-4CE4-BF72-3BFD2617BD9A.jpg',  text:'Con tus amigos. Con tu pareja. El río recibe a todos.' },
  { id:'f3-06-noche',  day:3,  slot:'noche',  file:'grupos-experiencia/79CB395F-9592-413C-B54A-BB5BE6AF53EC.jpg',  text:'Algunas salidas se convierten en planes fijos.' },
  { id:'f3-07-manana', day:4,  slot:'manana', file:'travesias-navegacion/1e3b0841-74c1-4d19-baa4-328dd67b57dc.jpg',text:'Salís. Navegás. Volvés distinto.' },
  { id:'f3-08-noche',  day:4,  slot:'noche',  file:'buenos-aires-paisaje/41507763-A3F3-4BCD-BEB7-2686A81B4656.jpg',text:'Tres horas que se sienten como tres días.' },
  { id:'f3-09-manana', day:5,  slot:'manana', file:'destinos/47BCD95D-61A3-4A35-9AF6-41C11FBFAD74.jpg',            text:'A cuatro horas de Buenos Aires. Sin subir a un avión.' },
  { id:'f3-10-noche',  day:5,  slot:'noche',  file:'destinos/destino-martin-garcia.jpg',                           text:'Hay una isla esperándote en el río.' },
  { id:'f3-11-manana', day:6,  slot:'manana', file:'destinos/IMG_5259.jpg',                                        text:'Empezás desde cero. Terminás con rumbo propio.' },
  { id:'f3-12-noche',  day:6,  slot:'noche',  file:'grupos-experiencia/IMG_1556.jpg',                             text:'La náutica no se aprende en un libro.' },
  { id:'f3-13-manana', day:7,  slot:'manana', file:'escuela-aprendizaje/366F1B75-E7D7-4CBF-B986-BDFBCBAD024A.jpg', text:'El río no te pide CV. Solo ganas.' },
  { id:'f3-14-noche',  day:7,  slot:'noche',  file:'escuela-aprendizaje/5FF3E0FE-6586-44BE-BB9F-FC3324E29155.jpg', text:'Cada travesía suma tripulantes para la próxima.' },
  { id:'f3-15-manana', day:8,  slot:'manana', file:'buenos-aires-paisaje/635BFF82-D671-4C82-9E02-A0F84474388C.jpg',text:'Costanera Norte, frente al Aeroparque. A 20 minutos de Palermo.' },
  { id:'f3-16-noche',  day:8,  slot:'noche',  file:'travesias-navegacion/0d66ea8a-47e5-4f5d-be7f-00eeed870d3d.jpg',text:'Salís de la ciudad sin salir de la ciudad.' },
  { id:'f3-17-manana', day:9,  slot:'manana', file:'travesias-navegacion/1ab2a95b-753a-45f5-818c-f8ed6e09f564.jpg',text:'El único paso que falta es el primero.' },
  { id:'f3-18-noche',  day:9,  slot:'noche',  file:'buenos-aires-paisaje/6e603539-0564-4622-bf77-c1a006a3a114.jpg',text:'El río está ahí. La pregunta es cuándo.' },
  { id:'f3-19-manana', day:10, slot:'manana', file:'destinos/duo-cockpit-sunset-celular-rio.jpg',                  text:'Tu próxima salida empieza con un mensaje.' },
  { id:'f3-20-noche',  day:10, slot:'noche',  file:'destinos/IMG_1645.jpg',                                        text:'Escribinos. Contamos los cupos con los dedos.' },
];

function escQ(s) { return s.replace(/'/g, "\\'"); }

// Scale: 270x480 = 1/4 of 1080x1920
// Franja en original: top=1080px, height=460px → en preview: top=270px, height=115px
// Logo dentro de franja, bottom: 8px from franja bottom → en preview
// En original: logo width=280px, height=44px, bottom=14px from franja bottom
const cards = stories.map(s => {
  const lbl = (s.slot === 'manana' ? 'Mañana' : 'Noche') + ' · Día ' + s.day;
  const url = ASSET + s.file;
  return `
  <div class="card" onclick="openFull('${escQ(url)}','${escQ(s.text)}')">
    <div class="story" style="background-image:url('${url}')">
      <div class="ot"></div>
      <div class="franja">
        <div class="st">${s.text}</div>
        <img class="logo" src="${LOCKUP}" alt="ENBA">
      </div>
    </div>
    <div class="lbl">${lbl}</div>
  </div>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Preview Fase 3</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0d1117; color: #e6edf3; font-family: -apple-system, sans-serif; padding: 16px; }
h1 { text-align: center; font-size: 0.9rem; color: #8b949e; margin-bottom: 16px; font-weight: 400; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, 270px); gap: 14px; justify-content: center; }
.card { cursor: pointer; }
.card:hover .story { outline: 2px solid #58a6ff; }

/* Preview card: 270×480 (9:16) */
.story { width:270px; height:480px; position:relative; overflow:hidden;
  background-size:cover; background-position:center; background-color:#0A1520; border-radius:6px; }
.ot { position:absolute; top:0; left:0; right:0; height:100px;
  background:linear-gradient(to bottom,rgba(10,21,32,.25),rgba(10,21,32,0)); }

/* Franja: de y=270px (56.25% de 480) a y=385px — bottom edge exacto al límite safe zone */
.franja { position:absolute; top:270px; left:0; right:0; height:115px;
  background:rgba(13,43,78,0.68);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  padding:10px 18px 8px; }
.st { font-family:'Barlow Semi Condensed',Arial,sans-serif; font-size:13px; font-weight:600;
  color:#fff; line-height:1.25; text-align:center; }
.logo { width:70px; opacity:0.75; display:block; flex-shrink:0; }

.lbl { text-align:center; font-size:0.68rem; color:#484f58; margin-top:5px; }

/* Lightbox: 405×720 (~37.5% del real) */
#lb { display:none; position:fixed; inset:0; background:rgba(0,0,0,.93); z-index:100;
  align-items:center; justify-content:center; }
#lb.open { display:flex; }
#lbi { width:405px; height:720px; position:relative; overflow:hidden;
  background-size:cover; background-position:center; background-color:#0A1520; border-radius:10px; }
#lbot { position:absolute; top:0; left:0; right:0; height:150px;
  background:linear-gradient(to bottom,rgba(10,21,32,.25),rgba(10,21,32,0)); }
#lbf { position:absolute; top:405px; left:0; right:0; height:173px;
  background:rgba(13,43,78,0.68);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;
  padding:14px 27px 10px; }
#lbt { font-family:'Barlow Semi Condensed',Arial,sans-serif; font-size:20px; font-weight:600;
  color:#fff; line-height:1.25; text-align:center; }
#lblogo { width:105px; opacity:0.75; display:block; }
#lbc { position:fixed; top:16px; right:16px; background:rgba(0,0,0,.7); color:#fff;
  border:none; font-size:1.4rem; width:36px; height:36px; border-radius:50%; cursor:pointer; }

/* Safe zone overlay hint en lightbox */
#lbsz-top { position:absolute; top:0; left:0; right:0; height:101px;
  border-bottom:1px dashed rgba(255,200,0,.35); pointer-events:none; }
#lbsz-bot { position:absolute; bottom:0; left:0; right:0; height:143px;
  border-top:1px dashed rgba(255,200,0,.35); pointer-events:none; }
</style>
</head>
<body>
<h1>Fase 3 "Esto vivís" — 20 stories · Clic = lightbox a escala real · líneas amarillas = dead zone META</h1>
<div class="grid">${cards}</div>

<div id="lb" onclick="if(event.target===this)closeLb()">
  <div id="lbi">
    <div id="lbot"></div>
    <div id="lbf">
      <div id="lbt"></div>
      <img id="lblogo" src="${LOCKUP}" alt="ENBA">
    </div>
    <div id="lbsz-top"></div>
    <div id="lbsz-bot"></div>
  </div>
  <button id="lbc" onclick="closeLb()">×</button>
</div>

<script>
function openFull(url, text) {
  document.getElementById('lbi').style.backgroundImage = "url('" + url + "')";
  document.getElementById('lbt').textContent = text;
  document.getElementById('lb').classList.add('open');
}
function closeLb() { document.getElementById('lb').classList.remove('open'); }
</script>
</body>
</html>`;

fs.writeFileSync('C:/Users/josea/enba-redes/campaigns/plan-crecimiento-10k/preview-fase3-stories.html', html, 'utf8');
console.log('OK — preview-fase3-stories.html actualizado');
