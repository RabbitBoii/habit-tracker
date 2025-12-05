"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner"; 

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

// Define Form Schema 
const formSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
});

export default function CreateProjectBtn() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Setup the Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Setup the Backend Mutation
    const createProject = trpc.project.create.useMutation({
        onSuccess: (project) => {
            toast.success(`Project "${project.name}" created!`);
            setOpen(false);
            form.reset();
            // Redirect to the new project page immediately
            router.push(`/dashboard/project/${project.id}`);
        },
        onError: (err) => {
            toast.error("Failed to create project: " + err.message);
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        createProject.mutate({
            name: values.name,
            description: values.description,
            color: "#3b82f6",
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Add a new goal. We'll use AI to break it down later.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* NAME INPUT */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Learn Guitar, Build App..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* DESCRIPTION INPUT */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="I want to learn acoustic guitar in 30 days..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createProject.isPending}>
                                {createProject.isPending ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}