from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import boards, tasks, task_activity, comments

app = FastAPI(title="Kanban Board");

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://kanban-board-hazel-seven-44.vercel.app/"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(boards.router, prefix="/api/boards");
app.include_router(tasks.router, prefix="/api/tasks");
app.include_router(comments.router, prefix="/api/comments");
app.include_router(task_activity.router, prefix="/api/task-activity-logs");
# app.include_router(boards.router, prefix="/api/boards");