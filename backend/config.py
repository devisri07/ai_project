import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _resolve_path(value: str) -> str:
    if os.path.isabs(value):
        return value
    return os.path.normpath(os.path.join(BASE_DIR, value))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret-change-me")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URI",
        f"sqlite:///{os.path.join(BASE_DIR, 'magic_mirror.db').replace(os.sep, '/')}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    EMOTION_MODEL_PATH = _resolve_path(
        os.getenv("EMOTION_MODEL_PATH", os.path.join("models", "emotion_cnn.keras"))
    )
    CLASS_NAMES_PATH = _resolve_path(
        os.getenv("CLASS_NAMES_PATH", os.path.join("models", "emotion_class_names.json"))
    )
    USE_DEEPFACE_EMOTION = os.getenv("USE_DEEPFACE_EMOTION", "false").lower() == "true"
    EMOTION_USE_FACE_CROP = os.getenv("EMOTION_USE_FACE_CROP", "false").lower() == "true"
    EMOTION_FORCE_GRAYSCALE = os.getenv("EMOTION_FORCE_GRAYSCALE", "true").lower() == "true"

    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
