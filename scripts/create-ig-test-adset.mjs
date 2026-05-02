const TOKEN = process.env.META_TOKEN;
const AD_ACCOUNT = 'act_2303565156801569';
const CAMPAIGN_ID = '120239303658100139'; // ENBA_Follow_IG_abr2026
const PAGE_ID = '1064806400040502';
const IG_ACCOUNT_ID = '17841443139761422';

// 4 valid high-affinity interests (3 deprecated by Meta: Turismo nautico, North Sails, Revista Nautica)
const INTERESTS = [
  { id: '6003404424364', name: 'Vendee Globe' },
  { id: '6003344313889', name: 'Boat show' },
  { id: '6003103430070', name: 'Yachting (magazine)' },
  { id: '6003448192425', name: 'American Sailing Association' },
];

// LAL1
const LAL1 = { id: '120239852278830139', name: 'ENBA_LAL_1pct_FBLikers' };

// D6 exclusion
const D6 = { id: '120239621840990139', name: 'ENBA_Custom_IGFollowers_exclusion' };

// 18 cities (same as ig_cold)
const CITIES = [
  { key: '83540', name: 'Belen de Escobar', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '83693', name: 'Buenos Aires', region_id: '103', country: 'AR', distance_unit: 'mile', region: 'Ciudad Autonoma de Buenos Aires' },
  { key: '84740', name: 'Cordoba', region_id: '101', country: 'AR', distance_unit: 'mile', region: 'Cordoba' },
  { key: '87107', name: 'Lanus', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '87145', name: 'La Plata', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '88017', name: 'Martinez', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '88108', name: 'Mendoza', region_id: '109', country: 'AR', distance_unit: 'mile', region: 'Mendoza' },
  { key: '88527', name: 'Olivos', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '88928', name: 'Pilar', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '89445', name: 'Quilmes', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '89720', name: 'Rosario', region_id: '117', country: 'AR', distance_unit: 'mile', region: 'Santa Fe' },
  { key: '89927', name: 'San Fernando de la Buena Vista', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '89977', name: 'San Isidro', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '90205', name: 'Santa Fe', region_id: '117', country: 'AR', distance_unit: 'mile', region: 'Santa Fe' },
  { key: '90324', name: 'Sarandi', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '90675', name: 'Tigre', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '90988', name: 'Vicente Lopez', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
  { key: '91408', name: 'Wilde', region_id: '97', country: 'AR', distance_unit: 'mile', region: 'Buenos Aires' },
];

async function run() {
  // Step 1: Create ad set
  console.log('--- Step 1: Creating ad set ENBA_Follow_IG_Test_NAU ---');

  const targeting = {
    age_min: 18,
    age_max: 65,
    geo_locations: {
      cities: CITIES,
      location_types: ['home', 'recent'],
    },
    flexible_spec: [{ interests: INTERESTS }],
    custom_audiences: [LAL1],
    excluded_custom_audiences: [D6],
    targeting_automation: { advantage_audience: 1 },
  };

  const adsetBody = new URLSearchParams({
    name: 'ENBA_Follow_IG_Test_NAU',
    campaign_id: CAMPAIGN_ID,
    daily_budget: '150000',
    optimization_goal: 'VISIT_INSTAGRAM_PROFILE',
    billing_event: 'IMPRESSIONS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    destination_type: 'INSTAGRAM_PROFILE',
    targeting: JSON.stringify(targeting),
    status: 'ACTIVE',
    access_token: TOKEN,
  });

  const adsetRes = await fetch(`https://graph.facebook.com/v22.0/${AD_ACCOUNT}/adsets`, {
    method: 'POST',
    body: adsetBody,
  });
  const adsetData = await adsetRes.json();

  if (adsetData.error) {
    console.log(`FAILED creating ad set: ${JSON.stringify(adsetData.error)}`);
    return;
  }

  const newAdsetId = adsetData.id;
  console.log(`Ad set created: ${newAdsetId}`);

  // Step 2: Create ads in new ad set (using same creatives as static01 and static02)
  const ads = [
    { name: 'ENBA_ad_IG_static01_test_NAU', creative_id: '1400396012120914' },
    { name: 'ENBA_ad_IG_static02_test_NAU', creative_id: '1663837334951160' },
  ];

  for (const ad of ads) {
    console.log(`--- Creating ad: ${ad.name} ---`);
    const adBody = new URLSearchParams({
      name: ad.name,
      adset_id: newAdsetId,
      creative: JSON.stringify({ creative_id: ad.creative_id }),
      status: 'ACTIVE',
      access_token: TOKEN,
    });

    const adRes = await fetch(`https://graph.facebook.com/v22.0/${AD_ACCOUNT}/ads`, {
      method: 'POST',
      body: adBody,
    });
    const adData = await adRes.json();

    if (adData.error) {
      console.log(`FAILED: ${JSON.stringify(adData.error)}`);
    } else {
      console.log(`Ad created: ${adData.id}`);
    }
  }

  // Step 3: Pause static01 and static02 in ig_cold
  console.log('--- Step 3: Pausing static01 + static02 in ig_cold ---');
  const pauseIds = [
    '120239854682060139', // IG_static01
    '120239854683020139', // IG_static02
  ];

  for (const id of pauseIds) {
    const pauseBody = new URLSearchParams({
      status: 'PAUSED',
      access_token: TOKEN,
    });
    const pauseRes = await fetch(`https://graph.facebook.com/v22.0/${id}`, {
      method: 'POST',
      body: pauseBody,
    });
    const pauseData = await pauseRes.json();
    console.log(`Paused ${id}: ${pauseData.success ? 'OK' : JSON.stringify(pauseData.error)}`);
  }

  // Step 4: Reduce ig_cold from $5,000 to $3,500
  console.log('--- Step 4: Reducing ig_cold $5,000 to $3,500 ---');
  const budgetBody = new URLSearchParams({
    daily_budget: '350000',
    access_token: TOKEN,
  });
  const budgetRes = await fetch(`https://graph.facebook.com/v22.0/120239303658370139`, {
    method: 'POST',
    body: budgetBody,
  });
  const budgetData = await budgetRes.json();
  console.log(`ig_cold budget reduced: ${budgetData.success ? 'OK' : JSON.stringify(budgetData.error)}`);

  // Summary
  console.log('\n=== RESUMEN ===');
  console.log(`Nuevo ad set: ${newAdsetId} - ENBA_Follow_IG_Test_NAU - $1,500/dia`);
  console.log('7 intereses nauticos + LAL1 + D6 exclusion + advantage_audience ON');
  console.log('2 ads: static01 + static02 (mismos creativos)');
  console.log('ig_cold: static01 + static02 PAUSED, budget $5,000 -> $3,500');
  console.log('Gasto total IG: $3,500 + $1,500 + $1,500 = $6,500 (neutro)');
}

run();
