from typing import Dict
import os
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

try:
    from google import genai
except Exception:  # pragma: no cover
    genai = None


CRAFT_TEMPLATES = {
    "paper flower": {
        "title": "Paper Flower",
        "materials": ["colored paper", "scissors", "glue"],
        "steps": [
            "Take one paper sheet.",
            "Cut simple petal shapes.",
            "Glue the petals in a circle.",
            "Add a small paper center.",
        ],
        "encouragement": "Nice job. Your flower can be bright and beautiful.",
    },
    "paper boat": {
        "title": "Paper Boat",
        "materials": ["one paper sheet"],
        "steps": [
            "Fold the paper in half.",
            "Fold the top corners down.",
            "Lift the bottom flaps up.",
            "Open the shape and pull gently into a boat.",
        ],
        "encouragement": "Well done. Your little boat is ready.",
    },
    "pencil holder": {
        "title": "Pencil Holder",
        "materials": ["paper cup", "colors", "stickers"],
        "steps": [
            "Take a paper cup.",
            "Color the outside.",
            "Add stickers or shapes.",
            "Let it dry and place pencils inside.",
        ],
        "encouragement": "Great work. You made something useful.",
    },
}


def _detect_activity(prompt: str) -> str:
    normalized = (prompt or "").lower()
    for key in CRAFT_TEMPLATES:
        if key in normalized:
            return key
    if "flower" in normalized:
        return "paper flower"
    if "boat" in normalized:
        return "paper boat"
    if "holder" in normalized or "pencil" in normalized:
        return "pencil holder"
    return "paper flower"


def _build_local_reply(prompt: str, mode: str) -> Dict[str, object]:
    activity = _detect_activity(prompt)
    template = CRAFT_TEMPLATES[activity]
    voice_hint = (
        "I will say the steps slowly and clearly."
        if mode == "visual"
        else "I will keep the steps simple and easy."
    )
    return {
        "title": template["title"],
        "materials": template["materials"],
        "steps": template["steps"],
        "encouragement": template["encouragement"],
        "voice_text": f"{template['title']}. {voice_hint} " + " ".join(template["steps"]),
        "source": "local_fallback",
    }


def _gemini_reply(prompt: str, mode: str) -> Dict[str, object] | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None:
        return None

    system_prompt = (
        "You are Smart Friend inside BrightBridge. "
        "Give child-friendly craft guidance. "
        "Return only JSON with keys: title, materials, steps, encouragement, voice_text. "
        "Use short simple steps. "
        f"Support mode: {mode}. "
        "For visual impairment, make voice_text extra descriptive. "
        "Do not mention webcam detection."
    )

    def _call_model() -> Dict[str, object] | None:
        import json

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"{system_prompt}\n\nUser prompt: {prompt}",
            config={"temperature": 0.2, "max_output_tokens": 300},
        )
        text = getattr(response, "text", None)
        if not text:
            return None
        data = json.loads(text.strip().replace("```json", "").replace("```", "").strip())
        data["source"] = "gemini"
        return data

    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_call_model)
            return future.result(timeout=8)
    except FuturesTimeoutError:
        return None
    except Exception:
        return None


def generate_smart_friend_reply(prompt: str, mode: str) -> Dict[str, object]:
    normalized_mode = (mode or "autism").lower()
    gemini_result = _gemini_reply(prompt, normalized_mode)
    if gemini_result:
        return gemini_result
    return _build_local_reply(prompt, normalized_mode)
