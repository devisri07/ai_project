import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Page for capturing webcam feed and sending frames to backend for emotion/age/attention detection.
const WebcamDetection = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    }
    initCamera();
  }, []);

  const navigate = useNavigate();
  const captureFrame = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    api.post('/analyze', { image: dataUrl })
      .then(res => {
        console.log('analysis result', res.data);
        // move to story component, passing along analysis via state
        navigate('/story', { state: { analysis: res.data } });
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h1>Webcam Detection</h1>
      <video ref={videoRef} autoPlay playsInline muted width="640" height="480" />
      <button onClick={captureFrame}>Analyze Current Frame</button>
    </div>
  );
};

export default WebcamDetection;
