import { execSync } from 'node:child_process';

const BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1';

function getApiKey() {
  return execSync(`powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"`, { encoding: 'utf-8' }).trim();
}

async function main() {
  const apiKey = getApiKey();
  console.log('N8N_API_KEY: CARGADA\n');

  // Últimas 10 ejecuciones
  const res = await fetch(BASE_URL + '/executions?limit=10&includeData=false', {
    headers: { 'X-N8N-API-KEY': apiKey }
  });
  const json = await res.json();
  const execs = json.data || [];

  console.log('Últimas ejecuciones:\n');
  execs.forEach(function(e) {
    console.log('ID:', e.id, '| WF:', e.workflowId, '| Status:', e.status);
    console.log('  Inicio:', e.startedAt, '| Fin:', e.stoppedAt || 'N/A');
    if (e.data && e.data.resultData && e.data.resultData.error) {
      console.log('  ERROR:', e.data.resultData.error.message);
    }
    console.log();
  });

  // Ver detalles de la más reciente si falló
  if (execs.length > 0 && execs[0].status !== 'success') {
    console.log('=== Detalle de la ejecución más reciente (' + execs[0].id + ') ===');
    const detRes = await fetch(BASE_URL + '/executions/' + execs[0].id, {
      headers: { 'X-N8N-API-KEY': apiKey }
    });
    const det = await detRes.json();
    if (det.data && det.data.resultData) {
      const rd = det.data.resultData;
      if (rd.error) console.log('Error:', JSON.stringify(rd.error, null, 2));
      // Mostrar qué nodo falló
      const runData = rd.runData || {};
      Object.keys(runData).forEach(function(nodeName) {
        const nodeRun = runData[nodeName];
        if (nodeRun && nodeRun[0] && nodeRun[0].error) {
          console.log('Nodo con error:', nodeName);
          console.log(JSON.stringify(nodeRun[0].error, null, 2));
        }
      });
    }
  }
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
