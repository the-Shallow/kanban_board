from datetime import datetime
from pydantic import BaseModel, Field

class LabelCreate(BaseModel):
    board_id: str
    name: str = Field(min_length=1, max_length=50)
    color: str = "#6B7280"

class LabelUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    color: str | None = None

class LabelResponse(BaseModel):
    id:str
    user_id: str
    board_id:str
    name:str
    color:str
    created_at: datetime