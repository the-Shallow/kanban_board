from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.core.deps import get_user_supabase_client
from app.schemas.comment import CommentCreate

router = APIRouter()

@router.get("")
def list_comment(
    task_id: str = Query(...),
    deps: tuple[Client,str] = Depends(get_user_supabase_client)
):
    supabase, user_id = deps
    response = (
        supabase.table("comments").select("*").eq("task_id", task_id).order("created_at").execute()
    )

    return response.data


@router.post("")
def create_comment(payload: CommentCreate, deps: tuple[Client,str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    # user_response = supabase.auth.get_user()
    # user = user_response.user

    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")
    
    insert_payload = {
        "user_id": user_id,
        "task_id": payload.task_id,
        "content": payload.content
    }
    # print(insert_payload)
    response = supabase.table("comments").insert(insert_payload).execute()
    return response.data[0]