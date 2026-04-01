"""
This module defines Pydantic models used for creating boards and
serializing board data returned from the API.
"""
from datetime import datetime
from pydantic import BaseModel

class BoardCreate(BaseModel):
    name:str
    description: str | None = None


class BoardResponse(BaseModel):
    id:str
    user_id:str
    name:str
    description: str | None = None
    created_at: datetime
    updated_at : datetime