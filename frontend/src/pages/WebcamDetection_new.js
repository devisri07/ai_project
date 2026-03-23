import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './WebcamDetection.css';

const WebcamDetection = () => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const navigate = useNavigate();

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
        console.error('Error accessing webcam:', err);
      }
    }
    initCamera();
  }, []);

  const captureFrame = async () => {
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
      console.log('analysis result', res.data);
      navigate('/story', { state: { analysis: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="webcam-container">
      <div className="webcam-content">
        <h1>📷 Emotion Detection</h1>
        <p>Let's understand your emotions through a photo!</p>

        <div className="video-wrapper">
          {!cameraActive && <div className="camera-loading">Initializing camera...</div>}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-feed"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="button-group">
          <button
            onClick={captureFrame}
            disabled={!cameraActive || loading}
            className="btn-capture"
          >
            {loading ? '⏳ Analyzing...' : '📸 Capture & Analyze'}
          </button>
        </div>

        <div className="info-card">
          <h3>ℹ️ How it works:</h3>
          <ul>
            <li>Click the button to capture your face</li>
            <li>The system detects your emotion</li>
            <li>A personalized story is generated for you</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebcamDetection;
