from typing import Dict, List


CATALOG = [
    {"id": "vid-001", "title": "Calm Forest Journey", "emotion_fit": ["sad", "anger"], "theme": "Autism"},
    {"id": "vid-002", "title": "Focus Quest Challenge", "emotion_fit": ["joy"], "theme": "ADHD"},
    {"id": "vid-003", "title": "Sound Map Adventure", "emotion_fit": ["sad"], "theme": "Visual"},
    {"id": "vid-004", "title": "Caption Hero Story", "emotion_fit": ["joy"], "theme": "Hearing"},
    {"id": "vid-005", "title": "Breathing Star Mission", "emotion_fit": ["anger", "sad"], "theme": "Autism"},
]


def _score_item(item: Dict, emotion: str, age_group: str, theme: str) -> int:
    score = 0
    if emotion in item["emotion_fit"]:
        score += 2
    if item["theme"] == theme:
        score += 2
    if age_group == "1-10":
        score += 1
    return score


def build_recommendations(emotion: str, age_group: str, theme: str) -> List[Dict]:
    emotion = (emotion or "joy").lower()
    theme = theme or "Autism"
    age_group = age_group or "1-10"

    results = []
    for row in CATALOG:
        score = _score_item(row, emotion, age_group, theme)
        results.append(
            {
                "id": row["id"],
                "title": row["title"],
                "thumbnail": f"https://picsum.photos/seed/{row['id']}/400/225",
                "emotion_suitability_badge": emotion,
                "theme_badge": row["theme"],
                "match_score": score,
            }
        )
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
