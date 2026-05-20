from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "Kenya Financial Intelligence System"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:3000",]

    # Database
    DATABASE_URL: str
    DATABASE_URL_SYNC: str

    DB_SSL_CA: str | None = None   # optional CA cert path
    DB_SSL_MODE: str = "require"   # Aiven needs 'require' or 'verify-ca'

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AI
    ANTHROPIC_API_KEY: str
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIM: int = 384

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_PDFS: str = "cbk-pdfs"
    MINIO_BUCKET_REPORTS: str = "fund-reports"

    # External APIs
    NEWS_API_KEY: str = ""
    YAHOO_FINANCE_BASE: str = "https://query1.finance.yahoo.com/v8/finance/chart"

    # WhatsApp bridge
    WHATSAPP_WEBHOOK_SECRET: str = "change-me"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
