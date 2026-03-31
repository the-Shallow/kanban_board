export type Priority = "low" | "medium" | "high";
export type ColumnId = "todo" | "in-progress" | "in-review" | "done";

export interface Board {
    id:string;
    name:string;
    description?: string | null;
    created_at?: string;
}

export interface Comment {
    id: string;
    content:string;
    created_at: string;
}

export type ActivityType = "task_created" | "status_changed" | "priority_changed" | "due_date_changed" | "label_added" | "label_removed" | "comment_added";

export interface ActivityItem {
    id:string;
    activity_type: ActivityType;
    created_at: string;
    detail?: string;
}

export interface Task {
    id: string;
    title:string;
    description?: string;
    priority?: Priority;
    dueDate?: string;
    columnId: ColumnId;
    comments?: Comment[];
    activity?: ActivityItem[];
}

export interface Column {
    id:ColumnId;
    title: string;
}

export const COLUMNS: Column[] = [
    { id:"todo", title:"To Do"},
    { id:"in-progress", title:"In Progress"},
    { id:"in-review", title:"In Review"},
    { id:"done", title:"Done"},
];

export const SAMPLE_TASKS: Task[] = [
  { id: '1', title: 'Design landing page wireframes', priority: 'high', dueDate: '2026-03-28', columnId: 'todo' },
  { id: '2', title: 'Set up CI/CD pipeline', priority: 'medium', columnId: 'todo' },
  { id: '3', title: 'Write API documentation', priority: 'low', dueDate: '2026-04-02', columnId: 'todo' },
  { id: '4', title: 'Implement user authentication', priority: 'high', dueDate: '2026-03-27', columnId: 'in-progress' },
  { id: '5', title: 'Database schema migration', priority: 'medium', columnId: 'in-progress' },
  { id: '6', title: 'Code review: payment module', priority: 'high', dueDate: '2026-03-26', columnId: 'in-review' },
  { id: '7', title: 'Unit tests for auth service', priority: 'medium', columnId: 'in-review' },
  { id: '8', title: 'Project setup and scaffolding', priority: 'low', columnId: 'done' },
  { id: '9', title: 'Define color palette and tokens', priority: 'low', columnId: 'done' },
];