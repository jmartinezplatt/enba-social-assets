"""
Patch quirúrgico sobre workflow Evaluación Diaria Ads (1qRywsEWAl7VoO5o).

Cambio: "Page likes FB" (acumulado lifetime) → "Ad likes 24h" (yesterday via nuevo nodo).

Operaciones:
1. Agrega nodo HTTP "Get Ad Likes 24h" (date_preset=yesterday, fields=ad_id,actions)
2. Actualiza conexiones: Get Quality Rankings → Get Ad Likes 24h → Evaluate Ads
3. Patch quirúrgico en Code node "Evaluate Ads":
   a. Agrega var totalFbLikes24h leyendo el nuevo nodo
   b. Cambia hero block: valor totalFbLikes → totalFbLikes24h, label "Page likes FB" → "Ad likes 24h"
"""

import json
import urllib.request
import os
import sys

# ── Config ────────────────────────────────────────────────────────────────────
WORKFLOW_ID = "1qRywsEWAl7VoO5o"
BASE_URL = "https://espacionautico.app.n8n.cloud/api/v1"

def get_api_key():
    import subprocess
    result = subprocess.run(
        ["powershell", "-Command",
         "[System.Environment]::GetEnvironmentVariable('N8N_API_KEY', 'User')"],
        capture_output=True, text=True
    )
    return result.stdout.strip()

API_KEY = get_api_key()
if not API_KEY:
    print("ERROR: N8N_API_KEY vacia")
    sys.exit(1)
print(f"API key: CARGADA ({len(API_KEY)} chars)")

# ── Step 1: GET fresco del workflow ───────────────────────────────────────────
print("\n[1/6] GET workflow productivo...")
req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": API_KEY}
)
with urllib.request.urlopen(req) as resp:
    wf = json.loads(resp.read().decode("utf-8"))

print(f"      Nodos: {[n['name'] for n in wf['nodes']]}")

# ── Step 2: Patch Code node — agregar totalFbLikes24h ────────────────────────
print("\n[2/6] Patch Code node 'Evaluate Ads'...")
eval_node = next(n for n in wf["nodes"] if n["name"] == "Evaluate Ads")
code = eval_node["parameters"]["jsCode"]

# Verificar que los strings objetivo existen exactamente
TARGET_DEF = "totalFbLikes     = followAds.reduce(function(s, r) { return s + r.fbLikes; }, 0);"
TARGET_HERO_VAL = "totalFbLikes.toLocaleString()"
TARGET_HERO_LABEL = "Page likes FB"

assert TARGET_DEF in code, f"ERROR: string definicion no encontrado"
assert TARGET_HERO_VAL in code, f"ERROR: string hero val no encontrado"
assert TARGET_HERO_LABEL in code, f"ERROR: string hero label no encontrado"
print("      Strings objetivo verificados OK")

# a. Insertar bloque totalFbLikes24h justo despues de la definicion de totalFbLikes
NEW_24H_BLOCK = (
    "\n// Ad likes last 24h (yesterday) — desde nodo Get Ad Likes 24h\n"
    "var totalFbLikes24h = 0;\n"
    "try {\n"
    "  $('Get Ad Likes 24h').all().forEach(function(item) {\n"
    "    totalFbLikes24h += getAction(item.json.actions, 'like');\n"
    "  });\n"
    "} catch(e) {}"
)
code = code.replace(
    TARGET_DEF,
    TARGET_DEF + NEW_24H_BLOCK,
    1  # solo primera ocurrencia
)
assert code.count("totalFbLikes24h") >= 2, "ERROR: bloque 24h no insertado correctamente"

# b. Cambiar hero block: valor
code = code.replace(TARGET_HERO_VAL, "totalFbLikes24h.toLocaleString()", 1)

# c. Cambiar hero block: label
code = code.replace(TARGET_HERO_LABEL, "Ad likes 24h", 1)

# Verificaciones post-patch
assert "totalFbLikes24h.toLocaleString()" in code, "ERROR: hero val no reemplazado"
assert "Ad likes 24h" in code, "ERROR: hero label no reemplazado"
assert "Page likes FB" not in code, "ERROR: label vieja todavia presente"
assert TARGET_DEF in code, "ERROR: definicion original perdida"  # sigue intacta
print("      Patch Code node OK")

eval_node["parameters"]["jsCode"] = code

# ── Step 3: Agregar nodo HTTP "Get Ad Likes 24h" ─────────────────────────────
print("\n[3/6] Agregando nodo 'Get Ad Likes 24h'...")
new_node = {
    "parameters": {
        "url": "https://graph.facebook.com/v22.0/act_2303565156801569/insights?level=ad&fields=ad_id,actions&date_preset=yesterday&limit=100",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {}
    },
    "id": "node-get-ad-likes-24h",
    "name": "Get Ad Likes 24h",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [840, 304],
    "credentials": {
        "httpHeaderAuth": {
            "id": "6LxWcVxeyZgsBTUU",
            "name": "Meta Ads API ENB"
        }
    },
    "continueOnFail": True
}
# Verificar que no existe ya
assert not any(n["name"] == "Get Ad Likes 24h" for n in wf["nodes"]), "ERROR: nodo ya existe"
wf["nodes"].append(new_node)
print("      Nodo agregado OK")

# ── Step 4: Actualizar conexiones ─────────────────────────────────────────────
print("\n[4/6] Actualizando conexiones...")
conns = wf["connections"]

# Verificar estado actual
assert conns.get("Get Quality Rankings", {}).get("main", [[]])[0][0]["node"] == "Evaluate Ads", \
    "ERROR: conexion Get Quality Rankings → Evaluate Ads no encontrada"

# Get Quality Rankings → Get Ad Likes 24h (antes iba a Evaluate Ads)
conns["Get Quality Rankings"]["main"][0][0]["node"] = "Get Ad Likes 24h"

# Get Ad Likes 24h → Evaluate Ads (nueva)
conns["Get Ad Likes 24h"] = {
    "main": [[{"node": "Evaluate Ads", "type": "main", "index": 0}]]
}
print("      Conexiones OK")

# ── Step 5: Guardar patch local para revision ─────────────────────────────────
print("\n[5/6] Guardando patch local para revision...")
out_path = "C:/Users/josea/enba-redes/automatizaciones/n8n-workflows/eval-ads-patched-likes24h.json"

# Filtrar campos que el PUT rechaza
put_payload = {
    "name": wf["name"],
    "nodes": wf["nodes"],
    "connections": wf["connections"],
    "settings": {k: v for k, v in wf.get("settings", {}).items()
                 if k in ("executionOrder", "callerPolicy", "saveManualExecutions")}
}

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(put_payload, f, ensure_ascii=False, indent=2)
print(f"      Guardado en {out_path}")

# ── Step 6: PUT ───────────────────────────────────────────────────────────────
print("\n[6/6] PUT al workflow productivo...")
payload_bytes = json.dumps(put_payload, ensure_ascii=False).encode("utf-8")
put_req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    data=payload_bytes,
    headers={
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json; charset=utf-8"
    },
    method="PUT"
)
with urllib.request.urlopen(put_req) as resp:
    result = json.loads(resp.read().decode("utf-8"))

# ── Verificacion post-PUT ─────────────────────────────────────────────────────
print("\n[POST-PUT] Verificacion...")
result_nodes = [n["name"] for n in result.get("nodes", [])]
print(f"      Nodos en respuesta: {result_nodes}")

result_eval = next((n for n in result["nodes"] if n["name"] == "Evaluate Ads"), None)
result_code = result_eval["parameters"]["jsCode"]

checks = [
    ("totalFbLikes24h en code", "totalFbLikes24h" in result_code),
    ("Ad likes 24h en code", "Ad likes 24h" in result_code),
    ("Page likes FB ausente", "Page likes FB" not in result_code),
    ("Get Ad Likes 24h en nodos", "Get Ad Likes 24h" in result_nodes),
    ("conexion QR->Likes24h", result["connections"].get("Get Quality Rankings", {}).get("main", [[{}]])[0][0].get("node") == "Get Ad Likes 24h"),
    ("conexion Likes24h->Eval", result["connections"].get("Get Ad Likes 24h", {}).get("main", [[{}]])[0][0].get("node") == "Evaluate Ads"),
]

all_ok = True
for label, ok in checks:
    status = "OK" if ok else "FALLO"
    print(f"      [{status}] {label}")
    if not ok:
        all_ok = False

if all_ok:
    print("\nPatch aplicado y verificado correctamente.")
else:
    print("\nERROR: uno o mas checks fallaron. Revisar antes de continuar.")
    sys.exit(1)
