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
var adStatusMap = {};
try {
  var statusData = $('Get Ad Status Batch').first().json;
  Object.keys(statusData).forEach(function(id) {
    adStatusMap[id] = statusData[id].effective_status;
  });
} catch(e) {}

// ── Input: burn rate real (nodo "Get Ad Set Budgets") ──────────────────
// Suma de daily_budget de ad sets con effective_status ACTIVE
var realBurnRate = 0;
var burnRateSource = 'historical_avg';
try {
  var budgetData = $('Get Ad Set Budgets').first().json;
  Object.values(budgetData).forEach(function(adset) {
    if (adset.effective_status === 'ACTIVE') {
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
  Object.keys(qualData).forEach(function(id) {
    qualityMap[id] = qualData[id];
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

// ── Conteo veredictos (solo activos para el resumen ejecutivo) ─────────
var counts = {};
activeResults.forEach(function(r) { counts[r.verdict] = (counts[r.verdict] || 0) + 1; });
var summaryParts = [];
if (counts.WINNER)          summaryParts.push(counts.WINNER + ' WINNER');
if (counts.VIABLE)          summaryParts.push(counts.VIABLE + ' VIABLE');
if (counts.LEARNING)        summaryParts.push(counts.LEARNING + ' LEARNING');
if (counts.CORTAR)          summaryParts.push(counts.CORTAR + ' CORTAR');
if (counts.FATIGUE)         summaryParts.push(counts.FATIGUE + ' FATIGUE');
if (counts.FATIGUE_WARNING) summaryParts.push(counts.FATIGUE_WARNING + ' WARNING');
if (counts.MAX_REACHED)     summaryParts.push(counts.MAX_REACHED + ' MAX');
var summaryStr = summaryParts.join(' | ') || 'Sin datos';

// ── Estilos HTML ───────────────────────────────────────────────────────
function verdictStyle(v) {
  var map = {
    WINNER:          { color: '#16a34a', bg: '#f0fdf4' },
    VIABLE:          { color: '#2563eb', bg: '#eff6ff' },
    LEARNING:        { color: '#7c3aed', bg: '#f5f3ff' },
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

// ── Función fila tabla ─────────────────────────────────────────────────
function makeTableRow(r) {
  var s = verdictStyle(r.verdict);
  var tpCell   = r.thruPlays > 0 ? r.thruPlayRate + '%' : '—';
  var hookCell = r.isVideoAd ? r.hookRate + '%' : '—';
  var holdCell = (r.isVideoAd && r.videoViews3s > 0) ? r.holdRate + '%' : '—';
  var savesCell = r.saves > 0 ? r.saves : '—';
  var segCell = r.segment !== '—' ? r.segment : '';
  return '<tr style="border-bottom:1px solid #e5e7eb;">'
    + '<td style="padding:5px 8px;font-size:11px;max-width:170px;">' + r.adName + '</td>'
    + '<td style="padding:4px;text-align:center;">' + typeBadge(r.campaignType) + '</td>'
    + '<td style="padding:4px;text-align:center;font-size:10px;color:#6b7280;">' + r.platform + '</td>'
    + '<td style="padding:4px;text-align:center;font-size:10px;color:#6b7280;">' + segCell + '</td>'
    + '<td style="padding:4px;text-align:center;">' + r.daysActive + 'd</td>'
    + '<td style="padding:4px;text-align:right;">$' + r.spend.toLocaleString() + '</td>'
    + '<td style="padding:4px;text-align:right;font-size:10px;color:#6b7280;">$' + r.cpm + '</td>'
    + '<td style="padding:4px;text-align:right;">' + r.reach.toLocaleString() + '</td>'
    + '<td style="padding:4px;text-align:center;">' + r.ctr + '%</td>'
    + '<td style="padding:4px;text-align:center;">' + r.er + '%</td>'
    + '<td style="padding:4px;text-align:center;">' + r.frequency + '</td>'
    + '<td style="padding:4px;text-align:center;color:#7c3aed;">' + tpCell + '</td>'
    + '<td style="padding:4px;text-align:center;color:#0891b2;">' + hookCell + '</td>'
    + '<td style="padding:4px;text-align:center;color:#0891b2;">' + holdCell + '</td>'
    + '<td style="padding:4px;text-align:center;color:#059669;">' + savesCell + '</td>'
    + '<td style="padding:4px;text-align:center;font-size:11px;">' + r.followLabel + '</td>'
    + '<td style="padding:4px;text-align:right;">' + r.cps + '</td>'
    + '<td style="padding:4px;text-align:center;background:' + s.bg + ';color:' + s.color + ';font-weight:bold;">' + r.verdict + '</td>'
    + '<td style="padding:4px;font-size:10px;color:#6b7280;">' + r.reason + '</td>'
    + '</tr>';
}
var activeTableRows = activeResults.map(makeTableRow).join('\n');
var pausedTableRows = pausedResults.map(makeTableRow).join('\n');

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
var gapToGoal    = 10000 - (fbFollowersNow || CAMPAIGN_BASELINE_FB) - (igFollowersNow || CAMPAIGN_BASELINE_IG) + 34;
var orchestratorSection =
  '## CONTEXTO DE CAMPANA — Orquestador\n\n'
  + 'Mision: 10.000 seguidores IG+FB en 27 dias de pauta (19/04 – 16/05/2026).\n'
  + 'Datos frescos al: ' + todayStr + ' ' + String(artNow.getUTCHours()).padStart(2,'0') + ':' + String(artNow.getUTCMinutes()).padStart(2,'0') + ' ART'
  + (burnRateSource === 'ad_set_budgets' ? ' | Burn rate: sum ad_set budgets activos' : ' | Burn rate: promedio historico')
  + (freshnessWarning ? ' | AVISO: ' + freshnessWarning : '')
  + '\n\n'
  + '### Posicion actual: Dia ' + dayRef + ' de 27\n'
  + '- Seguidores FB: ' + (fbFollowersNow || '?') + ' (baseline 23 → ' + fbNetNewStr + ' nuevos)\n'
  + '- Seguidores IG: ' + (igFollowersNow || '?') + ' (baseline 11 → ' + igNetNewStr + ' nuevos)\n'
  + '- Total nuevos: ' + totalNetNew + ' / objetivo 10.000 | Gap: ' + gapToGoal + ' seguidores\n\n'
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

var brunoPrompt = 'Contexto REDES. Carga /bruno.\n\n'
  + orchestratorSection
  + 'Reporte automatico Meta Ads — ' + todayStr + '.\n'
  + 'Campana ENBA activa desde 19/04/2026. Dia ' + dayRef + ' de ' + CAMPAIGN_TOTAL_DAYS + '.\n'
  + 'Spend total: $' + totalSpend.toLocaleString()
  + ' | CPM blended: $' + (blendedCPM || '—')
  + ' | Reach: ' + totalReach.toLocaleString()
  + ' | ThruPlays: ' + totalThruPlays.toLocaleString()
  + ' | Saves: ' + totalSaves
  + '\n'
  + followerSummary
  + burnSummary
  + '\n## Resumen por segmento — Follow Plan\n'
  + segTableLines.join('\n') + '\n'
  + '\n## Benchmarks 2026\n'
  + '- CPM IG/FB Argentina: $30-$80 normal, < $30 excelente, > $120 problema\n'
  + '- Hook Rate (3s views / impressions): > 25% bueno, > 40% excelente\n'
  + '- Hold Rate (thruplay / 3s views): > 25% bueno, > 40% excelente\n'
  + '- CTR micro-video 15s FB: 3-8% normal, > 10% excepcional\n'
  + '- CPF cuentas nuevas Argentina: $80-$300 rango normal\n'
  + '- Follow rate (visit→follow): 15-35% benchmark cuentas nuevas\n'
  + '- Quality Ranking ABOVE_AVERAGE = top 55%; AVERAGE = ok; BELOW_AVERAGE = problema creativo o saturacion\n'
  + '\n## Datos por objetivo — ACTIVOS\n'
  + makeBrunoSection(activeResults.filter(function(r) { return r.campaignType === 'FOLLOW'; }), 'FOLLOW Plan (objetivo: visitas perfil IG + page likes FB)')
  + makeBrunoSection(activeResults.filter(function(r) { return r.campaignType === 'ENG'; }),    'ENGAGEMENT (objetivo: post engagement, ThruPlay, construye D4)')
  + makeBrunoSection(activeResults.filter(function(r) { return r.campaignType === 'AWR'; }),    'AWARENESS (objetivo: reach)')
  + d4Context
  + '\n## Historial — PAUSADOS (sin gasto actual)\n'
  + makeBrunoSection(pausedResults, 'Ads pausados — referencia historica unicamente')
  + '\n## Reglas plan v4\n'
  + '- CORTAR (72h+): CPS > $100 o ER < 1% o CTR < 0.4%\n'
  + '- WINNER (72h+): CPS < $30 + ER > 3%\n'
  + '- FATIGUE: Frecuencia > 3.5 · MAX: > 14 dias\n'
  + '- Escalar WINNER: +25% cada 48h, triple scale si win 5 dias\n'
  + '- Gate 2 dia 10 (29/04): follows>200, ER>3%, CPS<$80\n\n'
  + '## Tu tarea\n'
  + '1. Confirma o corregi cada veredicto automatico (solo ads ACTIVOS)\n'
  + '2. Propone acciones: pausar, escalar, rotar — con impacto presupuestario\n'
  + '3. Evalua el riesgo de presupuesto si hay alerta de burn rate\n'
  + '4. Analiza follow rate IG si hay datos (benchmark 15-35%)\n'
  + '5. Video ads: Hook Rate < 15% = problema de gancho; Hold Rate < 20% = problema de retencion\n'
  + '6. Quality Rankings BELOW_AVERAGE = senal de fatiga creativa o mismatch de audiencia\n'
  + '7. Evalua D4 audience y si ya tiene volumen para warm retargeting\n'
  + '8. Segmento Cold vs Retarget: comparar CPF entre segmentos del mismo canal\n\n'
  + 'Entrega tu analisis y espera aprobacion antes de ejecutar.';

// ── HTML email ─────────────────────────────────────────────────────────
var diagLines = Object.keys(diagActionTypes).sort().map(function(k) {
  return k + ': ' + diagActionTypes[k];
});

// Alerta presupuesto (banner en email)
var budgetBanner = '';
if (budgetRisk) {
  budgetBanner = '<div style="background:#fef2f2;border:2px solid #dc2626;border-radius:6px;padding:10px 14px;margin:12px 0;">'
    + '<b style="color:#dc2626;">⚠ RIESGO PRESUPUESTO:</b>'
    + ' Burn rate $' + burnRateDaily.toLocaleString() + '/día · Presupuesto restante $' + Math.round(budgetRemaining).toLocaleString()
    + ' · Se agota el <b>' + exhaustStr + '</b>'
    + ' (' + (daysToEnd - daysAtBurn) + ' días antes del 16/05)'
    + ' · Budget diario máximo para llegar al fin: <b>$' + Math.round(budgetRemaining / daysToEnd).toLocaleString() + '/día</b>'
    + '</div>';
}

// Panel follower counts
var followerPanel = '';
if (fbFollowersNow !== null || igFollowersNow !== null) {
  var followRateHtml = igFollowRate !== null
    ? ' &middot; Follow rate IG: <b style="color:' + (parseFloat(igFollowRate) < 10 ? '#dc2626' : '#16a34a') + ';">' + igFollowRate + '%</b>'
      + ' <span style="color:#6b7280;font-size:10px;">(bench 15–35%)</span>'
    : '';
  followerPanel = '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 14px;margin:8px 0;font-size:12px;">'
    + '👥 <b>Seguidores ahora:</b>'
    + (fbFollowersNow !== null ? ' FB <b>' + fbFollowersNow + '</b> (+' + (fbFollowersNow - CAMPAIGN_BASELINE_FB) + ' desde 22/04)' : '')
    + (igFollowersNow !== null ? ' &middot; IG <b>' + igFollowersNow + '</b> (+' + (igFollowersNow - CAMPAIGN_BASELINE_IG) + ' desde 22/04)' : '')
    + followRateHtml
    + '</div>';
}

var followDisplay = totalIgFollows > 0
  ? 'IG F:' + totalIgFollows + ' FB L:' + totalFbLikes
  : 'IG V:' + totalIgVisits + ' FB L:' + totalFbLikes;
var timeStr = String(artNow.getUTCHours()).padStart(2,'0') + ':' + String(artNow.getUTCMinutes()).padStart(2,'0');
var subject = '[ENBA Ads] ' + todayStr + ' ' + timeStr
  + ' | ' + summaryStr
  + ' | $' + totalSpend.toLocaleString()
  + ' | ' + followDisplay
  + ' | Saves:' + totalSaves
  + (budgetRisk ? ' | BURN' : '')
  + (freshnessWarning ? ' | DATOS VIEJOS' : '');

var freshnessBanner = freshnessWarning
  ? '<div style="background:#fef9c3;border:2px solid #ca8a04;border-radius:6px;padding:10px 14px;margin:12px 0;">'
    + '<b style="color:#ca8a04;">AVISO FRESCURA:</b> ' + freshnessWarning
    + '</div>'
  : '';

var html = '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>'
  + '<body style="font-family:Arial,sans-serif;max-width:1200px;margin:0 auto;padding:16px;">'
  + '<h2 style="color:#1e293b;margin-bottom:4px;">ENBA Meta Ads — Reporte Diario</h2>'
  + '<p style="color:#64748b;margin-top:4px;font-size:13px;">'
  + 'Fecha: ' + todayStr + ' &middot; Dia ' + dayRef + ' de ' + CAMPAIGN_TOTAL_DAYS
  + ' &middot; Spend: $' + totalSpend.toLocaleString()
  + ' &middot; CPM: <b>$' + (blendedCPM || '—') + '</b>'
  + ' &middot; IG Visits: <b>' + totalIgVisits + '</b>'
  + ' &middot; FB Likes: <b>' + totalFbLikes + '</b>'
  + ' &middot; Saves: <b>' + totalSaves + '</b>'
  + ' &middot; CPS blended: <b>' + (blendedCPS !== null ? '$' + blendedCPS : '—') + '</b>'
  + ' &middot; Reach: ' + totalReach.toLocaleString() + '</p>'
  + '<p style="font-size:15px;font-weight:bold;color:#1e293b;">' + summaryStr + '</p>'
  + followerPanel
  + freshnessBanner
  + budgetBanner
  // Tabla ACTIVOS
  + '<h3 style="color:#1e293b;font-size:13px;margin:16px 0 4px;">Ads ACTIVOS (' + activeResults.length + ' — gastan dinero ahora)</h3>'
  + '<div style="overflow-x:auto;">'
  + '<table style="border-collapse:collapse;width:100%;font-size:11px;">'
  + '<thead><tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">'
  + '<th style="padding:5px 8px;text-align:left;">Ad</th>'
  + '<th>Tipo</th><th>Plat</th><th>Seg</th><th>Dias</th>'
  + '<th style="text-align:right;">Spend</th>'
  + '<th style="text-align:right;color:#6b7280;">CPM</th>'
  + '<th style="text-align:right;">Reach</th>'
  + '<th>CTR</th><th>ER</th><th>Freq</th>'
  + '<th style="color:#7c3aed;">ThruPly</th>'
  + '<th style="color:#0891b2;">Hook%</th>'
  + '<th style="color:#0891b2;">Hold%</th>'
  + '<th style="color:#059669;">Saves</th>'
  + '<th>Follows/V</th>'
  + '<th style="text-align:right;">CPS</th>'
  + '<th>Veredicto</th><th>Razon</th>'
  + '</tr></thead><tbody>\n'
  + activeTableRows
  + '\n</tbody></table></div>'
  // Tabla PAUSADOS
  + '<h3 style="color:#6b7280;font-size:12px;margin:16px 0 4px;">Ads PAUSADOS (' + pausedResults.length + ' — sin gasto actual, solo historial)</h3>'
  + '<div style="overflow-x:auto;">'
  + '<table style="border-collapse:collapse;width:100%;font-size:10px;opacity:0.7;">'
  + '<thead><tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">'
  + '<th style="padding:4px 8px;text-align:left;">Ad</th>'
  + '<th>Tipo</th><th>Plat</th><th>Seg</th><th>Dias</th>'
  + '<th style="text-align:right;">Spend hist.</th>'
  + '<th style="text-align:right;color:#6b7280;">CPM</th>'
  + '<th style="text-align:right;">Reach</th>'
  + '<th>CTR</th><th>ER</th><th>Freq</th>'
  + '<th>ThruPly</th><th>Hook%</th><th>Hold%</th>'
  + '<th>Saves</th><th>Follows/V</th>'
  + '<th style="text-align:right;">CPS</th>'
  + '<th>Estado</th><th>Nota</th>'
  + '</tr></thead><tbody>\n'
  + pausedTableRows
  + '\n</tbody></table></div>'
  // Quality Rankings
  + '<hr style="margin:20px 0;border:1px solid #e5e7eb;">'
  + '<h3 style="color:#1e293b;font-size:13px;margin-bottom:8px;">Calidad del Anuncio vs Competencia</h3>'
  + '<p style="font-size:11px;color:#64748b;margin-bottom:8px;">'
  + '<b>▲ TOP</b> = top 55% &middot; <b>≈ AVG</b> = promedio &middot; <b>▼</b> = señal de problema creativo o saturación.</p>'
  + '<table style="border-collapse:collapse;font-size:11px;">'
  + '<thead><tr style="background:#f1f5f9;">'
  + '<th style="padding:4px 8px;text-align:left;">Ad</th>'
  + '<th>Tipo</th><th>Calidad</th><th>Engagement</th><th>Conversión</th>'
  + '</tr></thead><tbody>\n'
  + qualityRows + '\n</tbody></table>'
  // Diagnóstico
  + '<hr style="margin:20px 0;border:1px solid #e5e7eb;">'
  + '<details><summary style="cursor:pointer;font-size:12px;color:#7c3aed;font-weight:bold;">Diagnóstico: action_types disponibles (expandir)</summary>'
  + '<pre style="font-size:10px;background:#f8fafc;padding:12px;border-radius:4px;border:1px solid #e2e8f0;max-height:200px;overflow-y:auto;">'
  + diagLines.join('\n') + '</pre></details>'
  // Prompt Bruno
  + '<hr style="margin:20px 0;border:1px solid #e5e7eb;">'
  + '<h3 style="color:#1e293b;">Prompt para Bruno</h3>'
  + '<p style="color:#64748b;font-size:12px;">Copia y pega en Claude Code:</p>'
  + '<pre style="background:#f8fafc;padding:16px;border-radius:8px;font-size:10px;overflow-x:auto;white-space:pre-wrap;border:1px solid #e2e8f0;">'
  + brunoPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  + '</pre>'
  + '<p style="color:#94a3b8;font-size:10px;margin-top:16px;">ENBA Ads Evaluation Workflow v5 &middot; ' + new Date().toISOString() + ' &middot; Burn rate: ' + burnRateSource + '</p>'
  + '</body></html>';

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
