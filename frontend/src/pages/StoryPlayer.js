import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

// Story player component renders the appropriate media depending on the
// disability/accessibility flags. It can also read the analysis result passed
// via navigation state. In a full application the story would be fetched from
// the backend using analysis parameters.
const StoryPlayer = ({ story = {}, disability = 'none' }) => {
    const location = useLocation();
    const analysis = location.state?.analysis;
    if (analysis) {
        console.log('analysis received in story player', analysis);
        // you could use analysis to fetch the actual story via API
    }
  const { videoUrl, audioUrl, subtitles = [], autismMode } = story;
  const [storyText, setStoryText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePersonalizedStory = async () => {
    if (!analysis) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        emotion: analysis.emotion,
        age_group: analysis.age_group,
        disability: disability,
        autism_mode: autismMode || false,
      };
      const res = await api.post('/generate_story', payload);
      setStoryText(res.data.story_text);
    } catch (err) {
      setError(err.response?.data || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Story Player</h1>
      {analysis && (
        <div>
          <p>Detected emotion: {analysis.emotion}</p>
          <p>Age group: {analysis.age_group}</p>
          <p>Attention: {analysis.attention}</p>
        </div>
      )}
      {disability === 'visual' && audioUrl && (
        <audio controls src={audioUrl} />
      )}
      {(disability === 'hearing' || disability === 'none') && videoUrl && (
        <video controls width="640" height="360">
          <source src={videoUrl} type="video/mp4" />
          {subtitles.length > 0 && (
            <track
              label="English"
              kind="subtitles"
              srcLang="en"
              src={subtitles}
              default
            />
          )}
        </video>
      )}
      {autismMode && <p>Autism-friendly mode: calm narration and reduced animation</p>}
      <div style={{ marginTop: 20 }}>
        <button onClick={generatePersonalizedStory} disabled={!analysis || loading}>
          {loading ? 'Generating...' : 'Generate Personalized Story'}
        </button>
        {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
        {storyText && (
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
            <h3>Generated Story</h3>
            <p>{storyText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryPlayer;
