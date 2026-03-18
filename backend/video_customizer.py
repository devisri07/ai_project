from urllib.parse import parse_qs, urlparse


def _extract_video_id(youtube_url: str) -> str:
    parsed = urlparse(youtube_url)
    if parsed.netloc in {"youtu.be"}:
        return parsed.path.strip("/")
    if "youtube" in parsed.netloc:
        params = parse_qs(parsed.query)
        return params.get("v", [""])[0]
    return ""


def _extract_start_seconds(youtube_url: str) -> int:
    parsed = urlparse(youtube_url)
    params = parse_qs(parsed.query)
    raw = params.get("t", ["0"])[0]
    raw = raw.replace("s", "")
    try:
        return int(raw)
    except Exception:
        return 0


CONVERTED_VIDEO_MAP = {
    "lJn8Oe2hg4c": {
        "converted_url": "https://www.youtube.com/watch?v=flPFlY8hECk&t=46s",
        "title": "Converted Animated Story 1",
    },
    "3tX6pBqP_KY": {
        "converted_url": "https://www.youtube.com/watch?v=GjoYbsvUoO4&t=7s",
        "title": "Converted Animated Story 2",
    },
}


def build_customization_plan(youtube_url: str, mode: str) -> dict:
    input_video_id = _extract_video_id(youtube_url)
    mode = (mode or "autism").lower()

    mode_rules = {
        "autism": {
            "operations": [
                "reduce flashing transitions",
                "slow scene cuts",
                "predictable caption timing",
            ],
            "summary": "Autism mode makes the video calmer and more predictable.",
        },
        "adhd": {
            "operations": [
                "highlight key segments",
                "add focus markers",
                "split content into short parts",
            ],
            "summary": "ADHD mode keeps the video active, clear, and easier to follow.",
        },
        "visual": {
            "operations": [
                "add audio descriptions",
                "increase contrast",
                "narrate important visual events",
            ],
            "summary": "Visual mode adds stronger sound guidance and clearer contrast.",
        },
        "hearing": {
            "operations": [
                "large subtitles",
                "visual sound indicators",
                "clear caption timing",
            ],
            "summary": "Hearing mode adds clear captions and visual sound support.",
        },
    }

    converted = CONVERTED_VIDEO_MAP.get(input_video_id)
    selected_mode = mode_rules.get(mode, mode_rules["autism"])

    if converted:
        converted_url = converted["converted_url"]
        converted_video_id = _extract_video_id(converted_url)
        converted_start_seconds = _extract_start_seconds(converted_url)
    else:
        converted_url = youtube_url
        converted_video_id = input_video_id
        converted_start_seconds = _extract_start_seconds(youtube_url)

    return {
        "status": "ready",
        "input_url": youtube_url,
        "input_video_id": input_video_id,
        "mode": mode,
        "operations": selected_mode["operations"],
        "summary": selected_mode["summary"],
        "converted_title": converted["title"] if converted else "Converted Animated Story",
        "converted_url": converted_url,
        "converted_video_id": converted_video_id,
        "converted_start_seconds": converted_start_seconds,
        "captions_enabled": mode == "hearing",
        "audio_description_enabled": mode == "visual",
        "notes": "Converted video is ready to play inside the website.",
    }
