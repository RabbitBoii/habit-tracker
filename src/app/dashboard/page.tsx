"use client";

import { trpc } from "@/app/_trpc/client";
import CreateProjectBtn from "@/components/dashboard/create-project-btn";
import Link from "next/link";
import { ArrowRight, Folder } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    // 1. Fetch Projects
    const { data: projects, isLoading } = trpc.project.getAll.useQuery();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Manage your goals and track progress.</p>
                </div>
                <CreateProjectBtn />
            </div>

            {/* STATS PLACEHOLDER (We will add the Ring Chart here next) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="p-6 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Total Projects</div>
                    <div className="text-2xl font-bold">{projects?.length || 0}</div>
                </div>
                {/* Add more stats later */}
            </div>

            {/* PROJECT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* LOADING STATE */}
                {isLoading && (
                    <>
                        <Skeleton className="h-40 rounded-xl" />
                        <Skeleton className="h-40 rounded-xl" />
                        <Skeleton className="h-40 rounded-xl" />
                    </>
                )}

                {/* EMPTY STATE */}
                {!isLoading && projects?.length === 0 && (
                    <div className="col-span-full border-dashed border-2 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Folder className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-lg">No projects yet</h3>
                        <p className="text-gray-500 mb-4 max-w-sm">
                            Create your first project to get started. Our AI will help you break it down into tasks.
                        </p>
                        <CreateProjectBtn />
                    </div>
                )}

                {/* PROJECT LIST */}
                {projects?.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/project/${project.id}`}
                        className="group block"
                    >
                        <div className="border rounded-xl p-6 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: project.colorCode || "#000" }}
                                />
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>

                            <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                                {project.name}
                            </h3>

                            <p className="text-muted-foreground text-sm line-clamp-2 flex-1">
                                {project.description || "No description provided."}
                            </p>

                            <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                <span className="group-hover:translate-x-1 transition-transform">View Tasks &rarr;</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}