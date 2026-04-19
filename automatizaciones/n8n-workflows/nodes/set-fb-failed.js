const errorData = $input.first().json;
const piece = $('Prepare Publish Data').first().json;
return [{ json: {
  platform: 'fb',
  ok: false,
  postId: null,
  error: JSON.stringify(errorData).substring(0, 500),
  pieceId: piece.pieceId
} }];
