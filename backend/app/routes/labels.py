from fastapi import APIRouter, Depends,HTTPException, Query
from supabase import Client
from ..schemas.label import LabelCreate, LabelUpdate, LabelResponse
from ..core.deps import get_user_supabase_client
import random

LABEL_COLORS = [
    "#EF4444",  # red
    "#F97316",  # orange
    "#EAB308",  # yellow
    "#22C55E",  # green
    "#3B82F6",  # blue
    "#8B5CF6",  # purple
    "#EC4899",  # pink
    "#6B7280",  # gray
]

def get_random_color():
    return random.choice(LABEL_COLORS)

router = APIRouter()

@router.post("")
def create_label(payload:LabelCreate, deps: tuple[Client, str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    insert_payload = {
        "user_id":user_id,
        "board_id": payload.board_id,
        "name": payload.name,
        "color": get_random_color()
    }

    result = supabase.table("labels").insert(insert_payload).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create label")
    
    return result.data[0]

@router.get("")
def get_labels(board_id:str = Query(...), deps: tuple[Client, str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    result = (
        supabase.table("labels").select("*").eq("board_id",board_id).eq("user_id",user_id).order("created_at").execute()
    )

    return result.data or []

@router.patch("/{label_id}")
def update_label(label_id:str, payload:LabelUpdate, deps: tuple[Client, str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")
    
    result = (
        supabase.table("labels").update(update_data).eq("id", label_id).eq("user_id", user_id).execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Label not found")
    
    return result.data[0]

@router.delete("/{label_id}")
def delete_label(label_id:str, deps: tuple[Client,str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    result = (
        supabase.table("labels").delete().eq("id", label_id).eq("user_id", user_id).execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Label not found")
    
    return {"message": "Label delete successfully."}