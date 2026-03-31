from datetime import datetime
from pydantic import BaseModel, Field

class TaskLabelCreate(BaseModel):
    task_id: str
    label_id:str

class TaskLabelResponse(BaseModel):
    task_id: str
    label_id:str
    created_at: datetime