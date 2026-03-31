from supabase import Client, create_client
from app.core.config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPERBASE_PROJECT_URL, settings.SUPERBASE_PUBLIC_KEY)