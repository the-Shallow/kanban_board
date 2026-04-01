"""
This module provides endpoints for listing and creating comments
associated with tasks. It integrates with Supabase for database
operations and ensures all actions are performed by authenticated users.
"""
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
    """
    Retrieve all comments for a specific task.

    This endpoint:
    1. Accepts a task_id as a query parameter.
    2. Fetches all comments linked to the task.
    3. Orders comments by creation time (ascending).

    Args:
        task_id (str): ID of the task whose comments are to be fetched.
        deps (tuple): Contains (Supabase client, user_id).

    Returns:
        list: List of comment records associated with the task.
    """
    supabase, user_id = deps
    response = (
        supabase.table("comments").select("*").eq("task_id", task_id).order("created_at").execute()
    )

    return response.data


@router.post("")
def create_comment(payload: CommentCreate, deps: tuple[Client,str] = Depends(get_user_supabase_client)):
    """
    Create a new comment for a task.

    This endpoint:
    1. Validates the authenticated user.
    2. Constructs a comment payload using request data.
    3. Inserts the comment into the Supabase "comments" table.

    Args:
        payload (CommentCreate): Request body containing comment details.
        deps (tuple): Contains (Supabase client, user_id).

    Returns:
        dict: Newly created comment record.

    Raises:
        HTTPException:
            - 401 if user is not authenticated.
    """
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