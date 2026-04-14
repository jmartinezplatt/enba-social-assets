const pieces = $input.first().json;
const entry = $('Find Today Piece').first().json;
const piece = Array.isArray(pieces) ? pieces.find(p => p.id === entry.id) : null;

if (!piece) {
  return [{ json: { error: true, message: 'Piece not found: ' + entry.id } }];
}

const num = piece.id.replace('piece-', '');
const parts = piece.date.split('/');
const d = parts[0];
const m = parts[1];
const y = parts[2];
const dateStr = y + '-' + m + '-' + d;
const verticalSlug = piece.vertical.toLowerCase().replace(/\u00ed/g, 'i');
const manifestId = 'sm-' + dateStr + '-ig-feed-' + verticalSlug + '-' + num;
const pngName = num + '-' + d + '-' + m + '-' + y + '-' + verticalSlug + '.png';
const imageUrl = 'https://social-assets.espacionautico.com.ar/staging/' + y + '/' + m + '/' + manifestId + '/' + pngName;

return [{ json: {
  error: false,
  pieceId: piece.id,
  date: piece.date,
  vertical: piece.vertical,
  headline: piece.headline,
  captionIg: piece.captionIg,
  captionFb: piece.captionFb,
  imageUrl: imageUrl,
  manifestId: manifestId,
  igUserId: '17841443139761422',
  pageId: '1064806400040502'
} }];
