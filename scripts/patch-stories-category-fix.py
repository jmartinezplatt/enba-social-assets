"""
patch-stories-category-fix.py
Fix: [undefined] -> [Fase 3] en subject y body del nodo Email OK
Workflows: Stories Mañana (q1nZVNrtEsxKEFni) y Noche (c8MHANGzW56GORAi)
Bug: fase3-manifest.json no tiene campo `category` — era específico de Fase 2.
"""

import json
import subprocess
import sys
import urllib.request

BASE_URL = "https://espacionautico.app.n8n.cloud/api/v1"

WORKFLOWS = [
    {"id": "q1nZVNrtEsxKEFni", "name": "Stories Mañana", "email_node_id": "email-ok-manana"},
    {"id": "c8MHANGzW56GORAi", "name": "Stories Noche",  "email_node_id": "email-ok-noche"},
]

NEW_SUBJECT = (
    "={{ 'ENBA Stories [Fase 3] '"
    " + $('Pick Next Story').first().json.cycleProgress"
    " + ' ' + $('Set Slot').first().json.slot"
    " + ' publicada \u2713' }}"
)

NEW_TEXT = (
    "={{ 'Story publicada correctamente.\\n\\nFase: Fase 3"
    "\\nCaption: ' + $('Pick Next Story').first().json.caption"
    " + '\\nArchivo: ' + $('Pick Next Story').first().json.file"
    " + '\\nIG Story ID: ' + $json.id"
    " + '\\nVer story: https://www.instagram.com/stories/espacionauticobsas/' + $json.id + '/'"
    " + '\\nCiclo: ' + $('Pick Next Story').first().json.cycleProgress"
    " + '\\nSlot: ' + $('Pick Next Story').first().json.slot"
    " + ' (' + $('Pick Next Story').first().json.time + ' ART)'"
    " + '\\nTimestamp: ' + $('Pick Next Story').first().json.timestamp }}"
)

def get_key():
    result = subprocess.run(
        ["powershell", "-Command",
         "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')"],
        capture_output=True, text=True
    )
    key = result.stdout.strip()
    if not key:
        print("ERROR: N8N_API_KEY vacía")
        sys.exit(1)
    print("API key: CARGADA")
    return key

def api_get(key, path):
    req = urllib.request.Request(BASE_URL + path, headers={"X-N8N-API-KEY": key})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode("utf-8"))

def api_put(key, path, payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        BASE_URL + path,
        data=data,
        headers={
            "X-N8N-API-KEY": key,
            "Content-Type": "application/json; charset=utf-8",
        },
        method="PUT",
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode("utf-8"))

def filter_settings(settings):
    allowed = {"executionOrder", "callerPolicy", "saveManualExecutions"}
    return {k: v for k, v in settings.items() if k in allowed}

def patch_workflow(wf, key, dry_run=False):
    wid = wf["id"]
    name = wf["name"]
    email_id = wf["email_node_id"]

    print(f"\n--- {name} ({wid}) ---")
    data = api_get(key, f"/workflows/{wid}")

    nodes = data.get("nodes", [])
    target = next((n for n in nodes if n.get("id") == email_id), None)
    if not target:
        print(f"  ERROR: nodo '{email_id}' no encontrado")
        sys.exit(1)

    old_subject = target["parameters"].get("subject", "")
    print(f"  Subject actual: {old_subject[:100]}")

    # Verificar que el jsCode de Pick Next Story no se toca
    pick_node = next((n for n in nodes if n.get("name") == "Pick Next Story"), None)
    if pick_node:
        jscode_len = len(pick_node["parameters"].get("jsCode", ""))
        print(f"  jsCode 'Pick Next Story': {jscode_len} chars (verificado, no se toca)")

    if "[Fase 3]" in old_subject and "category" not in old_subject:
        print("  Ya está actualizado — skip")
        return

    # Patch quirúrgico: solo email node
    target["parameters"]["subject"] = NEW_SUBJECT
    target["parameters"]["text"]    = NEW_TEXT

    print(f"  Subject nuevo:  {NEW_SUBJECT[:100]}")

    if dry_run:
        print("  [DRY RUN] No se ejecutó PUT")
        return

    payload = {
        "name":        data["name"],
        "nodes":       nodes,
        "connections": data["connections"],
        "settings":    filter_settings(data.get("settings", {})),
    }

    result = api_put(key, f"/workflows/{wid}", payload)
    print(f"  PUT OK — workflow: {result.get('name')}")

    # Verificación post-PUT
    data2 = api_get(key, f"/workflows/{wid}")
    target2 = next((n for n in data2["nodes"] if n.get("id") == email_id), None)
    got_subject = target2["parameters"].get("subject", "")
    got_text    = target2["parameters"].get("text", "")
    if "[Fase 3]" in got_subject and "category" not in got_subject and "Fase: Fase 3" in got_text:
        print("  Verificacion POST-PUT: OK")
    else:
        print(f"  ERROR verificacion POST-PUT: subject={got_subject[:80]}")
        sys.exit(1)

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("=== DRY RUN — no se ejecutan PUTs ===")

    key = get_key()
    for wf in WORKFLOWS:
        patch_workflow(wf, key, dry_run=dry_run)

    print("\nDone.")
