// burst-prepare-email-ok.js
// Prepara subject y body para el email de confirmacion de story publicada
const story = $('Pick Story').first().json;
const igId = $('IG Publish').first().json.id;

const subject = 'ENBA Stories: ' + story.file + ' publicada (' + story.progress + ')';
const body = 'Story publicada.\n\n'
  + 'Seq: ' + story.progress + '\n'
  + 'Archivo: ' + story.file + '\n'
  + 'Highlight: ' + story.highlight + '\n'
  + 'IG Story ID: ' + igId + '\n'
  + 'Timestamp: ' + story.actualAt;

return [{ json: { subject, body } }];
