"""
This module defines a Settings class that loads This module defines a Settings class that loads environment variables
using Pydantic's BaseSettings. It reads values from a `.env` file and
provides type-safe access to required configuration such as Supabase
credentials.
"""
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