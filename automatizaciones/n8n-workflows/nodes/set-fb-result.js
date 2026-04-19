const fbPublish = $input.first().json;
const piece = $('Prepare Publish Data').first().json;
return [{ json: {
  platform: 'fb',
  ok: true,
  postId: fbPublish.id || null,
  error: null,
  pieceId: piece.pieceId
} }];
