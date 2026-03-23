-- MySQL schema for AI-Driven Adaptive Storytelling System

CREATE DATABASE IF NOT EXISTS storytelling;
USE storytelling;

-- tables correspond to SQLAlchemy models; they will also be created by app

-- users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    disability VARCHAR(20),
    age INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    emotion_history TEXT,
    attention_history TEXT,
    age_group VARCHAR(20),
    story_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    user_id INT,
    feedback_type VARCHAR(20),
    content TEXT,
    rating INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
