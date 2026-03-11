import json
import os

import tensorflow as tf
from tensorflow.keras import layers, models

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "dataset"))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "emotion_cnn.keras")
CLASS_NAMES_PATH = os.path.join(MODELS_DIR, "emotion_class_names.json")
METRICS_PATH = os.path.join(MODELS_DIR, "emotion_eval_metrics.json")

IMG_SIZE = 128
BATCH_SIZE = 32
EPOCHS = 30
SEED = 123
USE_GRAYSCALE_TRAINING = True


def create_alcnn(num_classes: int):
    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))

    x = layers.Rescaling(1.0 / 255)(inputs)
    x = layers.Conv2D(32, (3, 3), activation="relu", padding="same")(x)
    x = layers.MaxPooling2D((2, 2))(x)

    x = layers.Conv2D(64, (3, 3), activation="relu", padding="same")(x)
    x = layers.MaxPooling2D((2, 2))(x)

    x = layers.Conv2D(128, (3, 3), activation="relu", padding="same")(x)
    x = layers.MaxPooling2D((2, 2))(x)

    attention = layers.Conv2D(128, (1, 1), activation="sigmoid")(x)
    x = layers.multiply([x, attention])

    x = layers.Flatten()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    return models.Model(inputs, outputs)


def main():
    if not os.path.isdir(DATASET_DIR):
        raise FileNotFoundError(f"Dataset folder not found: {DATASET_DIR}")

    print(f"Using dataset path: {DATASET_DIR}")
    train_dataset = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=SEED,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        label_mode="categorical",
    )
    val_dataset = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=SEED,
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        label_mode="categorical",
    )

    class_names = [str(x).lower() for x in train_dataset.class_names]
    print("Emotion Classes:", class_names)

    train_dataset = train_dataset.prefetch(tf.data.AUTOTUNE)
    val_dataset = val_dataset.prefetch(tf.data.AUTOTUNE)

    if USE_GRAYSCALE_TRAINING:
        def to_gray_rgb(x, y):
            gray = tf.image.rgb_to_grayscale(x)
            rgb = tf.image.grayscale_to_rgb(gray)
            return rgb, y

        train_dataset = train_dataset.map(to_gray_rgb, num_parallel_calls=tf.data.AUTOTUNE)
        val_dataset = val_dataset.map(to_gray_rgb, num_parallel_calls=tf.data.AUTOTUNE)

    model = create_alcnn(num_classes=len(class_names))
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    model.summary()

    history = model.fit(train_dataset, validation_data=val_dataset, epochs=EPOCHS)
    val_loss, val_accuracy = model.evaluate(val_dataset, verbose=0)

    os.makedirs(MODELS_DIR, exist_ok=True)
    model.save(MODEL_PATH)
    with open(CLASS_NAMES_PATH, "w", encoding="utf-8") as fp:
        json.dump(class_names, fp, indent=2)
    with open(METRICS_PATH, "w", encoding="utf-8") as fp:
        json.dump(
            {
                "val_loss": float(val_loss),
                "val_accuracy": float(val_accuracy),
                "epochs": EPOCHS,
                "image_size": IMG_SIZE,
                "batch_size": BATCH_SIZE,
                "grayscale_training": USE_GRAYSCALE_TRAINING,
                "history": {
                    "accuracy": [float(x) for x in history.history.get("accuracy", [])],
                    "val_accuracy": [float(x) for x in history.history.get("val_accuracy", [])],
                    "loss": [float(x) for x in history.history.get("loss", [])],
                    "val_loss": [float(x) for x in history.history.get("val_loss", [])],
                },
            },
            fp,
            indent=2,
        )

    print(f"Model saved: {MODEL_PATH}")
    print(f"Class names saved: {CLASS_NAMES_PATH}")
    print(f"Metrics saved: {METRICS_PATH}")


if __name__ == "__main__":
    main()
