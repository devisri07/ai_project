from typing import Dict
import os
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

try:
    from google import genai
except Exception:  # pragma: no cover
    genai = None

EMOTION_PREFIX = {
    "joy": "You are doing great.",
    "sad": "It is okay. I am here with you.",
}

MODE_STRUCTURE = {
    "autism": "I will keep the steps clear and predictable.",
    "adhd": "I will keep the answer short and focused.",
    "visual": "I will describe things clearly.",
    "hearing": "I will keep the text direct and easy to follow.",
}

WEBSITE_CONTEXT = """
BrightBridge website features:
- webcam-based joy and sad emotion detection
- age-based adaptive storytelling
- YouTube story playback inside the website
- a 3-question story quiz after video completion
- recommendations page for more videos
- student dashboard and parent dashboard
- chatbot support inside the website
"""

THEME_HELP = {
    "autism": "Autism mode keeps the flow calm and predictable.",
    "adhd": "ADHD mode keeps things short and active.",
    "visual": "Visual mode gives clearer spoken help.",
    "hearing": "Hearing mode focuses on captions and visual cues.",
}


def _gemini_reply(message: str, emotion: str, mode: str) -> str | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None:
        return None

    prompt = (
        f"{WEBSITE_CONTEXT}\n\n"
        "You are the chatbot inside the BrightBridge website. "
        "Answer the user's exact question directly. "
        "If the question is about the website, answer using the website context above. "
        "If the question is general, answer normally. "
        "Do not invent facts. "
        "If you are unsure, say you are unsure. "
        "Use simple, helpful language. "
        f"Emotion context: {emotion}. Mode context: {mode}. "
        "Only mention the emotion or mode if it is actually helpful.\n\n"
        f"User question: {message}"
    )

    def _call_model() -> str | None:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                "temperature": 0.2,
                "max_output_tokens": 180,
            },
        )
        text = getattr(response, "text", None)
        return text.strip() if text else None

    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_call_model)
            return future.result(timeout=8)
    except FuturesTimeoutError:
        return None
    except Exception:
        return None


def _local_chat_reply(message: str, emotion: str, mode: str) -> str:
    normalized = (message or "").strip().lower()
    words = normalized.replace("?", " ").replace("!", " ").replace(".", " ").split()
    emotion_prefix = EMOTION_PREFIX.get(emotion, "I am listening.")
    structure = MODE_STRUCTURE.get(mode, "I will keep the answer simple and kind.")
    mode_help = THEME_HELP.get(mode, "")

    asked_mode = mode
    for candidate in ["autism", "adhd", "visual", "hearing"]:
        if candidate in normalized:
            asked_mode = candidate
            break
    asked_mode_help = THEME_HELP.get(asked_mode, mode_help)

    if not normalized:
        return f"{emotion_prefix} {structure}"

    if any(word in words for word in ["hi", "hello", "hey"]):
        return "Hello, friend. How can I help today?"

    if any(word in normalized for word in ["thank", "thanks"]):
        return "You are welcome. You are doing well."

    if any(word in normalized for word in ["bye", "goodbye", "see you"]):
        return "Bye for now. Keep shining."

    if any(phrase in normalized for phrase in ["what can this website do", "about this website", "what is this website for"]):
        return (
            "BrightBridge can scan emotion, play a matching story, show video suggestions, and give a 3-question quiz."
        )

    if any(word in normalized for word in ["how to use", "how do i use", "how does this work", "what do i do first"]):
        return (
            "First choose age and theme. Next start the webcam scan. Then watch the story. After that, take the quiz."
        )

    if any(word in normalized for word in ["emotion detection", "detect emotion", "emotion scan"]) or (
        "emotion" in normalized and any(word in normalized for word in ["detect", "scan", "camera", "webcam"])
    ):
        return (
            "The webcam scan checks emotion, age group, and attention. Then the website picks a matching story."
        )

    if any(word in normalized for word in ["attention", "focus", "blink", "gaze"]):
        return "The website checks gaze and blink signals to estimate attention."

    if any(word in normalized for word in ["age", "age group", "age selection"]):
        return "Age groups are 1-10, 10-20, and 20-40. Age helps the website choose the right story."

    if any(word in normalized for word in ["theme", "mode", "autism", "adhd", "visual", "hearing"]):
        return f"{asked_mode_help} The theme changes how the story is shown."

    if any(word in normalized for word in ["joy", "sad", "emotion types", "which emotions"]):
        return "This project mainly works with joy and sad emotions."

    if any(word in normalized for word in ["webcam permission", "camera permission", "allow camera"]):
        return "Please allow camera access in the browser so the scan can start."

    if any(word in normalized for word in ["start scan", "begin scan", "scan page"]):
        return "Go to the scan page, allow the webcam, and wait for the short face scan."

    if any(word in normalized for word in ["after scan", "what happens after scan"]):
        return "After the scan, the website shows the result and picks a matching story video."

    if "quiz" in normalized:
        return "After the story ends, the website gives 3 quick questions about the video."

    if any(word in normalized for word in ["score", "mark", "result", "accuracy"]):
        return "The score shows how many quiz answers were correct."

    if any(word in normalized for word in ["correct answer", "wrong answer", "answer"]):
        return "Choose one answer for each quiz question. The website shows if it is correct."

    if "student dashboard" in normalized:
        return "The student dashboard shows stories, rewards, badges, and kind messages."

    if "parent dashboard" in normalized:
        return "The parent dashboard shows emotion history, attention, story progress, and quiz scores."

    if "dashboard" in normalized:
        return "There are two dashboards: student and parent."

    if any(word in normalized for word in ["recommend", "suggest", "suggestion", "recommended videos"]):
        return "The recommendations page shows videos based on age, emotion, and theme."

    if "story" in normalized or "video" in normalized:
        return "The website chooses a story video based on age, emotion, and theme."

    if any(word in normalized for word in ["youtube", "video player", "play video"]):
        return "Story videos play inside the website player."

    if any(word in normalized for word in ["caption", "subtitle", "subtitles"]):
        return "Captions help users read along during the story."

    if any(word in normalized for word in ["sound", "volume", "audio"]):
        return "The story page has sound controls like mute, low volume, and high volume."

    if any(word in normalized for word in ["parent", "teacher"]):
        return "Parents and teachers can use the dashboard to follow progress."

    if any(word in normalized for word in ["reward", "badge", "achievement"]):
        return "The student side can show rewards and badges after progress."

    if any(word in normalized for word in ["chatbot", "chat", "ask you"]):
        return "I am the BrightBridge chatbot. I can help and guide you."

    if (
        ("scan" in normalized or "camera" in normalized or "webcam" in normalized or "emotion" in normalized)
        and any(word in normalized for word in ["not working", "problem", "issue", "error", "fail"])
    ):
        return "If the scan is not working, allow camera access, keep your face visible, and make sure the backend is running."

    if any(word in normalized for word in ["video not playing", "story not playing", "youtube not working"]):
        return "If the video does not play, restart frontend and backend, then refresh the page."

    if any(word in normalized for word in ["chatbot not working", "chat not working"]):
        return "If chat is not working, restart the backend and refresh the page."

    if any(word in normalized for word in ["login", "sign in", "account", "authentication"]):
        return "This project is guest mode only. No login is needed."

    if any(word in normalized for word in ["save face", "store face", "privacy", "data"]):
        return "This project is guest mode. It should not store personal identity. The webcam is for live analysis only."

    if any(word in normalized for word in ["database", "db", "sqlite", "mysql"]):
        return "The project can store analytics in a database like SQLite or MySQL."

    if any(word in normalized for word in ["safe pause", "safety pause", "calm screen"]):
        return "Safety pause can stop the story and show a calm screen if needed."

    if any(word in normalized for word in ["frontend", "backend", "api"]):
        return "The frontend talks to the Flask backend through API calls."

    if "who are you" in normalized:
        return "I am the BrightBridge chatbot, your friendly helper."

    return (
        f"{emotion_prefix} {structure} "
        "I can help with scan, story, quiz, theme, dashboard, and website questions."
    )


def _should_use_local_first(message: str) -> bool:
    normalized = (message or "").strip().lower()
    words = normalized.replace("?", " ").replace("!", " ").replace(".", " ").split()
    website_keywords = [
        "website",
        "brightbridge",
        "scan",
        "emotion",
        "story",
        "video",
        "quiz",
        "dashboard",
        "camera",
        "webcam",
        "mode",
    ]
    greeting_keywords = ["hi", "hello", "hey"]
    has_website_keyword = any(keyword in normalized for keyword in website_keywords)
    has_greeting = any(word in words for word in greeting_keywords)
    return has_website_keyword or has_greeting


def generate_chat_reply(message: str, emotion: str, mode: str) -> Dict[str, str]:
    normalized = (message or "").strip()
    emotion = (emotion or "joy").lower()
    mode = (mode or "Autism").lower()

    if _should_use_local_first(normalized):
        return {
            "reply": _local_chat_reply(normalized, emotion, mode),
            "voice_response_recommended": str(mode == "visual").lower(),
            "emotion_used": emotion,
            "mode_used": mode,
            "source": "local_fallback",
        }

    gemini_text = _gemini_reply(normalized, emotion, mode)
    if gemini_text:
        return {
            "reply": gemini_text,
            "voice_response_recommended": str(mode == "visual").lower(),
            "emotion_used": emotion,
            "mode_used": mode,
            "source": "gemini",
        }

    return {
        "reply": _local_chat_reply(normalized, emotion, mode),
        "voice_response_recommended": str(mode == "visual").lower(),
        "emotion_used": emotion,
        "mode_used": mode,
        "source": "local_fallback",
    }
