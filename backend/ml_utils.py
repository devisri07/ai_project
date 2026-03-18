import json
import os

import numpy as np
import tensorflow as tf

# Placeholder for loading trained models
emotion_model = None
age_model = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "models", "emotion_class_names.json")
DEFAULT_EMOTION_LABELS = ["joy", "sad"]


def _load_emotion_labels() -> list[str]:
    if os.path.exists(CLASS_NAMES_PATH):
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as fp:
            values = json.load(fp)
        if isinstance(values, list) and values:
            return [str(v).lower() for v in values]
    return DEFAULT_EMOTION_LABELS


def load_models(emotion_path: str, age_path: str):
    global emotion_model, age_model
    emotion_model = tf.keras.models.load_model(emotion_path)
    age_model = tf.keras.models.load_model(age_path)


def predict_emotion(image_np: np.ndarray) -> str:
    """Accepts a preprocessed face image as numpy array, returns label."""
    if emotion_model is None:
        raise ValueError("Emotion model not loaded")
    preds = emotion_model.predict(np.expand_dims(image_np, axis=0), verbose=0)
    labels = _load_emotion_labels()
    idx = int(np.argmax(preds[0]))
    if idx >= len(labels):
        return labels[0]
    return labels[idx]


def estimate_age(image_np: np.ndarray) -> str:
    """Return age group string based on trained age model (1-10,10-30,30-60)."""
    if age_model is None:
        raise ValueError("Age model not loaded")
    preds = age_model.predict(np.expand_dims(image_np, axis=0), verbose=0)
    # assume output is one-hot for groups
    groups = ['1-10', '10-30', '30-60']
    return groups[np.argmax(preds[0])]


def compute_attention(face_landmarks) -> float:
    """Return a simple attention score based on landmark openness and orientation.

    A concrete implementation might track the ratio of eye openness (using
    distances between eyelid landmarks), head pose (whether the nose tip is
    roughly centered), or how far the gaze deviates from the camera. For
    demonstration we'll return a dummy value.
    """
    return 1.0  # always fully attentive in stub
