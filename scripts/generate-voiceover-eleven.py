"""Generate voiceover with ElevenLabs - natural Spanish Argentine voices."""
import os, subprocess, json
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

# Voces que suenan bien en español con multilingual_v2
# Femenina: Laura (enthusiast, quirky) y Sarah (mature, reassuring)
# Masculina: George (warm storyteller) y Brian (deep, comforting)
voices = {
    "laura": {"id": "FGY2WhTYpPnrIDTd", "gender": "female", "desc": "Enthusiast, natural"},
    "sarah": {"id": "EXAVITQu4vr4xnSD", "gender": "female", "desc": "Mature, reassuring"},
    "george": {"id": "JBFqnCBsd6RMkjVD", "gender": "male", "desc": "Warm storyteller"},
    "brian": {"id": "nPczCjzI2devNBz1", "gender": "male", "desc": "Deep, comforting"},
}

for voice_name, voice_info in voices.items():
    print(f"\n=== {voice_name} ({voice_info['desc']}) ===")
    for phrase in phrases:
        outfile = OUT / f"eleven_{voice_name}_{phrase['id']}.mp3"
        if outfile.exists():
            print(f"  Skip (exists): {outfile.name}")
            continue

        import urllib.request
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_info['id']}"
        payload = json.dumps({
            "text": phrase["text"],
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.4,
                "similarity_boost": 0.75,
                "style": 0.6,
                "use_speaker_boost": True
            }
        }).encode()

        req = urllib.request.Request(url, data=payload, method='POST')
        req.add_header('xi-api-key', ELEVEN_KEY)
        req.add_header('Content-Type', 'application/json')
        req.add_header('Accept', 'audio/mpeg')

        try:
            with urllib.request.urlopen(req) as resp:
                with open(outfile, 'wb') as f:
                    f.write(resp.read())
            print(f"  OK: {outfile.name}")
        except Exception as e:
            print(f"  ERROR: {phrase['id']} - {e}")

print(f"\nArchivos en: {OUT}")
print("Escuchá las 4 voces y elegí la que más te guste.")
