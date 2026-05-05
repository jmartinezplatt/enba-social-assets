"""
Bruno — Acciones aprobadas 05/05/2026
Acción 1: ESCALAR ig_cold +20% ($3,500 → $4,200/día)
Acción 2: CORTAR destinos_FB_Cold (PAUSED)
Acción 4: ACTIVAR retarget FB — 2 ads nuevos con static01 + static02
"""
import subprocess
import json
import urllib.request
import urllib.parse
import sys

# --- Token ---
token = subprocess.run(
    ['powershell', '-Command', "[System.Environment]::GetEnvironmentVariable('META_ADS_USER_TOKEN', 'User')"],
    capture_output=True, text=True
).stdout.strip()

if not token:
    print("ERROR: META_ADS_USER_TOKEN vacio")
    sys.exit(1)

print(f"Token: CARGADO ({len(token)} chars)")

BASE = "https://graph.facebook.com/v22.0"
AD_ACCOUNT = "act_2303565156801569"

def api_post(path, params):
    params['access_token'] = token
    data = urllib.parse.urlencode(params).encode('utf-8')
    req = urllib.request.Request(f"{BASE}/{path}", data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            return result
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"  HTTP {e.code}: {body}")
        return None

# =============================================================
# Acción 1: ESCALAR ig_cold ad set — $3,500 → $4,200/día (+20%)
# ig_cold id: 120239303658370139
# =============================================================
print("\n=== Acción 1: ESCALAR ig_cold +20% ===")
print("  Ad set: 120239303658370139")
print("  Budget: 350000 → 420000 ARS centavos ($3,500 → $4,200/día)")

r1 = api_post("120239303658370139", {"daily_budget": "420000"})
if r1 and r1.get("success"):
    print("  OK — ig_cold escalado a $4,200/día")
else:
    print(f"  Resultado: {r1}")

# =============================================================
# Acción 2: CORTAR ENBA_ad_destinos_FB_Cold — PAUSED
# Ad id: 120239303665020139
# =============================================================
print("\n=== Acción 2: CORTAR destinos_FB_Cold ===")
print("  Ad: 120239303665020139")

r2 = api_post("120239303665020139", {"status": "PAUSED"})
if r2 and r2.get("success"):
    print("  OK — destinos_FB_Cold PAUSED")
else:
    print(f"  Resultado: {r2}")

# =============================================================
# Acción 4: ACTIVAR retarget FB — crear 2 ads nuevos
# fb_retarget ad set id: 120239303660260139
# Creative static01: 961542533501869
# Creative static02: 26783650401254705
# =============================================================
print("\n=== Acción 4: ACTIVAR retarget FB ===")
print("  Ad set: 120239303660260139 (fb_retarget, $3,600/día, PAGE_LIKES)")

print("  Creando ENBA_ad_FB_static01_Retarget...")
r4a = api_post(f"{AD_ACCOUNT}/ads", {
    "name": "ENBA_ad_FB_static01_Retarget",
    "adset_id": "120239303660260139",
    "creative": json.dumps({"creative_id": "961542533501869"}),
    "status": "ACTIVE"
})
if r4a and r4a.get("id"):
    print(f"  OK — static01_Retarget creado: ID {r4a['id']}")
else:
    print(f"  Resultado: {r4a}")

print("  Creando ENBA_ad_FB_static02_Retarget...")
r4b = api_post(f"{AD_ACCOUNT}/ads", {
    "name": "ENBA_ad_FB_static02_Retarget",
    "adset_id": "120239303660260139",
    "creative": json.dumps({"creative_id": "26783650401254705"}),
    "status": "ACTIVE"
})
if r4b and r4b.get("id"):
    print(f"  OK — static02_Retarget creado: ID {r4b['id']}")
else:
    print(f"  Resultado: {r4b}")

# =============================================================
print("\n=== RESUMEN ===")
print(f"  Acción 1 ig_cold scale:    {'OK' if r1 and r1.get('success') else 'REVISAR'}")
print(f"  Acción 2 destinos FB cut:  {'OK' if r2 and r2.get('success') else 'REVISAR'}")
print(f"  Acción 4 static01 retarget: {'OK: ' + r4a.get('id','') if r4a and r4a.get('id') else 'REVISAR'}")
print(f"  Acción 4 static02 retarget: {'OK: ' + r4b.get('id','') if r4b and r4b.get('id') else 'REVISAR'}")

print("\nIDs para registrar en meta-ids.json:")
if r4a and r4a.get("id"):
    print(f"  ENBA_ad_FB_static01_Retarget: {r4a['id']}")
if r4b and r4b.get("id"):
    print(f"  ENBA_ad_FB_static02_Retarget: {r4b['id']}")
