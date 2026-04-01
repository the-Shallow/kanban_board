"""
This module provides utilities for tracking task-related actions such as
creation, updates, and status changes. It also exposes an API endpoint
to fetch activity logs for a specific task, ensuring logs are scoped to
the authenticated user.
"""
from supabase import Client
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from ..core.deps import get_user_supabase_client

router = APIRouter()

def create_logs(supabase:Client, user_id:str, task_id:str, action_type:str, message:str, old_value:dict | None = None, new_value: dict | None = None):
    """
    Create a task activity log entry.

    This function:
    1. Constructs a log payload with action metadata.
    2. Inserts the log into the "task_activity_logs" table.

    Args:
        supabase (Client): Supabase client instance.
        user_id (str): ID of the user performing the action.
        task_id (str): ID of the associated task.
        action_type (str): Type of action (e.g., "task_created", "task_updated").
        message (str): Human-readable description of the action.
        old_value (dict | None): Previous state (for updates).
        new_value (dict | None): New state (for updates).

    Returns:
        None
    """
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
    """
    Retrieve activity logs for a specific task.

    This endpoint:
    1. Validates the authenticated user.
    2. Fetches all activity logs for the given task.
    3. Filters logs by user to ensure data isolation.
    4. Orders logs by creation time (most recent first).

    Args:
        task_id (str): ID of the task.
        deps (tuple): Contains (Supabase client, user_id).

    Returns:
        list: List of activity log records (empty if none found).
    """
    supabase, user_id = deps
    result = (
        supabase.table("task_activity_logs").select("*").eq("task_id", task_id).eq("user_id", user_id).order("created_at", desc=True).execute()
    )

    return result.data or []