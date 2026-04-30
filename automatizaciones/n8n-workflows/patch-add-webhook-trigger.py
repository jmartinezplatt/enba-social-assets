#!/usr/bin/env python3
"""
Patch: Agregar Webhook Trigger al workflow ENBA - Evaluacion Diaria Ads.
Permite ejecutar el workflow manualmente via API (curl POST al webhook).
El Schedule Trigger sigue funcionando igual a las 9:00 ART.

Metodologia: Python obligatorio para PUTs a n8n (evita mojibake PowerShell).
Ref: OPERACION-N8N.md regla 5.
"""

import json
import subprocess
import sys
import urllib.request
import ssl

WORKFLOW_ID = "1qRywsEWAl7VoO5o"
BASE_URL = "https://espacionautico.app.n8n.cloud/api/v1"
WEBHOOK_PATH = "eval-ads-manual"

def get_env(name):
    r = subprocess.run(
        ["powershell", "-Command",
         f'[System.Environment]::GetEnvironmentVariable("{name}","User")'],
        capture_output=True, text=True
    )
    val = r.stdout.strip()
    if not val:
        print(f"ERROR: {name} vacia")
        sys.exit(1)
    return val

N8N_KEY = get_env("N8N_API_KEY")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 1. GET workflow
print("1. GET workflow...")
req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": N8N_KEY}
)
with urllib.request.urlopen(req, context=ctx) as resp:
    wf = json.loads(resp.read().decode("utf-8"))

# 2. Check if webhook already exists
for node in wf["nodes"]:
    if node.get("type") == "n8n-nodes-base.webhook":
        print(f"Webhook ya existe: {node['name']} - abortando (no duplicar)")
        sys.exit(0)

# 3. Add webhook node (positioned above Schedule Trigger)
print("2. Agregando nodo Webhook Trigger...")
webhook_node = {
    "parameters": {
        "path": WEBHOOK_PATH,
        "httpMethod": "POST",
        "responseMode": "lastNode",
        "options": {}
    },
    "name": "Webhook Manual Trigger",
    "type": "n8n-nodes-base.webhook",
    "typeVersion": 2,
    "position": [-256, 104]  # arriba del Schedule [-256, 304]
}
wf["nodes"].append(webhook_node)
print(f"   OK Nodo agregado: path=/{WEBHOOK_PATH}")

# 4. Add connection: Webhook -> Get Ad Insights
print("3. Agregando conexion Webhook -> Get Ad Insights...")
wf["connections"]["Webhook Manual Trigger"] = {
    "main": [
        [
            {
                "node": "Get Ad Insights",
                "type": "main",
                "index": 0
            }
        ]
    ]
}
print("   OK Conexion agregada")

# 5. Build PUT payload (only allowed fields)
print("4. Building PUT payload...")
allowed_settings = {"executionOrder", "timezone", "callerPolicy"}
payload = {
    "name": wf["name"],
    "nodes": wf["nodes"],
    "connections": wf["connections"],
    "settings": {k: v for k, v in wf.get("settings", {}).items() if k in allowed_settings}
}

payload_str = json.dumps(payload, ensure_ascii=False)
if "\ufffd" in payload_str:
    print("ERROR: Mojibake detectado - abortando PUT")
    sys.exit(1)
print(f"   OK Payload {len(payload_str)} bytes, sin mojibake")

# 6. PUT
print("5. PUT workflow...")
put_req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    data=payload_str.encode("utf-8"),
    headers={
        "X-N8N-API-KEY": N8N_KEY,
        "Content-Type": "application/json; charset=utf-8"
    },
    method="PUT"
)
with urllib.request.urlopen(put_req, context=ctx) as resp:
    result = json.loads(resp.read().decode("utf-8"))
    print(f"   OK PUT exitoso: '{result['name']}'")

# 7. Verify post-PUT
print("6. Verificacion post-PUT...")
get_req2 = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": N8N_KEY}
)
with urllib.request.urlopen(get_req2, context=ctx) as resp:
    verify = json.loads(resp.read().decode("utf-8"))

verify_str = json.dumps(verify, ensure_ascii=False)
if "\ufffd" in verify_str:
    print("ERROR: Mojibake post-PUT!")
    sys.exit(1)

webhook_found = False
for node in verify["nodes"]:
    if node.get("type") == "n8n-nodes-base.webhook":
        webhook_found = True
        print(f"   OK Webhook node encontrado: {node['name']}")
        break

if not webhook_found:
    print("ERROR: Webhook node no encontrado post-PUT!")
    sys.exit(1)

conn = verify["connections"].get("Webhook Manual Trigger", {})
targets = conn.get("main", [[]])[0]
if targets and targets[0]["node"] == "Get Ad Insights":
    print("   OK Conexion Webhook -> Get Ad Insights verificada")
else:
    print("ERROR: Conexion incorrecta!")
    sys.exit(1)

# Check Spanish text in Code node survived
for node in verify["nodes"]:
    if node["name"] == "Evaluate Ads":
        code = node["parameters"]["jsCode"]
        if "posici" in code:  # posición
            print("   OK Texto espanol intacto")
        break

# 8. Re-register cron
print("7. Re-registrando cron (deactivate -> activate)...")
for action in ["deactivate", "activate"]:
    areq = urllib.request.Request(
        f"{BASE_URL}/workflows/{WORKFLOW_ID}/{action}",
        headers={"X-N8N-API-KEY": N8N_KEY},
        method="POST"
    )
    with urllib.request.urlopen(areq, context=ctx) as resp:
        r = json.loads(resp.read().decode("utf-8"))
        print(f"   {action}: active={r.get('active')}")

print()
print("=== DONE ===")
print(f"Webhook URL: https://espacionautico.app.n8n.cloud/webhook/{WEBHOOK_PATH}")
print("Para disparar: curl -X POST https://espacionautico.app.n8n.cloud/webhook/" + WEBHOOK_PATH)
print("El Schedule Trigger 9:00 ART sigue funcionando normalmente.")
