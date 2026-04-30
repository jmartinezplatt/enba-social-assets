#!/usr/bin/env python3
"""
Patch: Fix burn rate - solo contar ad sets con al menos 1 ad ACTIVE.
Cambios:
  1. Get Ad Status Batch: agregar adset_id a los fields
  2. Code node: construir set de ad sets con ads activos, filtrar budget

Metodologia: Python obligatorio para PUTs a n8n (evita mojibake).
Ref: OPERACION-N8N.md regla 5.
"""

import json
import subprocess
import sys
import urllib.request
import ssl

WORKFLOW_ID = "1qRywsEWAl7VoO5o"
BASE_URL = "https://espacionautico.app.n8n.cloud/api/v1"

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

# 2. Patch URL: agregar adset_id a Get Ad Status Batch
print("2. Patching Get Ad Status Batch URL (agregar adset_id)...")
for node in wf["nodes"]:
    if node["name"] == "Get Ad Status Batch":
        old_url = node["parameters"]["url"]
        expected = "fields=id,name,effective_status,status"
        new_fields = "fields=id,name,effective_status,status,adset_id"
        if expected in old_url:
            node["parameters"]["url"] = old_url.replace(expected, new_fields)
            print(f"   OK fields: +adset_id")
        else:
            print(f"   ERROR: URL no tiene el patron esperado: {old_url}")
            sys.exit(1)
        break

# 3. Patch Code node: status block + budget block
print("3. Patching Evaluate Ads Code node...")
for node in wf["nodes"]:
    if node["name"] == "Evaluate Ads":
        code = node["parameters"]["jsCode"]

        # Block 1: adStatusMap - agregar construccion de activeAdSetIds
        old_status_block = """var adStatusMap = {};
try {
  var statusResp = $('Get Ad Status Batch').first().json;
  (statusResp.data || []).forEach(function(ad) {
    adStatusMap[ad.id] = ad.effective_status;
  });
} catch(e) {}"""

        new_status_block = """var adStatusMap = {};
var activeAdSetIds = {};
try {
  var statusResp = $('Get Ad Status Batch').first().json;
  (statusResp.data || []).forEach(function(ad) {
    adStatusMap[ad.id] = ad.effective_status;
    if (ad.effective_status === 'ACTIVE' && ad.adset_id) {
      activeAdSetIds[ad.adset_id] = true;
    }
  });
} catch(e) {}"""

        if old_status_block in code:
            code = code.replace(old_status_block, new_status_block)
            print("   OK adStatusMap + activeAdSetIds")
        else:
            print("   ERROR: status block no encontrado por match exacto")
            sys.exit(1)

        # Block 2: burn rate - filtrar por activeAdSetIds
        old_budget_block = """  var budgetResp = $('Get Ad Set Budgets').first().json;
  (budgetResp.data || []).forEach(function(adset) {
    if (adset.effective_status === 'ACTIVE') {
      realBurnRate += parseInt(adset.daily_budget || 0) / 100; // Meta devuelve en centavos
    }
  });"""

        new_budget_block = """  var budgetResp = $('Get Ad Set Budgets').first().json;
  (budgetResp.data || []).forEach(function(adset) {
    if (adset.effective_status === 'ACTIVE' && activeAdSetIds[adset.id]) {
      realBurnRate += parseInt(adset.daily_budget || 0) / 100; // Meta devuelve en centavos
    }
  });"""

        if old_budget_block in code:
            code = code.replace(old_budget_block, new_budget_block)
            print("   OK burn rate: solo ad sets con ads activos")
        else:
            print("   ERROR: budget block no encontrado por match exacto")
            sys.exit(1)

        # Update comment
        old_comment = "// Suma de daily_budget de ad sets con effective_status ACTIVE"
        new_comment = "// Suma de daily_budget de ad sets ACTIVE que tienen al menos 1 ad ACTIVE"
        if old_comment in code:
            code = code.replace(old_comment, new_comment)

        node["parameters"]["jsCode"] = code
        break

# 4. Build PUT payload
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
    print("ERROR: Mojibake detectado - abortando")
    sys.exit(1)
print(f"   OK {len(payload_str)} bytes, sin mojibake")

# 5. PUT
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
    print(f"   OK '{result['name']}'")

# 6. Verify post-PUT
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
print("   OK Sin mojibake")

for node in verify["nodes"]:
    if node["name"] == "Get Ad Status Batch":
        url = node["parameters"]["url"]
        if "adset_id" in url:
            print(f"   OK URL tiene adset_id")
        else:
            print("   ERROR: URL sin adset_id!")
            sys.exit(1)
    elif node["name"] == "Evaluate Ads":
        code = node["parameters"]["jsCode"]
        if "activeAdSetIds" in code and "activeAdSetIds[adset.id]" in code:
            print("   OK Code node: activeAdSetIds logica presente")
        else:
            print("   ERROR: logica activeAdSetIds no encontrada!")
            sys.exit(1)
        # Verify Spanish text
        if any(c in code for c in ["posici", "Evaluaci", "parametro"]):
            print("   OK Texto espanol intacto")

# 7. Re-register cron
print("7. Re-registrando cron...")
for action in ["deactivate", "activate"]:
    areq = urllib.request.Request(
        f"{BASE_URL}/workflows/{WORKFLOW_ID}/{action}",
        headers={"X-N8N-API-KEY": N8N_KEY},
        method="POST"
    )
    with urllib.request.urlopen(areq, context=ctx) as resp:
        r = json.loads(resp.read().decode("utf-8"))
        print(f"   {action}: active={r.get('active')}")

print("\n=== DONE ===")
print("Burn rate ahora solo cuenta ad sets con al menos 1 ad ACTIVE.")
print("Disparar test: curl -X POST https://espacionautico.app.n8n.cloud/webhook/eval-ads-manual")
