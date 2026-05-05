// Evaluate Ads Performance — Code Node para n8n  v5
// Input esperado: Get Ad Insights → Get FB Followers → Get IG Followers
//                 + en paralelo: Get Ad Status Batch → Get Ad Set Budgets → Get Quality Rankings
//                 → [este nodo]
// Accede a nodos previos por nombre. Si alguno falla con continueOnFail,
// los try/catch degradan graciosamente (el email igual llega, sin esa sección).
//
// Plan vigente: presupuesto-v4-reestructuracion.md + presupuesto-v4.1-estado-dia10.md
// CORTAR  (72h+): CPS > $100 ó ER < 1% ó CTR < 0.4%
// WINNER  (72h+): CPS < $30 + ER > 3%
// FATIGUE: frecuencia > 3.5
// MAX_REACHED: > 14 días / FATIGUE_WARNING: >= 10 días
//
// v5 vs v4:
// - effective_status real desde nodo "Get Ad Status Batch": ads pausados → veredicto PAUSED
// - Burn rate real desde nodo "Get Ad Set Budgets": suma budgets activos (no promedio histórico)
// - Quality rankings reales desde nodo "Get Quality Rankings" (no UNKNOWN)
// - Tabla Bruno: ads ACTIVOS separados de PAUSADOS
// - Orquestador al inicio del prompt Bruno: posición, gap, hipótesis falsadas, decisiones pendientes
// - Gate de frescura: si datos > 12h → advertencia en email
// - Timestamp de ejecución en subject del email

// ── Constantes de campaña ──────────────────────────────────────────────
const CAMPAIGN_BUDGET_TOTAL = 500000;               // ARS — presupuesto-v4
const CAMPAIGN_BASELINE_FB  = 23;                   // fans FB al 22/04 (baseline Follow Plan)
const CAMPAIGN_BASELINE_IG  = 11;                   // seguidores IG al 22/04
const CAMPAIGN_START_DATE   = new Date('2026-04-19T03:00:00Z'); // día 1 ART
const CAMPAIGN_END_DATE     = new Date('2026-05-16T03:00:00Z'); // fin plan
const CAMPAIGN_TOTAL_DAYS   = 27;

// ── Input: insights ────────────────────────────────────────────────────
var response;
try {
  response = $('Get Ad Insights').first().json;
} catch(e) {
  // fallback por si se ejecuta en contexto sin nodo nombrado (tests manuales)
  response = $input.first().json;
}
const adsData = response.data || [];

// ── Input: follower counts ─────────────────────────────────────────────
var fbFollowersNow = null;
var igFollowersNow = null;
try {
  var fbData = $('Get FB Followers').first().json;
  fbFollowersNow = parseInt(fbData.fan_count || fbData.followers_count || 0) || null;
} catch(e) {}
try {
  var igData = $('Get IG Followers').first().json;
  igFollowersNow = parseInt(igData.followers_count || 0) || null;
} catch(e) {}

// ── Input: effective_status real (nodo "Get Ad Status Batch") ──────────
// Mapa { ad_id: effective_status } — diferencia activos de pausados sin ambigüedad
// Mapa { adset_id: true } — ad sets que tienen al menos 1 ad ACTIVE
var adStatusMap = {};
var adsetHasActiveAd = {};
try {
  var statusData = $('Get Ad Status Batch').first().json;
  // La API devuelve {data: [{id, effective_status, adset_id, ...}], paging: {...}}
  var statusItems = Array.isArray(statusData.data) ? statusData.data
    : Array.isArray(statusData) ? statusData : [];
  statusItems.forEach(function(item) {
    if (item && item.id) {
      adStatusMap[item.id] = item.effective_status;
      if (item.effective_status === 'ACTIVE' && item.adset_id) {
        adsetHasActiveAd[item.adset_id] = true;
      }
    }
  });
} catch(e) {}

// ── Input: burn rate real (nodo "Get Ad Set Budgets") ──────────────────
// Suma de daily_budget de ad sets con effective_status ACTIVE
var realBurnRate = 0;
var burnRateSource = 'historical_avg';
try {
  var budgetData = $('Get Ad Set Budgets').first().json;
  var budgetItems = Array.isArray(budgetData.data) ? budgetData.data
    : Array.isArray(budgetData) ? budgetData : [];
  budgetItems.forEach(function(adset) {
    // Solo sumar si el ad set esta ACTIVE y tiene al menos 1 ad ACTIVE dentro
    // (operamos pausando a nivel ad, los ad sets quedan siempre ACTIVE)
    if (adset.effective_status === 'ACTIVE' && adsetHasActiveAd[adset.id]) {
      realBurnRate += parseInt(adset.daily_budget || 0) / 100; // Meta devuelve en centavos
    }
  });
  if (realBurnRate > 0) burnRateSource = 'ad_set_budgets';
} catch(e) {}

// ── Input: quality rankings reales (nodo "Get Quality Rankings") ───────
// Mapa { ad_id: { quality_ranking, engagement_rate_ranking, conversion_rate_ranking } }
var qualityMap = {};
try {
  var qualData = $('Get Quality Rankings').first().json;
  var qualItems = Array.isArray(qualData.data) ? qualData.data
    : Array.isArray(qualData) ? qualData : [];
  qualItems.forEach(function(item) {
    if (item && item.ad_id) qualityMap[item.ad_id] = item;
  });
} catch(e) {}

// ── Gate de frescura (12h) ─────────────────────────────────────────────
var freshnessWarning = '';
try {
  var metaHeader = $('Get Ad Insights').first().json._meta;
  if (metaHeader && metaHeader.fetched_at) {
    var insightsAge = (new Date() - new Date(metaHeader.fetched_at)) / (1000 * 60 * 60);
    if (insightsAge >= 12) {
      freshnessWarning = 'DATOS CON ' + Math.round(insightsAge) + 'h DE ANTIGUEDAD — verificar frescura';
    }
  }
} catch(e) {}

// ── Fecha ART ──────────────────────────────────────────────────────────
const now = new Date();
const artNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const dd   = String(artNow.getUTCDate()).padStart(2, '0');
const mm   = String(artNow.getUTCMonth() + 1).padStart(2, '0');
const yyyy = artNow.getUTCFullYear();
const todayStr = dd + '/' + mm + '/' + yyyy;

// ── Mapa campaign_id → tipo ────────────────────────────────────────────
const campaignTypeMap = {
  '120238976548160139': 'AWR',
  '120238976548380139': 'ENG',
  '120238976549000139': 'TRF',
  '120238976549780139': 'LEA',
  '120239303658100139': 'FOLLOW',
  '120239303658190139': 'FOLLOW',
};

// ── Helpers ────────────────────────────────────────────────────────────
function getAction(actions, type) {
  var found = (actions || []).find(function(a) { return a.action_type === type; });
  return found ? parseInt(found.value) : 0;
}

function getFollowsIG(actions) {
  return getAction(actions, 'instagram_follow')
      || getAction(actions, 'omni_instagramapp_follow')
      || getAction(actions, 'follow');
}

function getThruPlays(field) {
  if (!field) return 0;
  if (Array.isArray(field)) {
    var found = field.find(function(a) { return a.action_type === 'video_thruplay_watched'; });
    return found ? parseInt(found.value) : (field.length > 0 ? parseInt(field[0].value) : 0);
  }
  return parseInt(field) || 0;
}

function getDaysActive(createdTime) {
  if (!createdTime) return 0;
  return Math.max(0, Math.floor((now - new Date(createdTime)) / (1000 * 60 * 60 * 24)));
}

function inferCampaignType(campaignId) {
  return campaignTypeMap[campaignId] || 'AWR';
}

function inferPlatform(adName) {
  var n = (adName || '').toLowerCase();
  if (n.includes('_ig_') || n.includes('_ig ') || n.endsWith('_ig')) return 'IG';
  if (n.includes('_fb_') || n.includes('_fb ') || n.endsWith('_fb')) return 'FB';
  return '—';
}

function inferSegment(adName) {
  var n = (adName || '').toLowerCase();
  if (n.includes('retarget')) return 'Retarget';
  if (n.includes('cold'))     return 'Cold';
  return '—';
}

function rankingInfo(val) {
  if (!val || val === 'UNKNOWN' || val === '') return { label: '—', color: '#9ca3af' };
  if (val === 'ABOVE_AVERAGE')    return { label: '▲ TOP', color: '#16a34a' };
  if (val === 'AVERAGE')          return { label: '≈ AVG', color: '#2563eb' };
  if (val === 'BELOW_AVERAGE_10') return { label: '▼ -10%', color: '#ca8a04' };
  if (val === 'BELOW_AVERAGE_20') return { label: '▼ -20%', color: '#ea580c' };
  if (val === 'BELOW_AVERAGE_35') return { label: '▼▼ BOT', color: '#dc2626' };
  return { label: val, color: '#6b7280' };
}

// ── Sin datos ──────────────────────────────────────────────────────────
if (adsData.length === 0) {
  return [{ json: {
    subject: '[ENBA Ads] ' + todayStr + ' — Sin datos de insights',
    html: '<html><body style="font-family:Arial,sans-serif;"><h2>ENBA Meta Ads — Sin datos</h2>'
      + '<p>Fecha: ' + todayStr + '</p>'
      + '<p>Meta no devolvio datos. Los ads pueden llevar menos de unas horas activos.</p>'
      + '</body></html>',
    brunoPrompt: '', totalSpend: 0, adsCount: 0
  } }];
}

// ── Diagnóstico action_types ───────────────────────────────────────────
var diagActionTypes = {};
adsData.forEach(function(ad) {
  (ad.actions || []).forEach(function(a) {
    if (!diagActionTypes[a.action_type]) diagActionTypes[a.action_type] = 0;
    diagActionTypes[a.action_type] += parseInt(a.value) || 0;
  });
});

// ── Procesar cada ad ───────────────────────────────────────────────────
var results = adsData.map(function(ad) {
  var impressions  = parseInt(ad.impressions || 0);
  var reach        = parseInt(ad.reach || 0);
  var spend        = parseFloat(ad.spend || 0);
  var ctr          = parseFloat(ad.ctr || 0);
  var frequency    = parseFloat(ad.frequency || 0);
  var daysActive   = getDaysActive(ad.created_time);
  var campaignType = inferCampaignType(ad.campaign_id);
  var platform     = inferPlatform(ad.ad_name);
  var segment      = inferSegment(ad.ad_name);

  var engagements = getAction(ad.actions, 'post_engagement');
  var er = reach > 0 ? (engagements / reach * 100) : 0;

  var igFollows       = getFollowsIG(ad.actions);
  var igProfileVisits = parseInt(ad.instagram_profile_visits || 0);
  var fbLikes         = getAction(ad.actions, 'like');

  var followSignal = 0;
  var followLabel  = '';
  if (campaignType === 'FOLLOW') {
    if (igFollows > 0) {
      followSignal = igFollows + fbLikes;
      followLabel = 'F:' + igFollows + (fbLikes > 0 ? '/L:' + fbLikes : '');
    } else if (igProfileVisits > 0 || fbLikes > 0) {
      followSignal = igProfileVisits + fbLikes;
      followLabel = 'V:' + igProfileVisits + (fbLikes > 0 ? '/L:' + fbLikes : '');
    } else {
      followLabel = '0';
    }
  } else {
    followLabel = '—';
  }

  var thruPlays    = getThruPlays(ad.video_thruplay_watched_actions);
  var thruPlayRate = impressions > 0 ? (thruPlays / impressions * 100) : 0;

  var videoViews3s = getAction(ad.actions, 'video_view');
  var hookRate     = impressions > 0 ? (videoViews3s / impressions * 100) : 0;
  var holdRate     = videoViews3s > 0 ? (thruPlays / videoViews3s * 100) : 0;
  var isVideoAd    = videoViews3s > 0 || thruPlays > 0;

  var cpm      = impressions > 0 ? (spend / impressions * 1000) : 0;
  var saves    = getAction(ad.actions, 'onsite_conversion.post_net_save');

  var cps    = (campaignType === 'FOLLOW' && followSignal > 0) ? Math.round(spend / followSignal) : null;
  var cpsStr = cps !== null ? '$' + cps : 'N/A';

  // KPI primario por plataforma para el nuevo diseño de email
  var cpv = (campaignType === 'FOLLOW' && platform === 'IG' && igProfileVisits > 0)
    ? Math.round(spend / igProfileVisits) : null;
  var cpf = (campaignType === 'FOLLOW' && platform === 'FB' && fbLikes > 0)
    ? Math.round(spend / fbLikes) : null;
  var kpiStr = cpv !== null ? '$' + cpv + ' / visita'
             : cpf !== null ? '$' + cpf + ' / like'
             : (isVideoAd && videoViews3s > 0) ? 'Hold ' + holdRate.toFixed(0) + '%'
             : cpsStr;

  // Quality rankings desde nodo dedicado (no desde /insights — ese endpoint no los devuelve)
  var qualRank = (qualityMap[ad.ad_id] && qualityMap[ad.ad_id].quality_ranking)
    || ad.quality_ranking || 'UNKNOWN';
  var engRank = (qualityMap[ad.ad_id] && qualityMap[ad.ad_id].engagement_rate_ranking)
    || ad.engagement_rate_ranking || 'UNKNOWN';
  var conRank = (qualityMap[ad.ad_id] && qualityMap[ad.ad_id].conversion_rate_ranking)
    || ad.conversion_rate_ranking || 'UNKNOWN';

  // effective_status real desde API (no el campo status que puede quedar desactualizado)
  var effectiveStatus = adStatusMap[ad.ad_id] || 'UNKNOWN';
  var isCurrentlyActive = effectiveStatus === 'ACTIVE';

  var verdict = 'VIABLE';
  var reasons = [];
  if (!isCurrentlyActive) {
    verdict = 'PAUSED';
    reasons.push('Pausado — solo historial, sin gasto actual');
  } else if (daysActive < 3) {
    verdict = 'LEARNING';
    reasons.push(daysActive + 'd activo, esperar 72h');
  } else if (frequency > 3.5) {
    verdict = 'FATIGUE';
    reasons.push('Freq ' + frequency.toFixed(1) + ' > 3.5');
  } else if (daysActive > 14) {
    verdict = 'MAX_REACHED';
    reasons.push(daysActive + 'd > 14 max');
  } else if ((cps !== null && cps > 100) || er < 1 || ctr < 0.4) {
    verdict = 'CORTAR';
    if (cps !== null && cps > 100) reasons.push('CPS $' + cps + ' > $100');
    if (er < 1)    reasons.push('ER ' + er.toFixed(1) + '% < 1%');
    if (ctr < 0.4) reasons.push('CTR ' + ctr.toFixed(2) + '% < 0.4%');
  } else if (cps !== null && cps < 30 && er > 3) {
    verdict = 'WINNER';
    reasons.push('CPS $' + cps + ' < $30, ER ' + er.toFixed(1) + '% > 3%');
  } else if (daysActive >= 10) {
    verdict = 'FATIGUE_WARNING';
    reasons.push(daysActive + 'd, preparar reemplazo');
  }

  return {
    adId: ad.ad_id, adName: ad.ad_name,
    campaignType: campaignType, platform: platform, segment: segment,
    daysActive: daysActive, impressions: impressions, reach: reach,
    spend: Math.round(spend), cpm: cpm.toFixed(0),
    ctr: ctr.toFixed(2), frequency: frequency.toFixed(1),
    engagements: engagements, er: er.toFixed(1),
    igFollows: igFollows, igProfileVisits: igProfileVisits, fbLikes: fbLikes,
    followLabel: followLabel, followSignal: followSignal,
    thruPlays: thruPlays, thruPlayRate: thruPlayRate.toFixed(1),
    videoViews3s: videoViews3s,
    hookRate: hookRate.toFixed(1), holdRate: holdRate.toFixed(1), isVideoAd: isVideoAd,
    saves: saves,
    cps: cpsStr, cpsRaw: cps,
    cpv: cpv, cpf: cpf, kpiStr: kpiStr,
    qualRank: qualRank, engRank: engRank, conRank: conRank,
    effectiveStatus: effectiveStatus, isCurrentlyActive: isCurrentlyActive,
    verdict: verdict, reason: reasons.join(', ') || 'Dentro de parametros'
  };
});

// ── Segmentar ──────────────────────────────────────────────────────────
var followAds = results.filter(function(r) { return r.campaignType === 'FOLLOW'; });
var engAds    = results.filter(function(r) { return r.campaignType === 'ENG'; });
var awrAds    = results.filter(function(r) { return r.campaignType === 'AWR'; });

// ── Totales ────────────────────────────────────────────────────────────
var totalSpend       = results.reduce(function(s, r) { return s + r.spend; }, 0);
var totalReach       = results.reduce(function(s, r) { return s + r.reach; }, 0);
var totalImpressions = results.reduce(function(s, r) { return s + r.impressions; }, 0);
var totalIgFollows   = followAds.reduce(function(s, r) { return s + r.igFollows; }, 0);
var totalIgVisits    = followAds.reduce(function(s, r) { return s + r.igProfileVisits; }, 0);
var totalFbLikes     = followAds.reduce(function(s, r) { return s + r.fbLikes; }, 0);
var totalSaves       = results.reduce(function(s, r) { return s + r.saves; }, 0);
var totalThruPlays   = results.reduce(function(s, r) { return s + r.thruPlays; }, 0);
var blendedCPM       = totalImpressions > 0 ? (totalSpend / totalImpressions * 1000).toFixed(0) : null;
var totalFollowSig   = followAds.reduce(function(s, r) {
  var sig = r.igFollows > 0 ? r.igFollows + r.fbLikes : r.igProfileVisits + r.fbLikes;
  return s + sig;
}, 0);
var blendedCPS = totalFollowSig > 0 ? Math.round(totalSpend / totalFollowSig) : null;

// ── Día de referencia ──────────────────────────────────────────────────
var refAd = results.find(function(r) { return r.campaignType === 'ENG' && r.daysActive > 0; });
var dayRef = refAd ? refAd.daysActive : results.reduce(function(m, r) { return Math.max(m, r.daysActive); }, 0);

// ── Burn rate + presupuesto ────────────────────────────────────────────
// Priorizar burn rate real (suma de budgets de ad sets activos) sobre promedio histórico
var burnRateDaily    = realBurnRate > 0 ? realBurnRate : (dayRef > 0 ? Math.round(totalSpend / dayRef) : 0);
var budgetRemaining  = CAMPAIGN_BUDGET_TOTAL - totalSpend;
var daysToEnd        = Math.max(0, Math.round((CAMPAIGN_END_DATE - now) / (1000 * 60 * 60 * 24)));
var daysAtBurn       = burnRateDaily > 0 ? Math.floor(budgetRemaining / burnRateDaily) : 999;
var budgetRisk       = daysAtBurn < daysToEnd; // true = presupuesto se agota antes que el plan
var exhaustDate      = new Date(now.getTime() + daysAtBurn * 24 * 60 * 60 * 1000);
var exhaustStr       = String(exhaustDate.getUTCDate()).padStart(2,'0') + '/'
                     + String(exhaustDate.getUTCMonth()+1).padStart(2,'0');

// ── Follower growth ────────────────────────────────────────────────────
var fbNetNew  = fbFollowersNow !== null ? fbFollowersNow - CAMPAIGN_BASELINE_FB : null;
var igNetNew  = igFollowersNow !== null ? igFollowersNow - CAMPAIGN_BASELINE_IG : null;
// Follow rate IG: net new IG / total IG profile visits
var igFollowRate = (igNetNew !== null && igNetNew > 0 && totalIgVisits > 0)
  ? (igNetNew / totalIgVisits * 100).toFixed(1) : null;

// ── Segmento Cold/Retarget × FB/IG para Follow Plan ───────────────────
var segmentStats = {};
followAds.forEach(function(r) {
  var key = r.platform + '_' + r.segment;
  if (!segmentStats[key]) {
    segmentStats[key] = { platform: r.platform, segment: r.segment, spend: 0, follows: 0, visits: 0 };
  }
  segmentStats[key].spend   += r.spend;
  segmentStats[key].follows += r.igFollows + r.fbLikes;
  segmentStats[key].visits  += r.igProfileVisits;
});

// ── Split activos vs pausados ──────────────────────────────────────────
var activeResults = results.filter(function(r) { return r.isCurrentlyActive; });
var pausedResults = results.filter(function(r) { return !r.isCurrentlyActive; });

// ── Post-process: HOLD PUENTE para FB FOLLOW ads en primeros 7d que serían CORTAR ──
// Un ad FB joven con métricas débiles mantiene cobertura mientras no haya reemplazo.
// Después del día 7 → CORTAR normal.
activeResults.forEach(function(r) {
  if (r.campaignType === 'FOLLOW' && r.platform === 'FB' && r.daysActive < 7 && r.verdict === 'CORTAR') {
    r.verdict = 'HOLD PUENTE';
    r.reason = r.reason + ' — sin reemplazo FB, mantener por cobertura';
  }
});

// ── Conteo veredictos (solo activos para el resumen ejecutivo) ─────────
var counts = {};
activeResults.forEach(function(r) { counts[r.verdict] = (counts[r.verdict] || 0) + 1; });
var summaryParts = [];
if (counts.WINNER)              summaryParts.push(counts.WINNER + ' WINNER');
if (counts.VIABLE)              summaryParts.push(counts.VIABLE + ' VIABLE');
if (counts.LEARNING)            summaryParts.push(counts.LEARNING + ' LEARNING');
if (counts['HOLD PUENTE'])      summaryParts.push(counts['HOLD PUENTE'] + ' HOLD PUENTE');
if (counts.CORTAR)              summaryParts.push(counts.CORTAR + ' CORTAR');
if (counts.FATIGUE)             summaryParts.push(counts.FATIGUE + ' FATIGUE');
if (counts.FATIGUE_WARNING)     summaryParts.push(counts.FATIGUE_WARNING + ' WARNING');
if (counts.MAX_REACHED)         summaryParts.push(counts.MAX_REACHED + ' MAX');
var summaryStr = summaryParts.join(' | ') || 'Sin datos';

// ── Estilos HTML ───────────────────────────────────────────────────────
function verdictStyle(v) {
  var map = {
    WINNER:          { color: '#16a34a', bg: '#f0fdf4' },
    VIABLE:          { color: '#2563eb', bg: '#eff6ff' },
    LEARNING:        { color: '#7c3aed', bg: '#f5f3ff' },
    'HOLD PUENTE':   { color: '#92400e', bg: '#fef3c7' },
    CORTAR:          { color: '#dc2626', bg: '#fef2f2' },
    FATIGUE:         { color: '#ea580c', bg: '#fff7ed' },
    FATIGUE_WARNING: { color: '#ca8a04', bg: '#fefce8' },
    MAX_REACHED:     { color: '#dc2626', bg: '#fef2f2' },
  };
  return map[v] || { color: '#6b7280', bg: '#f9fafb' };
}
function typeBadge(type) {
  var colors = { FOLLOW: '#7c3aed', ENG: '#2563eb', AWR: '#0891b2', LEA: '#059669', TRF: '#d97706' };
  return '<span style="background:' + (colors[type] || '#9ca3af') + ';color:white;padding:1px 5px;border-radius:3px;font-size:10px;">' + type + '</span>';
}
function rankBadge(val) {
  var info = rankingInfo(val);
  return '<span style="color:' + info.color + ';font-weight:bold;font-size:10px;">' + info.label + '</span>';
}

// ── Mapping veredicto interno → display / acción ──────────────────────
// Los valores internos (FATIGUE_WARNING, MAX_REACHED, etc.) se mantienen
// para Bruno prompt y lógica interna. Solo el email muestra los nuevos nombres.
function verdictDisplay(v) {
  var map = { FATIGUE_WARNING: 'WARNING', MAX_REACHED: 'REEMPLAZAR', FATIGUE: 'REEMPLAZAR' };
  return map[v] || v;
}
function verdictAction(v) {
  var d = verdictDisplay(v);
  var map = {
    WINNER: 'ESCALAR', VIABLE: 'MANTENER', LEARNING: 'ESPERAR 72H',
    WARNING: 'ROTAR CREATIVO', 'HOLD PUENTE': 'HOLD PUENTE',
    REEMPLAZAR: 'REEMPLAZAR', CORTAR: 'PAUSAR', PAUSED: '—'
  };
  return map[d] || '—';
}
function verdictCellStyle(v) {
  var d = verdictDisplay(v);
  var map = {
    WINNER:          { bg: '#dcfce7', color: '#15803d' },
    VIABLE:          { bg: '#dbeafe', color: '#1d4ed8' },
    LEARNING:        { bg: '#ede9fe', color: '#6d28d9' },
    WARNING:         { bg: '#fef9c3', color: '#92400e' },
    'HOLD PUENTE':   { bg: '#fef3c7', color: '#92400e' },
    REEMPLAZAR:      { bg: '#fce7f3', color: '#9d174d' },
    CORTAR:          { bg: '#fee2e2', color: '#b91c1c' },
    PAUSED:          { bg: '#f1f5f9', color: '#94a3b8' },
  };
  return map[d] || { bg: '#f9fafb', color: '#6b7280' };
}
function kpiCellStyle(r) {
  // Verde si KPI bajo umbral, rojo si alto
  if (r.cpv !== null) return r.cpv < 30 ? 'background:#dcfce7;color:#15803d;font-weight:bold;' : r.cpv > 80 ? 'background:#fef2f2;color:#b91c1c;font-weight:bold;' : 'color:#92400e;font-weight:bold;';
  if (r.cpf !== null) return r.cpf < 80 ? 'background:#dcfce7;color:#15803d;font-weight:bold;' : r.cpf > 100 ? 'background:#fef2f2;color:#b91c1c;font-weight:bold;' : 'color:#92400e;font-weight:bold;';
  return '';
}

// ── Función fila tabla ─────────────────────────────────────────────────
// Tabla activos — nueva (11 cols, agrupada por plataforma)
function makeActiveRow(r) {
  var vd = verdictDisplay(r.verdict);
  var va = verdictAction(r.verdict);
  var vs = verdictCellStyle(r.verdict);
  var ks = kpiCellStyle(r);
  var dayStyle = r.daysActive >= 10 ? 'color:#b91c1c;font-weight:bold;' : '';
  var ctrStyle = parseFloat(r.ctr) < 0.4 ? 'color:#b91c1c;font-weight:bold;background:#fef2f2;' : parseFloat(r.ctr) > 0.8 ? 'color:#15803d;font-weight:bold;background:#f0fdf4;' : '';
  var erStyle  = parseFloat(r.er)  < 1   ? 'color:#b91c1c;font-weight:bold;background:#fef2f2;' : parseFloat(r.er)  > 3   ? 'color:#15803d;font-weight:bold;background:#f0fdf4;' : '';
  // Veredicto·Acción: mostrar ambos solo si difieren
  var verdCell = vd === va
    ? '<span style="background:' + vs.bg + ';color:' + vs.color + ';font-weight:bold;padding:2px 6px;border-radius:3px;font-size:10px;white-space:nowrap;">' + vd + '</span>'
    : '<span style="background:' + vs.bg + ';color:' + vs.color + ';font-weight:bold;padding:2px 6px;border-radius:3px;font-size:10px;white-space:nowrap;">' + vd + '</span>'
      + '<br><span style="background:' + vs.bg + ';color:' + vs.color + ';padding:2px 5px;border-radius:3px;font-size:9px;white-space:nowrap;display:inline-block;margin-top:2px;">' + va + '</span>';
  return '<tr style="border-bottom:1px solid #f1f5f9;">'
    + '<td style="padding:5px 7px;font-size:11px;max-width:175px;white-space:normal;">' + r.adName + '</td>'
    + '<td style="padding:4px 6px;text-align:center;">' + typeBadge(r.campaignType) + '</td>'
    + '<td style="padding:4px 6px;text-align:center;font-size:11px;' + dayStyle + '">' + r.daysActive + 'd</td>'
    + '<td style="padding:4px 6px;text-align:right;font-size:11px;">$' + r.spend.toLocaleString() + '</td>'
    + '<td style="padding:4px 6px;text-align:right;font-size:11px;">' + r.reach.toLocaleString() + '</td>'
    + '<td style="padding:4px 6px;text-align:center;font-size:11px;' + ctrStyle + '">' + r.ctr + '%</td>'
    + '<td style="padding:4px 6px;text-align:center;font-size:11px;' + erStyle  + '">' + r.er  + '%</td>'
    + '<td style="padding:4px 6px;text-align:center;font-size:11px;">' + r.frequency + '</td>'
    + '<td style="padding:4px 6px;text-align:center;font-size:11px;' + ks + '">' + r.kpiStr + '</td>'
    + '<td style="padding:4px 6px;text-align:center;min-width:90px;">' + verdCell + '</td>'
    + '<td style="padding:4px 6px;font-size:10px;color:#64748b;max-width:140px;white-space:normal;">' + r.reason + '</td>'
    + '</tr>';
}

// Tabla pausados — simplificada
function makePausedRow(r) {
  return '<tr style="border-bottom:1px solid #f1f5f9;">'
    + '<td style="padding:3px 6px;font-size:10px;">' + r.adName + '</td>'
    + '<td style="padding:3px 6px;text-align:center;">' + typeBadge(r.campaignType) + '</td>'
    + '<td style="padding:3px 6px;text-align:center;font-size:10px;">' + r.daysActive + 'd</td>'
    + '<td style="padding:3px 6px;text-align:right;font-size:10px;">$' + r.spend.toLocaleString() + '</td>'
    + '<td style="padding:3px 6px;text-align:center;font-size:10px;">' + r.ctr + '%</td>'
    + '<td style="padding:3px 6px;text-align:center;font-size:10px;">' + r.er + '%</td>'
    + '<td style="padding:3px 6px;font-size:10px;">' + r.kpiStr + '</td>'
    + '<td style="padding:3px 6px;font-size:10px;color:#64748b;">' + r.reason + '</td>'
    + '</tr>';
}

// Agrupado por plataforma para tabla activos
function makePlatformGroup(ads, icon, label, colCount) {
  if (ads.length === 0) return '';
  var sepTd = '<td colspan="' + colCount + '" style="background:#f8fafc;font-size:9px;font-weight:bold;color:#94a3b8;padding:3px 7px;letter-spacing:0.07em;text-transform:uppercase;border-top:2px solid #e2e8f0;">'
    + icon + ' ' + label + '</td>';
  return '<tr>' + sepTd + '</tr>' + ads.map(makeActiveRow).join('\n');
}

var verdictSortOrder = { 'WINNER': 0, 'VIABLE': 1, 'LEARNING': 2, 'HOLD PUENTE': 3, 'WARNING': 4, 'REEMPLAZAR': 5, 'CORTAR': 6 };
function sortByVerdict(a, b) {
  var oa = verdictSortOrder[verdictDisplay(a.verdict)];
  var ob = verdictSortOrder[verdictDisplay(b.verdict)];
  return (oa !== undefined ? oa : 99) - (ob !== undefined ? ob : 99);
}

var igActive  = activeResults.filter(function(r) { return r.platform === 'IG'; });
var fbActive  = activeResults.filter(function(r) { return r.platform === 'FB'; });
var engActive = activeResults.filter(function(r) { return r.campaignType === 'ENG' && r.platform !== 'IG' && r.platform !== 'FB'; });
// ENG ads que son IG o FB ya caen en igActive/fbActive — separar por campaignType
igActive  = activeResults.filter(function(r) { return r.platform === 'IG' && r.campaignType !== 'ENG'; });
fbActive  = activeResults.filter(function(r) { return r.platform === 'FB' && r.campaignType !== 'ENG'; });
engActive = activeResults.filter(function(r) { return r.campaignType === 'ENG'; });

igActive.sort(sortByVerdict);
fbActive.sort(sortByVerdict);
engActive.sort(sortByVerdict);

var activeTableRows = makePlatformGroup(igActive,  '📱', 'Instagram', 11)
  + makePlatformGroup(fbActive,  '👍', 'Facebook', 11)
  + makePlatformGroup(engActive, '🎬', 'Engagement', 11);

// Motivo pausa específico por ad (mejor que el genérico "solo historial")
function inferPauseReason(r) {
  if (r.adName.match(/piece0[0-9]|piece[0-9]/)) return 'AWR campana lanzamiento &mdash; historial';
  if (r.adName.match(/reel4h[A-Za-z]/) && r.campaignType === 'AWR') return 'AWR historial &mdash; datos de D4 preservados';
  if (r.adName.match(/regalos|corporativo_C|reelPV/)) return 'Campana lanzamiento &mdash; historial';
  if (r.isVideoAd && r.holdRate > 20) return 'ENG &mdash; Hold ' + r.holdRate + '% &middot; D4 se nutre de este ad';
  if (r.cpsRaw !== null && r.cpsRaw > 100) return 'CPF $' + r.cpsRaw + ' &gt; $100 (umbral)';
  if (r.cpv !== null && r.cpv > 80) return 'CPV $' + r.cpv + ' &gt; $80 (umbral)';
  if (r.daysActive > 14) return 'M&aacute;x ' + r.daysActive + 'd &mdash; reemplazado';
  return 'Pausado &mdash; historial';
}

// Ordenar por días activos (más recientes primero) y separar recientes vs históricos
var sortedPaused = pausedResults.slice().sort(function(a, b) { return a.daysActive - b.daysActive; });
var PAUSED_SHOW_MAX = 8;
var recentPausedRows = sortedPaused.slice(0, PAUSED_SHOW_MAX);
var historicalPausedRows = sortedPaused.slice(PAUSED_SHOW_MAX);

function makePausedRowRich(r) {
  return '<tr style="border-bottom:1px solid #f1f5f9;">'
    + '<td style="padding:3px 6px;font-size:10px;">' + r.adName + '</td>'
    + '<td style="padding:3px 6px;text-align:center;">' + typeBadge(r.campaignType) + '</td>'
    + '<td style="padding:3px 6px;text-align:center;font-size:10px;">' + r.daysActive + 'd</td>'
    + '<td style="padding:3px 6px;text-align:right;font-size:10px;">$' + r.spend.toLocaleString() + '</td>'
    + '<td style="padding:3px 6px;text-align:center;font-size:10px;">' + r.ctr + '%</td>'
    + '<td style="padding:3px 6px;text-align:center;font-size:10px;">' + r.er + '%</td>'
    + '<td style="padding:3px 6px;font-size:10px;">' + r.kpiStr + '</td>'
    + '<td style="padding:3px 6px;font-size:10px;color:#64748b;">' + inferPauseReason(r) + '</td>'
    + '</tr>';
}

var pausedTableRows = recentPausedRows.map(makePausedRowRich).join('\n')
  + (historicalPausedRows.length > 0
    ? '<tr><td colspan="8" style="padding:4px 8px;font-size:10px;color:#94a3b8;font-style:italic;">+ '
      + historicalPausedRows.length + ' ads hist&oacute;ricos adicionales (AWR pausados, ENG v1, Follow Plan v1)</td></tr>'
    : '');

// ── Panel Quality Rankings ─────────────────────────────────────────────
var qualityRows = results.map(function(r) {
  return '<tr style="border-bottom:1px solid #e5e7eb;">'
    + '<td style="padding:4px 8px;font-size:11px;">' + r.adName + '</td>'
    + '<td style="padding:4px;text-align:center;">' + typeBadge(r.campaignType) + '</td>'
    + '<td style="padding:4px;text-align:center;">' + rankBadge(r.qualRank) + '</td>'
    + '<td style="padding:4px;text-align:center;">' + rankBadge(r.engRank) + '</td>'
    + '<td style="padding:4px;text-align:center;">' + rankBadge(r.conRank) + '</td>'
    + '</tr>';
}).join('\n');

// ── Prompt Bruno ───────────────────────────────────────────────────────
function makeBrunoSection(ads, title) {
  if (ads.length === 0) return '';
  var hdr = '| Ad | Plat | Seg | Dias | Spend | CPM | Reach | CTR | ER | Hook% | Hold% | ThruPlay | IG Visits | FB Likes | Saves | CPS | Freq | QualRank | EngRank | Veredicto | Razon |';
  var sep = '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|';
  var rows = ads.map(function(r) {
    var tp = r.thruPlays > 0 ? r.thruPlayRate + '% (' + r.thruPlays + ')' : 'N/A';
    return '| ' + r.adName + ' | ' + r.platform + ' | ' + r.segment
      + ' | ' + r.daysActive + 'd'
      + ' | $' + r.spend + ' | $' + r.cpm
      + ' | ' + r.reach
      + ' | ' + r.ctr + '% | ' + r.er + '%'
      + ' | ' + (r.isVideoAd ? r.hookRate + '%' : '—')
      + ' | ' + (r.isVideoAd && r.videoViews3s > 0 ? r.holdRate + '%' : '—')
      + ' | ' + tp
      + ' | ' + r.igProfileVisits
      + ' | ' + r.fbLikes
      + ' | ' + r.saves
      + ' | ' + r.cps + ' | ' + r.frequency
      + ' | ' + r.qualRank + ' | ' + r.engRank
      + ' | ' + r.verdict + ' | ' + r.reason + ' |';
  }).join('\n');
  return '\n### ' + title + '\n\n' + hdr + '\n' + sep + '\n' + rows + '\n';
}

// Tabla segmentos Cold/Retarget × FB/IG
var segTableLines = ['| Segmento | Spend | Follows/Likes | Visits IG | CPF/CPV |',
                     '|---|---|---|---|---|'];
Object.keys(segmentStats).sort().forEach(function(key) {
  var s = segmentStats[key];
  var cpf = s.follows > 0 ? '$' + Math.round(s.spend / s.follows) : '—';
  var cpv = s.visits > 0 && s.platform === 'IG' ? '$' + Math.round(s.spend / s.visits) : '—';
  segTableLines.push('| ' + s.platform + ' ' + s.segment
    + ' | $' + s.spend + ' | ' + s.follows + ' | ' + s.visits
    + ' | ' + (s.platform === 'FB' ? cpf : cpv) + ' |');
});

// ENG D4 context
var engThruTotal = engAds.reduce(function(s, r) { return s + r.thruPlays; }, 0);
var d4Context = engThruTotal > 0
  ? '\n### D4 Custom Audience (Video Viewers)\n'
    + engThruTotal.toLocaleString() + ' ThruPlays acumulados en ENG. '
    + 'D4 debería tener volumen para warm retargeting. '
    + 'Verificar en Ads Manager → Audiences → D4 Video Viewers.\n'
    + 'Los ENG reels tienen valor estratégico aunque no generen follows directos: '
    + 'alimentan la custom audience que baja el CPF en Follow FB Retarget.\n'
  : '';

// Follower summary para prompt
var followerSummary = '';
if (fbFollowersNow !== null || igFollowersNow !== null) {
  followerSummary = '\n## Estado de seguidores (API en tiempo real)\n';
  if (fbFollowersNow !== null) {
    followerSummary += '| Plataforma | Ahora | Baseline 22/04 | Nuevos |\n';
    followerSummary += '|---|---|---|---|\n';
    followerSummary += '| Facebook | ' + fbFollowersNow + ' | ' + CAMPAIGN_BASELINE_FB + ' | +' + (fbFollowersNow - CAMPAIGN_BASELINE_FB) + ' |\n';
    if (igFollowersNow !== null) {
      followerSummary += '| Instagram | ' + igFollowersNow + ' | ' + CAMPAIGN_BASELINE_IG + ' | +' + (igFollowersNow - CAMPAIGN_BASELINE_IG) + ' |\n';
    }
  }
  if (igFollowRate !== null) {
    followerSummary += '\n⚠ **Follow rate IG**: ' + igNetNew + ' nuevos IG / ' + totalIgVisits + ' profile visits = **' + igFollowRate + '%**'
      + ' (benchmark 15–35%). '
      + (parseFloat(igFollowRate) < 10 ? '🔴 Perfil no convierte — revisar bio, grid y highlights antes de escalar Follow IG.' : '✅ Conversión aceptable.')
      + '\n';
  }
}

// Burn rate para prompt
var burnSummary = '\n## Presupuesto y burn rate\n'
  + '| | |\n|---|---|\n'
  + '| Presupuesto total | $' + CAMPAIGN_BUDGET_TOTAL.toLocaleString() + ' |\n'
  + '| Gastado (acumulado) | $' + totalSpend.toLocaleString() + ' |\n'
  + '| Restante | $' + Math.round(budgetRemaining).toLocaleString() + ' |\n'
  + '| Burn rate (promedio/día) | $' + burnRateDaily.toLocaleString() + ' |\n'
  + '| Días restantes del plan | ' + daysToEnd + ' (hasta 16/05) |\n'
  + '| Días de presupuesto al ritmo actual | ' + daysAtBurn + ' |\n'
  + (budgetRisk
    ? '\n🔴 **RIESGO PRESUPUESTO**: al ritmo actual ($' + burnRateDaily.toLocaleString() + '/día), el presupuesto se agota el '
      + exhaustStr + ' — **' + (daysToEnd - daysAtBurn) + ' días antes del cierre del plan**. '
      + 'Para llegar al 16/05 el budget diario máximo es $' + Math.round(budgetRemaining / daysToEnd).toLocaleString() + '/día.\n'
    : '\n✅ Presupuesto alcanza hasta el final del plan y más.\n');

// ── Orquestador de campaña ─────────────────────────────────────────────
var fbNetNewStr  = fbNetNew !== null ? '+' + fbNetNew : '?';
var igNetNewStr  = igNetNew !== null ? '+' + igNetNew : '?';
var totalNetNew  = (fbNetNew || 0) + (igNetNew || 0);
var GOAL_ADJUSTED = 6500; // meta ajustada por Jose (original 10.000)
var gapToGoal    = GOAL_ADJUSTED - (fbFollowersNow || CAMPAIGN_BASELINE_FB) - (igFollowersNow || CAMPAIGN_BASELINE_IG);
var orchestratorSection =
  '## CONTEXTO DE CAMPANA — Orquestador\n\n'
  + 'Mision: 6.500 seguidores IG+FB en 27 dias de pauta (19/04 – 16/05/2026). Meta ajustada por Jose.\n'
  + 'Datos frescos al: ' + todayStr + ' ' + String(artNow.getUTCHours()).padStart(2,'0') + ':' + String(artNow.getUTCMinutes()).padStart(2,'0') + ' ART'
  + (burnRateSource === 'ad_set_budgets' ? ' | Burn rate: sum ad_set budgets activos' : ' | Burn rate: promedio historico')
  + (freshnessWarning ? ' | AVISO: ' + freshnessWarning : '')
  + '\n\n'
  + '### Posicion actual: Dia ' + dayRef + ' de 27\n'
  + '- Seguidores FB: ' + (fbFollowersNow || '?') + ' (baseline 23 → ' + fbNetNewStr + ' nuevos)\n'
  + '- Seguidores IG: ' + (igFollowersNow || '?') + ' (baseline 11 → ' + igNetNewStr + ' nuevos)\n'
  + '- Total nuevos: ' + totalNetNew + ' / objetivo 6.500 | Gap: ' + gapToGoal + ' seguidores\n\n'
  + '### Budget\n'
  + '- Gastado: $' + totalSpend.toLocaleString() + ' / $500.000\n'
  + '- Restante: $' + Math.round(budgetRemaining).toLocaleString() + '\n'
  + '- Burn rate REAL (sum ad sets activos): $' + burnRateDaily.toLocaleString() + '/dia\n'
  + '- Dias restantes: ' + daysToEnd + '\n'
  + (budgetRisk ? '- RIESGO: presupuesto se agota el ' + exhaustStr + ' — ' + (daysToEnd - daysAtBurn) + ' dias antes del 16/05\n' : '- OK: presupuesto alcanza hasta el 16/05\n')
  + '\n### Ads ACTIVOS ahora (' + activeResults.length + ' ads gastan dinero)\n'
  + activeResults.map(function(r) { return '- ' + r.adName + ' [' + r.verdict + ']'; }).join('\n') + '\n'
  + '\n### Ads PAUSADOS (' + pausedResults.length + ' ads — solo historial)\n'
  + pausedResults.map(function(r) { return '- ' + r.adName; }).join('\n') + '\n'
  + '\n### Lo que sabemos que FUNCIONA\n'
  + '- WINNER: ENBA_ad_corporativo_IG_Cold — CPV $26, ER 4.9%, imagen estatica (NO video)\n'
  + '- Follow FB: destinos_FB_Cold — CPF $89, ABOVE_AVERAGE, imagen\n'
  + '- ENG: reel4horas — Hook 57%, ER 64.9%, alimenta D4 (3.600-4.200 personas)\n\n'
  + '### Hipotesis FALSADAS\n'
  + '- FALSADA: Video-first — el WINNER es imagen estatica. Micro-reels en FB tienen CPM 4x mas caro.\n'
  + '- FALSADA: Retarget siempre mas barato — en FB retarget es MAS CARO que cold (anomalia).\n\n'
  + '### Decisiones pendientes (bloquean escalado)\n'
  + '1. Perfil IG no convierte (follow rate 3.2% vs benchmark 15-35%) — requiere Marina\n'
  + '2. Reemplazo creativo para reel4horas (FATIGUE_WARNING dia ' + dayRef + ') — requiere Dani\n'
  + '3. 3 ads ACTIVOS + CORTAR: microreel_FB_Cold, microreel_FB_Retarget, nosotros_FB_Retarget — pendiente Jose\n\n'
  + '---\n\n';

// ── Time string (necesario para Bruno prompt y subject) ───────────────
var timeStr = String(artNow.getUTCHours()).padStart(2,'0') + ':' + String(artNow.getUTCMinutes()).padStart(2,'0');

// ── Bruno prompt — nuevo formato ───────────────────────────────────────
var currentDailyPace = dayRef > 0 ? Math.round(totalNetNew / dayRef) : 0;
var paceNeeded = daysToEnd > 0 ? Math.round(gapToGoal / daysToEnd) : 0;
var projectedEnd = Math.round((fbFollowersNow || CAMPAIGN_BASELINE_FB) + (igFollowersNow || CAMPAIGN_BASELINE_IG) + currentDailyPace * daysToEnd);
var budgetStatusStr = budgetRisk
  ? 'RIESGO — se agota el ' + exhaustStr
  : 'OK — alcanza hasta 16/05';

var brunoAdsTable = activeResults.map(function(r) {
  var plat = r.campaignType === 'ENG' ? 'ENG' : r.platform;
  return plat + ' | ' + r.adName + ' | ' + r.kpiStr + ' | ' + verdictDisplay(r.verdict);
}).join('\n');

// Gaps estructurales auto-generados
var gapLines = [];
var hasRetargetFB = activeResults.some(function(r) { return r.platform === 'FB' && r.segment === 'Retarget'; });
if (!hasRetargetFB) gapLines.push('- Sin retarget FB activo — funnel 100% cold, CPF inflado.');
var warnAds = activeResults.filter(function(r) { return verdictDisplay(r.verdict) === 'WARNING'; });
if (warnAds.length > 0) gapLines.push('- Ads en WARNING (rotar creativo urgente): ' + warnAds.map(function(r) { return r.adName + ' (' + r.daysActive + 'd)'; }).join(', '));
var learningAds = activeResults.filter(function(r) { return r.verdict === 'LEARNING'; });
if (learningAds.length > 0) gapLines.push('- Ads en LEARNING — revisar manana: ' + learningAds.map(function(r) { return r.adName; }).join(', '));
var replaceAds = activeResults.filter(function(r) { return verdictDisplay(r.verdict) === 'REEMPLAZAR'; });
if (replaceAds.length > 0) gapLines.push('- Ads para reemplazar (sin pausar hasta tener reemplazo): ' + replaceAds.map(function(r) { return r.adName; }).join(', '));
if (engThruTotal > 100) gapLines.push('- D4 tiene ' + engThruTotal.toLocaleString() + ' ThruPlays — evaluar si tiene volumen para retarget.');

var brunoPrompt = 'Contexto REDES. Carga /bruno.\n\n'
  + '## Corte temporal\n'
  + todayStr + ' · ' + timeStr + ' ART · Dia ' + dayRef + ' de ' + CAMPAIGN_TOTAL_DAYS + ' · Campana 19/04–16/05/2026.\n'
  + 'Datos con corte fijo. No tengo delta vs ayer. Trabajar con snapshot actual.\n'
  + (freshnessWarning ? '\nAVISO: ' + freshnessWarning + '\n' : '')
  + '\n## Objetivo vigente\n'
  + 'Meta ajustada por Jose: ' + GOAL_ADJUSTED.toLocaleString() + ' seguidores totales IG+FB.\n'
  + 'Proyeccion al 16/05 al ritmo actual: ~' + projectedEnd.toLocaleString() + ' seguidores.\n'
  + 'Pace necesario: ' + paceNeeded + ' seguidores/dia. Ritmo actual: ~' + currentDailyPace + '/dia'
  + (paceNeeded > 0 && currentDailyPace < paceNeeded ? ' → DEFICIT.' : ' → OK.') + '\n'
  + 'Presupuesto restante: $' + Math.round(budgetRemaining).toLocaleString()
  + ' · Burn: $' + burnRateDaily.toLocaleString() + '/dia · ' + budgetStatusStr + '\n'
  + '\n## Seguidores ahora (API)\n'
  + 'FB: ' + (fbFollowersNow || '?') + ' (+' + (fbNetNew || 0) + ' desde 22/04)'
  + ' · IG: ' + (igFollowersNow || '?') + ' (+' + (igNetNew || 0) + ' desde 22/04)'
  + ' · Total nuevos: ' + totalNetNew + '\n'
  + (igFollowRate !== null ? 'Follow rate IG: ' + igFollowRate + '% → objetivo operativo >5%, >8% fuerte.\n' : '')
  + '\n## Ads activos — snapshot ' + timeStr + ' ART\n'
  + 'Plataforma | Ad | KPI ENBA | Veredicto\n'
  + brunoAdsTable + '\n'
  + '\n## Gaps estructurales\n'
  + (gapLines.length > 0 ? gapLines.join('\n') : '- Sin gaps criticos detectados.') + '\n'
  + '\n## Benchmarks 2026\n'
  + '- CPV IG ($/visita perfil): < $30 WINNER, $30-$80 viable, > $80 WARNING\n'
  + '- CPF FB ($/page like): < $80 bueno, $80-$100 limite, > $100 CORTAR\n'
  + '- Hold% (video): > 30% bueno, > 40% excelente\n'
  + '- CTR: > 0.8% bueno IG/FB, < 0.4% alerta\n'
  + '- ER: > 3% bueno, < 1% problema\n'
  + '- Follow rate IG (visita→follow): > 8% fuerte, > 5% aceptable, < 5% critico\n'
  + '\n## Historial — PAUSADOS (sin gasto actual)\n'
  + makeBrunoSection(pausedResults, 'Ads pausados — referencia historica')
  + '\n## Tu tarea\n'
  + '1. Confirma o corregi cada veredicto automatico (solo ads ACTIVOS).\n'
  + '2. Propone acciones concretas con impacto presupuestario estimado.\n'
  + '3. Identifica el gap mas urgente a resolver hoy.\n'
  + '4. Entrega tu analisis en <= 300 palabras y espera aprobacion antes de ejecutar.';

// subject (diagLines vive solo en el HTML — se define abajo)
var followDisplay = totalIgFollows > 0
  ? 'IG F:' + totalIgFollows + ' FB L:' + totalFbLikes
  : 'IG V:' + totalIgVisits + ' FB L:' + totalFbLikes;
var subject = '[ENBA Ads] ' + todayStr + ' ' + timeStr
  + ' | ' + summaryStr
  + ' | $' + totalSpend.toLocaleString()
  + ' | ' + followDisplay
  + ' | Saves:' + totalSaves
  + (budgetRisk ? ' | BURN' : '')
  + (freshnessWarning ? ' | DATOS VIEJOS' : '');

// ── Pre-cálculo KPIs para hero block ──────────────────────────────────
var bestCpvIG = null, bestCpvVerdict = '';
var bestCpfFB = null, bestCpfAdShort = '';
activeResults.forEach(function(r) {
  if (r.cpv !== null && (bestCpvIG === null || r.cpv < bestCpvIG)) {
    bestCpvIG = r.cpv;
    bestCpvVerdict = verdictDisplay(r.verdict);
  }
  if (r.cpf !== null && (bestCpfFB === null || r.cpf < bestCpfFB)) {
    bestCpfFB = r.cpf;
    var parts = r.adName.split('_');
    bestCpfAdShort = parts.slice(-2).join('_');
  }
});

// ── HTML email v7 — Gmail compatible (table-based layout) ──────────────
var diagLines = Object.keys(diagActionTypes).sort().map(function(k) {
  return k + ': ' + diagActionTypes[k];
});

// Verdicts pills — aggregate counts (display:inline-block — Gmail-safe)
var verdictCounts = {};
activeResults.forEach(function(r) {
  var vd = verdictDisplay(r.verdict);
  verdictCounts[vd] = (verdictCounts[vd] || 0) + 1;
});
var verdictOrder = [
  { v: 'WINNER',       color: '#15803d', bg: '#dcfce7' },
  { v: 'VIABLE',       color: '#1d4ed8', bg: '#dbeafe' },
  { v: 'LEARNING',     color: '#6d28d9', bg: '#ede9fe' },
  { v: 'WARNING',      color: '#92400e', bg: '#fef9c3' },
  { v: 'HOLD PUENTE',  color: '#92400e', bg: '#fef3c7' },
  { v: 'REEMPLAZAR',   color: '#9d174d', bg: '#fce7f3' },
  { v: 'CORTAR',       color: '#b91c1c', bg: '#fee2e2' }
];
var verdictPills = verdictOrder.map(function(item) {
  var count = verdictCounts[item.v] || 0;
  var style = 'display:inline-block;margin:2px 4px 2px 0;font-size:11px;font-weight:bold;'
    + 'background:' + item.bg + ';color:' + item.color + ';padding:2px 10px;border-radius:10px;'
    + (count === 0 ? 'opacity:0.45;' : '');
  return '<span style="' + style + '">' + count + ' ' + item.v + '</span>';
}).join('');

// Progress
var progressPct = Math.min(100, Math.round(((fbFollowersNow || CAMPAIGN_BASELINE_FB) + (igFollowersNow || CAMPAIGN_BASELINE_IG)) / GOAL_ADJUSTED * 100));
var totalFollowers = (fbFollowersNow || CAMPAIGN_BASELINE_FB) + (igFollowersNow || CAMPAIGN_BASELINE_IG);
var barColor = progressPct >= 70 ? '#16a34a' : progressPct >= 40 ? '#ca8a04' : '#dc2626';

// Follow rate color
var frColor = igFollowRate !== null ? (parseFloat(igFollowRate) >= 8 ? '#4ade80' : parseFloat(igFollowRate) >= 5 ? '#fbbf24' : '#f87171') : '#94a3b8';

// Auto-insights
var insightLines = [];
var winnerAds    = activeResults.filter(function(r) { return r.verdict === 'WINNER'; });
var cortarAds    = activeResults.filter(function(r) { return verdictDisplay(r.verdict) === 'CORTAR'; });
var warnAdsI     = activeResults.filter(function(r) { return verdictDisplay(r.verdict) === 'WARNING'; });
var reemplazarAds = activeResults.filter(function(r) { return verdictDisplay(r.verdict) === 'REEMPLAZAR'; });
var learningAdsI = activeResults.filter(function(r) { return r.verdict === 'LEARNING'; });
var hasRetargetFBI = activeResults.some(function(r) { return r.platform === 'FB' && r.segment === 'Retarget'; });

if (!hasRetargetFBI) insightLines.push({ icon: '&#128308;', text: '<b>Sin retarget FB activo.</b> Funnel FB 100% cold &mdash; se paga CPF de audiencia fr&iacute;a sin aprovechar quienes ya interactuaron.' });
if (cortarAds.length > 0)    insightLines.push({ icon: '&#128308;', text: '<b>' + cortarAds.length + ' ads para CORTAR:</b> ' + cortarAds.map(function(r) { return r.adName + ' (' + r.kpiStr + ')'; }).join(', ') + '.' });
if (warnAdsI.length > 0)     insightLines.push({ icon: '&#128993;', text: '<b>' + warnAdsI.length + ' ads en WARNING &mdash; rotar creativo urgente:</b> ' + warnAdsI.map(function(r) { return r.adName + ' (' + r.daysActive + 'd)'; }).join(', ') + '.' });
if (reemplazarAds.length > 0) insightLines.push({ icon: '&#128993;', text: '<b>' + reemplazarAds.length + ' ads para reemplazar</b> (no pausar hasta tener reemplazo listo): ' + reemplazarAds.map(function(r) { return r.adName; }).join(', ') + '.' });
if (winnerAds.length > 0)    insightLines.push({ icon: '&#128994;', text: '<b>WINNER activo:</b> ' + winnerAds.map(function(r) { return r.adName + ' (' + r.kpiStr + ', ER ' + r.er + '%)'; }).join(', ') + '. Candidato a escalar.' });
if (learningAdsI.length > 0) insightLines.push({ icon: '&#128993;', text: '<b>' + learningAdsI.length + ' ads en LEARNING (&lt;72h):</b> ' + learningAdsI.map(function(r) { return r.adName; }).join(', ') + '. Revisar ma&ntilde;ana.' });
if (engThruTotal > 100)      insightLines.push({ icon: '&#128994;', text: '<b>D4 acumula ' + engThruTotal.toLocaleString() + ' ThruPlays.</b> Audience lista para retarget m&aacute;s barato cuando tenga volumen suficiente.' });
if (paceNeeded > 0 && currentDailyPace < paceNeeded) insightLines.push({ icon: '&#128308;', text: '<b>D&eacute;ficit de pace cr&iacute;tico.</b> Ritmo ~' + currentDailyPace + '/d&iacute;a vs ' + paceNeeded + '/d&iacute;a necesarios. Proyecci&oacute;n: ~' + projectedEnd.toLocaleString() + ' al 16/05 vs objetivo ' + GOAL_ADJUSTED.toLocaleString() + '.' });

var insightsHtml = insightLines.length > 0
  ? '<table width="100%" cellpadding="0" cellspacing="0">'
    + '<tr><td style="background:#fffbeb;border:1px solid #fcd34d;border-radius:5px;padding:10px 14px;">'
    + '<div style="font-size:10px;font-weight:bold;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:7px;">Lo que no se ve en la tabla</div>'
    + insightLines.map(function(ins) {
        return '<table cellpadding="0" cellspacing="0" style="margin-bottom:4px;width:100%;"><tr>'
          + '<td style="font-size:13px;width:20px;vertical-align:top;padding-top:1px;">' + ins.icon + '</td>'
          + '<td style="font-size:11px;color:#44403c;line-height:1.4;">' + ins.text + '</td>'
          + '</tr></table>';
      }).join('')
    + '</td></tr></table>'
  : '';

// Glosario completo (table-based, Gmail-safe)
var gTd = 'style="font-size:10px;color:#475569;padding:3px 8px 3px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;"';
var glosario = '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-top:2px solid #e2e8f0;">'
  + '<tr><td style="padding:10px 20px 14px;">'
  + '<div style="font-size:10px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Glosario de siglas y t&eacute;rminos</div>'
  // Terms grid — 3 columns, 5 rows
  + '<table cellpadding="0" cellspacing="0" width="100%">'
  + '<tr>'
  + '<td ' + gTd + ' width="33%"><b>CPV perfil</b> &mdash; Costo por Visita al Perfil IG (objetivo VISIT_INSTAGRAM_PROFILE)</td>'
  + '<td ' + gTd + ' width="33%"><b>CPF</b> &mdash; Costo por Follower/Like de Page (objetivo PAGE_LIKES en FB)</td>'
  + '<td ' + gTd + '><b>CTR</b> &mdash; Click-Through Rate: % de impresiones que generan un click</td>'
  + '</tr><tr>'
  + '<td ' + gTd + '><b>ER</b> &mdash; Engagement Rate: engagements / reach &times; 100</td>'
  + '<td ' + gTd + '><b>Freq</b> &mdash; Frecuencia: veces que el mismo usuario vio el anuncio</td>'
  + '<td ' + gTd + '><b>Hold%</b> &mdash; Retenci&oacute;n de video: ThruPlays / vistas 3s &times; 100</td>'
  + '</tr><tr>'
  + '<td ' + gTd + '><b>Hook%</b> &mdash; Gancho de video: vistas 3s / impresiones &times; 100</td>'
  + '<td ' + gTd + '><b>CPM</b> &mdash; Costo por Mil impresiones</td>'
  + '<td ' + gTd + '><b>D4</b> &mdash; Custom Audience: VideoViewers 30d (construida por ENG)</td>'
  + '</tr><tr>'
  + '<td ' + gTd + '><b>LAL1</b> &mdash; Lookalike 1% desde FB Page Likers</td>'
  + '<td ' + gTd + '><b>FOLLOW</b> &mdash; Campa&ntilde;a objetivo seguidores (IG visits + FB likes)</td>'
  + '<td ' + gTd + '><b>ENG</b> &mdash; Campa&ntilde;a objetivo engagement (ThruPlay)</td>'
  + '</tr><tr>'
  + '<td ' + gTd + '><b>AWR</b> &mdash; Campa&ntilde;a objetivo awareness (reach, impresiones)</td>'
  + '<td ' + gTd + '><b>Cold</b> &mdash; Audiencia fr&iacute;a: nunca interactu&oacute; con ENBA</td>'
  + '<td ' + gTd + '><b>Retarget</b> &mdash; Audiencia caliente: interactu&oacute; previamente (D1&ndash;D4)</td>'
  + '</tr></table>'
  // Verdicts grid — 3 columns, 3 rows
  + '<table cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">'
  + '<tr>'
  + '<td style="font-size:10px;padding:3px 8px 3px 0;vertical-align:top;"><span style="background:#dcfce7;color:#15803d;padding:1px 6px;border-radius:3px;font-weight:bold;">WINNER</span>&nbsp; KPI bajo umbral + ER &gt; 3%</td>'
  + '<td style="font-size:10px;padding:3px 8px 3px 0;vertical-align:top;"><span style="background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:3px;font-weight:bold;">VIABLE</span>&nbsp; Dentro de par&aacute;metros</td>'
  + '<td style="font-size:10px;padding:3px 0;vertical-align:top;"><span style="background:#ede9fe;color:#6d28d9;padding:1px 6px;border-radius:3px;font-weight:bold;">LEARNING</span>&nbsp; Menos de 72h activo &mdash; sin veredicto v&aacute;lido</td>'
  + '</tr><tr>'
  + '<td style="font-size:10px;padding:3px 8px 3px 0;vertical-align:top;"><span style="background:#fef9c3;color:#92400e;padding:1px 6px;border-radius:3px;font-weight:bold;">WARNING</span>&nbsp; &ge;10d activo &mdash; preparar reemplazo urgente</td>'
  + '<td style="font-size:10px;padding:3px 8px 3px 0;vertical-align:top;"><span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:3px;font-weight:bold;">HOLD PUENTE</span>&nbsp; Mal rendimiento, sin reemplazo &mdash; mantener por cobertura</td>'
  + '<td style="font-size:10px;padding:3px 0;vertical-align:top;"><span style="background:#fce7f3;color:#9d174d;padding:1px 6px;border-radius:3px;font-weight:bold;">REEMPLAZAR</span>&nbsp; Fuera de umbral &mdash; pausar cuando haya creativo nuevo</td>'
  + '</tr><tr>'
  + '<td colspan="3" style="font-size:10px;padding:3px 0;vertical-align:top;"><span style="background:#fee2e2;color:#b91c1c;padding:1px 6px;border-radius:3px;font-weight:bold;">CORTAR</span>&nbsp; Fuera de umbral + reemplazo ya activo &mdash; pausar ahora</td>'
  + '</tr></table>'
  + '</td></tr></table>';


// Frescura banner
var freshnessBannerHtml = freshnessWarning
  ? '<div style="background:#fef9c3;border-left:4px solid #ca8a04;padding:8px 14px;margin:8px 20px;font-size:11px;">'
    + '<b style="color:#92400e;">AVISO FRESCURA:</b> ' + freshnessWarning + '</div>'
  : '';

// Budget risk banner
var budgetBannerHtml = budgetRisk
  ? '<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:8px 14px;margin:8px 20px;font-size:11px;">'
    + '<b style="color:#b91c1c;">RIESGO PRESUPUESTO:</b>'
    + ' Burn $' + burnRateDaily.toLocaleString() + '/dia · Restante $' + Math.round(budgetRemaining).toLocaleString()
    + ' · Se agota el <b>' + exhaustStr + '</b>'
    + ' (' + (daysToEnd - daysAtBurn) + ' dias antes del 16/05)'
    + ' · Max diario: <b>$' + Math.round(budgetRemaining / daysToEnd).toLocaleString() + '/dia</b>'
    + '</div>'
  : '';


var html = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
  + '<style>*{box-sizing:border-box;margin:0;padding:0;}</style></head>'
  + '<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:0;">'
  + '<div style="max-width:980px;margin:0 auto;background:white;border:1px solid #e2e8f0;">'

  // HEADER oscuro — table-based
  + '<div style="background:#0f172a;color:white;padding:14px 20px 16px;">'
  + '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
  + '<td style="vertical-align:baseline;"><b style="font-size:15px;color:white;">ENBA Meta Ads &mdash; Reporte Diario</b></td>'
  + '<td align="right" style="vertical-align:baseline;white-space:nowrap;font-size:11px;color:#94a3b8;">' + todayStr + ' &middot; ' + timeStr + ' ART &middot; Dia ' + dayRef + ' de ' + CAMPAIGN_TOTAL_DAYS + '</td>'
  + '</tr></table>'
  // Metrics bar — table-based
  + '<table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #1e3a5f;border-radius:6px;margin-top:12px;"><tr>'
  + '<td width="16%" style="padding:8px 12px;text-align:center;border-right:1px solid #1e3a5f;vertical-align:middle;">'
    + '<div style="font-size:16px;font-weight:bold;color:white;">$' + totalSpend.toLocaleString() + '</div>'
    + '<div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;">Spend total</div></td>'
  + '<td width="16%" style="padding:8px 12px;text-align:center;border-right:1px solid #1e3a5f;vertical-align:middle;">'
    + '<div style="font-size:16px;font-weight:bold;color:' + (budgetRisk ? '#f87171' : '#fbbf24') + ';">$' + burnRateDaily.toLocaleString() + '</div>'
    + '<div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;">Burn rate / dia</div></td>'
  + '<td width="16%" style="padding:8px 12px;text-align:center;border-right:1px solid #1e3a5f;vertical-align:middle;">'
    + '<div style="font-size:16px;font-weight:bold;color:#4ade80;">$' + Math.round(budgetRemaining).toLocaleString() + '</div>'
    + '<div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;">Presupuesto restante</div></td>'
  + '<td width="18%" style="padding:8px 12px;text-align:center;border-right:1px solid #1e3a5f;vertical-align:middle;">'
    + '<div style="font-size:16px;font-weight:bold;color:white;">' + totalIgVisits.toLocaleString() + '</div>'
    + '<div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;">Visitas perfil IG</div></td>'
  + '<td width="17%" style="padding:8px 12px;text-align:center;border-right:1px solid #1e3a5f;vertical-align:middle;">'
    + '<div style="font-size:16px;font-weight:bold;color:white;">' + totalFbLikes.toLocaleString() + '</div>'
    + '<div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;">Page likes FB</div></td>'
  + '<td style="padding:8px 12px;text-align:center;vertical-align:middle;">'
    + '<div style="font-size:16px;font-weight:bold;color:white;">' + totalSaves + '</div>'
    + '<div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.04em;">Saves</div></td>'
  + '</tr></table>'
  + '</div>'

  // FOLLOWERS HERO — 4 columnas: FB | IG | Total Nuevos | KPI box
  + '<div style="background:#0f172a;border-top:1px solid #1e3a5f;padding:10px 20px 14px;">'
  + '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
  + '<td width="130" style="text-align:center;vertical-align:middle;padding-right:14px;">'
    + '<div style="font-size:22px;font-weight:bold;color:white;">' + (fbFollowersNow !== null ? fbFollowersNow.toLocaleString() : '?') + '</div>'
    + '<div style="font-size:11px;color:#4ade80;">+' + (fbNetNew || 0) + ' desde 22/04</div>'
    + '<div style="font-size:10px;color:#94a3b8;">Seguidores Facebook</div></td>'
  + '<td width="1" style="background:#1e3a5f;padding:0;">&nbsp;</td>'
  + '<td width="130" style="text-align:center;vertical-align:middle;padding:0 14px;">'
    + '<div style="font-size:22px;font-weight:bold;color:white;">' + (igFollowersNow !== null ? igFollowersNow.toLocaleString() : '?') + '</div>'
    + '<div style="font-size:11px;color:#4ade80;">+' + (igNetNew || 0) + ' desde 22/04</div>'
    + '<div style="font-size:10px;color:#94a3b8;">Seguidores Instagram</div></td>'
  + '<td width="1" style="background:#1e3a5f;padding:0;">&nbsp;</td>'
  + '<td width="130" style="text-align:center;vertical-align:middle;padding:0 14px;">'
    + '<div style="font-size:22px;font-weight:bold;color:white;">~' + totalNetNew.toLocaleString() + '</div>'
    + '<div style="font-size:10px;color:#94a3b8;margin-top:2px;">total nuevos</div>'
    + '<div style="font-size:10px;color:#64748b;">IG + FB desde 22/04</div></td>'
  + '<td width="1" style="background:#1e3a5f;padding:0;">&nbsp;</td>'
  + '<td style="padding-left:14px;vertical-align:middle;">'
    + (bestCpvIG !== null ? '<div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">CPV perfil IG <span style="font-size:9px;color:#4ade80;">(' + bestCpvVerdict + ')</span>: <b style="color:white;">$' + bestCpvIG + '</b></div>' : '')
    + (bestCpfFB !== null ? '<div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">CPF best FB: <b style="color:white;">~$' + bestCpfFB + '</b> <span style="font-size:9px;color:#64748b;">(' + bestCpfAdShort + ')</span></div>' : '')
    + '<div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Follow rate IG: <b style="color:' + frColor + ';">' + (igFollowRate !== null ? igFollowRate + '%' : '?') + '</b> <span style="font-size:10px;color:#475569;">(obj &gt;5%)</span></div>'
    + '<div style="font-size:11px;color:#94a3b8;">CPS blended: <b style="color:white;">' + (blendedCPS !== null ? '$' + blendedCPS : '&mdash;') + '</b></div>'
  + '</td></tr></table>'
  + '</div>'

  // Banners frescura / presupuesto
  + freshnessBannerHtml
  + budgetBannerHtml

  // VERDICTS STRIP — aggregate counts
  + '<div style="background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:8px 20px;">'
  + '<span style="font-size:10px;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.06em;display:inline-block;vertical-align:middle;margin-right:10px;">Activos hoy:</span>'
  + verdictPills
  + '</div>'

  // ROADMAP + PACE — table-based
  + '<div style="padding:12px 20px;border-bottom:1px solid #e2e8f0;">'
  + '<div style="font-size:10px;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Roadmap &mdash; Objetivo ' + GOAL_ADJUSTED.toLocaleString() + ' seguidores (19/04 &mdash; 16/05)</div>'
  + '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
  + '<td style="vertical-align:top;padding-right:20px;">'
    + '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
    + '<td style="font-size:24px;font-weight:bold;color:#1e293b;vertical-align:baseline;">' + ((fbFollowersNow || CAMPAIGN_BASELINE_FB) + (igFollowersNow || CAMPAIGN_BASELINE_IG)).toLocaleString() + '</td>'
    + '<td align="right" style="font-size:11px;color:#64748b;vertical-align:baseline;">/ ' + GOAL_ADJUSTED.toLocaleString() + ' seguidores nuevos &middot; ' + progressPct + '%</td>'
    + '</tr></table>'
    + '<div style="background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;margin:4px 0;">'
    + '<div style="background:' + barColor + ';height:8px;width:' + progressPct + '%;border-radius:4px;"></div></div>'
    + '<div style="font-size:10px;color:#94a3b8;">Dia ' + dayRef + ' de ' + CAMPAIGN_TOTAL_DAYS + ' &middot; ' + (CAMPAIGN_TOTAL_DAYS - dayRef) + ' dias operativos restantes (hasta 16/05)</div>'
    + '<div style="margin-top:7px;">'
    + '<span style="font-size:10px;background:#f1f5f9;border-radius:3px;padding:2px 6px;color:#475569;display:inline-block;">Restante <b style="color:#1e293b;">$' + Math.round(budgetRemaining).toLocaleString() + '</b></span>'
    + '&nbsp;&nbsp;'
    + '<span style="font-size:10px;background:#f1f5f9;border-radius:3px;padding:2px 6px;color:#475569;display:inline-block;">Burn <b style="color:#1e293b;">$' + burnRateDaily.toLocaleString() + '/dia</b></span>'
    + '&nbsp;&nbsp;'
    + '<span style="font-size:10px;background:' + (budgetRisk ? '#fef2f2' : '#f0fdf4') + ';border-radius:3px;padding:2px 6px;color:' + (budgetRisk ? '#b91c1c' : '#15803d') + ';display:inline-block;">Budget ' + (budgetRisk ? 'RIESGO hasta ' + exhaustStr : 'alcanza ✓ hasta 16/05') + '</span>'
    + '</div>'
  + '</td>'
  + '<td width="360" style="vertical-align:top;">'
    + '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:5px;padding:8px 12px;">'
    + '<div style="font-size:10px;font-weight:bold;color:#b91c1c;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">' + (currentDailyPace < paceNeeded ? '&#9888; D&eacute;ficit de Pace' : 'En Pace') + '</div>'
    + '<table cellpadding="0" cellspacing="0"><tr>'
    + '<td style="text-align:center;padding-right:16px;vertical-align:top;"><div style="font-size:18px;font-weight:bold;color:#b91c1c;">' + paceNeeded + '</div><div style="font-size:9px;color:#9ca3af;text-transform:uppercase;">Seg/dia necesarios</div></td>'
    + '<td style="text-align:center;padding-right:16px;vertical-align:top;"><div style="font-size:18px;font-weight:bold;color:#1d4ed8;">~' + currentDailyPace + '</div><div style="font-size:9px;color:#9ca3af;text-transform:uppercase;">Ritmo actual (prom)</div></td>'
    + '<td style="text-align:center;vertical-align:top;"><div style="font-size:18px;font-weight:bold;color:#b91c1c;">~' + projectedEnd.toLocaleString() + '</div><div style="font-size:9px;color:#9ca3af;text-transform:uppercase;">Proyeccion al 16/05</div></td>'
    + '</tr></table>'
    + '<div style="font-size:10px;color:#6b7280;margin-top:5px;">Gap: ' + gapToGoal.toLocaleString() + ' &middot; ' + (CAMPAIGN_TOTAL_DAYS - dayRef) + ' dias operativos &middot; ' + gapToGoal.toLocaleString() + ' / ' + (CAMPAIGN_TOTAL_DAYS - dayRef) + ' = ' + paceNeeded + '/dia necesarios</div>'
    + '<div style="font-size:9px;text-align:center;margin-top:5px;color:' + (budgetRisk ? '#b91c1c' : '#15803d') + ';font-weight:bold;">'
    + (budgetRisk ? 'Budget RIESGO &mdash; se agota el ' + exhaustStr : 'Budget alcanza &#10003; hasta 16/05')
    + '</div>'
    + '</div>'
  + '</td></tr></table>'
  + '</div>'

  // ADS ACTIVOS — header table-based
  + '<div style="padding:12px 20px 0;">'
  + '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
  + '<td style="font-size:10px;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.06em;padding:5px 8px;background:#f1f5f9;border-radius:3px;vertical-align:middle;">Ads activos &mdash; gastan dinero ahora</td>'
  + '<td align="right" style="font-size:10px;color:#94a3b8;font-weight:normal;padding:5px 8px;background:#f1f5f9;border-radius:3px;vertical-align:middle;white-space:nowrap;">' + activeResults.length + ' ads &middot; $' + burnRateDaily.toLocaleString() + '/dia estimado</td>'
  + '</tr></table>'
  + '</div>'
  + '<div style="overflow-x:auto;padding:4px 20px 0;">'
  + '<table style="border-collapse:collapse;width:100%;font-size:11px;">'
  + '<thead><tr>'
  + '<th style="padding:5px 7px;text-align:left;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;min-width:140px;max-width:175px;">Ad</th>'
  + '<th style="padding:5px 7px;text-align:center;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">Tipo</th>'
  + '<th style="padding:5px 7px;text-align:center;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">Dias</th>'
  + '<th style="padding:5px 7px;text-align:right;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">$</th>'
  + '<th style="padding:5px 7px;text-align:right;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">Alc.</th>'
  + '<th style="padding:5px 7px;text-align:center;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">CTR</th>'
  + '<th style="padding:5px 7px;text-align:center;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">ER</th>'
  + '<th style="padding:5px 7px;text-align:center;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">Fr.</th>'
  + '<th style="padding:5px 7px;text-align:center;background:#eff6ff;border-bottom:2px solid #93c5fd;font-size:10px;color:#1d4ed8;white-space:nowrap;">KPI ENBA<br><span style="font-size:9px;font-weight:normal;color:#64748b;">CPV (IG) &middot; CPF (FB) &middot; Hold% (ENG)</span></th>'
  + '<th style="padding:5px 7px;text-align:center;background:#f0fdf4;border-bottom:2px solid #86efac;font-size:10px;color:#15803d;white-space:nowrap;min-width:90px;">Veredicto &middot; Accion</th>'
  + '<th style="padding:5px 7px;text-align:left;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-size:10px;color:#64748b;white-space:nowrap;">Razon</th>'
  + '</tr></thead><tbody>'
  + activeTableRows
  + '</tbody></table></div>'

  // AUTO-INSIGHTS — después de la tabla de ads activos
  + (insightsHtml ? '<div style="padding:8px 20px 4px;">' + insightsHtml + '</div>' : '')

  // ADS PAUSADOS
  + '<div style="padding:0 20px 12px;margin-top:12px;">'
  + '<div style="font-size:10px;font-weight:bold;color:#94a3b8;padding:4px 8px;background:#f8fafc;border-radius:3px;margin-bottom:5px;">Ads Pausados &mdash; historial unicamente, sin gasto actual (' + pausedResults.length + ' ads)</div>'
  + '<div style="overflow-x:auto;opacity:0.65;">'
  + '<table style="border-collapse:collapse;width:100%;font-size:10px;">'
  + '<thead><tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">'
  + '<th style="padding:3px 6px;text-align:left;font-size:10px;color:#64748b;">Ad</th>'
  + '<th style="padding:3px 6px;text-align:center;font-size:10px;color:#64748b;">Tipo</th>'
  + '<th style="padding:3px 6px;text-align:center;font-size:10px;color:#64748b;">Dias</th>'
  + '<th style="padding:3px 6px;text-align:right;font-size:10px;color:#64748b;">Spend hist.</th>'
  + '<th style="padding:3px 6px;text-align:center;font-size:10px;color:#64748b;">CTR</th>'
  + '<th style="padding:3px 6px;text-align:center;font-size:10px;color:#64748b;">ER</th>'
  + '<th style="padding:3px 6px;text-align:center;font-size:10px;color:#64748b;">KPI ENBA</th>'
  + '<th style="padding:3px 6px;text-align:left;font-size:10px;color:#64748b;">Motivo pausa</th>'
  + '</tr></thead><tbody>'
  + pausedTableRows
  + '</tbody></table></div></div>'

  // PROMPT BRUNO — table header
  + '<div style="margin:0 20px 20px;border-top:1px solid #e2e8f0;padding-top:12px;">'
  + '<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:6px;"><tr>'
  + '<td style="font-size:11px;font-weight:bold;color:#1e293b;vertical-align:middle;">Prompt para Bruno &mdash; copiar y pegar en Claude Code con /bruno</td>'
  + '<td align="right" style="font-size:10px;color:#94a3b8;font-weight:normal;vertical-align:middle;white-space:nowrap;">Corte: ' + todayStr + ' ' + timeStr + ' ART &middot; Dia ' + dayRef + ' de ' + CAMPAIGN_TOTAL_DAYS + '</td>'
  + '</tr></table>'
  + '<pre style="background:#0f172a;border-radius:5px;padding:14px;font-size:10px;font-family:Courier New,monospace;white-space:pre-wrap;color:#e2e8f0;line-height:1.5;">'
  + brunoPrompt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  + '</pre></div>'

  // BENCHMARK COMPETIDORES — datos estáticos abr 2026
  + '<div style="border-top:1px solid #e2e8f0;padding:12px 20px 0;">'
  + '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
  + '<td style="font-size:10px;font-weight:bold;color:#475569;text-transform:uppercase;letter-spacing:0.06em;padding:5px 8px;background:#f1f5f9;border-radius:3px;vertical-align:middle;">Benchmark Competidores &mdash; Redes Sociales</td>'
  + '<td align="right" style="font-size:10px;color:#94a3b8;font-weight:normal;padding:5px 8px;background:#f1f5f9;border-radius:3px;vertical-align:middle;white-space:nowrap;">Actualizaci&oacute;n manual requerida &middot; &Uacute;ltima verificaci&oacute;n: abr 2026</td>'
  + '</tr></table>'
  + '<p style="font-size:10px;color:#94a3b8;margin:6px 0 8px;">Datos verificados manualmente. Actualizar semanalmente. Fuente: an&aacute;lisis competitivo ENBA abr 2026.</p>'
  + '</div>'
  + '<div style="overflow-x:auto;padding:0 20px 0;">'
  + '<table style="border-collapse:collapse;width:100%;font-size:11px;">'
  + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">'
  + '<th style="padding:4px 7px;text-align:left;font-size:10px;color:#64748b;min-width:160px;">Competidor</th>'
  + '<th style="padding:4px 7px;text-align:left;font-size:10px;color:#64748b;">Zona</th>'
  + '<th style="padding:4px 7px;text-align:left;font-size:10px;color:#64748b;">Verticales</th>'
  + '<th style="padding:4px 7px;text-align:right;font-size:10px;color:#64748b;">IG</th>'
  + '<th style="padding:4px 7px;text-align:right;font-size:10px;color:#64748b;">FB</th>'
  + '<th style="padding:4px 7px;text-align:right;font-size:10px;color:#64748b;">TikTok</th>'
  + '<th style="padding:4px 7px;text-align:left;font-size:10px;color:#64748b;">Diferenciador clave</th>'
  + '<th style="padding:4px 7px;text-align:right;font-size:10px;color:#b91c1c;">Gap IG vs ENBA</th>'
  + '</tr></thead><tbody>'
  // ENBA — fila destacada con seguidores reales del día
  + '<tr style="background:#eff6ff;border-top:2px solid #93c5fd;border-bottom:2px solid #93c5fd;">'
  + '<td style="padding:4px 7px;font-weight:bold;color:#1d4ed8;font-size:10px;">&#9658; ENBA (nosotros)</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Costanera Norte</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Paseos &middot; Escuela &middot; Traves&iacute;as &middot; Broker</td>'
  + '<td style="padding:4px 7px;text-align:right;color:#1d4ed8;font-weight:bold;font-size:10px;">' + (igFollowersNow || '~') + '</td>'
  + '<td style="padding:4px 7px;text-align:right;color:#1d4ed8;font-weight:bold;font-size:10px;">' + (fbFollowersNow || '~') + '</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash;</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Hub n&aacute;utico completo &middot; Blog SEO &middot; Marca unificada</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;">&mdash;</td>'
  + '</tr>'
  // D'Serra
  + '<tr style="border-bottom:1px solid #f1f5f9;">'
  + '<td style="padding:4px 7px;font-size:10px;"><b>Esc. N&aacute;utica D\'Serra</b><br><span style="font-size:9px;color:#94a3b8;">IG @escuelanauticads &middot; FB @EscuelaNauticaDSerra</span></td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Costanera Norte</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Paseos &middot; Escuela &middot; Traves&iacute;as &middot; Broker &middot; <b>Astillero</b></td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;">~7.200</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;">~26.000</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;">~2.700</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">20+ a&ntilde;os &middot; Fabrica veleros &middot; 10 personas visibles</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;background:#fef2f2;color:#b91c1c;font-weight:bold;">&times;90</td>'
  + '</tr>'
  // Bairesnavega
  + '<tr style="border-bottom:1px solid #f1f5f9;">'
  + '<td style="padding:4px 7px;font-size:10px;"><b>Bairesnavega</b><br><span style="font-size:9px;color:#94a3b8;">IG @bairesnavega</span></td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">San Isidro</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Paseos &middot; Vouchers</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;">~106.000</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash;</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash;</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Cara visible &middot; Lifestyle &middot; Voucher &uacute;nico $110K</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;background:#fef2f2;color:#b91c1c;font-weight:bold;">&times;1.325</td>'
  + '</tr>'
  // Medio Siglo
  + '<tr style="border-bottom:1px solid #f1f5f9;">'
  + '<td style="padding:4px 7px;font-size:10px;"><b>Medio Siglo</b><br><span style="font-size:9px;color:#94a3b8;">IG @mediosiglovelero &middot; FB @mediosiglovelero</span></td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">San Isidro</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Paseos &middot; Traves&iacute;as</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;">~13.000</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash; verif.</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash;</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Storytelling personal &middot; Bigbox &middot; GetYourGuide</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;background:#fef2f2;color:#b91c1c;font-weight:bold;">&times;163</td>'
  + '</tr>'
  // Navegando BA
  + '<tr style="border-bottom:1px solid #f1f5f9;">'
  + '<td style="padding:4px 7px;font-size:10px;"><b>Navegando BA</b><br><span style="font-size:9px;color:#94a3b8;">IG @navegandobsas &middot; FB @navegandobsas</span></td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Costanera Norte</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Paseos</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash; verif.</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash; verif.</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash;</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Civitatis 9.9/10 &middot; $72K/pax con aperitivo &middot; misma zona</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash; verif.</td>'
  + '</tr>'
  // Sailing Republic
  + '<tr>'
  + '<td style="padding:4px 7px;font-size:10px;"><b>Sailing Republic</b><br><span style="font-size:9px;color:#94a3b8;">IG @sailingrepublic</span></td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Puerto N&uacute;&ntilde;ez</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Paseos &middot; Navegaci&oacute;n</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash; verif.</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash;</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash;</td>'
  + '<td style="padding:4px 7px;font-size:10px;color:#475569;">Puerto N&uacute;&ntilde;ez &middot; perfil digital bajo</td>'
  + '<td style="padding:4px 7px;text-align:right;font-size:10px;color:#94a3b8;">&mdash; verif.</td>'
  + '</tr>'
  + '</tbody></table></div>'
  + '<div style="margin:4px 20px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 12px;font-size:10px;color:#64748b;">'
  + '<b style="color:#475569;">Notas de contexto:</b> D\'Serra (mismo edificio) tiene 90&times; m&aacute;s seguidores IG con 20 a&ntilde;os de ventaja. Bairesnavega domina IG con estrategia lifestyle + cara visible. Ning&uacute;n competidor invierte en Google Ads &mdash; oportunidad virgen con CPC bajo. Los datos marcados &ldquo;&mdash; verificar&rdquo; deben relevarse manualmente. <b style="color:#b91c1c;">Actualizar esta tabla 1&times; por semana.</b>'
  + '</div>'

  // GLOSARIO (table-based)
  + glosario

  // FOOTER — table-based
  + '<div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:7px 20px;">'
  + '<table cellpadding="0" cellspacing="0" width="100%"><tr>'
  + '<td style="font-size:10px;color:#94a3b8;">ENBA Ads Evaluation v7</td>'
  + '<td align="right" style="font-size:10px;color:#94a3b8;">' + new Date().toISOString() + ' &middot; Burn rate: ' + (burnRateSource === 'ad_set_budgets' ? 'suma ad sets activos (real)' : 'promedio hist&oacute;rico (estimado)') + '</td>'
  + '</tr></table>'
  + '</div>'
  + '</div></body></html>';

return [{ json: {
  subject: subject, html: html, brunoPrompt: brunoPrompt,
  totalSpend: totalSpend, totalIgFollows: totalIgFollows,
  totalIgVisits: totalIgVisits, totalFbLikes: totalFbLikes,
  totalSaves: totalSaves, blendedCPM: blendedCPM,
  blendedCPS: blendedCPS, burnRateDaily: burnRateDaily, burnRateSource: burnRateSource,
  budgetRemaining: Math.round(budgetRemaining), budgetRisk: budgetRisk,
  fbFollowersNow: fbFollowersNow, igFollowersNow: igFollowersNow,
  igFollowRate: igFollowRate,
  adsCount: results.length, activeAdsCount: activeResults.length, pausedAdsCount: pausedResults.length,
  summaryStr: summaryStr, freshnessWarning: freshnessWarning,
  diagActionTypes: diagActionTypes
} }];
