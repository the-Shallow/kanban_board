from datetime import datetime
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    board_id: str
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status : str = "todo"
    priority: str = "medium"
    dueDate: datetime |  None = None
    position: int = 0

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = None
    priority : str | None = None
    dueDate : datetime | None = None
    position : int | None = None


class TaskLabelItem(BaseModel):
    id:str
    name:str
    color:str

class TaskResponse(BaseModel):
    id:str
    user_id:str
    board_id: str
    title: str
    description: str | None = None
    status : str
    priority: str
    dueDate: datetime | None = None
    position: int
    created_at: datetime
    updated_at: datetime
    labels: list[TaskLabelItem] = []