import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        setError('Unable to access webcam. Please check permissions.');
        console.error(err);
      }
    }
    initCamera();
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setLoading(true);
    setError('');

    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const res = await api.post('/analyze', { image: dataUrl });
      setAnalysis(res.data);

      // immediately generate story
      const payload = {
        emotion: res.data.emotion,
        age_group: res.data.age_group,
        disability: res.data.disability || 'none',
        autism_mode: false,
      };
      const storyRes = await api.post('/generate_story', payload);
      setStoryText(storyRes.data.story_text);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {error && <div className="error" role="alert">❌ {error}</div>}
      <div className="dashboard-content">
        <div className="camera-section">
          <div className="video-wrapper">
            {!cameraActive && <div className="camera-loading">Initializing camera...</div>}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-feed"
              aria-label="Webcam stream"
            />
          </div>
          <button
            onClick={captureAndAnalyze}
            disabled={!cameraActive || loading}
            className="btn-capture"
            aria-label="Capture and analyze emotion"
          >
            {loading ? '⏳ Please wait...' : '📸 Capture & Analyze'}
          </button>
        </div>
        <div className="story-section">
          <h2>Your Personalized Story</h2>
          {storyText ? (
            <div className="story-display" tabIndex="0">{storyText}</div>
          ) : (
            <p>No story generated yet. Capture an image to start.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
