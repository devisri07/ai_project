import os
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

AGE_TEXT_MAP = {
    '1-10': 'very young child (ages 1-10), use extremely simple words, short sentences, 2-4 sentences per scene',
    '10-30': 'older child/teen (ages 10-30), use intermediate vocabulary, 3-5 sentences per scene',
    '30-60': 'adult (ages 30-60), use mature vocabulary',
}

EMOTION_ALIAS = {
    "happy": "joy",
    "angry": "anger",
    "fear": "sad",
    "fearful": "sad",
}

TONE_MAP = {
    'happy': 'exciting, fun, adventurous, joyful',
    'joy': 'exciting, fun, adventurous, joyful',
    'sad': 'uplifting, comforting, hopeful, encouraging',
    'angry': 'calming, peaceful, soothing, reassuring',
    'anger': 'calming, peaceful, soothing, reassuring',
    'surprised': 'wonder-filled, delightful, amazing',
    'neutral': 'friendly, engaging, interesting',
}


def _build_prompt(emotion, age_group, disability, autism_mode=False, theme=None):
    """Build a prompt for simple story generation."""
    age_text = AGE_TEXT_MAP.get(age_group, 'child')

    emotion = (emotion or "joy").lower()
    canonical_emotion = EMOTION_ALIAS.get(emotion, emotion)
    
    tone = TONE_MAP.get(canonical_emotion, 'engaging')

    prompt = f"""Create a SHORT interactive animation-style story (approximately 5 minutes) for a {age_text}. The story should teach a simple lesson, such as good habits, avoiding bad habits, or another child-friendly moral.

EMOTIONAL TONE: {tone}
ANIMATION STYLE: simple, colorful, and engaging (this will become the video animation)
ACCESSIBILITY: include audio narration for visually impaired users, subtitles/onscreen text for hearing impaired, and occasional interactive prompts suitable for autistic children.
{ 'THEME: ' + theme if theme else '' }

Create exactly 3 scenes following this EXACT JSON format:
{{
  "title": "Short Story Title (2-3 words max)",
  "emotion_context": "{canonical_emotion}",
  "scenes": [
    {{
      "scene_number": 1,
      "duration": 25,
      "narration": "One sentence narration for the scene.",
      "visual": "A simple visual description.",
      "dialog": "Character says this.",
      "sounds": ["sound1", "sound2"],
      "question": "A simple yes/no or short answer question?"
    }},
    {{
      "scene_number": 2,
      "duration": 25,
      "narration": "What happens next in one sentence.",
      "visual": "Visual description.",
      "dialog": "Character dialog.",
      "sounds": ["sound1"],
      "question": "Another question?"
    }},
    {{
      "scene_number": 3,
      "duration": 25,
      "narration": "The happy ending in one sentence.",
      "visual": "Final visual scene.",
      "dialog": "Character says goodbye.",
      "sounds": ["happy_sound"],
      "question": "How do you feel?"
    }}
  ],
  "moral": "A one-sentence lesson.",
  "message": "Encouraging message for the child."
}}

Return ONLY valid JSON, no markdown, no explanation."""

    return prompt.strip()


def generate_story(
    emotion,
    age_group,
    disability='none',
    autism_mode=False,
    theme=None
):
    """Generate a simple story that works reliably."""
    import json
    
    api_key = os.getenv('GEMINI_API_KEY')

    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment.")

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        prompt = _build_prompt(emotion, age_group, disability, autism_mode, theme)

        logger.info(f"Calling Gemini for emotion={emotion}, age={age_group}")
        response = model.generate_content(prompt, temperature=0.7)

        if not response or not response.text:
            logger.warning("Empty Gemini response")
            return _get_fallback_storyboard(emotion, age_group)

        response_text = response.text.strip()
        response_text = _strip_markdown_fence(response_text)

        # Parse JSON
        data = json.loads(response_text)
        
        # Convert simple format to storyboard format
        storyboard = _convert_to_storyboard(data, age_group)
        logger.info("Story generated successfully")
        # a simple animation video URL (can be replaced with real generated video)
        video_url = os.getenv('STORY_VIDEO_URL', 'https://www.w3schools.com/html/mov_bbb.mp4')
        return { 'storyboard': storyboard, 'video_url': video_url }

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {str(e)}, response: {response_text[:200]}")
        return _get_fallback_storyboard(emotion, age_group)
    except Exception as e:
        logger.error(f"Gemini error: {str(e)}", exc_info=True)
        return _get_fallback_storyboard(emotion, age_group)


def _strip_markdown_fence(text: str) -> str:
    if not text.startswith('```'):
        return text
    parts = text.split('```')
    if len(parts) < 2:
        return text
    payload = parts[1]
    if payload.startswith('json'):
        payload = payload[4:]
    return payload.strip()


def _convert_to_storyboard(data, age_group):
    """Convert simple JSON response to full storyboard format."""
    scenes = []
    for scene_data in data.get('scenes', []):
        scene = {
            'scene_number': scene_data.get('scene_number', 1),
            'duration_seconds': scene_data.get('duration', 25),
            'narration': scene_data.get('narration', ''),
            'visual_description': scene_data.get('visual', ''),
            'character_dialogue': scene_data.get('dialog', ''),
            'sound_effects': scene_data.get('sounds', []),
            'background_color_mood': 'soft sky blue and white' if 'happy' in data.get('emotion_context', '').lower() else '#FFF8F0',
            'camera_movement': 'gentle pan',
            'character_animation': 'simple movement',
            'background_music_mood': 'appropriate to emotion',
            'interactive_question': scene_data.get('question', ''),
            'on_screen_text': f"Scene {scene_data.get('scene_number', 1)}"
        }
        scenes.append(scene)
    
    return {
        'title': data.get('title', 'A Story for You'),
        'target_age_group': age_group,
        'emotion_context': data.get('emotion_context', 'neutral'),
        'detected_emotion_adaptation': f"Story tailored for {data.get('emotion_context', 'neutral')} emotion",
        'story_duration_seconds': len(scenes) * 25,
        'vocabulary_level': 'simple',
        'complexity': 'low',
        'scene_count': len(scenes),
        'has_interactive_elements': True,
        'scenes': scenes,
        'moral_of_story': data.get('moral', 'Every story has a lesson'),
        'encouragement_message': data.get('message', 'You are amazing!')
    }


def _get_fallback_storyboard(emotion, age_group):
    """Return a fallback storyboard if API call fails."""
    # generate the same structure as normal response (storyboard + video_url)
    storyboard = {
        "title": "The Brave Little Star",
        "target_age_group": age_group,
        "emotion_context": emotion,
        "detected_emotion_adaptation": f"Story adapted for {emotion} emotion",
        "story_duration_seconds": 150,
        "vocabulary_level": "simple",
        "complexity": "low",
        "scene_count": 3,
        "has_interactive_elements": True,
        "scenes": [
            {
                "scene_number": 1,
                "duration_seconds": 25,
                "narration": "Once upon a time, a little star named Twinkle wanted to shine bright.",
                "visual_description": "A soft golden star glowing in a light blue sky with fluffy white clouds",
                "character_dialogue": "Twinkle: I can do this!",
                "sound_effects": ["gentle sparkle", "soft chime"],
                "background_color_mood": "soft sky blue and white",
                "camera_movement": "slow pan upward",
                "character_animation": "gentle glowing and pulsing",
                "background_music_mood": "calm, uplifting piano",
                "interactive_question": "What color is the sky?",
                "on_screen_text": "The Beginning"
            },
            {
                "scene_number": 2,
                "duration_seconds": 25,
                "narration": "Twinkle met a friendly cloud who wanted to help.",
                "visual_description": "A fluffy cloud with a smiling face floating beside Twinkle",
                "character_dialogue": "Cloud: Let's be friends!",
                "sound_effects": ["warm breeze", "cheerful chime"],
                "background_color_mood": "soft blue with warm highlights",
                "camera_movement": "side pan with gentle zoom",
                "character_animation": "cloud bouncing gently",
                "background_music_mood": "happy, encouraging strings",
                "interactive_question": "Can you smile like the cloud?",
                "on_screen_text": "Making Friends"
            },
            {
                "scene_number": 3,
                "duration_seconds": 25,
                "narration": "Together they lit up the night and made everyone happy.",
                "visual_description": "Twinkle and Cloud shining together, spreading light everywhere",
                "character_dialogue": "Both: We did it!",
                "sound_effects": ["triumphant chime", "soft applause"],
                "background_color_mood": "magical sky blue and gold",
                "camera_movement": "zoom out to show the whole sky",
                "character_animation": "both glowing brighter with joy",
                "background_music_mood": "triumphant, joyful music",
                "interactive_question": "How does the story make you feel?",
                "on_screen_text": "The End - You're Amazing!"
            }
        ],
        "moral_of_story": "You are special and your light matters to the world.",
        "encouragement_message": "You are brave, kind, and wonderful just the way you are!"
    }
    # attach placeholder video url for fallback as well
    video_url = os.getenv('STORY_VIDEO_URL', 'https://www.w3schools.com/html/mov_bbb.mp4')
    return {'storyboard': storyboard, 'video_url': video_url}
