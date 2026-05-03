const igPublish = $('IG Publish').first().json;
const permalinkData = $input.first().json;
const piece = $('Prepare Publish Data').first().json;
return [{ json: {
  platform: 'ig',
  ok: true,
  postId: igPublish.id || null,
  permalink: permalinkData.permalink || null,
  error: null,
  pieceId: piece.pieceId
} }];
