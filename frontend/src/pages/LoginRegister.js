import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Login/register page allowing parents/teachers to sign up or sign in.
const LoginRegister = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // or 'register'
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const path = mode === 'login' ? '/login' : '/register';
      const res = await api.post(path, { username, password });
      console.log(res.data);
      if (mode === 'login') {
        navigate('/webcam');
      } else {
        setMode('login');
      }
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };
  return (
    <div>
      <h1>Login / Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LoginRegister;
