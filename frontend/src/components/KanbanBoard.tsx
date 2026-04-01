
import { useState, useCallback, useEffect, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
 } from "@/components/ui/select";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanBoardSkeleton } from "./KanbanBoardSkeleton";
import { KanbanCard } from "./KanbanCard";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { COLUMNS, SAMPLE_TASKS, type ColumnId, type Task, type Board, type Priority } from "@/types/kanban_types";
import { NewTaskDialog } from "./NewTaskDialog";
import { api } from "@/lib/api";


export function KanbanBoard() {
    const [boards, setBoards] = useState<Board>();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [dialogOpen, setDiaglogOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
    // const [labelFilter, setLabelFilter] = useState()

    useEffect(() => {
        async function loadBoard() {
            try {
                const boardData = await api.post("/boards/default");
                setBoards(boardData);
            }catch(err){
                console.log(err);
            }finally {
                setLoading(false);
            }
        }

        loadBoard();
    }, []);

    useEffect(() => {
        async function loadTasks() {
            if(!boards) return;

            try{
                // console.log(boards)
                const taskData = await api.get(`/tasks?board_id=${boards.id}`);

                const mappedTasks = taskData.map((task:any) => ({
                    ...task,
                    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : undefined,
                    columnId: task.status
                }));

                setTasks(mappedTasks);
            }catch(err){
                console.log(err);
            }
        }

        loadTasks();
    }, [boards]);


    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint : {distance : 5}})
    );

    const  filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            if(search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
            if(priorityFilter !== "all" && t.priority !== priorityFilter) return false;
            return true;
        });
    }, [tasks, search, priorityFilter]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter(t => t.columnId === "done").length;
        const overdue = tasks.filter(t => {
            return new Date(t.dueDate) < new Date() && t.columnId !== "done";
        }).length;
        return {total, done, overdue};
    }, [tasks]);


    const getColumnTasks = useCallback(
        (columnId: ColumnId) => filteredTasks.filter(t => t.columnId === columnId),
        [filteredTasks]
    );

    const hasFilters = search || priorityFilter !== "all";

    const clearFilters = () => {
        setSearch("")
        setPriorityFilter("all");
    }

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        if(task) setActiveTask(task);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const {active, over} = event;
        // console.log(active, over);
        if(!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        const activeTask = tasks.find(t => String(t.id) === activeId);
        if(!activeTask) return;

        const isOverColumn = COLUMNS.some(c => c.id === overId);
        // console.log("Is over column?", isOverColumn);
        // console.log("Active task:", activeTask);

        if(isOverColumn){
            const targetColumnId = overId as ColumnId;
            // console.log("Target column id:", targetColumnId);
            if(activeTask.columnId !== targetColumnId){
                setTasks(prev => 
                    prev.map(t => (t.id === activeId ? {...t, columnId: targetColumnId} : t))
                );
            }
            return;
        }

        const overTask = tasks.find(t => String(t.id) === overId);
        // console.log("Over task:", overTask);
        // console.log("Active task:", activeTask);
        if(overTask && activeTask.columnId !== overTask.columnId){
            setTasks(prev => 
                prev.map(t => (t.id === activeId ? {...t, columnId: overTask.columnId}: t))
            );
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        setActiveTask(null);

        if(!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find(t => t.id === activeId);
        if(!activeTask) return;
        const overTask = tasks.find(t => t.id === overId);

        const isOverColumn = COLUMNS.some(c => c.id === overId);

        if(isOverColumn){
            const targetColumnId = overId as ColumnId;
            if(activeTask.columnId !== targetColumnId){
                setTasks(prev => prev.map(t => String(t.id) === activeId ? {...t, columnId: targetColumnId} : t));

                await api.patch(`/tasks/${activeTask.id}`, {
                    status: targetColumnId
                });
            }

            return;
        }

        if(!overTask) return;

        if(activeTask.columnId !== overTask.columnId) {
            const targetColumnId = overTask.columnId;
            setTasks(prev  => prev.map(t => String(t.id) === activeId ? {...t, columnId: targetColumnId} : t));

            await api.patch(`/tasks/${activeTask.id}`, {
                status: targetColumnId
            });
            
            return;
        }

        if(activeId && overTask && activeTask?.columnId == overTask.columnId){
            const columnTasks = getColumnTasks(activeTask.columnId);
            const oldIndex = columnTasks.findIndex(t => t.id == activeId);
            const newIndex = columnTasks.findIndex(t => t.id === overId);
            const reordered = arrayMove(columnTasks, oldIndex, newIndex);

            setTasks(prev => {
                const otherTasks = prev.filter(t => t.columnId !== activeTask.columnId);
                return [...otherTasks, ...reordered];
            });

            await Promise.all(
                reordered.map((task, index)=> api.patch(`/tasks/${task.id}`, {
                    position: index,
                    status: task.columnId
                }))
            )
        }
    };

    const handleAddTask = async (title : string, priority? : Task["priority"], description?:string, dueDate?: string) => {
        // const newTask : Task = {
        //     // id: crypto.randomUUID(),
        //     title,
        //     priority,
        //     columnId: "todo",
        // };

        const createdTask = await api.post("/tasks", {
            board_id: boards.id,
            title,
            description: description ?? null,
            priority: priority ?? "medium",
            dueDate: dueDate ?? null,
            status: "todo",
            position: 0,
        });

        const mappedTask = {
            ...createdTask,
            columnId: createdTask.status,
        }
        setTasks(prev => [mappedTask, ...prev]);
    };

    const handleTaskClick = (task : Task) => {
        setSelectedTask(task);
    }

    const handleTaskUpdate = async (updated : Task) => {
        console.log("Updating task:", updated);
        const updatedTask = await api.patch(`/tasks/${updated.id}`, {
            title: updated.title,
            description: updated.description,
            status: updated.columnId,
            priority: updated.priority,
            dueDate: updated.dueDate ?? null,
        });

        const mappedTask = {
            ...updatedTask,
            dueDate: updatedTask.dueDate ? updatedTask.dueDate.slice(0, 10) : undefined,
            columnId: updatedTask.status
        }
        setTasks(prev => prev.map(t => (t.id === mappedTask.id ? mappedTask : t)));
        setSelectedTask(mappedTask);
    };

    if (loading) return <KanbanBoardSkeleton />;

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold text-foreground tracking-tight">Kanban Board</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{stats.total}</span> tasks</span>
                        <span className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{stats.done}</span> done</span>
                        <span className="text-xs text-muted-foreground"><span className={`font-medium ${stats.overdue > 0 ? "text-destructive": "text-foreground"}`}>{stats.overdue}</span> overdue</span>
                    </div>
                </div>
                <Button
                    size="sm"
                    onClick={() => setDiaglogOpen(true)}
                    className="gap-1.5"
                >
                    <Plus className="w-4 h-4" />
                    New Task
                </Button>
            </header>

            <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/30">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm bg-background border-border"
                    />
                </div>

                <Select value={priorityFilter} onValueChange={v => setPriorityFilter(v as Priority | "all")}>
                    <SelectTrigger className="w-32 h-8 text-sm bg-background border-border">
                        <SelectValue placeholder="Priority"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">Hard</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-x-auto p-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 h-full">
                        {COLUMNS.map(col => (
                            <KanbanColumn 
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                tasks={getColumnTasks(col.id)}
                                onTaskClick={handleTaskClick}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeTask ? (
                            <div className="rotate-2 scale-105">
                                <KanbanCard task={activeTask} />
                            </div>
                        ): null}
                    </DragOverlay>
                </DndContext>
            </div>

            <NewTaskDialog 
                open={dialogOpen}
                onOpenChange={setDiaglogOpen}
                onSubmit={handleAddTask}
            />

            {selectedTask && (
                <TaskDetailPanel 
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleTaskUpdate}
                />
            )}
        </div>
    )
}