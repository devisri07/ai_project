# AI-Driven Multi-Modal Facial Emotion, Age & Attention Detection Enabled Adaptive Storytelling System (Magic Mirror)

## 1. What Is Implemented
- Guest-mode backend only (no authentication, no personal identity storage)
- Flask REST API for scan, story, monitoring, quiz, recommendations, dashboards, chatbot, and YouTube customization plan
- SQLite analytics storage (`magic_mirror.db`) with session-level and event-level metrics
- CNN training pipeline for your uploaded dataset (supports `Dataset/sad` and standard `train/val` layouts)
- Frontend service integration updates without changing visual design

## 2. Backend Folder Structure
```text
backend/
  app.py
  config.py
  models.py
  ai_pipeline.py
  story_engine.py
  chatbot_engine.py
  recommendation_engine.py
  video_customizer.py
  train_emotion_cnn.py
  predict_emotion.py
  requirements.txt
```

## 3. Database Models (SQLite / MySQL-compatible)
- `guest_sessions`: one anonymous session per usage
- `emotion_attention_readings`: per-scan/per-monitoring emotion + attention metrics
- `story_records`: generated story metadata
- `quiz_attempts`: quiz accuracy and completion performance

## 4. API Endpoints
- `GET /api/health`
- `POST /api/session/start`
- `POST /api/scan/analyze`
- `POST /api/story/generate` (alias: `POST /api/generate_story`)
- `POST /api/monitor/update`
- `POST /api/quiz/submit` (alias: `POST /api/quiz_report`)
- `GET|POST /api/recommendations`
- `GET /api/dashboard/parent`
- `GET /api/dashboard/student`
- `POST /api/chat`
- `POST /api/youtube/customize`
- `POST /api/session/complete`

## 5. Installation Guide
1. Create venv and install dependencies:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```
2. Run backend:
```bash
python app.py
```
3. Run frontend in another terminal:
```bash
cd frontend
npm install
npm run dev
```

## 6. Emotion CNN Training
Supported dataset layouts:
```text
Layout A (standard split):
Dataset/any-name/
  train/
    anger/ joy/ sad/ ...
  val/
    anger/ joy/ sad/ ...

Layout B (single root, auto split):
dataset/
  anger/
  joy/
  sad/
```

Training command:
```bash
python backend/train_emotion_cnn.py --dataset dataset --epochs 20 --batch-size 32 --image-size 224
```

Outputs:
- `backend/models/emotion_cnn.keras`
- `backend/models/emotion_class_names.json`
- `backend/models/emotion_eval_metrics.json`
- `backend/models/emotion_training_history.json`

Single-image test:
```bash
python backend/predict_emotion.py --image path/to/test.jpg
```

## 7. Security + Privacy Alignment
- Guest mode only
- No user login or identity profile
- No raw webcam stream stored
- Only derived analytics metrics stored (emotion/attention/session/quiz)
- Local DB (SQLite) default; MySQL can be used via `DATABASE_URI`

## 8. Architecture Summary
- Capture and infer:
  - WebRTC frame (frontend) -> `/api/scan/analyze`
  - CNN + optional DeepFace + MediaPipe logic in `ai_pipeline.py`
- Adapt and generate:
  - Story logic in `story_engine.py`
  - Runtime adaptation decisions in `/api/monitor/update`
- Assess and improve:
  - Quiz submission + session analytics -> parent/student dashboards

## 9. IEEE Novelty Explanation (for your report)
- Multi-modal adaptation: combines emotion, estimated age group, and gaze/blink-derived attention
- Closed feedback loop: scan -> adaptive story -> monitoring -> post-story re-evaluation
- Accessibility-first personalization: distinct behavior rules for Autism/ADHD/Visual/Hearing modes
- Privacy-preserving design: anonymous sessions and metric-only storage

## 10. Evaluation Metrics to Report
- Emotion Detection Accuracy:
  - Use `emotion_eval_metrics.json` validation accuracy
- Attention Score Reliability:
  - Correlate gaze/blink score with manual annotation or expert rating
- Engagement Improvement %:
  - Compare average `story_completion_rate` before vs after adaptive mode
- Story Completion Rate:
  - `completed_sessions / started_sessions * 100`

## 11. Story Generation Ideas (Emotion + Age)
- `1-10`: short scenes, repeated key words, explicit moral ending
- `10-20`: challenge-response arcs, character growth decisions
- `20-40`: reflective internal monologue + practical takeaway
- Emotion mapping:
  - Happy: exploration and social connection
  - Sad: comfort + hopeful resolution
  - Angry: calming sequence + breathing cues
  - Confused: scaffolded hints + recap scenes
