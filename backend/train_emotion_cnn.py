import json
import os

import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "dataset"))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "emotion_cnn.keras")
CLASS_NAMES_PATH = os.path.join(MODELS_DIR, "emotion_class_names.json")
METRICS_PATH = os.path.join(MODELS_DIR, "emotion_eval_metrics.json")

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 25
SEED = 123
USE_GRAYSCALE_TRAINING = False
FINE_TUNE_EPOCHS = 15

def create_model(num_classes: int):
    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
    aug = models.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.05),
            layers.RandomZoom(0.1),
            layers.RandomContrast(0.1),
        ],
        name="augmentation",
    )
    x = aug(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

    try:
        backbone = tf.keras.applications.MobileNetV2(
            input_shape=(IMG_SIZE, IMG_SIZE, 3),
            include_top=False,
            weights="imagenet",
        )
    except OSError as exc:
        raise RuntimeError(
            "MobileNetV2 weights cache is corrupted. Delete the cached file and retry.\n"
            "Typical path: C:\\Users\\<you>\\.keras\\models\\mobilenet_v2_weights_tf_dim_ordering_tf_kernels_1.0_224_no_top.h5"
        ) from exc
    backbone.trainable = False

    x = backbone(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    model = models.Model(inputs, outputs)
    return model, backbone


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

    train_dataset = train_dataset.shuffle(1000, seed=SEED).cache().prefetch(tf.data.AUTOTUNE)
    val_dataset = val_dataset.cache().prefetch(tf.data.AUTOTUNE)

    if USE_GRAYSCALE_TRAINING:
        def to_gray_rgb(x, y):
            gray = tf.image.rgb_to_grayscale(x)
            rgb = tf.image.grayscale_to_rgb(gray)
            return rgb, y

        train_dataset = train_dataset.map(to_gray_rgb, num_parallel_calls=tf.data.AUTOTUNE)
        val_dataset = val_dataset.map(to_gray_rgb, num_parallel_calls=tf.data.AUTOTUNE)

    model, backbone = create_model(num_classes=len(class_names))
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=5, restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6
        ),
    ]

    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=EPOCHS,
        callbacks=callbacks,
    )

    # Fine-tune top layers for better generalization on small datasets.
    backbone.trainable = True
    for layer in backbone.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    fine_tune_history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=EPOCHS + FINE_TUNE_EPOCHS,
        initial_epoch=EPOCHS,
        callbacks=callbacks,
    )
    val_loss, val_accuracy = model.evaluate(val_dataset, verbose=0)

    # Build confusion matrix on validation set to catch class collapse early.
    y_true = []
    y_pred = []
    for batch_x, batch_y in val_dataset:
        probs = model.predict(batch_x, verbose=0)
        y_true.extend(np.argmax(batch_y.numpy(), axis=1))
        y_pred.extend(np.argmax(probs, axis=1))
    cm = tf.math.confusion_matrix(y_true, y_pred, num_classes=len(class_names)).numpy().tolist()

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
                "confusion_matrix": cm,
                "history": {
                    "accuracy": [float(x) for x in history.history.get("accuracy", [])],
                    "val_accuracy": [float(x) for x in history.history.get("val_accuracy", [])],
                    "loss": [float(x) for x in history.history.get("loss", [])],
                    "val_loss": [float(x) for x in history.history.get("val_loss", [])],
                    "fine_tune_accuracy": [
                        float(x) for x in fine_tune_history.history.get("accuracy", [])
                    ],
                    "fine_tune_val_accuracy": [
                        float(x) for x in fine_tune_history.history.get("val_accuracy", [])
                    ],
                    "fine_tune_loss": [
                        float(x) for x in fine_tune_history.history.get("loss", [])
                    ],
                    "fine_tune_val_loss": [
                        float(x) for x in fine_tune_history.history.get("val_loss", [])
                    ],
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
