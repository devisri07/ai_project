from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class GuestSession(db.Model):
    __tablename__ = "guest_sessions"

    id = db.Column(db.Integer, primary_key=True)
    session_token = db.Column(db.String(64), unique=True, nullable=False, index=True)
    theme = db.Column(db.String(32), nullable=False)
    age_group = db.Column(db.String(16), nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    ended_at = db.Column(db.DateTime, nullable=True)

    dominant_emotion = db.Column(db.String(32), nullable=True)
    estimated_age_group = db.Column(db.String(16), nullable=True)
    avg_attention_score = db.Column(db.Float, default=0.0)
    emotion_stability_index = db.Column(db.Float, default=0.0)

    stories_completed = db.Column(db.Integer, default=0)
    quizzes_completed = db.Column(db.Integer, default=0)
    reward_points = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class EmotionAttentionReading(db.Model):
    __tablename__ = "emotion_attention_readings"

    id = db.Column(db.Integer, primary_key=True)
    session_token = db.Column(
        db.String(64),
        db.ForeignKey("guest_sessions.session_token"),
        nullable=False,
        index=True,
    )
    captured_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    emotion = db.Column(db.String(32), nullable=False)
    estimated_age_group = db.Column(db.String(16), nullable=True)
    blink_rate = db.Column(db.Float, default=0.0)
    gaze_focus_duration = db.Column(db.Float, default=0.0)
    attention_score = db.Column(db.Float, default=0.0)
    safety_pause_triggered = db.Column(db.Boolean, default=False)


class StoryRecord(db.Model):
    __tablename__ = "story_records"

    id = db.Column(db.Integer, primary_key=True)
    session_token = db.Column(
        db.String(64),
        db.ForeignKey("guest_sessions.session_token"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(255), nullable=False)
    theme = db.Column(db.String(32), nullable=False)
    emotion_context = db.Column(db.String(32), nullable=False)
    age_group = db.Column(db.String(16), nullable=False)
    duration_seconds = db.Column(db.Integer, default=300)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    session_token = db.Column(
        db.String(64),
        db.ForeignKey("guest_sessions.session_token"),
        nullable=False,
        index=True,
    )
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
