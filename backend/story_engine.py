from dataclasses import dataclass
from typing import Dict, List


@dataclass
class StoryScene:
    id: int
    title: str
    narration: str
    subtitle: str
    seconds: int


AGE_STYLE = {
    "1-10": {
        "tone": "simple and warm",
        "ending": "clear moral ending",
        "prompt": "short words, gentle repetition",
    },
    "10-20": {
        "tone": "growth oriented",
        "ending": "problem solving reflection",
        "prompt": "character growth with challenge",
    },
}

THEME_RULES = {
    "Autism": "predictable transitions and clear sequence markers",
    "ADHD": "interactive cues every scene and focus reset prompts",
    "Visual": "rich auditory scene description and spatial narration",
    "Hearing": "subtitle-forward phrasing and visual action words",
}

BASE_MORAL = {
    "joy": "Share joy and include others.",
    "sad": "Courage grows when we ask for support.",
    "anger": "Pause, breathe, then choose kindness.",
}

SCENE_TEMPLATES = [
    "A calm beginning where the hero notices their feeling and names it.",
    "A challenge appears and the guide offers a safe strategy.",
    "The hero practices the strategy with support.",
    "A second challenge tests attention and emotional balance.",
    "A gentle success closes the story with a practical takeaway.",
]


def _age_style(age_group: str) -> Dict[str, str]:
    return AGE_STYLE.get(
        age_group,
        {
            "tone": "reflective and grounded",
            "ending": "insightful ending",
            "prompt": "nuanced emotions and reflection",
        },
    )


def _theme_rules(theme: str) -> Dict[str, str]:
    return {"adaptation": THEME_RULES.get(theme, "balanced inclusive storytelling")}


def generate_adaptive_story(emotion: str, age_group: str, theme: str) -> Dict:
    style = _age_style(age_group)
    theme_rule = _theme_rules(theme)
    emotion = (emotion or "joy").lower()

    story_title = f"The Mirror Path of {emotion.title()}"
    base_moral = BASE_MORAL.get(emotion, "Every feeling can guide learning.")

    scenes: List[StoryScene] = []
    for idx, template in enumerate(SCENE_TEMPLATES, start=1):
        narration = (
            f"Scene {idx}. {template} "
            f"Tone: {style['tone']}. Theme adaptation: {theme_rule['adaptation']}. "
            f"Language hint: {style['prompt']}."
        )
        scenes.append(
            StoryScene(
                id=idx,
                title=f"Scene {idx}",
                narration=narration,
                subtitle=narration,
                seconds=60,
            )
        )

    return {
        "title": story_title,
        "duration_minutes": 5,
        "target_age_group": age_group,
        "emotion_context": emotion,
        "theme": theme,
        "adaptation_notes": theme_rule["adaptation"],
        "ending_style": style["ending"],
        "moral": base_moral,
        "scenes": [scene.__dict__ for scene in scenes],
    }
