from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SUPERBASE_PROJECT_URL: str
    SUPERBASE_PUBLIC_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()