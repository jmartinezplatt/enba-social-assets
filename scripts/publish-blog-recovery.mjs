#!/usr/bin/env node
// Recuperación incidente Gmail 25/04 — publica entrada blog directamente via GitHub API
// Replica exactamente el flujo de HTTP_GitHubGetFile + Code_PrepareGitHubUpdate + HTTP_GitHubUpdateFile
// del workflow ENBA - Blog Automation (BTs8fTGvGqJE3shj)

import https from 'https';
import { execSync } from 'child_process';

const repo = 'jmartinezplatt/enba-web';
const filePath = 'src/data/blog.ts';

function getEnvVar(name) {
  return execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('${name}', 'User')"`, { encoding: 'utf8' }).trim();
}

function ghRequest(token, method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com', path, method,
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'enba-blog-publish',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    const req = https.request(opts, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(Buffer.concat(chunks)) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function escapeStr(v) {
  return String(v || '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function formatStringArray(arr) {
  if (!Array.isArray(arr)) return '[]';
  return '[\n' + arr.map(item => '    `' + escapeStr(item) + '`').join(',\n') + ',\n  ]';
}

function formatFaqs(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return undefined;
  return '[\n' + faqs.map(f =>
    '    { question: `' + escapeStr(f.question) + '`, answer: `' + escapeStr(f.answer) + '` }'
  ).join(',\n') + ',\n  ]';
}

function normalizeLinks(text) {
  if (typeof text !== 'string') return text;
  text = text.replace(/https?:\/\/espacionautico\.com\.ar\/([a-z][a-z-]+)/g, '/$1/');
  text = text.replace(/https?:\/\/www\.espacionautico\.com\.ar\/([a-z][a-z-]+)/g, '/$1/');
  text = text.replace(/\(\/([a-z][a-z-]+)\)/g, '(/$1/)');
  return text;
}

// Post recuperado del exec 15424 (incidente Gmail 25/04)
const post = {
  slug: "opencpn-para-navegantes-recreativos-que-es-y-como-empezar",
  title: "OpenCPN para navegantes recreativos: qué es y cómo empezar a usarlo",
  metaTitle: "OpenCPN: guía para navegantes recreativos",
  metaDescription: "Descubrí qué es OpenCPN, cómo instalarlo y cómo usarlo para navegar con seguridad. La guía práctica de Espacio Náutico Buenos Aires.",
  datePublished: "2026-04-25",
  category: "Navegación",
  readTime: "6 min",
  excerpt: "OpenCPN es uno de los chartplotters de código abierto más populares del mundo. Te contamos qué es, cómo funciona y por qué cada vez más navegantes recreativos lo eligen."
};

// Contenido recuperado de HTTP_ClaudeGeneratePost → Code_ParsePost (exec 15424)
post.content = [
  "## ¿Qué es OpenCPN y por qué cada vez más navegantes lo usan?",
  "En el mundo de la navegación recreativa, contar con buenas herramientas de planificación y seguimiento de ruta puede marcar una diferencia real. OpenCPN es un software de chartplotter y navegación de código abierto, completamente gratuito, que permite visualizar cartas náuticas, trazar rutas, registrar tracks y recibir señales AIS, entre muchas otras funciones. Está disponible para Windows, macOS, Linux e incluso Android, lo que lo convierte en una solución accesible para cualquier navegante, desde el que está dando sus primeros pasos hasta el que acumula miles de millas.",
  "Su comunidad global de desarrollo lo mantiene actualizado de forma constante, y la cantidad de plugins disponibles lo transforma en una plataforma muy versátil. En la [escuela náutica de ENBA](/escuela-nautica/) lo utilizamos como recurso de apoyo en varios de nuestros cursos, porque entendemos que familiarizarse con este tipo de herramientas es parte de la formación integral de un navegante moderno.",
  "## ¿Cómo funciona OpenCPN?",
  "### Cartas náuticas y fuentes de datos",
  "El corazón de OpenCPN son las cartas náuticas. El programa es compatible con cartas en formato raster (como las BSB/KAP) y vectoriales (formato S-57 y S-63). En Argentina, el Servicio de Hidrografía Naval (SHN) ofrece cartas electrónicas que pueden integrarse al software, lo que lo hace especialmente relevante para quienes navegan en el Río de la Plata, el Delta del Paraná o las costas patagónicas.",
  "Una vez cargadas las cartas, OpenCPN permite moverse por ellas con fluidez, hacer zoom, superponer información meteorológica y visualizar la posición del barco en tiempo real si se conecta un receptor GPS, ya sea externo por USB o el integrado de una tablet.",
  "### Planificación de rutas y waypoints",
  "Una de las funciones más usadas es la creación de rutas. Podés marcar waypoints en la carta, definir el orden de paso y el programa calcula automáticamente distancias, rumbos y tiempos estimados de llegada según la velocidad que cargues. Esta herramienta es especialmente útil para planificar travesías con anticipación, algo que trabajamos en detalle en nuestras [travesías organizadas](/travesias/).",
  "### Integración con GPS y AIS",
  "Una de las grandes fortalezas de OpenCPN es su capacidad de conectarse a receptores GPS externos y a transponders AIS. Esto significa que no solo podés ver tu posición en la carta, sino también identificar otros buques en tiempo real, sus rumbos, velocidades y nombres. Para quienes navegan en zonas de tráfico intenso, como la entrada al Río de la Plata, esta función puede ser decisiva para la seguridad.",
  "## Instalación y primeros pasos",
  "### Descarga e instalación",
  "El proceso de instalación es muy sencillo. Desde el sitio oficial de OpenCPN (opencpn.org) se puede descargar el instalador para cualquier sistema operativo. En Windows, el proceso dura menos de cinco minutos. Una vez instalado, el programa te guía para cargar las primeras cartas.",
  "### Dónde conseguir cartas náuticas",
  "Para navegar en Argentina, la fuente principal de cartas es el Servicio de Hidrografía Naval. También existen repositorios de cartas gratuitas para todo el mundo, como OpenSeaMap o las cartas de NOAA para aguas internacionales. OpenCPN tiene un gestor de cartas integrado que facilita mucho este proceso: desde el mismo programa se pueden descargar cartas directamente con unos pocos clics.",
  "### Configuración básica recomendada",
  "Al iniciar por primera vez, conviene configurar las unidades preferidas (nudos, millas náuticas), el tipo de pantalla y las alertas de profundidad si se tiene disponible una carta con batimetría. También es útil activar el rastreo (track), que va grabando la ruta recorrida y permite revisarla después.",
  "## OpenCPN en la práctica: casos de uso reales",
  "### Planificación de una travesía",
  "Antes de salir, podés trazar toda la ruta en OpenCPN, marcar los puntos de referencia clave, identificar zonas de poca profundidad y calcular los tiempos aproximados según las condiciones esperadas. Esta preparación reduce considerablemente la incertidumbre durante la navegación y permite tomar decisiones más informadas en ruta.",
  "### Navegación diurna en el Río de la Plata",
  "Para salidas más cortas, como los [paseos en velero desde Costanera Norte](/paseos-en-velero-buenos-aires/), OpenCPN resulta útil para mantenerse orientado en un río donde la visibilidad de las costas puede ser limitada y los bancos de arena cambian de posición con frecuencia. Tener la carta a mano y la posición GPS actualizada en tiempo real es una ventaja concreta.",
  "### Registro de travesías",
  "OpenCPN permite exportar los tracks recorridos en formato GPX, lo que hace posible guardar un historial de navegaciones y compartirlo. Muchos navegantes usan esta función para documentar sus travesías y también para analizar después el rendimiento del barco.",
  "## Plugins que vale la pena conocer",
  "Uno de los puntos más fuertes de OpenCPN es su ecosistema de plugins. Algunos de los más utilizados en la comunidad de navegación recreativa son:",
  "**WeatherFax:** permite recibir y decodificar faxes meteorológicos via radio SSB directamente en la carta. Muy usado en navegaciones offshore.",
  "**Weatherrouting:** optimiza rutas según el pronóstico meteorológico, calculando la ruta más eficiente o la más segura según el criterio elegido.",
  "**Dashboard:** muestra instrumentos virtuales en pantalla: velocidad, rumbo, profundidad, viento, según los sensores conectados.",
  "**AIS Radar:** mejora la visualización del tráfico AIS con una interfaz tipo radar más intuitiva para zonas de mucho movimiento.",
  "## Limitaciones a tener en cuenta",
  "OpenCPN es una herramienta muy poderosa, pero tiene algunas limitaciones que conviene conocer. Al ser software de código abierto, la interfaz puede resultar menos intuitiva que la de un plotter comercial moderno, especialmente para usuarios sin experiencia previa. La configuración inicial requiere algo de tiempo y disposición para explorar las opciones.",
  "Además, la calidad de las cartas disponibles varía según la zona. En aguas argentinas, las cartas del SHN son confiables y se actualizan con regularidad, pero en zonas remotas puede haber lagunas de información. Por eso, OpenCPN siempre debe usarse como complemento a una buena formación náutica, no como reemplazo de ella.",
  "## OpenCPN y la formación náutica",
  "En ENBA integramos el uso de herramientas digitales como OpenCPN en nuestra [escuela náutica](/escuela-nautica/) porque entendemos que un navegante moderno necesita dominar tanto las técnicas tradicionales como los recursos tecnológicos disponibles. Saber leer una carta en papel y saber usar un chartplotter digital no son habilidades excluyentes: se complementan.",
  "Si estás pensando en aprender a navegar o ya tenés experiencia y querés profundizar en la planificación de travesías, el conocimiento de estas herramientas te va a dar una ventaja real en el agua.",
  "## Conclusión",
  "OpenCPN es una herramienta gratuita, potente y con una comunidad activa que la respalda. Para el navegante recreativo argentino, representa una opción concreta para mejorar la planificación, aumentar la seguridad y disfrutar más de cada salida. Como toda herramienta, su valor depende de cómo se la usa: bien integrada a una buena práctica náutica, marca una diferencia real.",
  "Si tenés preguntas sobre cómo usarlo o querés sumarte a alguna de nuestras [travesías](/travesias/) o [paseos en velero](/paseos-en-velero-buenos-aires/), escribinos por DM o completá el formulario de contacto."
];

post.faqs = [
  { question: "¿OpenCPN funciona en celular?", answer: "Existe una versión para Android llamada OpenCPN para Android, disponible en la Play Store. Funciona bien como complemento, aunque la experiencia más completa es en PC o laptop." },
  { question: "¿Es legal usar OpenCPN en lugar de cartas oficiales?", answer: "OpenCPN es un programa de visualización. La legalidad depende de las cartas que uses: para navegación oficial en Argentina se requieren cartas del SHN. OpenCPN puede usarlas perfectamente." },
  { question: "¿Se puede usar sin GPS?", answer: "Sí, podés usarlo para planificación sin GPS. Para ver tu posición en tiempo real necesitás conectar un receptor GPS externo por USB o Bluetooth, o usar la tablet con GPS integrado." },
  { question: "¿OpenCPN reemplaza al instructor náutico?", answer: "No. Es una herramienta de apoyo. La formación náutica, el criterio de navegación y la toma de decisiones en el agua requieren práctica real con instructores calificados." }
];

const token = getEnvVar('GITHUB_TOKEN');
if (!token) { console.error('GITHUB_TOKEN no encontrado'); process.exit(1); }
console.log('GITHUB_TOKEN: CARGADO');

const getRes = await ghRequest(token, 'GET', '/repos/' + repo + '/contents/' + filePath, null);
if (getRes.status !== 200) { console.error('GET failed:', getRes.status, getRes.body.message); process.exit(1); }

const sha = getRes.body.sha;
const currentContent = Buffer.from(getRes.body.content.replace(/\n/g, ''), 'base64').toString('utf-8');

if (currentContent.includes('"' + post.slug + '"')) {
  console.log('SKIP: slug ya existe en blog.ts —', post.slug);
  process.exit(0);
}

post.content = post.content.map(normalizeLinks);
post.faqs = post.faqs.map(f => ({ question: normalizeLinks(f.question), answer: normalizeLinks(f.answer) }));

const faqsBlock = formatFaqs(post.faqs);
const faqsLine = faqsBlock ? '    faqs: ' + faqsBlock + ',\n' : '';

const newBlock =
  '  {\n' +
  '    slug: "' + post.slug + '",\n' +
  '    title: "' + post.title.replace(/"/g, '\\"') + '",\n' +
  '    metaTitle: "' + post.metaTitle.replace(/"/g, '\\"') + '",\n' +
  '    metaDescription: "' + post.metaDescription.replace(/"/g, '\\"') + '",\n' +
  '    datePublished: "' + post.datePublished + '",\n' +
  '    category: "' + post.category + '",\n' +
  '    readTime: "' + post.readTime + '",\n' +
  '    excerpt: "' + post.excerpt.replace(/"/g, '\\"') + '",\n' +
  '    content: ' + formatStringArray(post.content) + ',\n' +
  faqsLine +
  '  },';

const marker = 'export const blogPosts: BlogPost[] = [';
const insertPos = currentContent.indexOf(marker);
if (insertPos === -1) { console.error('Marker no encontrado en blog.ts'); process.exit(1); }

const updatedContent = currentContent.substring(0, insertPos + marker.length) + '\n' + newBlock + '\n' + currentContent.substring(insertPos + marker.length);
const updatedBase64 = Buffer.from(updatedContent, 'utf-8').toString('base64');

const putRes = await ghRequest(token, 'PUT', '/repos/' + repo + '/contents/' + filePath, {
  message: 'Blog: publicar entrada 25/04 — OpenCPN para navegantes recreativos (recuperación incidente Gmail)',
  content: updatedBase64,
  sha
});

if (putRes.status === 200 || putRes.status === 201) {
  console.log('OK — commit SHA:', putRes.body.commit?.sha);
  console.log('Slug publicado: /blog/' + post.slug);
  console.log('datePublished:', post.datePublished);
} else {
  console.error('PUT failed:', putRes.status, JSON.stringify(putRes.body).substring(0, 300));
  process.exit(1);
}
