import os
import uuid
from collections import Counter
from datetime import datetime
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, request
from flask_cors import CORS

from ai_pipeline import EmotionAttentionAnalyzer, compute_emotion_stability
from chatbot_engine import generate_chat_reply
from config import DevelopmentConfig
from models import (
    EmotionAttentionReading,
    GuestSession,
    QuizAttempt,
    StoryRecord,
    db,
)
from recommendation_engine import build_recommendations
from smart_friend import generate_smart_friend_reply
from story_engine import generate_adaptive_story
from video_customizer import build_customization_plan

try:
    from gtts import gTTS
except Exception:  # pragma: no cover
    gTTS = None


DEFAULT_AGE_GROUP = "1-10"
DEFAULT_THEME = "Autism"
DEFAULT_EMOTION = "joy"
MAX_SCAN_FRAMES = 7


def _json_payload() -> Dict[str, Any]:
    return request.get_json(silent=True) or {}


def _valid_frame_strings(values: Any) -> List[str]:
    if not isinstance(values, list):
        return []
    return [v for v in values if isinstance(v, str) and v.strip()]


def _payload_frames(frame_base64: Any, frames_base64: Any) -> List[str]:
    frames = _valid_frame_strings(frames_base64)
    if frames:
        return frames
    if isinstance(frame_base64, str) and frame_base64.strip():
        return [frame_base64]
    return []


def _choose_scan_result(frame_results):
    """Pick a stable frame result by averaging class probabilities when available."""
    score_totals = Counter()
    for item in frame_results:
        if item.emotion_scores:
            score_totals.update(item.emotion_scores)

    if score_totals:
        for key in list(score_totals.keys()):
            score_totals[key] = score_totals[key] / len(frame_results)
        chosen_emotion, avg_conf = max(score_totals.items(), key=lambda x: x[1])
        candidates = [r for r in frame_results if r.emotion == chosen_emotion]
        chosen = max(candidates, key=lambda x: x.emotion_confidence) if candidates else frame_results[0]
        chosen.emotion_confidence = float(avg_conf)
        chosen.emotion_scores = dict(score_totals)
        return chosen

    emotion_counts = Counter([r.emotion for r in frame_results])
    chosen_emotion = emotion_counts.most_common(1)[0][0]
    candidates = [r for r in frame_results if r.emotion == chosen_emotion]
    return max(candidates, key=lambda x: x.emotion_confidence) if candidates else frame_results[0]


def _scan_response(chosen, frames_analyzed: int) -> Dict[str, Any]:
    return {
        "emotion": chosen.emotion,
        "estimated_age_group": chosen.estimated_age_group,
        "attention_level": chosen.attention_score,
        "blink_rate": chosen.blink_rate,
        "gaze_focus_duration": chosen.gaze_focus_duration,
        "emotion_confidence": chosen.emotion_confidence,
        "emotion_scores": chosen.emotion_scores,
        "source": chosen.source,
        "frames_analyzed": frames_analyzed,
    }


def _monitor_action(emotion: str, blink_rate: float, gaze_focus_duration: float) -> str:
    if emotion == "joy":
        return "increase_animation_intensity"
    if emotion == "sad":
        return "simplify_narration"
    if blink_rate > 0.8 and gaze_focus_duration < 30:
        return "safety_pause"
    return "continue"


def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    db.init_app(app)

    analyzer = EmotionAttentionAnalyzer(
        emotion_model_path=app.config["EMOTION_MODEL_PATH"],
        class_names_path=app.config["CLASS_NAMES_PATH"],
        use_deepface_emotion=app.config["USE_DEEPFACE_EMOTION"],
        use_face_crop=app.config["EMOTION_USE_FACE_CROP"],
        force_grayscale=app.config["EMOTION_FORCE_GRAYSCALE"],
    )
    app.logger.info(
        "Emotion model path=%s loaded=%s input_size=%s",
        app.config["EMOTION_MODEL_PATH"],
        analyzer.model is not None,
        analyzer.model_input_size,
    )

    @app.before_request
    def _log_request():
        app.logger.info("Request: %s %s", request.method, request.path)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify(
            {
                "status": "ok",
                "service": "magic-mirror-backend",
                "emotion_model_loaded": analyzer.model is not None,
                "emotion_model_path": app.config["EMOTION_MODEL_PATH"],
                "emotion_classes": analyzer.class_names,
                "model_input_size": analyzer.model_input_size,
                "use_deepface_emotion": app.config["USE_DEEPFACE_EMOTION"],
                "emotion_use_face_crop": app.config["EMOTION_USE_FACE_CROP"],
                "emotion_force_grayscale": app.config["EMOTION_FORCE_GRAYSCALE"],
            }
        )

    @app.route("/api/session/start", methods=["POST"])
    def start_session():
        data = _json_payload()
        age_group = data.get("age_group", DEFAULT_AGE_GROUP)
        theme = data.get("theme", DEFAULT_THEME)
        token = uuid.uuid4().hex
        row = GuestSession(session_token=token, age_group=age_group, theme=theme)
        db.session.add(row)
        db.session.commit()
        return jsonify(
            {
                "session_token": token,
                "started_at": row.started_at.isoformat(),
                "guest_mode": True,
            }
        )

    @app.route("/api/scan/analyze", methods=["POST"])
    def analyze_scan():
        data = _json_payload()
        frame_base64 = data.get("frame_base64")
        frames_base64 = data.get("frames_base64", [])
        age_group = data.get("age_group", DEFAULT_AGE_GROUP)
        session_token = data.get("session_token")
        if not frame_base64 and not frames_base64:
            app.logger.warning("scan/analyze: missing frame_base64 and frames_base64")
            return jsonify({"error": "frame_base64 or frames_base64 is required"}), 400

        payload_frames = _payload_frames(frame_base64, frames_base64)
        if not payload_frames:
            app.logger.warning("scan/analyze: payload_frames empty after filtering")
            return jsonify({"error": "no valid frames found"}), 400

        frame_results = []
        for raw_frame in payload_frames[:MAX_SCAN_FRAMES]:
            try:
                frame_bgr = analyzer.decode_base64_frame(raw_frame)
                frame_results.append(analyzer.analyze_frame(frame_bgr, fallback_age_group=age_group))
            except Exception as ex:
                app.logger.warning("scan/analyze: frame decode/analyze failed: %s", ex)
                continue

        if not frame_results:
            app.logger.warning(
                "scan/analyze: all frames failed (received=%d)", len(payload_frames[:MAX_SCAN_FRAMES])
            )
            return jsonify({"error": "failed to decode/analyze frames"}), 400

        chosen = _choose_scan_result(frame_results)
        app.logger.info(
            "scan result emotion=%s source=%s conf=%.4f attention=%.2f frames=%d",
            chosen.emotion,
            chosen.source,
            chosen.emotion_confidence,
            chosen.attention_score,
            len(frame_results),
        )

        if session_token:
            _store_reading(session_token, chosen)
            _refresh_session_aggregates(session_token)

        return jsonify(_scan_response(chosen, len(frame_results)))

    @app.route("/api/story/generate", methods=["POST"])
    @app.route("/api/generate_story", methods=["POST"])
    def story_generate():
        data = _json_payload()
        emotion = data.get("emotion", DEFAULT_EMOTION)
        age_group = data.get("age_group", DEFAULT_AGE_GROUP)
        theme = data.get("theme", DEFAULT_THEME)
        session_token = data.get("session_token")
        generate_audio = bool(data.get("generate_audio", False))

        story = generate_adaptive_story(emotion=emotion, age_group=age_group, theme=theme)
        audio_path = None
        if generate_audio and gTTS is not None:
            os.makedirs("backend/generated_audio", exist_ok=True)
            audio_path = os.path.join(
                "backend",
                "generated_audio",
                f"story_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.mp3",
            )
            tts = gTTS(text=" ".join([s["narration"] for s in story["scenes"]]), lang="en")
            tts.save(audio_path)

        if session_token:
            title = story.get("title", "Adaptive Story")
            db.session.add(
                StoryRecord(
                    session_token=session_token,
                    title=title,
                    theme=theme,
                    emotion_context=emotion,
                    age_group=age_group,
                    duration_seconds=300,
                )
            )
            db.session.commit()

        return jsonify({"story": story, "audio_path": audio_path})

    @app.route("/api/monitor/update", methods=["POST"])
    def monitor_update():
        data = _json_payload()
        gaze_focus_duration = float(data.get("gaze_focus_duration", 70.0))
        blink_rate = float(data.get("blink_rate", 0.2))
        emotion = (data.get("emotion", DEFAULT_EMOTION) or DEFAULT_EMOTION).lower()
        penalty_factor = float(data.get("penalty_factor", 8.0))
        attention_score = max(0.0, round(gaze_focus_duration - (blink_rate * penalty_factor), 2))
        action = _monitor_action(emotion, blink_rate, gaze_focus_duration)

        return jsonify(
            {
                "attention_score": attention_score,
                "adaptive_action": action,
                "safety_pause": action == "safety_pause",
            }
        )

    @app.route("/api/quiz/submit", methods=["POST"])
    @app.route("/api/quiz_report", methods=["POST"])
    def submit_quiz():
        data = _json_payload()
        session_token = data.get("session_token")
        answers = data.get("answers", [])
        if not isinstance(answers, list):
            return jsonify({"error": "answers must be a list"}), 400
        total = len(answers)
        correct = sum(1 for a in answers if bool(a))
        accuracy = round((correct / total) * 100, 2) if total else 0.0

        if session_token:
            db.session.add(
                QuizAttempt(
                    session_token=session_token,
                    total_questions=total or 5,
                    correct_answers=correct,
                    accuracy=accuracy,
                )
            )
            _increment_rewards(session_token, correct * 5)
            db.session.commit()

        return jsonify({"total": total, "correct": correct, "accuracy": accuracy})

    @app.route("/api/quiz/gaze", methods=["POST", "OPTIONS"])
    def quiz_gaze():
        if request.method == "OPTIONS":
            return jsonify({"ok": True})
        data = _json_payload()
        frame_base64 = data.get("frame_base64")
        if not isinstance(frame_base64, str) or not frame_base64.strip():
            return jsonify({"error": "frame_base64 is required"}), 400
        try:
            frame_bgr = analyzer.decode_base64_frame(frame_base64)
            direction = analyzer.estimate_gaze_direction(frame_bgr)
            return jsonify({"direction": direction})
        except Exception as exc:
            app.logger.warning("quiz/gaze: failed to estimate gaze: %s", exc)
            return jsonify({"direction": "center"})

    @app.route("/api/recommendations", methods=["GET", "POST"])
    def recommendations():
        payload = request.get_json(silent=True) if request.method == "POST" else request.args
        emotion = payload.get("emotion", DEFAULT_EMOTION)
        age_group = payload.get("age_group", DEFAULT_AGE_GROUP)
        theme = payload.get("theme", DEFAULT_THEME)
        items = build_recommendations(emotion=emotion, age_group=age_group, theme=theme)
        return jsonify({"items": items})

    @app.route("/api/dashboard/parent", methods=["GET"])
    def parent_dashboard():
        sessions = GuestSession.query.order_by(GuestSession.started_at.desc()).all()
        readings = EmotionAttentionReading.query.all()
        quizzes = QuizAttempt.query.all()

        emotion_counter = Counter([r.emotion for r in readings]) if readings else Counter()
        avg_attention = (
            round(sum([r.attention_score for r in readings]) / len(readings), 2)
            if readings
            else 0.0
        )
        quiz_accuracy = (
            round(sum([q.accuracy for q in quizzes]) / len(quizzes), 2) if quizzes else 0.0
        )
        completion_rate = (
            round(
                (
                    sum([s.stories_completed for s in sessions])
                    / max(1, len(sessions))
                )
                * 100,
                2,
            )
            if sessions
            else 0.0
        )

        return jsonify(
            {
                "emotion_history": emotion_counter,
                "attention_trend_average": avg_attention,
                "story_completion_rate": completion_rate,
                "quiz_accuracy": quiz_accuracy,
                "recommended_improvements": [
                    "Use short breathing pauses before difficult scenes.",
                    "Prefer subtitle-rich mode for hearing support.",
                    "Repeat key learning points at scene transitions.",
                ],
            }
        )

    @app.route("/api/dashboard/student", methods=["GET"])
    def student_dashboard():
        session_token = request.args.get("session_token")
        row = (
            GuestSession.query.filter_by(session_token=session_token).first()
            if session_token
            else None
        )
        if not row:
            return jsonify(
                {
                    "stories_completed": 0,
                    "rewards_earned": 0,
                    "achievement_badges": [],
                    "encouragement_message": "You are doing great. Keep exploring one story at a time.",
                }
            )
        badges = []
        if row.stories_completed >= 1:
            badges.append("Story Starter")
        if row.quizzes_completed >= 1:
            badges.append("Quiz Explorer")
        if row.reward_points >= 20:
            badges.append("Focus Champion")
        return jsonify(
            {
                "stories_completed": row.stories_completed,
                "rewards_earned": row.reward_points,
                "achievement_badges": badges,
                "encouragement_message": "Great effort. Your consistency is improving every session.",
            }
        )

    @app.route("/api/chat", methods=["POST"])
    def chat():
        data = _json_payload()
        message = data.get("message", "")
        emotion = data.get("emotion", DEFAULT_EMOTION)
        mode = data.get("mode", DEFAULT_THEME)
        try:
            result = generate_chat_reply(message=message, emotion=emotion, mode=mode)
        except Exception as exc:
            app.logger.exception("chat: failed to generate reply: %s", exc)
            result = {
                "reply": "Sorry, I had trouble responding just now. Please try again.",
                "voice_response_recommended": "false",
                "emotion_used": emotion,
                "mode_used": mode,
            }
        return jsonify(result)

    @app.route("/api/youtube/customize", methods=["POST"])
    def youtube_customize():
        data = _json_payload()
        url = data.get("youtube_url", "")
        mode = data.get("mode", "autism")
        if not url:
            return jsonify({"error": "youtube_url is required"}), 400
        plan = build_customization_plan(url, mode)
        return jsonify(plan)

    @app.route("/api/smart-friend/respond", methods=["POST", "OPTIONS"])
    def smart_friend_respond():
        if request.method == "OPTIONS":
            return jsonify({"ok": True})
        data = _json_payload()
        prompt = data.get("prompt", "")
        mode = data.get("mode", DEFAULT_THEME)
        if not prompt:
            return jsonify({"error": "prompt is required"}), 400
        result = generate_smart_friend_reply(prompt=prompt, mode=mode)
        return jsonify(result)

    @app.route("/api/session/complete", methods=["POST"])
    def complete_session():
        data = _json_payload()
        session_token = data.get("session_token")
        if not session_token:
            return jsonify({"error": "session_token is required"}), 400
        row = GuestSession.query.filter_by(session_token=session_token).first()
        if not row:
            return jsonify({"error": "session not found"}), 404
        row.ended_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"status": "completed", "ended_at": row.ended_at.isoformat()})

    @app.route("/", methods=["GET"])
    def root():
        return jsonify(
            {
                "message": "Magic Mirror backend running",
                "guest_mode": True,
                "hint": "Use /api/health and /api/scan/analyze for model status and emotion scanning.",
            }
        )

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "not found", "path": request.path}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        app.logger.exception("Unhandled error: %s", error)
        return jsonify({"error": "internal server error"}), 500

    with app.app_context():
        db.create_all()

    return app


def _store_reading(session_token, result):
    db.session.add(
        EmotionAttentionReading(
            session_token=session_token,
            emotion=result.emotion,
            estimated_age_group=result.estimated_age_group,
            blink_rate=result.blink_rate,
            gaze_focus_duration=result.gaze_focus_duration,
            attention_score=result.attention_score,
            safety_pause_triggered=(result.blink_rate > 0.8 and result.gaze_focus_duration < 30),
        )
    )
    db.session.commit()


def _refresh_session_aggregates(session_token):
    session_row = GuestSession.query.filter_by(session_token=session_token).first()
    if not session_row:
        return
    readings = EmotionAttentionReading.query.filter_by(session_token=session_token).all()
    if not readings:
        return
    emotions = [r.emotion for r in readings]
    attention_scores = [r.attention_score for r in readings]
    session_row.dominant_emotion = Counter(emotions).most_common(1)[0][0]
    session_row.estimated_age_group = readings[-1].estimated_age_group
    session_row.avg_attention_score = round(sum(attention_scores) / len(attention_scores), 2)
    session_row.emotion_stability_index = compute_emotion_stability(emotions)
    db.session.commit()


def _increment_rewards(session_token, points):
    session_row = GuestSession.query.filter_by(session_token=session_token).first()
    if not session_row:
        return
    session_row.reward_points += int(points)
    session_row.quizzes_completed += 1
    db.session.commit()


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
