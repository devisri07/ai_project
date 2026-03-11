import base64
import io
import json
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np
from PIL import Image

try:
    import cv2
except Exception:  # pragma: no cover - optional runtime dependency
    cv2 = None

try:
    import tensorflow as tf
except Exception:  # pragma: no cover - optional runtime dependency
    tf = None

try:
    import mediapipe as mp
except Exception:  # pragma: no cover - optional runtime dependency
    mp = None

try:
    from deepface import DeepFace
except Exception:  # pragma: no cover - optional runtime dependency
    DeepFace = None


DEFAULT_CLASS_NAMES = ["anger", "joy", "sad"]
EMOTION_ALIAS_MAP = {
    "anger": "anger",
    "angry": "anger",
    "fear": "sad",
    "fearful": "sad",
    "sad": "sad",
    "joy": "joy",
    "happy": "joy",
}


@dataclass
class AIAnalysisResult:
    emotion: str
    estimated_age_group: str
    emotion_confidence: float
    blink_rate: float
    gaze_focus_duration: float
    attention_score: float
    source: str
    emotion_scores: Dict[str, float] = field(default_factory=dict)


class EmotionAttentionAnalyzer:
    def __init__(
        self,
        emotion_model_path: str,
        class_names_path: Optional[str] = None,
        penalty_factor: float = 8.0,
        use_deepface_emotion: bool = False,
        use_face_crop: bool = False,
        force_grayscale: bool = True,
    ) -> None:
        self.penalty_factor = penalty_factor
        self.use_deepface_emotion = use_deepface_emotion
        self.use_face_crop = use_face_crop
        self.force_grayscale = force_grayscale
        self.model = self._load_model(emotion_model_path)
        self.class_names = self._load_class_names(class_names_path)
        self.default_emotion = self.class_names[0] if self.class_names else "anger"
        self._last_emotion_scores: Dict[str, float] = {}
        self.model_input_size = self._infer_model_input_size(self.model)
        self.face_cascade = None
        if cv2 is not None:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            )
        self.face_mesh = self._init_face_mesh()
        self.face_detector = self._init_face_detector()

    def analyze_frame(
        self,
        frame_bgr: np.ndarray,
        fallback_age_group: str = "10-20",
    ) -> AIAnalysisResult:
        emotion, confidence, source = self._predict_emotion(frame_bgr)
        estimated_age_group = self._estimate_age_group(frame_bgr, fallback_age_group)
        blink_rate, gaze_focus_duration = self._estimate_attention_signals(frame_bgr)
        attention_score = max(
            0.0,
            round(gaze_focus_duration - (blink_rate * self.penalty_factor), 2),
        )
        return AIAnalysisResult(
            emotion=emotion,
            estimated_age_group=estimated_age_group,
            emotion_confidence=confidence,
            blink_rate=blink_rate,
            gaze_focus_duration=gaze_focus_duration,
            attention_score=attention_score,
            source=source,
            emotion_scores=self._last_emotion_scores,
        )

    def decode_base64_frame(self, frame_base64: str) -> np.ndarray:
        payload = frame_base64.split(",", 1)[-1]
        raw_bytes = base64.b64decode(payload)
        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        arr = np.array(image)
        if cv2 is None:
            return arr
        return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)

    def _load_model(self, model_path: str):
        if not os.path.exists(model_path):
            return None
        if tf is None:
            return None
        # Inference-only load. Avoid deserializing custom training losses/metrics.
        return tf.keras.models.load_model(model_path, compile=False)

    def _load_class_names(self, class_names_path: Optional[str]) -> List[str]:
        if class_names_path and os.path.exists(class_names_path):
            with open(class_names_path, "r", encoding="utf-8") as fp:
                values = json.load(fp)
            if isinstance(values, list) and values:
                return [str(v).lower() for v in values]
        return DEFAULT_CLASS_NAMES

    def _infer_model_input_size(self, model) -> int:
        if model is None:
            return 64
        try:
            shape = model.input_shape
            if isinstance(shape, list):
                shape = shape[0]
            h = int(shape[1]) if shape and len(shape) > 2 and shape[1] else 64
            w = int(shape[2]) if shape and len(shape) > 2 and shape[2] else h
            if h > 0 and w > 0:
                return min(h, w)
        except Exception:
            pass
        return 64

    def _canonical_emotion(self, label: str) -> str:
        value = (label or "").strip().lower()
        return EMOTION_ALIAS_MAP.get(value, value if value else self.default_emotion)

    def _init_face_mesh(self):
        if mp is None:
            return None

        # Classic MediaPipe API path.
        try:
            solutions = getattr(mp, "solutions", None)
            if solutions is not None and hasattr(solutions, "face_mesh"):
                return solutions.face_mesh.FaceMesh(
                    static_image_mode=True,
                    max_num_faces=1,
                    refine_landmarks=True,
                )
        except Exception:
            pass

        # Alternate import path used by some package variants.
        try:
            from mediapipe.python.solutions import face_mesh as mp_face_mesh  # type: ignore

            return mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
            )
        except Exception:
            return None

    def _init_face_detector(self):
        if mp is None:
            return None
        try:
            solutions = getattr(mp, "solutions", None)
            if solutions is not None and hasattr(solutions, "face_detection"):
                return solutions.face_detection.FaceDetection(
                    model_selection=0,
                    min_detection_confidence=0.5,
                )
        except Exception:
            pass
        return None

    def _predict_emotion(self, frame_bgr: np.ndarray) -> Tuple[str, float, str]:
        cnn_result = self._predict_emotion_cnn(frame_bgr)
        if DeepFace is None or not self.use_deepface_emotion:
            return cnn_result
        try:
            deepface_result = DeepFace.analyze(
                frame_bgr,
                actions=["emotion"],
                enforce_detection=False,
            )
            if isinstance(deepface_result, list):
                deepface_result = deepface_result[0]
            deepface_emotion = str(deepface_result.get("dominant_emotion", "joy")).lower()
            canonical = self._canonical_emotion(deepface_emotion)
            if canonical in DEFAULT_CLASS_NAMES:
                return canonical, float(deepface_result["emotion"].get(deepface_emotion, 0.0)), "deepface"
        except Exception:
            pass
        return cnn_result

    def _predict_emotion_cnn(self, frame_bgr: np.ndarray) -> Tuple[str, float, str]:
        if self.model is None:
            self._last_emotion_scores = {}
            return self.default_emotion, 0.0, "fallback_no_model"
        face = self._extract_face(frame_bgr)

        # Training pipeline used RGB images and includes an in-model Rescaling(1/255).
        # Keep inference input in [0,255] float range and convert BGR->RGB here.
        if self.force_grayscale:
            if cv2 is not None:
                gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
                face = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
            else:
                rgb_tmp = np.array(Image.fromarray(face).convert("L").convert("RGB"))
                face = rgb_tmp
        if cv2 is not None:
            face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
        face = face.astype("float32")
        logits = self.model.predict(np.expand_dims(face, axis=0), verbose=0)[0]
        self._last_emotion_scores = {
            self._canonical_emotion(self.class_names[i]): float(logits[i])
            for i in range(min(len(self.class_names), len(logits)))
        }
        idx = int(np.argmax(logits))
        label = self.class_names[idx] if idx < len(self.class_names) else self.default_emotion
        return self._canonical_emotion(label), float(logits[idx]), "cnn"

    def _extract_face(self, frame_bgr: np.ndarray) -> np.ndarray:
        target = self.model_input_size
        h, w = frame_bgr.shape[:2]
        if not self.use_face_crop:
            if cv2 is not None:
                return cv2.resize(frame_bgr, (target, target))
            return np.array(Image.fromarray(frame_bgr).resize((target, target)))
        if h < 10 or w < 10:
            return np.array(Image.fromarray(frame_bgr).resize((target, target)))

        if self.face_detector is not None and cv2 is not None:
            try:
                rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                detections = self.face_detector.process(rgb).detections
                if detections:
                    bbox = detections[0].location_data.relative_bounding_box
                    x = max(0, int(bbox.xmin * w))
                    y = max(0, int(bbox.ymin * h))
                    bw = int(bbox.width * w)
                    bh = int(bbox.height * h)
                    pad_x = int(0.15 * bw)
                    pad_y = int(0.20 * bh)
                    x1 = max(0, x - pad_x)
                    y1 = max(0, y - pad_y)
                    x2 = min(w, x + bw + pad_x)
                    y2 = min(h, y + bh + pad_y)
                    crop = frame_bgr[y1:y2, x1:x2]
                    if crop.size > 0:
                        return cv2.resize(crop, (target, target))
            except Exception:
                pass

        if cv2 is not None and self.face_cascade is not None:
            try:
                gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, 1.2, 5)
                if len(faces) > 0:
                    x, y, fw, fh = sorted(faces, key=lambda r: r[2] * r[3], reverse=True)[0]
                    pad_x = int(0.10 * fw)
                    pad_y = int(0.15 * fh)
                    x1 = max(0, x - pad_x)
                    y1 = max(0, y - pad_y)
                    x2 = min(w, x + fw + pad_x)
                    y2 = min(h, y + fh + pad_y)
                    crop = frame_bgr[y1:y2, x1:x2]
                    if crop.size > 0:
                        return cv2.resize(crop, (target, target))
            except Exception:
                pass

        side = min(h, w)
        cx, cy = w // 2, h // 2
        half = int(side * 0.35)
        x1 = max(0, cx - half)
        y1 = max(0, cy - half)
        x2 = min(w, cx + half)
        y2 = min(h, cy + half)
        crop = frame_bgr[y1:y2, x1:x2]
        if crop.size == 0:
            crop = frame_bgr
        if cv2 is not None:
            return cv2.resize(crop, (target, target))
        return np.array(Image.fromarray(crop).resize((target, target)))

    def _estimate_age_group(self, frame_bgr: np.ndarray, fallback: str) -> str:
        if DeepFace is None:
            return fallback
        try:
            result = DeepFace.analyze(frame_bgr, actions=["age"], enforce_detection=False)
            if isinstance(result, list):
                result = result[0]
            age = int(result.get("age", 15))
            if age <= 10:
                return "1-10"
            if age <= 20:
                return "10-20"
            return "20-40"
        except Exception:
            return fallback

    def _estimate_attention_signals(self, frame_bgr: np.ndarray) -> Tuple[float, float]:
        if self.face_mesh is None:
            blink_rate = float(np.random.uniform(0.1, 0.4))
            gaze_focus_duration = float(np.random.uniform(60.0, 95.0))
            return blink_rate, gaze_focus_duration

        if cv2 is None:
            rgb = frame_bgr
        else:
            rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        result = self.face_mesh.process(rgb)
        if not result.multi_face_landmarks:
            return 0.5, 50.0
        landmarks = result.multi_face_landmarks[0].landmark
        left_ear = self._eye_aspect_ratio(landmarks, [33, 160, 158, 133, 153, 144])
        right_ear = self._eye_aspect_ratio(landmarks, [263, 387, 385, 362, 380, 373])
        ear = (left_ear + right_ear) / 2.0
        blink_rate = 0.8 if ear < 0.2 else 0.2

        left_iris = landmarks[468] if len(landmarks) > 468 else landmarks[33]
        right_iris = landmarks[473] if len(landmarks) > 473 else landmarks[263]
        center_x = (left_iris.x + right_iris.x) / 2.0
        gaze_focus_duration = max(0.0, 100.0 - abs(center_x - 0.5) * 200.0)
        return round(blink_rate, 3), round(gaze_focus_duration, 2)

    @staticmethod
    def _eye_aspect_ratio(landmarks, idx: List[int]) -> float:
        p1 = np.array([landmarks[idx[0]].x, landmarks[idx[0]].y])
        p2 = np.array([landmarks[idx[1]].x, landmarks[idx[1]].y])
        p3 = np.array([landmarks[idx[2]].x, landmarks[idx[2]].y])
        p4 = np.array([landmarks[idx[3]].x, landmarks[idx[3]].y])
        p5 = np.array([landmarks[idx[4]].x, landmarks[idx[4]].y])
        p6 = np.array([landmarks[idx[5]].x, landmarks[idx[5]].y])
        vertical = np.linalg.norm(p2 - p6) + np.linalg.norm(p3 - p5)
        horizontal = max(np.linalg.norm(p1 - p4), 1e-6)
        return vertical / (2.0 * horizontal)


def compute_emotion_stability(emotions: List[str]) -> float:
    if not emotions:
        return 0.0
    transitions = 0
    prev = emotions[0]
    for item in emotions[1:]:
        if item != prev:
            transitions += 1
        prev = item
    max_possible = max(1, len(emotions) - 1)
    return round(1.0 - (transitions / max_possible), 3)
