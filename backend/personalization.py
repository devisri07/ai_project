"""Personalization scoring system for adaptive storytelling."""
import logging

logger = logging.getLogger(__name__)

EMOTION_WEIGHT = 0.4
ATTENTION_WEIGHT = 0.3
AGE_WEIGHT = 0.3

EMOTION_TONE_MAP = {
    'joy': ['exciting', 'adventurous', 'joyful', 'fun'],
    'sad': ['uplifting', 'comforting', 'encouraging', 'hopeful', 'safe'],
    'anger': ['calming', 'soothing', 'peaceful', 'reassuring'],
}

AGE_RANGE_RULES = {
    '1-10': {'min_vocab': 'simple', 'max_complexity': 'low'},
    '10-30': {'min_vocab': 'intermediate', 'max_complexity': 'medium'},
    '30-60': {'min_vocab': 'advanced', 'max_complexity': 'high'},
}


def calculate_personalization_score(age_group, emotion, attention_score, story_metadata):
    """
    Calculate personalization score (0-100) based on child profile alignment.
    
    Args:
        age_group: str (e.g., "1-10", "10-30", "30-60")
        emotion: str (e.g., "joy", "sad", "anger")
        attention_score: int (0-10)
        story_metadata: dict with story characteristics
        
    Returns:
        dict with individual scores, final score, explanation, and suggestions
    """
    
    # 1. Emotion Alignment (40%) - how well story matches detected emotion
    emotion_score = _score_emotion_alignment(emotion, story_metadata.get('emotion_context'))
    
    # 2. Attention Suitability (30%) - how well story suits attention level
    attention_score_calc = _score_attention_suitability(attention_score, story_metadata.get('scene_count'), story_metadata.get('has_interactive_elements'))
    
    # 3. Age Appropriateness (30%) - vocabulary and complexity match
    age_score = _score_age_appropriateness(age_group, story_metadata.get('vocabulary_level'), story_metadata.get('complexity'))
    
    # Calculate weighted final score
    final_score = (
        (emotion_score * EMOTION_WEIGHT)
        + (attention_score_calc * ATTENTION_WEIGHT)
        + (age_score * AGE_WEIGHT)
    )
    final_score = round(final_score, 1)
    
    explanation = _generate_explanation(
        age_group, emotion, attention_score, emotion_score, attention_score_calc, age_score
    )
    
    suggestion = _generate_improvement_suggestion(
        emotion, attention_score, age_group, story_metadata
    )
    
    return {
        'emotion_alignment_score': emotion_score,
        'attention_suitability_score': attention_score_calc,
        'age_appropriateness_score': age_score,
        'final_score': final_score,
        'final_score_out_of_10': round((final_score / 100) * 10, 1),
        'explanation': explanation,
        'improvement_suggestion': suggestion
    }


def _score_emotion_alignment(detected_emotion, story_emotion_context):
    """Score how well story aligns with detected emotion (0-100)."""
    if not detected_emotion or not story_emotion_context:
        return 75  # default
    
    detected_emotion = detected_emotion.lower()
    story_context = story_emotion_context.lower()
    
    expected_tones = EMOTION_TONE_MAP.get(detected_emotion, [])
    
    # Check if story contains any expected tones
    matches = sum(1 for tone in expected_tones if tone in story_context)
    
    if matches > 0:
        return min(100, 80 + (matches * 5))
    
    # Penalize mismatch slightly, but not heavily
    return 70


def _score_attention_suitability(attention_score, scene_count, has_interactive_elements):
    """Score how well story suits attention level (0-100)."""
    base_score = 70
    
    # Low attention (0-4) needs:
    # - Short scenes (3-4 max)
    # - Interactive elements
    if attention_score < 5:
        if scene_count and scene_count <= 4:
            base_score += 15
        if has_interactive_elements:
            base_score += 15
    
    # Medium attention (5-7) works with moderate length
    elif attention_score < 8:
        if scene_count and 3 <= scene_count <= 5:
            base_score += 15
        if has_interactive_elements:
            base_score += 10
    
    # High attention (8-10) can handle longer stories
    else:
        if scene_count and scene_count >= 4:
            base_score += 15
        if has_interactive_elements:
            base_score += 10
    
    return min(100, base_score)


def _score_age_appropriateness(age_group, vocabulary_level, complexity):
    """Score vocabulary and complexity match for age (0-100)."""
    expected = AGE_RANGE_RULES.get(age_group, AGE_RANGE_RULES['1-10'])
    
    vocab_match = (vocabulary_level or 'simple').lower() == expected['min_vocab'].lower()
    complexity_match = (complexity or 'low').lower() == expected['max_complexity'].lower()
    
    score = 70
    if vocab_match:
        score += 15
    if complexity_match:
        score += 15
    
    return min(100, score)


def _generate_explanation(age_group, emotion, attention_score, emotion_score, 
                         attention_score_calc, age_score):
    """Generate human-readable explanation of personalization."""
    parts = []
    
    parts.append(f"The story is well-tailored for a {age_group}-year-old child who is feeling {emotion}.")
    
    if emotion_score >= 85:
        parts.append(f"Emotion alignment is excellent (score: {emotion_score}).")
    elif emotion_score >= 75:
        parts.append(f"Emotion alignment is good (score: {emotion_score}).")
    else:
        parts.append(f"Emotion alignment could improve (score: {emotion_score}).")
    
    if attention_score < 5:
        if attention_score_calc >= 85:
            parts.append(f"The short scenes and interactive elements are perfect for maintaining attention ({attention_score_calc}).")
        else:
            parts.append(f"The story provides some engagement tools for low attention levels ({attention_score_calc}).")
    elif attention_score >= 8:
        parts.append(f"The story depth suits a child with strong focus ({attention_score_calc}).")
    
    if age_score >= 85:
        parts.append(f"Vocabulary and complexity match the age group perfectly ({age_score}).")
    else:
        parts.append(f"Age appropriateness is good ({age_score}).")
    
    return " ".join(parts)


def _generate_improvement_suggestion(emotion, attention_score, age_group, story_metadata):
    """Suggest one specific improvement for future personalization."""
    if attention_score < 5:
        return "For next time: Add more sound effect cues or a counting game to boost engagement with very low attention."
    
    if emotion == 'sad':
        return "For next time: Include a reassuring character who directly addresses the child's fears by name."
    
    if age_group == '1-10':
        return "For next time: Add simple rhymes or a catchy song to increase memorability for young children."
    
    return "For next time: Increase the moral lesson's depth and ask the child to apply it to their own life."
