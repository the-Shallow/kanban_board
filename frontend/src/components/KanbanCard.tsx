import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import type { Task } from "@/types/kanban_types";
import type React from "react";
import {parse, format} from "date-fns";

const priorityConfig = {
    low: {label:"Low", className:"bg-priority-low/15 text-priority-low"},
    medium: {label:"Med", className:"bg-priority-medium/15 text-priority-medium"},
    high: {label:"High", className:"bg-priority-high/15 text-priority-high"},
};

function dueDateUrgency(dueDate: string) : "overdue" | "soon" | "future" {
    const now = new Date();
    now.setHours(0,0,0,0);
    // const due = new Date(dueDate);
    const due = parse(dueDate, "yyyy-MM-dd", new Date());
    due.setHours(0,0,0,0);
    const diffDays = (due.getTime() - now.getTime()) / (1000*60*60*24);
    if(diffDays < 0) return "overdue";
    if (diffDays <= 2) return "soon";
    return "future";
}

const urgencyStyles = {
    overdue: "text-destructive",
    soon : "text-priority-medium",
    future: "text-muted-foreground"
};

interface KanbanCardProps {
    task: Task;
    onClick? : (task:Task) => void;
}

export function KanbanCard({task, onClick}: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: task.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleClick = (e:React.MouseEvent) => {
        if (!isDragging && onClick){
            onClick(task);
        }
    };

    const urgency = task.dueDate ? dueDateUrgency(task.dueDate) : null;
    // const visibleLabels = (task.lab)

    return (
        <div 
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className={`group rounded-lg border border-border bg-card p-3.5 cursor-grab active:cursor-grabbing
        transition-all duration-150 ease-out
        hover:bg-card-hover hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20
        ${isDragging ? "opacity-50 shadow-xl shadow-black/30 scale-[1.02] bg-card-drag z-50" : ''}`}    
        >
            <p className="text-sm font-medium text-foreground leading-snug mb-2">{task.title}</p>
            <div className="flex items-center gap-2">{
                task.priority && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${priorityConfig[task.priority].className}`}>{priorityConfig[task.priority].label}</span>
                )
            }
            {task.dueDate && urgency && (
                <span className={`flex items-center gap-1 text-[11px] font-medium ${urgencyStyles[urgency]}`}>
                    <Calendar className="w-3 h-3"></Calendar>
                    {format(parse(task.dueDate, "yyyy-MM-dd", new Date()), "MMM d")}
                </span>
            )}
            </div>
        </div>
    )
};