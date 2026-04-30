#!/usr/bin/env python3
"""
Patch: ENBA - Evaluación Diaria Ads (1qRywsEWAl7VoO5o)
Reemplaza IDs hardcodeados en 3 nodos HTTP Request por queries dinámicas a la cuenta.
Adapta 3 bloques de parsing en el Code node (Evaluate Ads).

Metodología: Python obligatorio para PUTs a n8n (evita mojibake PowerShell).
Ref: OPERACION-N8N.md regla 5, INC-REDES-N8N-007.
"""

import json
import subprocess
import sys
import re
import urllib.request

# ── Config ──────────────────────────────────────────────────────────────
WORKFLOW_ID = "1qRywsEWAl7VoO5o"
BASE_URL = "https://espacionautico.app.n8n.cloud/api/v1"
AD_ACCOUNT = "act_2303565156801569"

# ── Get n8n API key from Windows User env ───────────────────────────────
def get_env(name):
    r = subprocess.run(
        ["powershell", "-Command",
         f'[System.Environment]::GetEnvironmentVariable("{name}","User")'],
        capture_output=True, text=True
    )
    val = r.stdout.strip()
    if not val:
        print(f"ERROR: {name} vacía")
        sys.exit(1)
    return val

N8N_KEY = get_env("N8N_API_KEY")

# ── GET workflow ────────────────────────────────────────────────────────
print("1. GET workflow...")
req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": N8N_KEY}
)
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with urllib.request.urlopen(req, context=ctx) as resp:
    wf = json.loads(resp.read().decode("utf-8"))

nodes = wf["nodes"]

# ── Patch nodo: Get Ad Status Batch ─────────────────────────────────────
print("2. Patching 'Get Ad Status Batch'...")
for node in nodes:
    if node["name"] == "Get Ad Status Batch":
        # Reemplazar URL con query dinámica por cuenta
        node["parameters"]["url"] = (
            f"https://graph.facebook.com/v22.0/{AD_ACCOUNT}/ads"
            f"?fields=id,name,effective_status,status&limit=100"
        )
        # Quitar query parameters hardcodeados (ids=...)
        if "queryParameters" in node["parameters"]:
            del node["parameters"]["queryParameters"]
        if "sendQuery" in node["parameters"]:
            del node["parameters"]["sendQuery"]
        print("   OK URL dinámica + query params removidos")
        break

# ── Patch nodo: Get Ad Set Budgets ──────────────────────────────────────
print("3. Patching 'Get Ad Set Budgets'...")
for node in nodes:
    if node["name"] == "Get Ad Set Budgets":
        node["parameters"]["url"] = (
            f"https://graph.facebook.com/v22.0/{AD_ACCOUNT}/adsets"
            f"?fields=id,name,daily_budget,status,effective_status&limit=100"
        )
        if "queryParameters" in node["parameters"]:
            del node["parameters"]["queryParameters"]
        if "sendQuery" in node["parameters"]:
            del node["parameters"]["sendQuery"]
        print("   OK URL dinámica + query params removidos")
        break

# ── Patch nodo: Get Quality Rankings ────────────────────────────────────
print("4. Patching 'Get Quality Rankings'...")
for node in nodes:
    if node["name"] == "Get Quality Rankings":
        # Query por cuenta con filtro effective_status=ACTIVE y date_preset=last_7d
        filtering = json.dumps([{
            "field": "ad.effective_status",
            "operator": "IN",
            "value": ["ACTIVE"]
        }])
        node["parameters"]["url"] = (
            f"https://graph.facebook.com/v22.0/{AD_ACCOUNT}/insights"
            f"?level=ad"
            f"&fields=ad_id,ad_name,quality_ranking,engagement_rate_ranking,conversion_rate_ranking"
            f"&date_preset=last_7d"
            f"&filtering={filtering}"
            f"&limit=100"
        )
        if "queryParameters" in node["parameters"]:
            del node["parameters"]["queryParameters"]
        if "sendQuery" in node["parameters"]:
            del node["parameters"]["sendQuery"]
        print("   OK URL dinámica por cuenta, filtro ACTIVE")
        break

# ── Patch nodo: Get Ad Insights (limit 50 -> 100) ───────────────────────
print("5. Patching 'Get Ad Insights' limit...")
for node in nodes:
    if node["name"] == "Get Ad Insights":
        old_url = node["parameters"]["url"]
        node["parameters"]["url"] = old_url.replace("&limit=50", "&limit=100")
        # Also upgrade API version v21.0 -> v22.0
        node["parameters"]["url"] = node["parameters"]["url"].replace("/v21.0/", "/v22.0/")
        print("   OK limit 50->100, API v21->v22")
        break

# ── Upgrade API version en otros nodos (v21->v22) ───────────────────────
print("5b. Upgrading API versions v21->v22 in remaining HTTP nodes...")
for node in nodes:
    if node.get("parameters", {}).get("url", ""):
        old = node["parameters"]["url"]
        if "/v21.0/" in old:
            node["parameters"]["url"] = old.replace("/v21.0/", "/v22.0/")
            print(f"   OK {node['name']}: v21->v22")

# ── Patch Code node: Evaluate Ads (3 parsing blocks) ───────────────────
print("6. Patching 'Evaluate Ads' Code node...")
for node in nodes:
    if node["name"] == "Evaluate Ads":
        code = node["parameters"]["jsCode"]

        # --- Block 1: adStatusMap (batch response -> array response) ---
        old_status = """var statusData = $('Get Ad Status Batch').first().json;
  Object.keys(statusData).forEach(function(id) {
    adStatusMap[id] = statusData[id].effective_status;
  });"""
        new_status = """var statusResp = $('Get Ad Status Batch').first().json;
  (statusResp.data || []).forEach(function(ad) {
    adStatusMap[ad.id] = ad.effective_status;
  });"""

        if old_status in code:
            code = code.replace(old_status, new_status)
            print("   OK adStatusMap parsing -> array format")
        else:
            print("   !! adStatusMap block not found by exact match, trying flexible...")
            # Flexible match
            code = re.sub(
                r"var statusData = \$\('Get Ad Status Batch'\)\.first\(\)\.json;\s*"
                r"Object\.keys\(statusData\)\.forEach\(function\(id\)\s*\{\s*"
                r"adStatusMap\[id\]\s*=\s*statusData\[id\]\.effective_status;\s*"
                r"\}\);",
                new_status,
                code
            )
            print("   OK adStatusMap parsing -> array format (flexible)")

        # --- Block 2: burn rate (batch response -> array response) ---
        old_budget = """var budgetData = $('Get Ad Set Budgets').first().json;
  Object.values(budgetData).forEach(function(adset) {
    if (adset.effective_status === 'ACTIVE') {
      realBurnRate += parseInt(adset.daily_budget || 0) / 100; // Meta devuelve en centavos
    }
  });"""
        new_budget = """var budgetResp = $('Get Ad Set Budgets').first().json;
  (budgetResp.data || []).forEach(function(adset) {
    if (adset.effective_status === 'ACTIVE') {
      realBurnRate += parseInt(adset.daily_budget || 0) / 100; // Meta devuelve en centavos
    }
  });"""

        if old_budget in code:
            code = code.replace(old_budget, new_budget)
            print("   OK burn rate parsing -> array format")
        else:
            print("   !! burn rate block not found by exact match, trying flexible...")
            code = re.sub(
                r"var budgetData = \$\('Get Ad Set Budgets'\)\.first\(\)\.json;\s*"
                r"Object\.values\(budgetData\)\.forEach\(function\(adset\)\s*\{",
                "var budgetResp = $('Get Ad Set Budgets').first().json;\n  (budgetResp.data || []).forEach(function(adset) {",
                code
            )
            print("   OK burn rate parsing -> array format (flexible)")

        # --- Block 3: quality rankings (batch response -> array response) ---
        old_quality = """var qualData = $('Get Quality Rankings').first().json;
  Object.keys(qualData).forEach(function(id) {
    qualityMap[id] = qualData[id];
  });"""
        new_quality = """var qualResp = $('Get Quality Rankings').first().json;
  (qualResp.data || []).forEach(function(row) {
    qualityMap[row.ad_id] = {
      quality_ranking: row.quality_ranking,
      engagement_rate_ranking: row.engagement_rate_ranking,
      conversion_rate_ranking: row.conversion_rate_ranking
    };
  });"""

        if old_quality in code:
            code = code.replace(old_quality, new_quality)
            print("   OK quality rankings parsing -> array format")
        else:
            print("   !! quality rankings block not found by exact match, trying flexible...")
            code = re.sub(
                r"var qualData = \$\('Get Quality Rankings'\)\.first\(\)\.json;\s*"
                r"Object\.keys\(qualData\)\.forEach\(function\(id\)\s*\{\s*"
                r"qualityMap\[id\]\s*=\s*qualData\[id\];\s*"
                r"\}\);",
                new_quality,
                code
            )
            print("   OK quality rankings parsing -> array format (flexible)")

        node["parameters"]["jsCode"] = code
        break

# ── Build PUT payload (only allowed fields) ─────────────────────────────
print("7. Building PUT payload...")
payload = {
    "name": wf["name"],
    "nodes": wf["nodes"],
    "connections": wf["connections"],
    "settings": wf.get("settings", {})
}

# ── Verify no mojibake before sending ───────────────────────────────────
payload_str = json.dumps(payload, ensure_ascii=False)
if "\ufffd" in payload_str:
    print("ERROR: Mojibake detectado (\\ufffd) en payload — abortando PUT")
    sys.exit(1)
print(f"   OK Payload OK, {len(payload_str)} bytes, sin mojibake")

# ── Save payload locally for inspection ─────────────────────────────────
local_path = "C:/Users/josea/enba-redes/automatizaciones/n8n-workflows/patch-eval-payload.json"
with open(local_path, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)
print(f"   OK Payload guardado en {local_path}")

# ── PUT workflow ────────────────────────────────────────────────────────
print("8. PUT workflow...")
put_data = payload_str.encode("utf-8")
put_req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    data=put_data,
    headers={
        "X-N8N-API-KEY": N8N_KEY,
        "Content-Type": "application/json; charset=utf-8"
    },
    method="PUT"
)

with urllib.request.urlopen(put_req, context=ctx) as resp:
    result = json.loads(resp.read().decode("utf-8"))
    print(f"   OK PUT OK — workflow '{result['name']}' actualizado")

# ── Verify post-PUT: check for mojibake in response ────────────────────
print("9. Verificación post-PUT...")
get_req2 = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}",
    headers={"X-N8N-API-KEY": N8N_KEY}
)
with urllib.request.urlopen(get_req2, context=ctx) as resp:
    verify = json.loads(resp.read().decode("utf-8"))

verify_str = json.dumps(verify, ensure_ascii=False)
if "\ufffd" in verify_str:
    print("ERROR: Mojibake detectado post-PUT — restaurar backup!")
    sys.exit(1)

# Verify the 3 patched nodes have dynamic URLs
for node in verify["nodes"]:
    if node["name"] == "Get Ad Status Batch":
        url = node["parameters"]["url"]
        assert f"{AD_ACCOUNT}/ads" in url, f"URL incorrecta: {url}"
        assert "ids=" not in url, f"Todavía tiene ids= hardcodeado: {url}"
        print(f"   OK Get Ad Status Batch: {url[:80]}...")
    elif node["name"] == "Get Ad Set Budgets":
        url = node["parameters"]["url"]
        assert f"{AD_ACCOUNT}/adsets" in url, f"URL incorrecta: {url}"
        assert "ids=" not in url, f"Todavía tiene ids= hardcodeado: {url}"
        print(f"   OK Get Ad Set Budgets: {url[:80]}...")
    elif node["name"] == "Get Quality Rankings":
        url = node["parameters"]["url"]
        assert f"{AD_ACCOUNT}/insights" in url, f"URL incorrecta: {url}"
        assert "ids=" not in url, f"Todavía tiene ids= hardcodeado: {url}"
        print(f"   OK Get Quality Rankings: {url[:80]}...")
    elif node["name"] == "Evaluate Ads":
        code = node["parameters"]["jsCode"]
        assert "statusResp.data" in code, "adStatusMap parsing no fue patcheado"
        assert "budgetResp.data" in code, "burn rate parsing no fue patcheado"
        assert "qualResp.data" in code, "quality rankings parsing no fue patcheado"
        print("   OK Evaluate Ads: 3 bloques de parsing verificados")

print("\n10. Re-registrando cron (active false->true)...")

# ── Deactivate ──────────────────────────────────────────────────────────
deact_req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}/deactivate",
    headers={"X-N8N-API-KEY": N8N_KEY},
    method="POST"
)
with urllib.request.urlopen(deact_req, context=ctx) as resp:
    resp.read()
print("   OK Deactivated")

# ── Activate ────────────────────────────────────────────────────────────
act_req = urllib.request.Request(
    f"{BASE_URL}/workflows/{WORKFLOW_ID}/activate",
    headers={"X-N8N-API-KEY": N8N_KEY},
    method="POST"
)
with urllib.request.urlopen(act_req, context=ctx) as resp:
    resp.read()
print("   OK Activated")

print("\n=== DONE ===")
print("Workflow patcheado exitosamente.")
print("3 nodos HTTP: IDs hardcodeados -> queries dinámicas por cuenta")
print("1 Code node: 3 bloques de parsing adaptados al nuevo formato")
print("Cron re-registrado. Próxima ejecución: mañana 09:00 ART.")
print("Para test manual: ejecutar desde UI de n8n o esperar cron.")
