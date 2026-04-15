import os
import subprocess
import sys


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)


def _run(cmd: str) -> bool:
    print(f"$ {cmd}")
    result = subprocess.run(cmd, shell=True)
    return result.returncode == 0


def detect_dataset() -> str:
    candidates = [
        os.path.join(PROJECT_ROOT, "dataset"),
        os.path.join(PROJECT_ROOT, "Dataset"),
    ]
    for path in candidates:
        if not os.path.isdir(path):
            continue
        child_dirs = {
            name.strip().lower()
            for name in os.listdir(path)
            if os.path.isdir(os.path.join(path, name))
        }
        if {"joy", "sad"}.issubset(child_dirs):
            return path
    return os.path.join(PROJECT_ROOT, "dataset")


def main() -> None:
    print("BrightBridge - Quick Emotion Training")
    print("=" * 60)

    dataset_path = detect_dataset()
    print(f"Detected dataset path: {dataset_path}")
    if not os.path.isdir(dataset_path):
        print("Dataset folder not found. Create dataset first, then run again.")
        sys.exit(1)

    epochs_raw = input("Epochs (default 25): ").strip()
    batch_raw = input("Batch size (default 32): ").strip()
    size_raw = input("Image size (default 128): ").strip()

    epochs = int(epochs_raw) if epochs_raw else 25
    batch = int(batch_raw) if batch_raw else 32
    image_size = int(size_raw) if size_raw else 128

    cmd = (
        f"\"{sys.executable}\" \"{os.path.join(BASE_DIR, 'train_emotion_cnn.py')}\" "
        f"--dataset \"{dataset_path}\" --epochs {epochs} --batch-size {batch} --image-size {image_size}"
    )
    ok = _run(cmd)
    if not ok:
        print("Training failed.")
        sys.exit(1)

    print("\nTraining complete.")
    print("Model files saved under: backend/models")
    print("Start backend with: python backend/app.py")


if __name__ == "__main__":
    main()
