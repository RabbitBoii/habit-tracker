"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskActions from "./task-actions";

interface TaskCardProps {
    task: {
        id: number;
        title: string;
        description: string | null; // 👈 Added Description
        priority: string | null;
        status: string | null;
        projectId: number;
    };
}

export function TaskCard({ task }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getBadgeVariant = (status: string | null) => {
        if (status === "done") return "default";
        if (status === "in_progress") return "secondary";
        return "outline";
    };

    const getPriorityColor = (priority: string | null) => {
        if (priority === "high") return "text-red-500 font-bold";
        if (priority === "medium") return "text-yellow-600 font-medium";
        return "text-gray-500 font-medium";
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-3">
            <Card
                className={cn(
                    "flex flex-row items-center p-3 gap-3 bg-card hover:shadow-md transition-all group",
                    isDragging && "shadow-xl ring-2 ring-blue-500 z-10 relative rotate-1"
                )}
            >
                {/* === LEFT COLUMN: CONTENT === */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Title */}
                    <div className="font-semibold text-base leading-tight">
                        {task.title}
                    </div>

                    {/* Description (Truncated to 2 lines to keep cards uniform) */}
                    {task.description && (
                        <div className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-snug">
                            {task.description}
                        </div>
                    )}

                    {/* Priority Label */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">

                        {/* Priority (Bottom Left) */}
                        <div className={cn("text-xs uppercase flex items-center gap-1", getPriorityColor(task.priority))}>
                            {task.priority || "Normal"}
                        </div>

                        {/* Status & Actions (Bottom Right) */}
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={getBadgeVariant(task.status)}
                                className="text-[10px] h-5 px-2 capitalize"
                            >
                                {task.status?.replace("_", " ") || "todo"}
                            </Badge>
                            <TaskActions task={task} />
                        </div>
                    </div>
                </div>

                {/* === RIGHT COLUMN: CONTROLS === */}

                {/* Drag Handle (Top Right) */}
                <div
                    {...attributes}
                    {...listeners}
                    className="self-center p-1 text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing hover:bg-muted rounded transition-colors   "
                >
                    <GripVertical className="h-5 w-5" />
                </div>

            </Card>
        </div>
    );
}