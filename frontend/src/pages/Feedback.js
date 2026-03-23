import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

// Feedback page collects text/audio/video/rating feedback depending on disability.
const Feedback = () => {
  const [rating, setRating] = useState(5);
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/feedback', { session_id: sessionId, feedback_type: 'rating', rating })
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  };
  return (
    <div>
      <h1>Feedback</h1>
      <form onSubmit={handleSubmit}>
        <label>Rating (1-10):</label>
        <input
          type="number"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Feedback;
