STORIES = {
    'basic_happy': {
        'story_url': '/static/videos/basic_happy.mp4',
        'subtitles': '/static/subs/basic_happy.vtt',
    },
    'basic_sad': {
        'story_url': '/static/videos/basic_sad.mp4',
        'subtitles': '/static/subs/basic_sad.vtt',
    },
}


def choose_story(emotion, age_group, attention_score, disability, autism_mode=False):
    """Return a story record (e.g. URL and metadata) depending on inputs."""
    # Example dictionary; in a full system this can come from DB.
    key = f'basic_{emotion}' if age_group == '1-10' else 'basic_happy'
    selected = STORIES.get(key, STORIES['basic_happy'])
    # modify for disability modes
    if disability == 'visual':
        selected = {'audio_url': '/static/audio/' + key + '.mp3'}
    if autism_mode:
        selected['autismMode'] = True
    return selected
