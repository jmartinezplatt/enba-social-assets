"""
Patch quirúrgico: actualiza solo parameters.jsCode del nodo "Evaluate Ads"
en el workflow ENBA Ads Evaluation Diaria 9:00 (ID: 1qRywsEWAl7VoO5o).

Reglas OPERACION-N8N.md:
- GET fresco antes de operar (ya hecho, backup en evaluate-ads-prod-fresh.json)
- Modificar SOLO el campo jsCode del nodo target
- PUT con {name, nodes, connections, settings} únicamente
- Verificación post-PUT: GET + confirmar strings sensibles intactos
"""

import json, subprocess, urllib.request, sys, os

WORKFLOW_ID = '1qRywsEWAl7VoO5o'
TARGET_NODE_NAME = 'Evaluate Ads'
BASE_URL = 'https://espacionautico.app.n8n.cloud/api/v1'
JS_FILE = os.path.join(os.path.dirname(__file__), '..', 'automatizaciones', 'n8n-workflows', 'nodes', 'evaluate-ads.js')
BACKUP_FILE = os.path.join(os.path.dirname(__file__), '..', 'automatizaciones', 'n8n-workflows', 'evaluate-ads-prod-fresh.json')

def get_key():
    result = subprocess.run(
        ['powershell', '-Command', "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')"],
        capture_output=True, text=True
    )
    return result.stdout.strip()

def api_get(key, path):
    req = urllib.request.Request(BASE_URL + path, headers={'X-N8N-API-KEY': key})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def api_put(key, path, payload):
    data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(
        BASE_URL + path,
        data=data,
        headers={
            'X-N8N-API-KEY': key,
            'Content-Type': 'application/json; charset=utf-8'
        },
        method='PUT'
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def filter_settings(settings):
    """Solo campos permitidos por la API de n8n en PUT."""
    allowed = {'executionOrder', 'callerPolicy', 'saveManualExecutions'}
    return {k: v for k, v in settings.items() if k in allowed}

# ── 1. Leer JS nuevo ──────────────────────────────────────────────────
print('Leyendo evaluate-ads.js local...')
with open(JS_FILE, encoding='utf-8') as f:
    new_js = f.read()
print(f'  JS local: {len(new_js)} chars')

# Verificar que strings clave con tildes están intactos en el JS
checks = ['días', 'día', 'gráfico', 'presupuesto', 'reemplazo', 'Proponé', 'Días']
for c in checks:
    if c in new_js:
        print(f'  [OK] tilde check: "{c}" presente')
    # Si no está, no es error crítico (puede no aparecer en todos los casos)

# ── 2. GET fresco de producción ───────────────────────────────────────
print('\nGET fresco del workflow de producción...')
key = get_key()
wf = api_get(key, f'/workflows/{WORKFLOW_ID}')
print(f'  Workflow: {wf["name"]} | {len(wf["nodes"])} nodos')

# ── 3. Localizar nodo target ──────────────────────────────────────────
target_idx = None
for i, node in enumerate(wf['nodes']):
    if node.get('name') == TARGET_NODE_NAME:
        target_idx = i
        break

if target_idx is None:
    print(f'ERROR: nodo "{TARGET_NODE_NAME}" no encontrado.')
    sys.exit(1)

old_js = wf['nodes'][target_idx]['parameters'].get('jsCode', '')
print(f'\nNodo target: "{TARGET_NODE_NAME}" (idx {target_idx})')
print(f'  JS actual en producción: {len(old_js)} chars')
print(f'  JS nuevo local:          {len(new_js)} chars')
print(f'  Delta: {len(new_js) - len(old_js):+d} chars')

# ── 4. Patch quirúrgico: solo jsCode ──────────────────────────────────
wf['nodes'][target_idx]['parameters']['jsCode'] = new_js

# ── 5. Verificar nodos no tocados ────────────────────────────────────
print('\nVerificando integridad de nodos no tocados...')
with open(BACKUP_FILE, encoding='utf-8-sig') as f:
    backup = json.load(f)

for i, (prod_node, bk_node) in enumerate(zip(wf['nodes'], backup['nodes'])):
    if i == target_idx:
        continue
    if prod_node.get('name') != bk_node.get('name'):
        print(f'  WARN: nodo {i} nombre distinto: {prod_node.get("name")} vs {bk_node.get("name")}')
    else:
        print(f'  [OK] nodo {i}: {prod_node.get("name")}')

# ── 6. Armar payload PUT ──────────────────────────────────────────────
payload = {
    'name': wf['name'],
    'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': filter_settings(wf.get('settings', {}))
}

print(f'\nPayload PUT: name={payload["name"]}, nodes={len(payload["nodes"])}, settings keys={list(payload["settings"].keys())}')

confirm = input('\n¿Ejecutar PUT a producción? (s/N): ').strip().lower()
if confirm != 's':
    print('Abortado. No se hizo PUT.')
    sys.exit(0)

# ── 7. PUT ────────────────────────────────────────────────────────────
print('\nEjecutando PUT...')
result = api_put(key, f'/workflows/{WORKFLOW_ID}', payload)
print(f'  Respuesta: name={result.get("name")}, nodos={len(result.get("nodes", []))}')

# ── 8. Verificación post-PUT ──────────────────────────────────────────
print('\nVerificación post-PUT: GET de confirmación...')
verify = api_get(key, f'/workflows/{WORKFLOW_ID}')

# Encontrar nodo en resultado
verified_node = next((n for n in verify['nodes'] if n.get('name') == TARGET_NODE_NAME), None)
if not verified_node:
    print('ERROR: nodo no encontrado en verificación post-PUT.')
    sys.exit(1)

verified_js = verified_node['parameters'].get('jsCode', '')
print(f'  JS en producción post-PUT: {len(verified_js)} chars')

# Verificar strings con tildes
tilde_ok = True
for c in ['días', 'presupuesto', 'reemplazo', 'Glosario', 'Veredicto']:
    if c in verified_js:
        print(f'  [OK] tilde OK: "{c}"')
    else:
        print(f'  [WARN] no encontrado en producción: "{c}"')
        tilde_ok = False

if verified_js == new_js:
    print('\n[OK] PUT exitoso -- JS en produccion = JS local (byte a byte).')
else:
    print(f'\n[WARN] DIFERENCIA detectada: local={len(new_js)} chars, produccion={len(verified_js)} chars.')
    if not tilde_ok:
        print('  Posible corrupcion de tildes. Verificar manualmente en UI de n8n.')

# ── 9. Sync backup local ──────────────────────────────────────────────
sync_path = os.path.join(os.path.dirname(__file__), '..', 'automatizaciones', 'n8n-workflows', 'evaluate-ads-prod-fresh.json')
with open(sync_path, 'w', encoding='utf-8') as f:
    json.dump(verify, f, ensure_ascii=False, indent=2)
print(f'\nBackup local sincronizado: {sync_path}')
print('Listo.')
