from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    task_id: str
    content: str = Field(min_length=1)

class CommentResponse(BaseModel):
    id:str
    user_id:str
    task_id:str
    content:str
    created_at: datetime
    updated_at: datetime