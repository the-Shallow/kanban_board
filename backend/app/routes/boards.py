from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.deps import get_user_supabase_client
from app.schemas.board import BoardCreate

router = APIRouter()

@router.post("")
def create_board(payload: BoardCreate, deps: tuple[Client, str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    # user_response = supabase.auth.get_user()
    # user = user_response.user

    # if not user:
        # raise HTTPException(status_code=401, detail="User not found")
    
    insert_payload = {
        "user_id": user_id,
        "name": payload.name,
        "description": payload.description
    }

    response = supabase.table("boards").insert(insert_payload)
    return response.data[0]

@router.post("/default")
def default_board(deps: tuple[Client,str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps

    existing = (
        supabase.table("boards").select("*").order("created_at").limit(1).execute()
    )

    print(existing)

    if existing.data:
        return existing.data[0]
    
    insert_payload = {
        "user_id": user_id,
        "name": "Default Board",
        "description": "Default Board"
    }

    created = supabase.table("boards").insert(insert_payload).execute()
    return created.data[0]