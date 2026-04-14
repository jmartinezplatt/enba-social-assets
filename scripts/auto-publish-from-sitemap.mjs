#!/usr/bin/env node

/**
 * ENBA Auto-Publisher: Genera posts desde el sitemap del sitio web
 *
 * Lee las URLs del sitio (blog, veleros, destinos) y genera variantes
 * de posts para cada red social usando Claude API.
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sk-xxx node social-media/automatizaciones/auto-publish-from-sitemap.mjs
 *
 * Opciones:
 *   --dry-run    Solo muestra los posts generados sin publicar
 *   --type blog  Solo procesa un tipo de contenido (blog, veleros, destinos)
 */

const SITEMAP_URLS = {
  blog: [
    { url: '/blog/travesia-colonia-velero', title: 'Travesia a Colonia del Sacramento en velero', type: 'travesia' },
    { url: '/blog/como-obtener-carnet-timonel', title: 'Como obtener el carnet de timonel', type: 'escuela' },
    { url: '/blog/guia-veleros-principiantes', title: 'Guia de veleros para principiantes', type: 'embarcaciones' },
    { url: '/blog/navegar-rio-plata-seguro', title: 'Navegar el Rio de la Plata de forma segura', type: 'educativo' },
    { url: '/blog/delta-parana-velero', title: 'El Delta del Parana en velero', type: 'travesia' },
    { url: '/blog/historia-nautica-buenos-aires', title: 'Historia de la nautica en Buenos Aires', type: 'educativo' },
    { url: '/blog/preparar-velero-travesia', title: 'Como preparar tu velero para una travesia', type: 'servicio_tecnico' },
    { url: '/blog/isla-martin-garcia-velero', title: 'Isla Martin Garcia: navegando la historia', type: 'travesia' },
    { url: '/blog/meteorologia-basica-navegantes', title: 'Meteorologia basica para navegantes', type: 'educativo' },
  ],
  veleros: [
    { url: '/veleros-en-venta/masti', title: 'Masti - Velero en venta', type: 'embarcaciones' },
    { url: '/veleros-en-venta/brama', title: 'Brama - Velero en venta', type: 'embarcaciones' },
    { url: '/veleros-en-venta/marejada', title: 'Marejada - Velero en venta', type: 'embarcaciones' },
    { url: '/veleros-en-venta/brisa', title: 'Brisa - Velero en venta', type: 'embarcaciones' },
  ],
  destinos: [
    { url: '/travesias/colonia-del-sacramento', title: 'Travesia a Colonia del Sacramento', type: 'travesia' },
    { url: '/travesias/carmelo', title: 'Travesia a Carmelo', type: 'travesia' },
    { url: '/travesias/delta', title: 'Travesia al Delta del Parana', type: 'travesia' },
    { url: '/travesias/isla-martin-garcia', title: 'Travesia a Isla Martin Garcia', type: 'travesia' },
    { url: '/travesias/riachuelo', title: 'Travesia a Riachuelo', type: 'travesia' },
    { url: '/travesias/juan-lacaze', title: 'Travesia a Juan Lacaze', type: 'travesia' },
    { url: '/travesias/mar-del-plata', title: 'Travesia a Mar del Plata', type: 'travesia' },
  ],
};

const SYSTEM_PROMPT = `Sos el agente de redes sociales de Espacio Nautico Buenos Aires (ENBA),
un negocio nautico integral con base en Puerto Norte, frente al Aeroparque Jorge Newbery,
Ciudad de Buenos Aires, Argentina.

Tu voz narradora es profesional, apasionada y con caracter femenino: segura, calida, directa.
Escribis en espanol rioplatense (vos, sos, tenes). Maximo 2-3 emojis por post.
CTA claro y elegante al final.

REGLAS CRITICAS:
- Nunca publicas precios exactos
- Nunca confirmas fechas o disponibilidad
- Nunca decis "Puerto Madero" (es Puerto Norte)
- Nunca usas tono sensacionalista

Las 4 lineas de servicio son:
1. Compra, venta y alquiler de embarcaciones
2. Escuela de navegacion y vela
3. Turismo y excursiones nauticas (travesias nacionales e internacionales)
4. Servicio tecnico a embarcaciones

Destinos nacionales: Arroyos del Delta, Isla Martin Garcia, Mar del Plata.
Destinos internacionales: Colonia del Sacramento, Carmelo, Riachuelo, Juan Lacaze.

Salidas todos los dias. Minimo 3 pasajeros por embarcacion.
Formas de pago: transferencia, efectivo, tarjeta (1 pago y cuotas consultar).
Valores + IVA. Factura A y B.`;

const BASE_URL = 'https://www.espacionautico.com.ar';

async function generatePosts(item) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY no configurada');
    process.exit(1);
  }

  const prompt = `Genera 3 variantes de post para promocionar este contenido del sitio web de ENBA:

Titulo: ${item.title}
URL: ${BASE_URL}${item.url}
Tipo de contenido: ${item.type}

Genera exactamente 3 variantes en formato JSON:
{
  "instagram": {
    "caption": "...(80-150 palabras, aspiracional, estetico)...",
    "hashtags": "...(max 10 hashtags relevantes)..."
  },
  "facebook": {
    "caption": "...(hasta 200 palabras, informativo, incluir link y formas de pago si aplica)..."
  },
  "tiktok": {
    "caption": "...(max 80 palabras, gancho en primeras 2 lineas, 3-5 hashtags)...",
    "video_idea": "...(brief de 1 linea para el video)..."
  }
}

Responde SOLO con el JSON, sin texto adicional.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;

    // Extraer JSON del response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error(`Error generando posts para ${item.title}:`, error.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const typeFilter = args.includes('--type') ? args[args.indexOf('--type') + 1] : null;

  console.log('===========================================');
  console.log('  ENBA Auto-Publisher desde Sitemap');
  console.log('  Espacio Nautico Buenos Aires');
  console.log('===========================================\n');

  if (dryRun) {
    console.log('MODO: Dry run (no se publica nada)\n');
  }

  const categories = typeFilter ? [typeFilter] : Object.keys(SITEMAP_URLS);
  const allPosts = [];

  for (const category of categories) {
    const items = SITEMAP_URLS[category];
    if (!items) {
      console.error(`Categoria no encontrada: ${category}`);
      continue;
    }

    console.log(`\n--- Procesando: ${category.toUpperCase()} (${items.length} items) ---\n`);

    for (const item of items) {
      console.log(`Generando posts para: ${item.title}`);
      const posts = await generatePosts(item);

      if (posts) {
        allPosts.push({
          source: item,
          posts,
          generated_at: new Date().toISOString(),
        });

        if (dryRun) {
          console.log('\n  Instagram:', posts.instagram?.caption?.substring(0, 80) + '...');
          console.log('  Facebook:', posts.facebook?.caption?.substring(0, 80) + '...');
          console.log('  TikTok:', posts.tiktok?.caption?.substring(0, 80) + '...');
          console.log('');
        }
      }

      // Rate limiting: esperar 1 segundo entre requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Guardar resultado
  const outputPath = new URL('./generated-posts.json', import.meta.url).pathname;
  const fs = await import('fs');
  fs.writeFileSync(outputPath, JSON.stringify(allPosts, null, 2));
  console.log(`\nPosts generados guardados en: ${outputPath}`);
  console.log(`Total: ${allPosts.length} sets de posts (${allPosts.length * 3} posts individuales)`);

  if (!dryRun) {
    console.log('\nPara publicar, conecta este script con los flujos de n8n');
    console.log('o importa el JSON en Google Sheets para aprobacion.');
  }
}

main().catch(console.error);
