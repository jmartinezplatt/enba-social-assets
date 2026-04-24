// burst-prepare-email-skip.js
// Prepara subject y body para el email de skip/done del burst
const data = $input.first().json;

const subject = 'ENBA Stories Burst: ' + data.reason;
const body = data.reason + '\nTimestamp: ' + new Date().toISOString();

return [{ json: { subject, body } }];
