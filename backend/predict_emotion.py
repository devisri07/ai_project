import argparse
import json
import os

import cv2
import numpy as np
import tensorflow as tf


def predict(image_path: str, model_path: str, class_names_path: str):
    model = tf.keras.models.load_model(model_path)
    with open(class_names_path, "r", encoding="utf-8") as fp:
        class_names = json.load(fp)

    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")
    image = cv2.resize(image, (64, 64))
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype("float32")
    probs = model.predict(np.expand_dims(image, axis=0), verbose=0)[0]
    idx = int(np.argmax(probs))
    return class_names[idx], float(probs[idx]), probs.tolist()


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument(
        "--model",
        default=os.path.join("backend", "models", "emotion_cnn.keras"),
    )
    parser.add_argument(
        "--class-names",
        default=os.path.join("backend", "models", "emotion_class_names.json"),
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    label, confidence, probs = predict(args.image, args.model, args.class_names)
    print(f"Predicted emotion: {label}")
    print(f"Confidence: {confidence:.4f}")
    print(f"Probabilities: {probs}")
