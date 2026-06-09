
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str = "postgresql+asyncpg://dermatrace:dermatrace@localhost:5432/dermatrace"
    CORS_ORIGINS: str = '["http://localhost:19006","http://localhost:8081"]'
    AI_SERVICE_URL: str = ""

    def get_cors_origins(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return ["http://localhost:19006"]

    class Config:
        env_file = ".env"

settings = Settings()
