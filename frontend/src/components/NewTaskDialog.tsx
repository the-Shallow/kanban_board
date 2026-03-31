import { useState } from "react";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
 } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calender";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { Select
    , SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
 } from "./ui/select";
import { CalendarIcon } from "lucide-react";
import {format} from "date-fns";
 import type { Priority } from "@/types/kanban_types";
import { cn } from "@/lib/utils";

interface NewTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (title : string, priority?: Priority, description?:string, dueDate?: string) => void;
}

export function NewTaskDialog({open, onOpenChange, onSubmit}: NewTaskDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority | "">("");
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [touched, setTouched] = useState(false);

    const titleError = touched && !title.trim()

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("");
        setDueDate(undefined);
        setTouched(false);
    } 

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim()) return;
        onSubmit(title.trim(), priority || undefined, description.trim() || undefined, dueDate ? format(dueDate, "yyyy-MM-dd") : undefined);
        resetForm();
        onOpenChange(false);
    };

    const handleOpenChange = (val : boolean) => {
        if(!val) resetForm();
        onOpenChange(val);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[440px] bg-card border-border backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-base">Create Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="task-title" className="text-xs text-muted-foreground uppercase tracking-wider">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="task-title"
                            value={title}
                            onChange={e => {setTitle(e.target.value); setTouched(true);}}
                            placeholder="What needs to be done?"
                            autoFocus
                            className={cn(
                                "bg-secondary border-border",
                                titleError && "border-destructive focus-visible:ring-destructive"
                            )}
                        />
                        {
                            titleError && (
                                <p className="text-xs text-destructive">Title is required</p>
                            )
                        }
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="task-desc" className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                        <Textarea
                            id="task-desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add more details..."
                            rows={3}
                            className="bg-secondary border-border resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Priority</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        typeof="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-secondary border-border",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >

                                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                        {dueDate ? format(dueDate, "PPP") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                                    <Calendar 
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button typeof="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button typeof="submit">Create Task</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}