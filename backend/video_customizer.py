from urllib.parse import parse_qs, urlparse


def _extract_video_id(youtube_url: str) -> str:
    parsed = urlparse(youtube_url)
    if parsed.netloc in {"youtu.be"}:
        return parsed.path.strip("/")
    if "youtube" in parsed.netloc:
        params = parse_qs(parsed.query)
        return params.get("v", [""])[0]
    return ""


def build_customization_plan(youtube_url: str, mode: str) -> dict:
    video_id = _extract_video_id(youtube_url)
    mode = (mode or "autism").lower()

    mode_rules = {
        "autism": [
            "reduce flashing transitions",
            "slow scene cuts by 20%",
            "predictable caption timing",
        ],
        "adhd": [
            "highlight key segments",
            "add focus markers every 20 seconds",
            "short chapter boundaries",
        ],
        "visual": [
            "generate audio descriptions for key scenes",
            "increase contrast overlays",
            "narrate text-only visuals",
        ],
        "hearing": [
            "large subtitles",
            "visual sound indicators",
            "speaker labels",
        ],
    }

    operations = mode_rules.get(mode, mode_rules["autism"])
    return {
        "status": "planned",
        "video_id": video_id,
        "input_url": youtube_url,
        "mode": mode,
        "operations": operations,
        "notes": "MoviePy pipeline can execute this plan asynchronously in a worker.",
    }
