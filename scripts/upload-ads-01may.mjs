import { execSync } from 'child_process';

const token = execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN','User')"`)
  .toString().trim();

const adAccountId = 'act_2303565156801569';
const pageId = '1064806400040502';
const igUserId = '17841443139761422';
const igColdAdSet = '120239303658370139';
const fbColdAdSet = '120239303659650139';

const igAdText = `⛵ Navegar el Río de la Plata no es algo que se cuente — se vive.\nSalimos desde Costanera Norte, frente al Aeroparque. Venís? 😎\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #VelerosBuenosAires #SalidaDistinta`;

const fbCaption1 = `No hace falta que el día sea perfecto para que la experiencia lo sea. ⛵\n\nCuando el viento sopla fuerte y las nubes pintan el cielo, el río se siente de verdad. Sin filtros, sin postal armada — vos, la vela y Buenos Aires desde un ángulo que muy pocos conocen. 🌊\n\nEn Espacio Náutico Buenos Aires salimos a navegar desde Costanera Norte, frente al Aeroparque. Veleros reales, tripulaciones reales, experiencias que no se encuentran Googleando.\n\nSi estás buscando un plan que no sea siempre lo mismo, hablemos 💬\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #SalidaDistinta #PlanesBuenosAires`;

const fbCaption2 = `Hay conversaciones que solo pasan arriba de un velero. ⛵\n\nEsas donde el río abierto, el viento en la vela y el skyline de fondo hacen que todo fluya distinto. Sin apuro, sin pantallas, con la gente que elegís. 🤙\n\nEn ENBA organizamos navegaciones accesibles desde Costanera Norte para que vos y tu grupo vivan algo que no se repite. No necesitás experiencia previa — solo ganas de probar algo diferente.\n\nSeguinos y visitá nuestra web para ver más y sumarte 👇\n\nespacionautico.com.ar/paseos-en-velero-buenos-aires\n\n#EspacioNautico #ENBA #NavegaElRioDeLaPlata #ExperienciasBuenosAires #PlanDePareja`;

async function api(endpoint, body) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    params.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
  }
  params.append('access_token', token);
  const res = await fetch(`https://graph.facebook.com/v22.0/${endpoint}`, { method: 'POST', body: params });
  const data = await res.json();
  if (data.error) throw new Error(`${endpoint}: ${data.error.message}`);
  return data;
}

async function createCreativeAndAd(name, adSetId, storySpec) {
  console.log(`Creating creative: ${name}`);
  const creative = await api(`${adAccountId}/adcreatives`, {
    name,
    object_story_spec: storySpec
  });
  console.log(`  Creative ID: ${creative.id}`);

  console.log(`Creating ad: ${name}`);
  const ad = await api(`${adAccountId}/ads`, {
    name,
    adset_id: adSetId,
    creative: { creative_id: creative.id },
    status: 'ACTIVE'
  });
  console.log(`  Ad ID: ${ad.id}`);
  return { creativeId: creative.id, adId: ad.id };
}

(async () => {
  const results = {};

  // IG-static-01
  results.ig1 = await createCreativeAndAd('ENBA_ad_IG_static01_01may', igColdAdSet, {
    page_id: pageId,
    instagram_user_id: igUserId,
    link_data: {
      link: 'https://www.instagram.com/espacionauticobsas/',
      message: igAdText,
      image_hash: 'ca7be297c2cbda64f918e14f27ebd79c',
      call_to_action: { type: 'VIEW_INSTAGRAM_PROFILE', value: { link: 'https://www.instagram.com/espacionauticobsas/' } }
    }
  });

  // IG-static-02
  results.ig2 = await createCreativeAndAd('ENBA_ad_IG_static02_01may', igColdAdSet, {
    page_id: pageId,
    instagram_user_id: igUserId,
    link_data: {
      link: 'https://www.instagram.com/espacionauticobsas/',
      message: igAdText,
      image_hash: 'e54b1862434514382c651b3a80553bfa',
      call_to_action: { type: 'VIEW_INSTAGRAM_PROFILE', value: { link: 'https://www.instagram.com/espacionauticobsas/' } }
    }
  });

  // FB-static-01
  results.fb1 = await createCreativeAndAd('ENBA_ad_FB_static01_01may', fbColdAdSet, {
    page_id: pageId,
    link_data: {
      link: 'https://www.facebook.com/espacionauticobsas',
      message: fbCaption1,
      image_hash: 'd9db267623af083fb6dca12765faeb56',
      call_to_action: { type: 'LIKE_PAGE', value: { page: pageId } }
    }
  });

  // FB-static-02
  results.fb2 = await createCreativeAndAd('ENBA_ad_FB_static02_01may', fbColdAdSet, {
    page_id: pageId,
    link_data: {
      link: 'https://www.facebook.com/espacionauticobsas',
      message: fbCaption2,
      image_hash: 'fe7427d3c1a2fe33958002eb8b01baa8',
      call_to_action: { type: 'LIKE_PAGE', value: { page: pageId } }
    }
  });

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
})();
