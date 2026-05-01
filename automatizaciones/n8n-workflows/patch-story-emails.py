"""
patch-story-emails.py
Patchea los 4 workflows de stories para mejorar los emails de notificacion.

Cambios:
- Stories IG (Manana/Tarde/Noche): agrega link para ver la story en IG
- Stories FB Best: reescribe body con detalle completo y agrega emailFormat text

Usa Python con ensure_ascii=False + encode('utf-8') para evitar mojibake.
"""

import json
import urllib.request
import subprocess
import sys

# Leer API key desde Windows User scope
result = subprocess.run(
    ['powershell', '-Command',
     "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')"],
    capture_output=True, text=True
)
API_KEY = result.stdout.strip()
if not API_KEY:
    print('ERROR: N8N_API_KEY vacia')
    sys.exit(1)

BASE = 'https://espacionautico.app.n8n.cloud/api/v1/workflows'

# --- Workflows de Stories IG (Manana, Tarde, Noche) ---
IG_WORKFLOWS = [
    'q1nZVNrtEsxKEFni',  # Manana
    'pBP7tkXlD6nzx4wd',  # Tarde
    'c8MHANGzW56GORAi',  # Noche
]

# Nuevo texto del email con link a la story
IG_EMAIL_TEXT = (
    "={{ 'Story publicada correctamente.\\n\\n"
    "Categoria: ' + $('Pick Next Story').first().json.category + "
    "'\\nCaption: ' + $('Pick Next Story').first().json.caption + "
    "'\\nArchivo: ' + $('Pick Next Story').first().json.file + "
    "'\\nIG Story ID: ' + $json.id + "
    "'\\nVer story: https://www.instagram.com/stories/espacionauticobsas/' + $json.id + '/' + "
    "'\\nCiclo: ' + $('Pick Next Story').first().json.cycleProgress + "
    "'\\nSlot: ' + $('Pick Next Story').first().json.slot + ' (' + $('Pick Next Story').first().json.time + ' ART)' + "
    "'\\nTimestamp: ' + $('Pick Next Story').first().json.timestamp }}"
)

# --- Workflow FB Best Story ---
FB_WORKFLOW = 'ZGIGw47IYuwHv3Wh'

FB_EMAIL_TEXT = (
    "={{ 'Story ganadora publicada en FB.\\n\\n"
    "Fecha evaluada: ' + $('Pick Winner').first().json.date + "
    "'\\nSlot ganador: ' + $('Pick Winner').first().json.slot + "
    "'\\nReach IG: ' + $('Pick Winner').first().json.reach + "
    "'\\nSeq: ' + $('Pick Winner').first().json.seq + "
    "'\\nImagen: ' + $('Pick Winner').first().json.image_url + "
    "'\\nFB post_id: ' + $json.post_id + "
    "'\\n\\nEste workflow selecciona la story de IG con mayor reach del dia anterior y la republica como story en FB.' }}"
)


def get_workflow(wf_id):
    req = urllib.request.Request(f'{BASE}/{wf_id}', headers={
        'X-N8N-API-KEY': API_KEY,
        'Accept': 'application/json'
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))


def put_workflow(wf_id, wf):
    payload = {
        'name': wf['name'],
        'nodes': wf['nodes'],
        'connections': wf['connections'],
        'settings': {
            'executionOrder': wf.get('settings', {}).get('executionOrder', 'v1'),
        }
    }
    data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(f'{BASE}/{wf_id}', data=data, method='PUT', headers={
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))


def verify_no_fffd(wf_result, wf_id):
    raw = json.dumps(wf_result, ensure_ascii=False)
    if '\ufffd' in raw:
        print(f'ERROR: FFFD detectado en workflow {wf_id} post-PUT!')
        return False
    return True


# --- Patch Stories IG ---
for wf_id in IG_WORKFLOWS:
    print(f'\n--- Patching IG workflow {wf_id} ---')
    wf = get_workflow(wf_id)
    print(f'  Name: {wf["name"]}')

    patched = False
    for node in wf['nodes']:
        if node['name'] == 'Email OK':
            old_text = node['parameters'].get('text', '')
            node['parameters']['text'] = IG_EMAIL_TEXT
            patched = True
            print('  Email OK: text patched (added story link)')
            break

    if not patched:
        print('  WARNING: Email OK node not found!')
        continue

    result = put_workflow(wf_id, wf)
    if verify_no_fffd(result, wf_id):
        # Verify the story link is in the result
        for node in result['nodes']:
            if node['name'] == 'Email OK':
                text = node['parameters'].get('text', '')
                if 'instagram.com/stories/espacionauticobsas' in text:
                    print('  VERIFIED: story link present in post-PUT response')
                else:
                    print('  WARNING: story link NOT found in post-PUT response!')
                break
    print(f'  Done: {wf["name"]}')


# --- Patch Stories FB Best ---
print(f'\n--- Patching FB Best workflow {FB_WORKFLOW} ---')
wf = get_workflow(FB_WORKFLOW)
print(f'  Name: {wf["name"]}')

for node in wf['nodes']:
    if node['name'] == 'Email OK':
        node['parameters']['text'] = FB_EMAIL_TEXT
        node['parameters']['emailFormat'] = 'text'
        print('  Email OK: text rewritten + emailFormat set to text')
        break

result = put_workflow(FB_WORKFLOW, wf)
if verify_no_fffd(result, FB_WORKFLOW):
    for node in result['nodes']:
        if node['name'] == 'Email OK':
            text = node['parameters'].get('text', '')
            fmt = node['parameters'].get('emailFormat', '')
            if 'Story ganadora publicada en FB' in text:
                print('  VERIFIED: new body present in post-PUT response')
            else:
                print('  WARNING: new body NOT found in post-PUT response!')
            if fmt == 'text':
                print('  VERIFIED: emailFormat = text')
            else:
                print(f'  WARNING: emailFormat = {fmt}')
            break
print(f'  Done: {wf["name"]}')

print('\n=== All patches complete ===')
