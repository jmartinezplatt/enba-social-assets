const igPublish = $input.first().json;
const piece = $('Prepare Publish Data').first().json;
return [{ json: {
  platform: 'ig',
  ok: true,
  postId: igPublish.id || null,
  error: null,
  pieceId: piece.pieceId
} }];
