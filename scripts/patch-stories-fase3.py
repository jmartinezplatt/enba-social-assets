#!/usr/bin/env python3
# Patch quirurgico: Stories Manana + Noche
# Cambios: cycleStartDate 2026-04-26 -> 2026-05-06, manifest fase2 -> fase3
import json, urllib.request, subprocess, sys

def get_key():
    r = subprocess.run(
        ['powershell', '-Command', "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY','User')"],
        capture_output=True, text=True
    )
    return r.stdout.strip()

BASE = 'https://espacionautico.app.n8n.cloud/api/v1'
KEY = get_key()
HEADERS_GET = {'X-N8N-API-KEY': KEY, 'Accept': 'application/json'}
HEADERS_PUT = {'X-N8N-API-KEY': KEY, 'Accept': 'application/json', 'Content-Type': 'application/json; charset=utf-8'}

WORKFLOWS = [
    {'id': 'q1nZVNrtEsxKEFni', 'label': 'Stories Manana'},
    {'id': 'c8MHANGzW56GORAi', 'label': 'Stories Noche'},
]

NEW_MANIFEST = 'https://enba-social-assets.pages.dev/campaigns/plan-crecimiento-10k/highlights/stories/fase3-manifest.json'
NEW_DATE = '2026-05-06'
OLD_DATE = '2026-04-26'

def api_get(path):
    req = urllib.request.Request(BASE + path, headers=HEADERS_GET)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def api_put(path, payload):
    data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(BASE + path, data=data, method='PUT', headers=HEADERS_PUT)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def patch_workflow(wf_id, label):
    print(f'\n--- {label} ({wf_id}) ---')
    wf = api_get(f'/workflows/{wf_id}')

    patched_nodes = []
    changes = []
    for node in wf['nodes']:
        n = dict(node)

        # Patch Set Slot: cycleStartDate
        if node['name'] == 'Set Slot':
            assignments = n['parameters']['assignments']['assignments']
            for a in assignments:
                if a['name'] == 'cycleStartDate' and a['value'] == OLD_DATE:
                    a['value'] = NEW_DATE
                    changes.append(f"  Set Slot: cycleStartDate {OLD_DATE} -> {NEW_DATE}")

        # Patch Get Manifest: URL
        if node['name'] == 'Get Manifest':
            old_url = n['parameters'].get('url', '')
            if 'fase2-manifest.json' in old_url:
                n['parameters']['url'] = NEW_MANIFEST
                changes.append(f"  Get Manifest: URL -> fase3-manifest.json")

        patched_nodes.append(n)

    if not changes:
        print('  Nada que cambiar — ya actualizado?')
        return

    for c in changes:
        print(c)

    # Solo campos permitidos en PUT
    allowed_settings_keys = {'executionOrder', 'callerPolicy', 'saveManualExecutions'}
    settings = {k: v for k, v in wf.get('settings', {}).items() if k in allowed_settings_keys}

    payload = {
        'name': wf['name'],
        'nodes': patched_nodes,
        'connections': wf['connections'],
        'settings': settings,
    }

    result = api_put(f'/workflows/{wf_id}', payload)
    print(f'  PUT OK — id: {result["id"]}')

    # Verificacion post-PUT
    verify = api_get(f'/workflows/{wf_id}')
    for node in verify['nodes']:
        if node['name'] == 'Set Slot':
            for a in node['parameters']['assignments']['assignments']:
                if a['name'] == 'cycleStartDate':
                    ok = a['value'] == NEW_DATE
                    print(f'  VERIFY cycleStartDate: {a["value"]} {"OK" if ok else "FAIL"}')
        if node['name'] == 'Get Manifest':
            url = node['parameters'].get('url', '')
            ok = 'fase3' in url
            print(f'  VERIFY manifest URL: {"fase3 OK" if ok else "FAIL — " + url}')

for wf in WORKFLOWS:
    patch_workflow(wf['id'], wf['label'])

print('\nPatch completo.')
