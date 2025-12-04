"use client";

import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { trpc } from "@/app/_trpc/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import EditProjectBtn from "@/components/dashboard/edit-project-btn";
// import TaskActions from "@/components/dashboard/task-actions";
import AddTaskBtn from "@/components/dashboard/add-task-btn";
import { TaskCard } from "@/components/dashboard/task-card";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import ProjectStats from "@/components/dashboard/project-stats";

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const projectId = parseInt(id as string);

    // 1. Fetch Project & Tasks
    const { data: project, isLoading: isProjectLoading } = trpc.project.getProject.useQuery(
        { id: projectId },
        { enabled: !!projectId } // Only run if ID exists
    );

    // const { data: tasks, isLoading: isTasksLoading, refetch: refetchTasks } = trpc.task.getByProject.useQuery(
    //     { projectId },
    //     { enabled: !!projectId }
    // );
    const { data: serverTasks, isLoading, refetch } = trpc.task.getByProject.useQuery(
        { projectId },
        { enabled: !!projectId }
    );

    const [tasks, setTasks] = useState(serverTasks || []);

    useEffect(() => {
        if (serverTasks) {
            setTasks(serverTasks);
        }
    }, [serverTasks]);

    const saveOrder = trpc.task.saveOrder.useMutation({
        onSuccess: () => {
            // Optional: toast.success("Order saved");
            // We don't need to refetch here because we already updated the UI locally!
        },
        onError: (err) => toast.error("Failed to save order: " + err.message)
    });

    // Stub function for now - we will add backend logic next!
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setTasks((currentTasks) => {
            const oldIndex = currentTasks.findIndex((t) => t.id === active.id);
            const newIndex = currentTasks.findIndex((t) => t.id === over.id);

            // Create the new array
            const newOrder = arrayMove(currentTasks, oldIndex, newIndex);

            // 2. Send new ID order to Backend
            // We map just the IDs because that's all the API needs
            const orderIds = newOrder.map((t) => t.id);
            saveOrder.mutate({ projectId, newOrder: orderIds });

            return newOrder;
        });
    }


    // 2. Mutations (AI & Delete)
    const generateAI = trpc.ai.generateTasks.useMutation({
        onSuccess: (data) => {
            toast.success(`Generated ${data.tasksGenerated} tasks!`);
            refetch(); // Refresh the list
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteProject = trpc.project.delete.useMutation({
        onSuccess: () => {
            toast.success("Project deleted");
            router.push("/dashboard");
        },
    });



    if (isProjectLoading || !project) {
        return <div className="p-8"><Skeleton className="h-12 w-1/3 mb-4" /><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline mb-2 flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-extrabold tracking-tight">{project.name}</h1>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.colorCode || "#000" }}></div>
                    </div>
                    <p className="text-muted-foreground mt-2 text-lg">{project.description}</p>
                </div>

                <div className="flex gap-2">

                    <EditProjectBtn project={project} />

                    <Button variant="outline" onClick={() => deleteProject.mutate({ projectId })}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <AddTaskBtn projectId={projectId} />
                </div>
            </div>

            {/* AI GENERATION SECTION (Only show if 0 tasks) */}
            {tasks?.length === 0 && (
                <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/20">
                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-2xl mb-2">Start with AI?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Your task list is empty. Let our AI analyze your goal and generate a step-by-step plan for you instantly.
                    </p>
                    <Button
                        size="lg"
                        onClick={() => generateAI.mutate({ projectId })}
                        disabled={generateAI.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {generateAI.isPending ? "Generating Plan..." : "✨ Generate AI Plan (1 Credit)"}
                    </Button>
                </div>
            )}
            {tasks && tasks.length > 0 && (
                <ProjectStats tasks={tasks} />
            )}

            {/* TASK LIST (Placeholder for Drag & Drop) */}
            {tasks && tasks.length > 0 && (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={tasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid gap-3">
                            {tasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}