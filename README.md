# 🧩 Kanban Board Application

A full-stack Kanban board application built with **React, FastAPI, and Supabase**, supporting task management, activity tracking, and scalable backend design.

---

## 🚀 Live Demo
🔗 https://kanban-board-hazel-seven-44.vercel.app  

## 📂 GitHub Repository
🔗 https://github.com/the-Shallow/kanban_board

---

## 🏗️ Tech Stack

### Frontend
- React + TypeScript (Vite)
- Tailwind CSS
- Drag-and-drop UI (Kanban board)

### Backend
- FastAPI (Python)
- Pydantic (data validation)
- Dependency Injection for auth

### Database & Auth
- Supabase (PostgreSQL)
- Row-Level Security (RLS)

---

## ✨ Features

### ✅ Core Features
- Create and manage boards
- Create, update, delete tasks
- Drag-and-drop task movement across columns
- Task ordering using position-based system

---

### 🚀 Advanced Features

#### 📝 Task Comments
- Add comments to tasks
- Stored in a dedicated table
- Retrieved in chronological order

#### 📜 Task Activity Logs
- Tracks task creation, updates, and status changes
- Stores `old_value` and `new_value`
- Enables activity timeline

#### 🏷️ Labels (Backend Ready)
- Many-to-many relationship between tasks and labels
- Backend fully implemented
- Frontend integration pending

#### ⏰ Due Date Indicators
- Highlights overdue and upcoming tasks

#### 🔍 Search & Filtering
- Search tasks by title
- Filter tasks by priority

#### 📊 Board Summary
- Displays:
  - Total tasks
  - Completed tasks
  - Overdue tasks

---

## 🗄️ Database Schema

### Key Tables

- **boards** → Stores user boards  
- **tasks** → Linked to boards, includes status, priority, position  
- **comments** → Task-level discussions  
- **task_activity_logs** → Tracks task changes  
- **labels** → Custom labels  
- **task_labels** → Many-to-many relation  

---

## ⚙️ Setup Instructions

### 1. Clone Repository
git clone https://github.com/the-Shallow/kanban_board <br>
cd kanban_board

### 2. Backend Setup
cd backend <br>
python -m venv venv <br>
source venv/bin/activate   # Windows: venv\Scripts\activate <br>
pip install -r requirements.txt 

### 3. ENV File
SUPERBASE_PROJECT_URL=your_url <br>
SUPERBASE_PUBLIC_KEY=your_key

### 4. Run Backend
uvicorn app.main:app --reload

### 5. Frontend Setup
cd frontend <br>
npm install <br>
npm run dev <br>

## 🔐 Security
- Uses Supabase authentication with JWT
- Row-Level Security (RLS) enforced at database level
- No sensitive keys exposed in frontend

## ⚖️ Tradeoffs
- Labels feature is backend-complete but not fully integrated in UI
- Minimal pagination and error standardization

## 🚀 Future Improvements
- Full frontend integration for labels
- Team members & task assignees
- Advanced filtering (labels)




