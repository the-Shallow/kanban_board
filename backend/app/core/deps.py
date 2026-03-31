from fastapi import Header, HTTPException
from .supabase import get_supabase_client

def get_user_supabase_client(authorization:str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "").strip()
    supabase = get_supabase_client()
    supabase.postgrest.auth(token)

    user_response = supabase.auth.get_user(token)
    user = user_response.user

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return supabase, user.id