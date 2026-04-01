"""
This module defines Pydantic models for linking labels to tasks.
It is used to manage many-to-many relationships between tasks
and labels.
"""
from datetime import datetime
from pydantic import BaseModel, Field

class TaskLabelCreate(BaseModel):
    task_id: str
    label_id:str

class TaskLabelResponse(BaseModel):
    task_id: str
    label_id:str
    created_at: datetime