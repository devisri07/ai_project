import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import WebcamDetection from './pages/WebcamDetection';
import StoryPlayer from './pages/StoryPlayer';
import Feedback from './pages/Feedback';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  return (
    <Router>
      <nav style={{ padding: '8px', background: '#eee' }}>
        <a href="/" style={{ marginRight: 10 }}>Home</a>
        <a href="/analytics" style={{ marginRight: 10 }}>Analytics</a>
      </nav>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/webcam" element={<WebcamDetection />} />
        <Route path="/story" element={<StoryPlayer />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
