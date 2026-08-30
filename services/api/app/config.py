from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


API_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=API_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "Springboard UK API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/springboard_db"
    
    JWT_SECRET_KEY: str = "springboard-super-secret-uk-mvp-key-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    SECRET_KEY: str = "springboard-super-secret-uk-mvp-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Gemini API Configuration (optional for standalone/offline mock agent mode)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    SEMANTIC_SKILLS_ENABLED: bool = True
    SEMANTIC_EMBEDDING_DIMENSIONS: int = 768
    SEMANTIC_ALIAS_THRESHOLD: float = 0.96
    SEMANTIC_RELATIONSHIP_THRESHOLD: float = 0.72
    SEMANTIC_CATEGORY_THRESHOLD: float = 0.90

    CORS_ORIGINS: List[str] = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ]


settings = Settings()
