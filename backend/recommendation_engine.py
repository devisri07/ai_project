from typing import Dict, List


def _yt_thumb(url: str) -> str:
    video_id = url.split("v=")[-1].split("&")[0]
    return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"


CATALOG = [
    {"id": "1", "title": "Joy Story 1", "url": "https://www.youtube.com/watch?v=4BgWg2EAmww", "emotion": "joy", "age_group": "1-10", "theme": "Autism"},
    {"id": "2", "title": "Joy Story 2", "url": "https://www.youtube.com/watch?v=0GQ1T1l3CvI", "emotion": "joy", "age_group": "1-10", "theme": "Autism"},
    {"id": "3", "title": "Joy Story 3", "url": "https://www.youtube.com/watch?v=xbyEP0M9w7k", "emotion": "joy", "age_group": "1-10", "theme": "Autism"},
    {"id": "4", "title": "Joy Story 4", "url": "https://www.youtube.com/watch?v=HFMtfBbJxjI", "emotion": "joy", "age_group": "1-10", "theme": "Autism"},
    {"id": "5", "title": "Joy Story 5", "url": "https://www.youtube.com/watch?v=difvQyWFmxw", "emotion": "joy", "age_group": "1-10", "theme": "Autism"},
    {"id": "6", "title": "Joy Story 6", "url": "https://www.youtube.com/watch?v=Nczp6WNR7I4", "emotion": "joy", "age_group": "1-10", "theme": "Autism"},
    {"id": "7", "title": "Joy Story 7", "url": "https://www.youtube.com/watch?v=NNQWZf1FQyE", "emotion": "joy", "age_group": "1-10", "theme": "Autism"},
    {"id": "8", "title": "Sad Story 1", "url": "https://www.youtube.com/watch?v=pFDNl874GWk", "emotion": "sad", "age_group": "1-10", "theme": "Autism"},
    {"id": "9", "title": "Sad Story 2", "url": "https://www.youtube.com/watch?v=UbvfRCcuZLA", "emotion": "sad", "age_group": "1-10", "theme": "Autism"},
    {"id": "10", "title": "Sad Story 3", "url": "https://www.youtube.com/watch?v=FaoevMkMu1M", "emotion": "sad", "age_group": "1-10", "theme": "Autism"},
    {"id": "11", "title": "Sad Story 4", "url": "https://www.youtube.com/watch?v=6J6UpxMxG_8", "emotion": "sad", "age_group": "1-10", "theme": "Autism"},
    {"id": "12", "title": "Sad Story 5", "url": "https://www.youtube.com/watch?v=noUFuAc4K-A", "emotion": "sad", "age_group": "1-10", "theme": "Autism"},
    {"id": "13", "title": "Joy Story 8", "url": "https://www.youtube.com/watch?v=-belHnGgk9E", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "14", "title": "Joy Story 9", "url": "https://www.youtube.com/watch?v=J3aJgtzvsuA", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "15", "title": "Joy Story 10", "url": "https://www.youtube.com/watch?v=RmhH2uVvxmM", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "16", "title": "Joy Story 11", "url": "https://www.youtube.com/watch?v=GjoYbsvUoO4", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "17", "title": "Joy Story 12", "url": "https://www.youtube.com/watch?v=0dwkGhRPQW4", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "18", "title": "Joy Story 13", "url": "https://www.youtube.com/watch?v=H9YMgx5T9Sk", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "19", "title": "Joy Story 14", "url": "https://www.youtube.com/watch?v=-GEVcgGxgQo", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "20", "title": "Joy Story 15", "url": "https://www.youtube.com/watch?v=b4jxNGl5-p0", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "21", "title": "Joy Story 16", "url": "https://www.youtube.com/watch?v=ysu1JimXY0w", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "22", "title": "Joy Story 17", "url": "https://www.youtube.com/watch?v=UPAkeZBxb0I", "emotion": "joy", "age_group": "10-20", "theme": "ADHD"},
    {"id": "23", "title": "Sad Story 6", "url": "https://www.youtube.com/watch?v=_mtQ9AEFn9Q", "emotion": "sad", "age_group": "10-20", "theme": "ADHD"},
    {"id": "24", "title": "Sad Story 7", "url": "https://www.youtube.com/watch?v=W5IjfYQqDbQ", "emotion": "sad", "age_group": "10-20", "theme": "ADHD"},
    {"id": "25", "title": "Sad Story 8", "url": "https://www.youtube.com/watch?v=0nTjsPJP3VA", "emotion": "sad", "age_group": "10-20", "theme": "ADHD"},
    {"id": "26", "title": "Sad Story 9", "url": "https://www.youtube.com/watch?v=-JDFStMT3XY", "emotion": "sad", "age_group": "10-20", "theme": "ADHD"},
    {"id": "27", "title": "Sad Story 10", "url": "https://www.youtube.com/watch?v=72GP8TxRF0Y", "emotion": "sad", "age_group": "10-20", "theme": "ADHD"},
    {"id": "28", "title": "Joy Story 18", "url": "https://www.youtube.com/watch?v=UX5cgiaEGMQ", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "29", "title": "Joy Story 19", "url": "https://www.youtube.com/watch?v=RmhH2uVvxmM", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "30", "title": "Joy Story 20", "url": "https://www.youtube.com/watch?v=flPFlY8hECk", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "31", "title": "Joy Story 21", "url": "https://www.youtube.com/watch?v=3g0W9OVJSsE", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "32", "title": "Joy Story 22", "url": "https://www.youtube.com/watch?v=UOraxP2BPok", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "33", "title": "Joy Story 23", "url": "https://www.youtube.com/watch?v=yR354C_Qw8Q", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "34", "title": "Joy Story 24", "url": "https://www.youtube.com/watch?v=I6i8cLXPGQE", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "35", "title": "Joy Story 25", "url": "https://www.youtube.com/watch?v=9W7KH6LOKkw", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "36", "title": "Joy Story 26", "url": "https://www.youtube.com/watch?v=uAwTWAC0vt0", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "37", "title": "Joy Story 27", "url": "https://www.youtube.com/watch?v=0iRbD5rM5qc", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "38", "title": "Joy Story 28", "url": "https://www.youtube.com/watch?v=JcXKbUIebrU", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "39", "title": "Joy Story 29", "url": "https://www.youtube.com/watch?v=g1J4181W8ss", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "40", "title": "Joy Story 30", "url": "https://www.youtube.com/watch?v=_j4Lj-BT00g", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "41", "title": "Joy Story 31", "url": "https://www.youtube.com/watch?v=bdUqQidffPE", "emotion": "joy", "age_group": "20-40", "theme": "Visual"},
    {"id": "42", "title": "Sad Story 11", "url": "https://www.youtube.com/watch?v=bmyb_3Ydm2Q", "emotion": "sad", "age_group": "20-40", "theme": "Visual"},
    {"id": "43", "title": "Sad Story 12", "url": "https://www.youtube.com/watch?v=B0p5SdkBydU", "emotion": "sad", "age_group": "20-40", "theme": "Visual"},
    {"id": "44", "title": "Sad Story 13", "url": "https://www.youtube.com/watch?v=sVUiCblDvNA", "emotion": "sad", "age_group": "20-40", "theme": "Visual"},
    {"id": "45", "title": "Sad Story 14", "url": "https://www.youtube.com/watch?v=wo1cyvMNpLg", "emotion": "sad", "age_group": "20-40", "theme": "Visual"},
    {"id": "46", "title": "Sad Story 15", "url": "https://www.youtube.com/watch?v=Hgk_f9YRmK4", "emotion": "sad", "age_group": "20-40", "theme": "Visual"},
    {"id": "47", "title": "Captioned Story 1", "url": "https://www.youtube.com/watch?v=0dxEAAwEQcA", "emotion": "joy", "age_group": "all", "theme": "Hearing"},
    {"id": "48", "title": "Captioned Story 2", "url": "https://www.youtube.com/watch?v=88QcfP6zRIE", "emotion": "joy", "age_group": "all", "theme": "Hearing"},
    {"id": "49", "title": "Captioned Story 3", "url": "https://www.youtube.com/watch?v=ysu1JimXY0w", "emotion": "joy", "age_group": "all", "theme": "Hearing"},
    {"id": "50", "title": "Captioned Story 4", "url": "https://www.youtube.com/watch?v=CxgZh1CYUzU", "emotion": "joy", "age_group": "all", "theme": "Hearing"},
]


def _score_item(item: Dict, emotion: str, age_group: str, theme: str) -> int:
    score = 0
    if emotion == item["emotion"]:
        score += 2
    if theme == item["theme"]:
        score += 2
    if age_group == item["age_group"]:
        score += 1
    if item["age_group"] == "all":
        score += 1
    return score


def build_recommendations(emotion: str, age_group: str, theme: str) -> List[Dict]:
    emotion = (emotion or "joy").lower()
    theme = theme or "Autism"
    age_group = age_group or "1-10"

    if theme.lower() == "hearing":
        filtered = [row for row in CATALOG if row["theme"] == "Hearing"]
    else:
        filtered = [
            row
            for row in CATALOG
            if row["emotion"] == emotion and (row["age_group"] == age_group or row["age_group"] == "all")
        ]

    results = []
    for row in filtered:
        score = _score_item(row, emotion, age_group, theme)
        results.append(
            {
                "id": row["id"],
                "title": row["title"],
                "thumbnail": _yt_thumb(row["url"]),
                "emotion_suitability_badge": emotion,
                "theme_badge": row["theme"],
                "match_score": score,
                "url": row["url"],
                "age_group": row["age_group"],
                "emotion": row["emotion"],
                "caption": f"{row['emotion'].title()} story for age {row['age_group']}.",
            }
        )
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
