from typing import Dict


EMOTION_PREFIX = {
    "joy": "I love your energy.",
    "sad": "I am here with you. You are safe.",
    "anger": "Let us slow down together.",
}

MODE_STRUCTURE = {
    "autism": "Step 1: breathe in. Step 2: tell me one word for your feeling. Step 3: we choose a small action.",
    "adhd": "Quick mission: 1 deep breath, 1 short answer, 1 tiny action. Ready?",
    "visual": "I will describe clearly with sound-friendly cues and simple directions.",
    "hearing": "I will keep text clear and direct, with visual-friendly phrasing.",
}


def generate_chat_reply(message: str, emotion: str, mode: str) -> Dict[str, str]:
    normalized = (message or "").strip()
    emotion = (emotion or "joy").lower()
    mode = (mode or "Autism").lower()

    emotion_prefix = EMOTION_PREFIX.get(emotion, "I am listening.")
    structure = MODE_STRUCTURE.get(mode, "We will keep it simple and kind.")

    if not normalized:
        reply = f"{emotion_prefix} {structure}"
    else:
        reply = f"{emotion_prefix} You said: '{normalized}'. {structure}"

    return {
        "reply": reply,
        "voice_response_recommended": str(mode == "visual").lower(),
        "emotion_used": emotion,
        "mode_used": mode,
    }
