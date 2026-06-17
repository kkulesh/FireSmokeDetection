from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "Fire and Smoke Detection System"
    VERSION: str = "1.0.0"

    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True

    # YOLO model settings
    MODEL_PATH: str = "weights/best.pt"
    CONFIDENCE_THRESHOLD: float = 0.1

    # Video source settings
    DEFAULT_CAMERA_SOURCE: int = 0

    # WebSocket settings
    MAX_CONNECTIONS: int = 10

    # Robot connection settings
    ROBOT_IP: str = "192.168.1.100"
    ROBOT_PORT: int = 5000


    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()