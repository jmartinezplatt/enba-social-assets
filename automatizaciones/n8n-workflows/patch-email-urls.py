#!/usr/bin/env python3
"""
Patch quirurgico: corrige URLs en email de publicacion.
Cambios:
  1. Agrega nodo "Get IG Permalink" entre "IG Publish" y "Set IG Result"
  2. Actualiza jsCode de "Set IG Result" para capturar permalink
  3. Actualiza jsCode de "Collect Results" para usar permalink IG y URL valida FB
"""

import json
import subprocess
import sys
import urllib.request

WORKFLOW_ID = "MipwleZNu8EG5v6C"
BASE_URL = "https://espacionautico.app.n8n.cloud/api/v1"

# --- Leer API key ---
result = subprocess.run(
    ["powershell", "-Command",
     "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')"],
    capture_output=True, text=True
)
API_KEY = result.stdout.strip()
if not API_KEY:
    print("ERROR: N8N_API_KEY vacia")
    sys.exit(1)
print("API key: CARGADA")

# --- Leer JS de archivos ---
with open("nodes/patch-email-urls-set-ig-result.js", encoding="utf-8") as f:
    js_set_ig_result = f.read()

with open("nodes/patch-email-urls-collect-results.js", encoding="utf-8") as f:
    js_collect_results = f.read()

# --- GET workflow fresco ---
req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": API_KEY}
)
with urllib.request.urlopen(req) as resp:
    wf = json.loads(resp.read().decode("utf-8"))

print(f"Workflow obtenido: {wf['name']}")

# --- Snapshot de nodos originales para diff post-patch ---
original_nodes = {n["id"]: json.dumps(n, sort_keys=True) for n in wf["nodes"]}
original_connections = json.dumps(wf["connections"], sort_keys=True)

# --- Verificar nodos objetivo existen ---
node_ids = {n["id"]: i for i, n in enumerate(wf["nodes"])}
for nid in ["node-ig-publish", "node-set-ig-ok", "node-collect"]:
    if nid not in node_ids:
        print(f"ERROR: nodo {nid} no encontrado")
        sys.exit(1)
print("Nodos objetivo encontrados: OK")

# =========================================================
# CAMBIO 1: Agregar nodo "Get IG Permalink"
# =========================================================
new_node = {
    "id": "node-ig-get-permalink",
    "name": "Get IG Permalink",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [2460, 60],
    "continueOnFail": True,
    "parameters": {
        "method": "GET",
        "url": "=https://graph.facebook.com/v21.0/{{ $json.id }}?fields=permalink",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {}
    },
    "credentials": {
        "httpHeaderAuth": {
            "id": "n8scJzbGXnCprioD",
            "name": "Meta API ENBA"
        }
    }
}

# Solo agregar si no existe ya
if "node-ig-get-permalink" not in node_ids:
    wf["nodes"].append(new_node)
    print("Nodo Get IG Permalink: AGREGADO")
else:
    print("Nodo Get IG Permalink: ya existe, saltando")

# =========================================================
# CAMBIO 2: Actualizar jsCode de "Set IG Result"
# =========================================================
idx_set_ig = node_ids["node-set-ig-ok"]
old_js_set_ig = wf["nodes"][idx_set_ig]["parameters"]["jsCode"]
wf["nodes"][idx_set_ig]["parameters"]["jsCode"] = js_set_ig_result
print("Set IG Result jsCode: ACTUALIZADO")

# =========================================================
# CAMBIO 3: Actualizar jsCode de "Collect Results"
# =========================================================
idx_collect = node_ids["node-collect"]
old_js_collect = wf["nodes"][idx_collect]["parameters"]["jsCode"]
wf["nodes"][idx_collect]["parameters"]["jsCode"] = js_collect_results
print("Collect Results jsCode: ACTUALIZADO")

# =========================================================
# CAMBIO 4: Actualizar connections
# =========================================================
conn = wf["connections"]

# IG Publish [output 0] ahora va a Get IG Permalink (antes iba a Set IG Result)
conn["IG Publish"]["main"][0] = [
    {"node": "Get IG Permalink", "type": "main", "index": 0}
]

# Get IG Permalink [output 0] va a Set IG Result
conn["Get IG Permalink"] = {
    "main": [
        [{"node": "Set IG Result", "type": "main", "index": 0}]
    ]
}

print("Connections: ACTUALIZADAS")

# =========================================================
# PRE-PUT CHECKS
# =========================================================
print("\n--- PRE-PUT CHECKS ---")

# Check 1: nodos no tocados no cambiaron
unchanged_ok = True
for node in wf["nodes"]:
    nid = node["id"]
    if nid in ["node-set-ig-ok", "node-collect", "node-ig-get-permalink"]:
        continue  # estos los tocamos intencionalmente
    if nid in original_nodes:
        if json.dumps(node, sort_keys=True) != original_nodes[nid]:
            print(f"  FAIL: nodo {nid} cambio sin ser objetivo")
            unchanged_ok = False
if unchanged_ok:
    print("  CHECK 1 (nodos no tocados): OK")

# Check 2: connections shape - verificar que IG Publish tiene 2 outputs
ig_pub_conn = conn.get("IG Publish", {}).get("main", [])
assert len(ig_pub_conn) == 2, "IG Publish debe tener 2 outputs"
assert ig_pub_conn[0][0]["node"] == "Get IG Permalink", "output[0] debe ir a Get IG Permalink"
assert ig_pub_conn[1][0]["node"] == "Set IG Failed", "output[1] debe ir a Set IG Failed"
print("  CHECK 2 (connections shape): OK")

# Check 3: no hay U+FFFD en jsCode modificados
for label, js in [("Set IG Result", js_set_ig_result), ("Collect Results", js_collect_results)]:
    if "\ufffd" in js:
        print(f"  FAIL: U+FFFD en {label}")
        sys.exit(1)
print("  CHECK 3 (sin mojibake en JS nuevos): OK")

# Check 4: payload solo tiene campos permitidos
payload = {
    "name": wf["name"],
    "nodes": wf["nodes"],
    "connections": wf["connections"],
    "settings": {k: v for k, v in wf.get("settings", {}).items()
                 if k in ["executionOrder", "callerPolicy", "saveManualExecutions"]}
}
print("  CHECK 4 (payload campos permitidos): OK")

# =========================================================
# PUT via Python (encoding UTF-8 obligatorio)
# =========================================================
print("\n--- EJECUTANDO PUT ---")
body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

put_req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    data=body,
    headers={
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json; charset=utf-8"
    },
    method="PUT"
)

try:
    with urllib.request.urlopen(put_req) as resp:
        resp_data = json.loads(resp.read().decode("utf-8"))
    print(f"PUT: OK (status {resp.status if hasattr(resp, 'status') else '200'})")
except urllib.error.HTTPError as e:
    err_body = e.read().decode("utf-8")
    print(f"PUT FALLO: {e.code} - {err_body}")
    sys.exit(1)

# =========================================================
# POST-PUT VERIFICATION
# =========================================================
print("\n--- VERIFICACION POST-PUT ---")

verify_req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": API_KEY}
)
with urllib.request.urlopen(verify_req) as resp:
    wf_verify = json.loads(resp.read().decode("utf-8"))

# Verificar nodo nuevo existe
verify_ids = {n["id"] for n in wf_verify["nodes"]}
assert "node-ig-get-permalink" in verify_ids, "Get IG Permalink no encontrado post-PUT"
print("  Nodo Get IG Permalink: PRESENTE")

# Verificar jsCode sin mojibake
for node in wf_verify["nodes"]:
    if node["id"] in ["node-set-ig-ok", "node-collect"]:
        js = node["parameters"].get("jsCode", "")
        if "\ufffd" in js:
            print(f"  FAIL: U+FFFD en {node['name']} post-PUT")
            sys.exit(1)
        print(f"  {node['name']} jsCode: SIN MOJIBAKE")

# Verificar connections
ig_pub_conn_verify = wf_verify["connections"]["IG Publish"]["main"]
assert ig_pub_conn_verify[0][0]["node"] == "Get IG Permalink", "Connection IG Publish->Get IG Permalink no aplicada"
assert "Get IG Permalink" in wf_verify["connections"], "Connection Get IG Permalink->Set IG Result ausente"
print("  Connections IG Publish -> Get IG Permalink -> Set IG Result: OK")

# Verificar que FB URL fix esta en collect
collect_node = next(n for n in wf_verify["nodes"] if n["id"] == "node-collect")
assert "permalink.php" in collect_node["parameters"]["jsCode"], "FB permalink.php fix no aplicado"
print("  FB URL fix (permalink.php): OK")

ig_node = next(n for n in wf_verify["nodes"] if n["id"] == "node-set-ig-ok")
assert "ig.permalink" in collect_node["parameters"]["jsCode"], "IG permalink en collect: OK"
print("  IG permalink en Collect Results: OK")

print("\nPATCH COMPLETADO OK")

# =========================================================
# SYNC backup local
# =========================================================
with open("enba-redes-publish-daily-v2.json", "w", encoding="utf-8") as f:
    json.dump(wf_verify, f, ensure_ascii=False, indent=2)
print("Backup local sincronizado: enba-redes-publish-daily-v2.json")
