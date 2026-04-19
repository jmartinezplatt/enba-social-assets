const piece = $('Prepare Publish Data').first().json;
return [{ json: {
  platform: 'ig',
  ok: true,
  postId: 'already_published',
  error: null,
  skipped: true,
  pieceId: piece.pieceId
} }];
