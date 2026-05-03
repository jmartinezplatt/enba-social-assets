const items = $input.all().map(item => item.json);
const piece = $('Prepare Publish Data').first().json;

const ig = items.find(i => i.platform === 'ig') || { ok: false, postId: null, error: 'Branch did not execute', skipped: false };
const fb = items.find(i => i.platform === 'fb') || { ok: false, postId: null, error: 'Branch did not execute', skipped: false };

// Anti-duplicate por plataforma
const staticData = $getWorkflowStaticData('global');
const key = piece.pieceId + '_' + piece.date;

if (ig.ok && !ig.skipped) {
  staticData.lastPublished_ig = key;
}
if (fb.ok && !fb.skipped) {
  staticData.lastPublished_fb = key;
}

// IG URL: usar permalink del post si esta disponible, sino perfil
const igUrl = ig.permalink || 'https://www.instagram.com/espacionauticobsas/';

// FB URL: postId tiene formato "pageId_postId" -> permalink.php
let fbUrl = 'N/A';
if (fb.postId && fb.postId !== 'already_published') {
  const parts = fb.postId.split('_');
  if (parts.length >= 2) {
    fbUrl = 'https://www.facebook.com/permalink.php?story_fbid=' + parts.slice(1).join('_') + '&id=' + parts[0];
  } else {
    fbUrl = 'https://www.facebook.com/' + fb.postId;
  }
}

// Determinar estado real (ignorando skipped)
const igPublished = ig.ok && !ig.skipped;
const fbPublished = fb.ok && !fb.skipped;
const igFailed = !ig.ok;
const fbFailed = !fb.ok;
const igSkipped = ig.skipped || false;
const fbSkipped = fb.skipped || false;

var subject;
if (igPublished && fbPublished) {
  subject = 'ENBA Redes: ' + piece.pieceId + ' publicado IG+FB - ' + piece.headline;
} else if (igFailed && fbFailed) {
  subject = '[ERROR CRITICO] ENBA Redes: ' + piece.pieceId + ' FALLO IG+FB';
} else if ((igPublished || igSkipped) && (fbPublished || fbSkipped)) {
  var freshPlatform = igPublished ? 'IG' : 'FB';
  subject = 'ENBA Redes: ' + piece.pieceId + ' ' + freshPlatform + ' publicado (otra ya estaba) - ' + piece.headline;
} else {
  var okPlatform = (ig.ok) ? 'IG' : 'FB';
  var failPlatform = (ig.ok) ? 'FB' : 'IG';
  subject = '[PARCIAL] ENBA Redes: ' + piece.pieceId + ' ' + okPlatform + ' ok, ' + failPlatform + ' fallo';
}

function statusLabel(result) {
  if (result.skipped) return 'YA PUBLICADO (skip)';
  if (result.ok) return 'PUBLICADO';
  return 'FALLO';
}

var body = 'PUBLICACION REDES - ENBA\n'
  + '========================\n\n'
  + 'Pieza: ' + piece.pieceId + '\n'
  + 'Fecha: ' + piece.date + '\n'
  + 'Vertical: ' + piece.vertical + '\n'
  + 'Headline: ' + piece.headline + '\n\n'
  + '--- INSTAGRAM ---\n'
  + 'Estado: ' + statusLabel(ig) + '\n'
  + (ig.ok && !ig.skipped ? '  Post ID: ' + ig.postId + '\n  Ver: ' + igUrl + '\n' : '')
  + (ig.skipped ? '  (ya publicado en ejecucion anterior)\n' : '')
  + (!ig.ok ? '  Error: ' + ig.error + '\n' : '')
  + '\n--- FACEBOOK ---\n'
  + 'Estado: ' + statusLabel(fb) + '\n'
  + (fb.ok && !fb.skipped ? '  Post ID: ' + fb.postId + '\n  Ver: ' + fbUrl + '\n' : '')
  + (fb.skipped ? '  (ya publicado en ejecucion anterior)\n' : '')
  + (!fb.ok ? '  Error: ' + fb.error + '\n' : '')
  + '\nTimestamp: ' + new Date().toISOString();

if (igFailed || fbFailed) {
  body += '\n\nACCION REQUERIDA: revisar plataforma(s) fallida(s) y reintentar.';
  body += '\nEl workflow se puede re-ejecutar: solo reintentara la(s) plataforma(s) que fallo/fallaron.';
}

return [{ json: { subject: subject, body: body, igOk: ig.ok, fbOk: fb.ok, igSkipped: igSkipped, fbSkipped: fbSkipped, pieceId: piece.pieceId } }];
