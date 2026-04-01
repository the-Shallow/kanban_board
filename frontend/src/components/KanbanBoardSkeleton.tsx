import { Skeleton } from "./ui/skeleton";

const COLUMN_CARDS = [3,2,4,1];
// const COLUMN_TITLES = ["To Do", "In Progress", "In Review", "Done"];

function SkeletonCard() {
    return ( 
        <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5">
            <div className="flex gap-1.5">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
            </div>

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
            <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function KanbanBoardSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24 rounded-md" />
            </header>

            <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/30">
                <Skeleton className="h-8 w-56 rounded-md" />
                <Skeleton className="h-8 w-32 rounded-md" />
                <Skeleton className="h-8 w-32 rounded-md" />
            </div>

            <div className="flex-1 overflow-hidden p-6">
                <div className="flex gap-4 h-full">
                    {COLUMN_CARDS.map((count, colIdx) => (
                        <div
                            key={colIdx}
                            className="flex flex-col rounded-xl bg-secondary/40 min-w-[280px] w-[300px] shrink-0"
                        >
                            <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-6 rounded-full" />
                            </div>

                            <div className="flex flex-col gap-2 px-3 pb-3 pt-1">
                                {Array.from({length: count}).map((_, i) => (
                                    <SkeletonCard key={i}/>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}