"""Generate voiceover tracks for reel 'primera vez' using edge-tts."""
import asyncio
import edge_tts
from pathlib import Path

OUT = Path("C:/Users/josea/enba-redes/campaigns/reels/reel-primera-vez/voiceover")
OUT.mkdir(exist_ok=True)

# Frases del voiceover alineadas con las tomas del reel
# Cada frase tiene: texto, toma donde va, y estilo de delivery
phrases = [
    {
        "id": "01_hook",
        "text": "Nunca había subido a un velero.",
        "toma": 1,
        "style": "reflective",
        "rate": "-10%",
        "pitch": "-5Hz"
    },
    {
        "id": "02_contexto",
        "text": "Un sábado cualquiera, Costanera Norte.",
        "toma": 2,
        "style": "casual",
        "rate": "-5%",
        "pitch": "+0Hz"
    },
    {
        "id": "03_motor",
        "text": "Cuando se apaga el motor... cambia todo.",
        "toma": 4,
        "style": "whisper-like",
        "rate": "-20%",
        "pitch": "-8Hz"
    },
    {
        "id": "04_sensacion",
        "text": "No sabía que iba a ser así.",
        "toma": 6,
        "style": "emotional",
        "rate": "-15%",
        "pitch": "+0Hz"
    },
    {
        "id": "05_cierre",
        "text": "Por qué no vine antes.",
        "toma": 8,
        "style": "reflective",
        "rate": "-15%",
        "pitch": "-3Hz"
    },
]

VOICES = {
    "elena": "es-AR-ElenaNeural",
    "tomas": "es-AR-TomasNeural",
}

async def generate_phrase(voice_name, voice_id, phrase):
    filename = f"{voice_name}_{phrase['id']}.mp3"
    filepath = OUT / filename

    communicate = edge_tts.Communicate(
        phrase["text"],
        voice_id,
        rate=phrase.get("rate", "+0%"),
        pitch=phrase.get("pitch", "+0Hz"),
    )
    await communicate.save(str(filepath))
    print(f"  {filename}")

async def generate_full_track(voice_name, voice_id):
    """Generate a single combined track with all phrases separated by silence."""
    # Generate individual phrases first
    for phrase in phrases:
        await generate_phrase(voice_name, voice_id, phrase)

async def main():
    for voice_name, voice_id in VOICES.items():
        print(f"\nGenerando voiceover - {voice_name} ({voice_id}):")
        await generate_full_track(voice_name, voice_id)

    print(f"\nArchivos en: {OUT}")
    print("\nFrases generadas:")
    for p in phrases:
        print(f"  Toma {p['toma']}: \"{p['text']}\" (rate: {p['rate']}, pitch: {p['pitch']})")

asyncio.run(main())
