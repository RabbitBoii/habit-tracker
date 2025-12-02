"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
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
import { Pencil } from "lucide-react"; // Pencil Icon

const formSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
});

// Define what data this component needs to receive
interface EditProjectBtnProps {
    project: {
        id: number;
        name: string;
        description: string | null;
        colorCode: string | null;
    };
}

export default function EditProjectBtn({ project }: EditProjectBtnProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        // PRE-FILL DATA HERE 👇
        defaultValues: {
            name: project.name,
            description: project.description || "",
        },
    });

    // Setup the Update Mutation
    const updateProject = trpc.project.update.useMutation({
        onSuccess: (data) => {
            toast.success(`Project updated!`);
            setOpen(false);
            router.refresh(); // Refresh page to show new name
        },
        onError: (err) => {
            toast.error("Failed to update: " + err.message);
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        updateProject.mutate({
            id: project.id,
            name: values.name,
            description: values.description,
            color: project.colorCode || "#000000", // Keep existing color or default
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="h-32" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateProject.isPending}>
                                {updateProject.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}