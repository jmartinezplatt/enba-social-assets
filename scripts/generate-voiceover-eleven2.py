"""Generate voiceover with ElevenLabs - correct voice IDs."""
import subprocess, json, urllib.request
from pathlib import Path

ELEVEN_KEY = subprocess.run(
    ['powershell', '-Command', "[System.Environment]::GetEnvironmentVariable('ELEVENLABS_API_KEY','User')"],
    capture_output=True, text=True
).stdout.strip()

OUT = Path("C:/Users/josea/enba-social-assets/campaigns/reels/reel-primera-vez/voiceover")
OUT.mkdir(exist_ok=True)

phrases = [
    {"id": "01_hook", "text": "Nunca había subido a un velero."},
    {"id": "02_contexto", "text": "Un sábado cualquiera, Costanera Norte."},
    {"id": "03_motor", "text": "Cuando se apaga el motor... cambia todo."},
    {"id": "04_sensacion", "text": "No sabía que iba a ser así."},
    {"id": "05_cierre", "text": "Por qué no vine antes."},
]

# 2 femeninas + 2 masculinas con IDs completos
voices = {
    "laura": {"id": "FGY2WhTYpPnrIDTdsKH5", "desc": "Femenina - Entusiasta, natural"},
    "lily":  {"id": "pFZP5JQG7iQjIQuC4Bku", "desc": "Femenina - Suave, actriz"},
    "george": {"id": "JBFqnCBsd6RMkjVDRZzb", "desc": "Masculina - Cálida, storyteller"},
    "chris": {"id": "iP95p4xoKVk53GoZ742B", "desc": "Masculina - Cercana, relajada"},
}

for voice_name, voice_info in voices.items():
    print(f"\n=== {voice_name}: {voice_info['desc']} ===")
    for phrase in phrases:
        outfile = OUT / f"eleven_{voice_name}_{phrase['id']}.mp3"
        if outfile.exists():
            print(f"  Skip: {outfile.name}")
            continue

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_info['id']}"
        payload = json.dumps({
            "text": phrase["text"],
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.35,
                "similarity_boost": 0.8,
                "style": 0.6,
                "use_speaker_boost": True
            }
        }).encode()

        req = urllib.request.Request(url, data=payload, method='POST')
        req.add_header('xi-api-key', ELEVEN_KEY)
        req.add_header('Content-Type', 'application/json')
        req.add_header('Accept', 'audio/mpeg')

        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        try:
            with urllib.request.urlopen(req, context=ctx) as resp:
                data = resp.read()
                with open(outfile, 'wb') as f:
                    f.write(data)
            size_kb = len(data) / 1024
            print(f"  OK: {outfile.name} ({size_kb:.0f}KB)")
        except Exception as e:
            print(f"  ERROR: {phrase['id']} - {e}")

print(f"\nTodos los archivos en: {OUT}")
print("\nEscuchá las 4 voces y decime cuál te gusta.")
