import { useState, useEffect, useRef } from "react";
import {format, formatDistanceToNow } from "date-fns";
import { X, CalendarIcon, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calender";
import { Select
    , SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
 } from "./ui/select";
import { Popover,
    PopoverTrigger,
    PopoverContent
  } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import type {Task, ColumnId, Priority, Comment, ActivityItem} from "@/types/kanban_types";
import {COLUMNS} from "@/types/kanban_types";
import { api } from "@/lib/api";
import type { Action } from "@dnd-kit/core/dist/store";

interface TaskDetailPanelProps {
    task: Task;
    onClose: () => void;
    onUpdate: (updated: Task) => void;
}

export function TaskDetailPanel({task, onClose, onUpdate}: TaskDetailPanelProps) {
    const [localTask, setLocalTask] = useState<Task>(task);
    // const [loadingDetails, setLoadingDetails] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [activityLogs, setActivityLogs] = useState<ActivityItem[]>([]);
    const [editingTitle, setEditingTitle] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalTask(task);
        setIsClosing(false);

        async function loadTaskData() {
            try {
                const [comments, logs] = await Promise.all([
                    api.get(`/comments?task_id=${task.id}`),
                    api.get(`/task-activity-logs?task_id=${task.id}`)
                ])
                // const comments = await api.get(`/comments?task_id=${task.id}`);
                // console.log(_task)
                setLocalTask({
                    ...task,
                    comments: comments ?? []
                });

                setActivityLogs((logs ?? []));

                // console.log(_task.comments)
            }catch(err){
                console.log(err)
            }
        }


        loadTaskData();
    }, [task]);

    const loadActivityLogs = async (taskId: string) => {
        try{
            const logs = await api.get(`/task-activity-logs?task_id=${taskId}`);

            // const mappedLogs = (logs ?? []).map((log:any) => ({
            //     id:log.id,
            //     activity_type: log.action_type,
            //     timestamp: log.created_at,
            //     detail:log.message,
            // }));

            setActivityLogs(logs ?? []);
        }catch(err){
            console.log(err);
        }
    }

    useEffect(()=> {
        if(editingTitle && titleRef.current) {
            titleRef.current.focus();
            titleRef.current.select();
        }
    }, [editingTitle]);

    // const addActivity = (type: ActivityItem["activity_type"], detail?:string) => {
    //     const item : ActivityItem = {id: crypto.randomUUID(), activity_type:type, timestamp: new Date().toISOString(), detail};
    //     return [...(localTask.activity || []), item];
    // }

    const update = (changes: Partial<Task>) => {
        // const activity = activityType ? addActivity(activityType, activityDetail) : localTask.activity;
        const updated = {...localTask, ...changes};
        setLocalTask(updated);
        onUpdate(updated);
    }

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200);
    }


    const handleAddComment = async () => {
        if(!commentText.trim()) return;

        try{
            const createdComment = await api.post(`/comments`,{
                task_id: task.id,
                content: commentText.trim()
            });
            // console.log(createdComment)
            update({comments:[...(localTask.comments || []), createdComment]});
            setCommentText("");
            await loadActivityLogs(task.id);
        }catch(err){
            console.log(err);
        }

        // const newComment: Comment = {
        //     id:crypto.randomUUID(),
        //     text: commentText.trim(),
        //     timestamp: new Date().toISOString(),
        // };
    }

    const handleKeyDown = (e:React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    }

    const getActivityMessages = (item: any) : string[] => {
        if( item.action_type === "task_created") {
            return ["Task created"];
        }

        if(item.action_type === "task_updated"){
            const oldTask = item.old_value;
            const newTask = item.new_value;
            const messages : string[] = [];

            if(oldTask.status !== newTask.status){
                messages.push(`Status changed: ${oldTask.status} -> ${newTask.status}`);
            }

            if(oldTask.priority !== newTask.priority){
                messages.push(`Priority changed: ${oldTask.priority} -> ${newTask.priority}`);
            }

            if(oldTask.title !== newTask.title){
                messages.push(`Title changed: ${oldTask.title} -> ${newTask.title}`);
            }

            if(oldTask.description !== newTask.description) {
                messages.push(`Description changed`);
            }

            if(oldTask.due_date !== newTask.due_date) {
                const oldDate = oldTask.due_date ? format(new Date(oldTask.due_date), "MMM d, yyyy"): "None";
                const newDate = newTask.due_date ? format(new Date(newTask.due_date), "MMM d, yyyy"): "None";
                messages.push(`Due date changed: ${oldDate} -> ${newDate}`);
            }

            return messages.length? messages : [];
        }

        return [item.message || "activity updated"];
    }


    return (
        <>
            <div
                className={cn(
                'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm',
                isClosing ? 'animate-fade-out' : 'animate-fade-in'
                )}
                onClick={handleClose}
            />

            <div
                className={cn(
                    'fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-secondary shadow-2xl shadow-black/40 flex flex-col',
                    isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
                )}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Task Details</span>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-5">
                        {editingTitle ? (
                            <Input 
                                ref={titleRef}
                                value={localTask.title}
                                onChange={e => update({title: e.target.value})}
                                onBlur={() => setEditingTitle(false)}
                                onKeyDown={e => e.key === "Enter" && setEditingTitle(false)}
                                className="text-lg font-semibold bg-muted border-border"
                            />
                        ): (
                            <h2 className="text-lg font-semibold text-foreground cursor-pointer rounded-md px-2 py-1 -mx-2 -my-1 hover:bg-muted transition-colors"
                                onClick={()=> setEditingTitle(true)}
                            >
                                {localTask.title}
                            </h2>
                        )}


                        <Separator className="bg-border" />

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                            <Select 
                                value={localTask.columnId}
                                onValueChange={(v) =>{
                                    // const oldCol = COLUMNS.find(c => c.id === localTask.columnId)?.title;
                                    // const newCol = COLUMNS.find(c => c.id === v)?.title;
                                    update({columnId: v as ColumnId})
                                }}
                            >
                                <SelectTrigger className="bg-muted border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COLUMNS.map(col => (
                                        <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</label>
                            <Select
                                value={localTask.priority || "none" }
                                onValueChange={(v) => {
                                    const val = v === "none" ? undefined : v as Priority;
                                    update({priority: val});
                                }}
                            >
                                <SelectTrigger className="bg-muted border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal bg-muted border-border',
                                            !localTask.dueDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {/* {console.log(new Date(localTask.dueDate))} */}
                                        {localTask.dueDate ? format(new Date(localTask.dueDate), "PPP")
                                        : "Pick a Date"}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={localTask.dueDate ? new Date(localTask.dueDate) : undefined}
                                        onSelect={(date) => update({dueDate : date?.toISOString().split("T")[0]})}
                                        initialFocus
                                        // className={cn("p-3 pointer-events-auto")}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Separator className="bg-border" />


                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                            <Textarea 
                                value={localTask.description || ""}
                                onChange={e => update({description : e.target.value})}
                                placeholder="Add a description..."
                                rows={4}
                                className="bg-muted border-border resize-none text-sm"
                            />
                        </div>

                        <Separator className="bg-border" />

                        <div className="space-y-3">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comments</label>
                            {(!localTask.comments || localTask.comments.length === 0) ? (
                                <p className="text-xs text-muted-foreground/60 py-2">No comments yet</p>
                            ): (
                                <div className="space-y-2.5">
                                    {localTask.comments.map(comment => (
                                        <div key={comment.id} className="bg-muted rounded-lg p-3 space-y-1">
                                            <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {format(new Date(comment.created_at), "MMM d, h:mm a")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-border" />

                        <div className="space-y-3">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</label>
                            {(activityLogs.length === 0) ? (
                                <p className="text-xs text-muted-foreground/60 py-2">No activity yet</p>
                            ): (
                                <div className="space-y-2">
                                    {activityLogs.map(item => (
                                        {
                                            ...item,
                                            messages: getActivityMessages(item)
                                        }
                                    )).filter(item => item.messages.length > 0).map(item => (
                                        <div key={item.id} className="flex items-start gap-2 py-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                                                <div className="min-w-0">
                                                    {getActivityMessages(item).map((msg, idx) => (
                                                        // {console.log(msg)}
                                                        <p key={idx} className="text-xs text-foreground/80 leading-relaxed">
                                                            {msg}
                                                        </p>
                                                    ))}
                                                    {/* <p className="text-ws text-foreground/80 leading-relaxed">
                                                        {item.activity_type === "task_created" && "Task created"}
                                                        {item.activity_type === "status_changed" && `Status changed : ${item.detail}`}
                                                        {item.activity_type === "priority_changed" && `Priority changed : ${item.detail}`}
                                                        {item.activity_type === "comment_added" && `Comment added`}
                                                        {item.activity_type === "due_date_changed" && `Due date changed : ${item.detail}`}
                                                        {item.activity_type === "label_added" && `Label added : ${item.detail}`}
                                                        {item.activity_type === "label_removed" && `Label removed : ${item.detail}`}
                                                    </p> */}
                                                    <p className="text-[10px] text-muted-foreground/60">
                                                        {formatDistanceToNow(new Date(item.created_at), {addSuffix: true})}
                                                    </p>
                                                </div>
                                            </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-border  p-4">
                    <div className="flex gap-2">
                        <Input 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add a comment..."
                            className="bg-muted border-border text-sm"
                        />
                        <Button
                            size="icon"
                            onClick={handleAddComment}
                            aria-disabled={!commentText.trim()}
                            className="shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}