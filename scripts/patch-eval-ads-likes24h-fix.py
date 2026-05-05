"""
Fix quirurgico sobre bloque totalFbLikes24h en Code node Evaluate Ads.

Problemas:
1. Estructura incorrecta: Meta devuelve { data: [] }, no items individuales.
   $('Get Ad Likes 24h').all() da 1 item con json.data[] adentro.
2. Action type incorrecto: 'like' -> 'onsite_conversion.post_net_like' (likes netos FB).
"""

import json
import urllib.request
import subprocess
import sys

WORKFLOW_ID = "1qRywsEWAl7VoO5o"
BASE_URL = "https://espacionautico.app.n8n.cloud/api/v1"

def get_api_key():
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

# ── Step 1: GET fresco ────────────────────────────────────────────────────────
print("\n[1/5] GET workflow productivo...")
req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": API_KEY}
)
with urllib.request.urlopen(req) as resp:
    wf = json.loads(resp.read().decode("utf-8"))
print(f"      OK — {len(wf['nodes'])} nodos")

# ── Step 2: Patch quirurgico en Code node ─────────────────────────────────────
print("\n[2/5] Patch Code node...")
eval_node = next(n for n in wf["nodes"] if n["name"] == "Evaluate Ads")
code = eval_node["parameters"]["jsCode"]

OLD_BLOCK = (
    "// Ad likes last 24h (yesterday) \u2014 desde nodo Get Ad Likes 24h\n"
    "var totalFbLikes24h = 0;\n"
    "try {\n"
    "  $('Get Ad Likes 24h').all().forEach(function(item) {\n"
    "    totalFbLikes24h += getAction(item.json.actions, 'like');\n"
    "  });\n"
    "} catch(e) {}"
)

NEW_BLOCK = (
    "// Ad likes netos 24h (yesterday) \u2014 desde nodo Get Ad Likes 24h\n"
    "var totalFbLikes24h = 0;\n"
    "try {\n"
    "  var likes24hData = $('Get Ad Likes 24h').first().json.data || [];\n"
    "  likes24hData.forEach(function(ad) {\n"
    "    totalFbLikes24h += getAction(ad.actions, 'onsite_conversion.post_net_like');\n"
    "  });\n"
    "} catch(e) {}"
)

assert OLD_BLOCK in code, "ERROR: bloque original no encontrado — verificar GET fresco"
print("      Bloque original encontrado OK")

code = code.replace(OLD_BLOCK, NEW_BLOCK, 1)

assert NEW_BLOCK in code, "ERROR: bloque nuevo no insertado"
assert OLD_BLOCK not in code, "ERROR: bloque viejo todavia presente"
assert "onsite_conversion.post_net_like" in code, "ERROR: action type nuevo no presente"
assert "$('Get Ad Likes 24h').first().json.data" in code, "ERROR: estructura nueva no presente"
print("      Patch aplicado y verificado OK")

eval_node["parameters"]["jsCode"] = code

# ── Step 3: Guardar para revision ────────────────────────────────────────────
print("\n[3/5] Guardando JSON patched...")
out_path = "C:/Users/josea/enba-redes/automatizaciones/n8n-workflows/eval-ads-patched-likes24h-fix.json"
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

# ── Step 4: PUT ───────────────────────────────────────────────────────────────
print("\n[4/5] PUT al workflow productivo...")
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
print("      PUT OK")

# ── Step 5: Verificacion post-PUT ─────────────────────────────────────────────
print("\n[5/5] Verificacion post-PUT...")
result_eval = next(n for n in result["nodes"] if n["name"] == "Evaluate Ads")
result_code = result_eval["parameters"]["jsCode"]

checks = [
    ("onsite_conversion.post_net_like en code", "onsite_conversion.post_net_like" in result_code),
    ("estructura .first().json.data en code", "$('Get Ad Likes 24h').first().json.data" in result_code),
    ("bloque viejo ausente", "$('Get Ad Likes 24h').all()" not in result_code),
    ("action type viejo ausente", "getAction(item.json.actions, 'like')" not in result_code),
]

all_ok = True
for label, ok in checks:
    status = "OK" if ok else "FALLO"
    print(f"      [{status}] {label}")
    if not ok:
        all_ok = False

if all_ok:
    print("\nFix aplicado y verificado correctamente.")
else:
    print("\nERROR: uno o mas checks fallaron.")
    sys.exit(1)
