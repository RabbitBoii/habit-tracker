"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { MoreHorizontal, Trash2, Pencil, CheckCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "@radix-ui/react-dropdown-menu";

interface TaskActionsProps {
    task: {
        id: number;
        title: string;
        priority: "low" | "medium" | "high" | string | null; // looser type to match DB return
        status: "todo" | "in_progress" | "done" | string | null;
        projectId: number;
        description: string | null;
    };
}

export default function TaskActions({ task }: TaskActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDesc, setEditDesc] = useState(task.description || "")

    const utils = trpc.useUtils();

    // 1. DELETE MUTATION
    const deleteTask = trpc.task.delete.useMutation({
        onSuccess: () => {
            toast.success("Task deleted");
            utils.task.getByProject.invalidate({ projectId: task.projectId });
        },
    });

    // 2. UPDATE STATUS MUTATION
    const updateStatus = trpc.task.updateStatus.useMutation({
        onSuccess: () => utils.task.getByProject.invalidate({ projectId: task.projectId }),
    });

    // 3. UPDATE PRIORITY MUTATION
    const updateTask = trpc.task.update.useMutation({
        onSuccess: () => {
            utils.task.getByProject.invalidate({ projectId: task.projectId });
            setIsEditOpen(false);
        },
    });

    const handleUpdateTitle = () => {
        updateTask.mutate({ taskId: task.id, title: editTitle, description: editDesc });

    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Title
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <CheckCircle className="mr-2 h-4 w-4" /> Set Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ taskId: task.id, status: "todo" })}>
                                To Do
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ taskId: task.id, status: "in_progress" })}>
                                In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ taskId: task.id, status: "done" })}>
                                Done
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <ArrowUpCircle className="mr-2 h-4 w-4" /> Priority
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => updateTask.mutate({ taskId: task.id, priority: "low" })}>
                                Low
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTask.mutate({ taskId: task.id, priority: "medium" })}>
                                Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTask.mutate({ taskId: task.id, priority: "high" })}>
                                High
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => deleteTask.mutate({ taskId: task.id })}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* EDIT TITLE DIALOG (Controlled by state) */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="space-y-1">
                            <Label>Title</Label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Textarea
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="h-24"
                            />
                        </div>
                        <Button onClick={handleUpdateTitle} disabled={updateTask.isPending}>
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}