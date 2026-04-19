// Evaluate Ads Performance — Code Node para n8n
// Input: Meta Insights API response (GET /act_.../insights?level=ad)
// Output: email subject, HTML body, Bruno prompt
//
// Reglas de evaluación: presupuesto-v3-final.md secciones 9-10
// CORTAR (después de 72h): CPS > $100 ó ER < 1% ó CTR < 0.4%
// WINNER (después de 72h): CPS < $30 + ER > 3%
// FATIGUE: frecuencia > 3.5
// MAX_REACHED: > 14 días
// FATIGUE_WARNING: >= 10 días (preparar reemplazo)

const response = $input.first().json;
const adsData = response.data || [];

// Fecha actual en ART
const now = new Date();
const artNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const dd = String(artNow.getUTCDate()).padStart(2, '0');
const mm = String(artNow.getUTCMonth() + 1).padStart(2, '0');
const yyyy = artNow.getUTCFullYear();
const todayStr = dd + '/' + mm + '/' + yyyy;

// Fechas de activación por ad ID (de meta-ids.json)
// ACTUALIZAR cuando se activen nuevos ads (C2, TopPerformers, C3)
const activationDates = {
  '120239058261910139': '2026-04-19', // AD_A2_P01 piece01dp
  '120239058262400139': '2026-04-19', // AD_B1_P01 piece01dp
  '120239057858590139': '2026-04-19', // AD_C1_P02 piece02
  '120239057859170139': '2026-04-19', // AD_B2_P02 piece02
  '120239061361640139': '2026-04-19', // AD_A3_P03 piece03
  '120239075118770139': '2026-04-19', // AD_B1_P03 piece03
  '120239078453020139': '2026-04-19', // AD_ENG_REEL reel4horas
};

// Nombres legibles
const adLabels = {
  '120239058261910139': 'piece01dp > A2 InteresNav',
  '120239058262400139': 'piece01dp > B1 Experiencias',
  '120239057858590139': 'piece02 > C1 TurismoBA',
  '120239057859170139': 'piece02 > B2 Outdoor',
  '120239061361640139': 'piece03 > A3 Aspiracional',
  '120239075118770139': 'piece03 > B1 Experiencias',
  '120239078453020139': 'reel4horas > ENG Reel',
};

function getAction(actions, type) {
  const found = (actions || []).find(function(a) { return a.action_type === type; });
  return found ? parseInt(found.value) : 0;
}

function getDaysActive(adId) {
  const activation = activationDates[adId] || '2026-04-19';
  return Math.floor((now - new Date(activation + 'T00:10:00-03:00')) / (1000 * 60 * 60 * 24));
}

// Caso sin datos
if (adsData.length === 0) {
  var noDataSubject = '[ENBA Ads] ' + todayStr + ' — Sin datos de insights';
  var noDataHtml = '<html><body style="font-family:Arial,sans-serif;">'
    + '<h2>ENBA Meta Ads — Sin datos</h2>'
    + '<p>Fecha: ' + todayStr + '</p>'
    + '<p>La API de Meta no devolvio datos de insights. Posibles causas:</p>'
    + '<ul><li>Los ads llevan menos de unas horas activos</li>'
    + '<li>Meta aun esta procesando impresiones</li></ul>'
    + '<p>Se reintentara manana a las 9:00 ART.</p>'
    + '</body></html>';
  return [{ json: { subject: noDataSubject, html: noDataHtml, brunoPrompt: '', totalSpend: 0, adsCount: 0 } }];
}

// Procesar cada ad
var results = adsData.map(function(ad) {
  var impressions = parseInt(ad.impressions || 0);
  var reach = parseInt(ad.reach || 0);
  var clicks = parseInt(ad.clicks || 0);
  var spend = parseFloat(ad.spend || 0);
  var ctr = parseFloat(ad.ctr || 0);
  var frequency = parseFloat(ad.frequency || 0);
  var engagements = getAction(ad.actions, 'post_engagement');
  var follows = getAction(ad.actions, 'follow');
  var er = reach > 0 ? (engagements / reach * 100) : 0;
  var cps = follows > 0 ? Math.round(spend / follows) : null;
  var daysActive = getDaysActive(ad.ad_id);

  var verdict = 'VIABLE';
  var reasons = [];

  if (daysActive < 3) {
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
    if (er < 1) reasons.push('ER ' + er.toFixed(1) + '% < 1%');
    if (ctr < 0.4) reasons.push('CTR ' + ctr.toFixed(2) + '% < 0.4%');
  } else if (cps !== null && cps < 30 && er > 3) {
    verdict = 'WINNER';
    reasons.push('CPS $' + cps + ' < $30, ER ' + er.toFixed(1) + '% > 3%');
  } else if (daysActive >= 10) {
    verdict = 'FATIGUE_WARNING';
    reasons.push(daysActive + 'd, preparar reemplazo');
  }

  return {
    adId: ad.ad_id,
    adName: adLabels[ad.ad_id] || ad.ad_name,
    impressions: impressions, reach: reach, clicks: clicks,
    spend: Math.round(spend),
    ctr: ctr.toFixed(2),
    frequency: frequency.toFixed(1),
    engagements: engagements, follows: follows,
    er: er.toFixed(1),
    cps: cps !== null ? '$' + cps : 'N/A',
    cpsRaw: cps,
    daysActive: daysActive, verdict: verdict,
    reason: reasons.join(', ') || 'Dentro de parametros'
  };
});

// Conteo de veredictos
var counts = {};
results.forEach(function(r) { counts[r.verdict] = (counts[r.verdict] || 0) + 1; });

var summaryParts = [];
if (counts.WINNER) summaryParts.push(counts.WINNER + ' WINNER');
if (counts.VIABLE) summaryParts.push(counts.VIABLE + ' VIABLE');
if (counts.LEARNING) summaryParts.push(counts.LEARNING + ' LEARNING');
if (counts.CORTAR) summaryParts.push(counts.CORTAR + ' CORTAR');
if (counts.FATIGUE) summaryParts.push(counts.FATIGUE + ' FATIGUE');
if (counts.FATIGUE_WARNING) summaryParts.push(counts.FATIGUE_WARNING + ' WARNING');
if (counts.MAX_REACHED) summaryParts.push(counts.MAX_REACHED + ' MAX');
var summaryStr = summaryParts.join(' | ') || 'Sin datos';

var totalSpend = results.reduce(function(s, r) { return s + r.spend; }, 0);
var totalFollows = results.reduce(function(s, r) { return s + r.follows; }, 0);
var totalReach = results.reduce(function(s, r) { return s + r.reach; }, 0);

// Estilo por veredicto
function verdictStyle(v) {
  var map = {
    'WINNER': { color: '#16a34a', bg: '#f0fdf4' },
    'VIABLE': { color: '#2563eb', bg: '#eff6ff' },
    'LEARNING': { color: '#7c3aed', bg: '#f5f3ff' },
    'CORTAR': { color: '#dc2626', bg: '#fef2f2' },
    'FATIGUE': { color: '#ea580c', bg: '#fff7ed' },
    'FATIGUE_WARNING': { color: '#ca8a04', bg: '#fefce8' },
    'MAX_REACHED': { color: '#dc2626', bg: '#fef2f2' },
  };
  return map[v] || { color: '#6b7280', bg: '#f9fafb' };
}

// Tabla HTML
var tableRows = results.map(function(r) {
  var s = verdictStyle(r.verdict);
  return '<tr style="border-bottom:1px solid #e5e7eb;">'
    + '<td style="padding:6px 8px;font-size:12px;">' + r.adName + '</td>'
    + '<td style="padding:6px;text-align:center;">' + r.daysActive + 'd</td>'
    + '<td style="padding:6px;text-align:right;">$' + r.spend.toLocaleString() + '</td>'
    + '<td style="padding:6px;text-align:right;">' + r.reach.toLocaleString() + '</td>'
    + '<td style="padding:6px;text-align:center;">' + r.frequency + '</td>'
    + '<td style="padding:6px;text-align:center;">' + r.ctr + '%</td>'
    + '<td style="padding:6px;text-align:center;">' + r.er + '%</td>'
    + '<td style="padding:6px;text-align:right;">' + r.engagements + '</td>'
    + '<td style="padding:6px;text-align:right;">' + r.follows + '</td>'
    + '<td style="padding:6px;text-align:right;">' + r.cps + '</td>'
    + '<td style="padding:6px;text-align:center;background:' + s.bg + ';color:' + s.color + ';font-weight:bold;">' + r.verdict + '</td>'
    + '<td style="padding:6px;font-size:11px;color:#6b7280;">' + r.reason + '</td>'
    + '</tr>';
}).join('\n');

// Subject
var subject = '[ENBA Ads] ' + todayStr + ' | ' + summaryStr + ' | $' + totalSpend.toLocaleString() + ' gastado';

// Prompt para Bruno
var promptTableHeader = '| Ad | Dias | Spend | Reach | CTR | ER | Eng | Follows | CPS | Freq | Veredicto | Razon |';
var promptTableSep = '|---|---|---|---|---|---|---|---|---|---|---|---|';
var promptTableRows = results.map(function(r) {
  return '| ' + r.adName + ' | ' + r.daysActive + 'd | $' + r.spend + ' | ' + r.reach + ' | ' + r.ctr + '% | ' + r.er + '% | ' + r.engagements + ' | ' + r.follows + ' | ' + r.cps + ' | ' + r.frequency + ' | ' + r.verdict + ' | ' + r.reason + ' |';
}).join('\n');

var firstAdDays = getDaysActive(Object.keys(activationDates)[0]);

var brunoPrompt = 'Contexto REDES. Carga /bruno.\n\n'
  + 'Reporte automatico Meta Ads — ' + todayStr + '.\n'
  + 'Campana ENBA activa desde 19/04/2026. Dia ' + firstAdDays + ' de 27.\n'
  + 'Spend total: $' + totalSpend.toLocaleString() + ' | Follows totales: ' + totalFollows + ' | Reach total: ' + totalReach.toLocaleString() + '\n\n'
  + '## Datos de rendimiento (lifetime)\n\n'
  + promptTableHeader + '\n' + promptTableSep + '\n' + promptTableRows + '\n\n'
  + '## Reglas del plan v3 (presupuesto-v3-final.md)\n'
  + '- CORTAR: CPS > $100 o ER < 1% o CTR < 0.4%\n'
  + '- WINNER: CPS < $30 + ER > 3%\n'
  + '- FATIGUE: Frecuencia > 3.5\n'
  + '- MAX: > 14 dias\n'
  + '- Escalar WINNER: +25% cada 48h, triple scale si win 5 dias\n\n'
  + '## Tu tarea\n'
  + '1. Confirma o corregi cada veredicto automatico\n'
  + '2. Propone acciones: que apagar, escalar, rotar\n'
  + '3. Si hay WINNERS, propone escalado\n'
  + '4. Si hay FATIGUE_WARNING, propone reemplazo antes de dia 14\n'
  + '5. Revisa split IG/FB y propone ajuste si corresponde\n\n'
  + 'Entrega tu analisis y espera aprobacion antes de ejecutar.';

// HTML completo
var html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'
  + '<body style="font-family:Arial,sans-serif;max-width:960px;margin:0 auto;padding:16px;">'
  + '<h2 style="color:#1e293b;margin-bottom:4px;">ENBA Meta Ads — Reporte Diario</h2>'
  + '<p style="color:#64748b;margin-top:4px;">Fecha: ' + todayStr + ' &middot; Dia ' + firstAdDays + ' de 27 &middot; Spend: $' + totalSpend.toLocaleString() + ' &middot; Follows: ' + totalFollows + ' &middot; Reach: ' + totalReach.toLocaleString() + '</p>'
  + '<p style="font-size:18px;font-weight:bold;color:#1e293b;">' + summaryStr + '</p>'
  + '<table style="border-collapse:collapse;width:100%;font-size:12px;margin-top:12px;">'
  + '<thead><tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">'
  + '<th style="padding:6px 8px;text-align:left;">Ad</th>'
  + '<th style="padding:6px;">Dias</th>'
  + '<th style="padding:6px;text-align:right;">Spend</th>'
  + '<th style="padding:6px;text-align:right;">Reach</th>'
  + '<th style="padding:6px;">Freq</th>'
  + '<th style="padding:6px;">CTR</th>'
  + '<th style="padding:6px;">ER</th>'
  + '<th style="padding:6px;text-align:right;">Eng</th>'
  + '<th style="padding:6px;text-align:right;">Follows</th>'
  + '<th style="padding:6px;text-align:right;">CPS</th>'
  + '<th style="padding:6px;">Veredicto</th>'
  + '<th style="padding:6px;">Razon</th>'
  + '</tr></thead><tbody>\n'
  + tableRows
  + '\n</tbody></table>'
  + '<hr style="margin:24px 0;border:1px solid #e5e7eb;">'
  + '<h3 style="color:#1e293b;">Prompt para Bruno</h3>'
  + '<p style="color:#64748b;font-size:12px;">Copia y pega esto en Claude Code para que Bruno analice:</p>'
  + '<pre style="background:#f8fafc;padding:16px;border-radius:8px;font-size:11px;overflow-x:auto;white-space:pre-wrap;border:1px solid #e2e8f0;">'
  + brunoPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  + '</pre>'
  + '<hr style="margin:24px 0;border:1px solid #e5e7eb;">'
  + '<p style="color:#94a3b8;font-size:10px;">Generado por ENBA Ads Evaluation Workflow &middot; ' + new Date().toISOString() + '</p>'
  + '</body></html>';

return [{ json: { subject: subject, html: html, brunoPrompt: brunoPrompt, totalSpend: totalSpend, totalFollows: totalFollows, adsCount: results.length, summaryStr: summaryStr } }];
