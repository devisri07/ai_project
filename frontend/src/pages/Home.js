import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1>📚 Welcome to Adaptive Storytelling</h1>
          <p className="tagline">Personalized Stories for Special Needs Children</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Adaptive Stories</h3>
            <p>Stories that adapt to your child's emotions, age, and learning style</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">😊</div>
            <h3>Emotion Detection</h3>
            <p>Real-time emotion recognition to personalize the learning experience</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Accessibility Modes</h3>
            <p>Special modes for autism, visual impairment, and hearing impairment</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Analytics</h3>
            <p>Track emotional growth and learning progress over time</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to start?</h2>
          <div className="button-group">
            <button className="btn btn-primary" onClick={() => navigate('/login-register')}>
              Get Started
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/analytics')}>
              View Analytics
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>🧠 How It Works</h3>
          <ol className="steps">
            <li><strong>Register:</strong> Create an account for your child</li>
            <li><strong>Capture:</strong> Let us analyze emotions through your webcam</li>
            <li><strong>Listen:</strong> Enjoy a personalized story based on emotions</li>
            <li><strong>Feedback:</strong> Rate and share feedback about the experience</li>
            <li><strong>Track:</strong> Monitor progress through analytics dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;
