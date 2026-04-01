"""
This module provides a utility function to create and return a Supabase
client instance using project credentials defined in application settings.
It centralizes client creation for reuse across the application.
"""
from supabase import Client, create_client
from app.core.config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPERBASE_PROJECT_URL, settings.SUPERBASE_PUBLIC_KEY)