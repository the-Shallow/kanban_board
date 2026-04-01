"""
This module provides a utility function to extract and validate a user
from the Authorization header (Bearer token). It initializes a Supabase
client with the user's JWT and ensures the request is authenticated.

Used as a dependency in protected API routes.
"""
from fastapi import Header, HTTPException
from .supabase import get_supabase_client

def get_user_supabase_client(authorization:str = Header(...)):
    """
    Extracts and validates the authenticated user from the Authorization header.

    This function:
    1. Validates the presence and format of the Bearer token.
    2. Initializes a Supabase client with the user's JWT.
    3. Verifies the user using Supabase Auth.
    4. Returns the authenticated Supabase client and user ID.

    Args:
        authorization (str): Authorization header containing Bearer token.

    Returns:
        tuple: (supabase client instance, user_id)

    Raises:
        HTTPException:
            - 401 if Authorization header is invalid or missing Bearer token
            - 401 if user is not found or token is invalid
    """
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