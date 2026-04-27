/**
 * patch-stories-add-sheets-log.mjs
 * Agrega nodo "Log to Sheet" después de "Email OK" en los 3 workflows de stories.
 * Operación quirúrgica: solo agrega nodo nuevo + conexión nueva. No toca nodos existentes.
 *
 * Google Sheet ID: 10lBPzPIRkADfudjGKsP316rO76fPSHW4E0FlO7mEoSE
 * Credencial Google Sheets: w3CGca02rWZppDL9
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const N8N_BASE = 'https://espacionautico.app.n8n.cloud/api/v1';
const N8N_KEY = execSync(
  `powershell -Command "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')"`,
  { encoding: 'utf8' }
).trim();

const SHEET_ID = '1DimMWT7rNXNd2jS_rnCNs0qHLqSahwYLc3s9m7wpw1U';
const SHEETS_CRED_ID = 'w3CGca02rWZppDL9';

const WORKFLOWS = [
  { id: 'q1nZVNrtEsxKEFni', suffix: 'manana' },
  { id: 'pBP7tkXlD6nzx4wd', suffix: 'tarde'  },
  { id: 'c8MHANGzW56GORAi', suffix: 'noche'  },
];

async function n8nFetch(path, options = {}) {
  const url = `${N8N_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-N8N-API-KEY': N8N_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return res.json();
}

function buildLogToSheetNode(suffix, emailOkPosition) {
  return {
    parameters: {
      operation: 'append',
      documentId: {
        __rl: true,
        value: SHEET_ID,
        mode: 'id',
      },
      sheetName: {
        __rl: true,
        value: 'gid=0',
        mode: 'id',
      },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          date:      "={{ $('Pick Next Story').first().json.timestamp.substring(0,10) }}",
          slot:      "={{ $('Pick Next Story').first().json.slot }}",
          media_id:  "={{ $('IG Publish').first().json.id }}",
          image_url: "={{ $('Pick Next Story').first().json.imageUrl }}",
          seq:       "={{ $('Pick Next Story').first().json.seq }}",
        },
        matchingColumns: [],
        schema: [],
      },
      options: {},
    },
    credentials: {
      googleSheetsOAuth2Api: {
        id: SHEETS_CRED_ID,
        name: 'Google Sheets account',
      },
    },
    id: `log-to-sheet-${suffix}`,
    name: 'Log to Sheet',
    type: 'n8n-nodes-base.googleSheets',
    typeVersion: 4.4,
    position: [emailOkPosition[0] + 220, emailOkPosition[1]],
  };
}

async function patchWorkflow(wfId, suffix) {
  console.log(`\n--- Patching ${wfId} (${suffix}) ---`);

  // 1. GET current workflow
  const wf = await n8nFetch(`/workflows/${wfId}`);

  // 2. Verify "Log to Sheet" not already present
  if (wf.nodes.some(n => n.name === 'Log to Sheet')) {
    console.log('  SKIP: Log to Sheet already exists.');
    return;
  }

  // 3. Find "Email OK" node to get position
  const emailOkNode = wf.nodes.find(n => n.name === 'Email OK');
  if (!emailOkNode) {
    console.error('  ERROR: Email OK node not found!');
    process.exit(1);
  }

  // 4. Build new node
  const logNode = buildLogToSheetNode(suffix, emailOkNode.position);

  // 5. Surgical addition: append node, add connection
  wf.nodes.push(logNode);
  wf.connections['Email OK'] = {
    main: [[{ node: 'Log to Sheet', type: 'main', index: 0 }]],
  };

  // 6. PUT updated workflow — solo campos aceptados por la API
  const body = {
    name:        wf.name,
    nodes:       wf.nodes,
    connections: wf.connections,
    settings:    wf.settings,
  };
  const updated = await n8nFetch(`/workflows/${wfId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (updated.id !== wfId) {
    console.error('  ERROR: PUT returned unexpected response:', JSON.stringify(updated));
    process.exit(1);
  }
  console.log(`  PUT OK — nodes: ${updated.nodes.length}`);

  // 7. Deactivate → activate to re-register schedule
  await n8nFetch(`/workflows/${wfId}/deactivate`, { method: 'POST' });
  console.log('  Deactivated');
  await new Promise(r => setTimeout(r, 1000));
  const activated = await n8nFetch(`/workflows/${wfId}/activate`, { method: 'POST' });
  console.log(`  Activated — active: ${activated.active}`);
}

// Main
for (const wf of WORKFLOWS) {
  await patchWorkflow(wf.id, wf.suffix);
}
console.log('\nDone. Verificar los 3 workflows en n8n UI.');
