"""
This module provides endpoints for creating, retrieving, updating,
and deleting tasks. It supports filtering, ordering, and integrates
with task activity logging to track changes such as creation,
updates, and status transitions.

All operations are scoped to authenticated users via Supabase.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from ..core.deps import get_user_supabase_client
from .task_activity import create_logs
from ..schemas.task import TaskCreate, TaskResponse, TaskUpdate


router = APIRouter()

@router.get("")
def list_tasks(
    board_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
    deps: tuple[Client, str] = Depends(get_user_supabase_client)
):
    """
    Retrieve tasks with optional filtering.

    This endpoint:
    1. Fetches all tasks for the authenticated user.
    2. Optionally filters by board_id and/or status.
    3. Orders tasks by position (for Kanban ordering).

    Args:
        board_id (str | None): Filter tasks by board ID.
        status (str | None): Filter tasks by status column.
        deps (tuple): Contains (Supabase client, user_id).

    Returns:
        list: List of task records.
    """
    supabase, user_id = deps
    query = supabase.table("tasks").select("*")

    if board_id:
        query = query.eq("board_id", board_id)
    if status:
        query = query.eq("status", status)

    response = query.order("position").execute()
    return response.data

@router.get("/{task_id}")
def get_task(task_id:str, deps:tuple[Client,str] = Depends(get_user_supabase_client)):
    """
    Retrieve a single task by ID.

    Args:
        task_id (str): ID of the task.
        deps (tuple): Contains (Supabase client, user_id).

    Returns:
        dict: Task record.

    Raises:
        HTTPException: If task is not found.
    """
    supabase, user_id = deps
    response = supabase.table("tasks").select("*").eq("id", task_id).limit(1).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return response.data[0]

@router.post("")
def create_task(payload:TaskCreate, deps:tuple[Client, str] = Depends(get_user_supabase_client)):
    """
    Create a new task.

    This endpoint:
    1. Validates the authenticated user.
    2. Inserts a new task into the database.
    3. Logs the task creation event.

    Args:
        payload (TaskCreate): Task creation data.
        deps (tuple): Contains (Supabase client, user_id).

    Returns:
        dict: Newly created task.

    Raises:
        HTTPException:
            - 401 if user is not authenticated
            - 400 if task creation fails
    """
    supabase, user_id = deps

    if not user_id:
        raise HTTPException(status_code=401, detail="User not found")
       
    insert_payload = {
        "user_id": user_id,
        "board_id": payload.board_id,
        "title": payload.title,
        "description": payload.description,
        "status": payload.status,
        "priority": payload.priority,
        "dueDate": payload.dueDate.isoformat(),
        "position": payload.position,
    }

    response = supabase.table("tasks").insert(insert_payload).execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="Task creation failed")
    
    task = response.data[0]
    create_logs(
        supabase,
        user_id=user_id,
        task_id=task["id"],
        action_type="task_created",
        message=f"Task {task["title"]} created",
        new_value=task
    )
    return task



@router.patch("/{task_id}")
def update_task(
    task_id:str,
    payload: TaskUpdate,
    deps: tuple[Client, str] = Depends(get_user_supabase_client),
):
    """
    Update an existing task.

    This endpoint:
    1. Fetches the existing task.
    2. Applies partial updates.
    3. Logs either a status change or general update.

    Args:
        task_id (str): ID of the task.
        payload (TaskUpdate): Fields to update.
        deps (tuple): Contains (Supabase client, user_id).

    Returns:
        dict: Updated task.

    Raises:
        HTTPException: If task is not found.
    """
    supabase, user_id = deps

    existing_response = (
        supabase.table("tasks").select("*").eq("id", task_id).limit(1).execute()
    )

    if not existing_response.data:
        return HTTPException(status_code=404, detail="Task not found")
    
    existing_task = existing_response.data[0]
    update_payload = payload.model_dump(exclude_none=True)
    print(update_payload)
    if "dueDate" in update_payload and update_payload["dueDate"] is not None:
        update_payload["dueDate"] = update_payload["dueDate"].isoformat()
    response = (
        supabase.table("tasks").update(update_payload).eq("id", task_id).execute()
    )

    if not  response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_task = response.data[0]

    if "status" in update_payload and update_payload["status"] != existing_task["status"]:
        create_logs(
            supabase=supabase,
            user_id=user_id,
            task_id=task_id,
            action_type="status change",
            message=f"Status changed from {existing_task["status"]} to {update_task["status"]}",
            old_value={"status": existing_task["status"]},
            new_value={"status": update_task["status"]}
        )
    else:
        create_logs(
            supabase=supabase,
            user_id=user_id,
            task_id=task_id,
            action_type="task_updated",
            message=f"Task {update_task["title"]} updated",
            old_value=existing_task,
            new_value=update_task
        )
    return update_task

@router.delete("/{task_id}")
def delete_task(task_id: str, supabase:Client = Depends(get_user_supabase_client)):
    """
    Delete a task by ID.

    Args:
        task_id (str): ID of the task.
        supabase (Client): Supabase client instance.

    Returns:
        dict: Confirmation message.

    Raises:
        HTTPException: If task is not found.
    """
    response = supabase.table("tasks").delete().eq("id", task_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted successfully"}