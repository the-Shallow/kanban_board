from fastapi import APIRouter,HTTPException, Depends
from ..schemas.task_label import TaskLabelCreate, TaskLabelResponse
from supabase import Client
from ..core.deps import get_user_supabase_client

router = APIRouter()

@router.post("/tasks/{task_id}/labels/{label_id}")
def add_label_task(task_id: str, label_id:str, deps: tuple[Client, str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    task_result = (
        supabase.table("tasks").select("id", "board_id", "user_id").eq("id",task_id).eq("user_id",user_id).execute()
    )

    if not task_result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = task_result.data[0]

    label_result = (
        supabase.table("labels").select("id","board_id","user_id").eq("id", label_id).eq("user_id", user_id).execute()
    )


    if not label_result.data:
        raise HTTPException(status_code=404, detail="Label not found")
    
    label = label_result.data[0]
    if task["board_id"] != label["board_id"]:
        raise HTTPException(status_code=400, detail="Label and task must belong to the same board")
    
    existing = (
        supabase.table("task_labels").select("task_id","label_id").eq("task_id", task_id).eq("label_id",label_id).execute()
    )

    if existing.data:
        raise HTTPException(status_code=400, detail="Label already attached to task")
    
    result = (
        supabase.table("task_labels").insert({
            "task_id":task_id,
            "label_id":label_id
        }).execute()
    )

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to attach label to task")
    
    return result.data[0]


@router.delete("/tasks/{task_id}/labels/{label_id}")
def remove_label_task(task_id:str, label_id:str, deps: tuple[Client,str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    task_result = (
        supabase.table("tasks").select("id").eq("id",task_id).eq("user_id",user_id).execute()
    )

    if not task_result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    result = (
        supabase.table("task_labels").delete().eq("task_id", task_id).eq("label_id",label_id).execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Task label association not found")
    
    return {"message": "Label removed from task"}


@router.get("/tasks/{task_id}/labels")
def get_labels_task(task_id: str, deps: tuple[Client,str] = Depends(get_user_supabase_client)):
    supabase, user_id = deps
    task_result = (
        supabase.table("tasks").select("id").eq("id",task_id).eq("user_id",user_id).execute()
    )

    if not task_result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    result = (
        supabase.table("task_labels").select("created_at, labels(id,name,color)").eq("task_id",task_id).execute()
    )

    return result.data or []