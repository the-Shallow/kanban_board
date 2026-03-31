import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, ColumnId } from "@/types/kanban_types";
import { KanbanCard } from "./KanbanCard";

const columnBg: Record<ColumnId, string> = {
    "todo": "bg-column-todo",
    "in-progress": "bg-column-progress",
    "in-review": "bg-column-review",
    "done": "bg-column-done",
};

interface KanbanColumnProps {
    id: ColumnId;
    title: string;
    tasks: Task[];
    onTaskClick? : (task: Task) => void;
}

export function KanbanColumn({id, title, tasks, onTaskClick}: KanbanColumnProps) {
    const {setNodeRef, isOver} = useDroppable({id});

    return (
        <div className={`flex flex-col rounded-xl ${columnBg[id]} min-w-[280px] w-[300px] shrink-0 transition-colors duration-200
        ${isOver ? "ring-1 ring-primary/30": ""}`}>

            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
            </div>


            <div ref={setNodeRef}
                className="flex-1 flex flex-col gap-2 px-3 pb-3 pt-1 min-h-[120px]"
            >
                <SortableContext items={tasks.map(t=> t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.length == 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-xs text-muted-foreground/60">No tasks yet</p>
                        </div>
                    ) : (
                        tasks.map(task => <KanbanCard key={task.id} task={task} onClick={onTaskClick} />)
                    )}
                </SortableContext>
            </div>
        </div>
    );
};