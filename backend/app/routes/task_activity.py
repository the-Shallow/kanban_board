from supabase import Client
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from ..core.deps import get_user_supabase_client

router = APIRouter()

def create_logs(supabase:Client, user_id:str, task_id:str, action_type:str, message:str, old_value:dict | None = None, new_value: dict | None = None):
    payload = {
        "user_id": user_id,
        "task_id": task_id,
        "action_type": action_type,
        "message": message,
        "old_value": old_value,
        "new_value": new_value
    }

    supabase.table("task_activity_logs").insert(payload).execute()


@router.get("")
def get_task_activity(task_id:str, deps:tuple[Client, str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    result = (
        supabase.table("task_activity_logs").select("*").eq("task_id", task_id).eq("user_id", user_id).order("created_at", desc=True).execute()
    )

    return result.data or []