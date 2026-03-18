import json
import os
import sys

import numpy as np
import tensorflow as tf
from PIL import Image

EMOTION_MODEL_PATH = "backend/models/emotion_cnn.keras"
CLASS_NAMES_PATH = "backend/models/emotion_class_names.json"
DEFAULT_EMOTIONS = ["joy", "sad"]

EMOTION_EMOJIS = {
    "joy": ":)",
    "sad": ":(",
}


def load_class_names():
    if os.path.exists(CLASS_NAMES_PATH):
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as fp:
            values = json.load(fp)
        if isinstance(values, list) and values:
            return [str(v).lower() for v in values]
    return DEFAULT_EMOTIONS


def load_model():
    print("Loading emotion model...")

    if not os.path.exists(EMOTION_MODEL_PATH):
        raise FileNotFoundError(f"Model not found: {EMOTION_MODEL_PATH}")

    model = tf.keras.models.load_model(EMOTION_MODEL_PATH, compile=False)
    print("Model loaded successfully")
    return model


def preprocess_image(image_path, target_size=(224, 224)):
    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size)

    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array


def predict_emotion(image_path, model, emotions):
    img_array = preprocess_image(image_path)

    predictions = model.predict(img_array, verbose=0)

    emotion_idx = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][emotion_idx])
    emotion = emotions[emotion_idx] if emotion_idx < len(emotions) else emotions[0]

    return emotion, confidence, predictions[0]


def print_results(emotion, confidence, all_predictions, emotions):
    print("\n" + "=" * 60)
    print("EMOTION PREDICTION RESULT")
    print("=" * 60)

    emoji = EMOTION_EMOJIS.get(emotion, "?")

    print(f"\nDetected Emotion: {emoji} {emotion.upper()}")
    print(f"Confidence: {confidence * 100:.2f}%")

    print("\nAll Class Probabilities:")

    for i, em in enumerate(emotions):
        prob = all_predictions[i]
        bar = "#" * int(prob * 30)
        print(f"{em:10}: {bar} {prob * 100:.2f}%")

    print("=" * 60)


def main():
    if len(sys.argv) < 2:
        print("Usage: python test_models.py image.jpg")
        return

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print("Image not found.")
        return

    emotions = load_class_names()
    print(f"Class order: {emotions}")

    model = load_model()

    emotion, confidence, all_predictions = predict_emotion(image_path, model, emotions)

    print_results(emotion, confidence, all_predictions, emotions)


if __name__ == "__main__":
    main()
