const piece = $('Prepare Publish Data').first().json;
const igResult = $('IG Publish').first().json;
const fbResult = $('FB Publish').first().json;

const igId = igResult.id || 'ERROR';
const fbId = fbResult.id || 'ERROR';

const igUrl = 'https://www.instagram.com/espacionauticobsas/';
const fbUrl = 'https://www.facebook.com/' + fbId;

const ok = igId !== 'ERROR' && fbId !== 'ERROR';

const subject = ok
  ? 'ENBA Redes: ' + piece.pieceId + ' publicado - ' + piece.headline
  : 'ENBA Redes ERROR: ' + piece.pieceId + ' fallo';

const body = 'PUBLICACION REDES - ENBA\n'
  + '========================\n\n'
  + 'Pieza: ' + piece.pieceId + '\n'
  + 'Fecha: ' + piece.date + '\n'
  + 'Vertical: ' + piece.vertical + '\n'
  + 'Headline: ' + piece.headline + '\n\n'
  + 'Instagram: ' + (igId !== 'ERROR' ? 'PUBLICADO' : 'FALLO') + '\n'
  + '  Post ID: ' + igId + '\n'
  + '  Ver en vivo: ' + igUrl + '\n\n'
  + 'Facebook: ' + (fbId !== 'ERROR' ? 'PUBLICADO' : 'FALLO') + '\n'
  + '  Post ID: ' + fbId + '\n'
  + '  Ver en vivo: ' + fbUrl + '\n\n'
  + 'Timestamp: ' + new Date().toISOString();

return [{ json: { subject, body, igId, fbId, pieceId: piece.pieceId } }];
