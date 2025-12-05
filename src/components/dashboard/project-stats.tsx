"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectStatsProps {
    tasks: { status: string | null }[];
}

export default function ProjectStats({ tasks }: ProjectStatsProps) {
    // Calculate Counts
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const todo = tasks.filter((t) => !t.status || t.status === "todo").length;

    // Prepare Data for Chart
    const data = [
        { name: "Done", value: done, color: "#22c55e" },
        { name: "In Progress", value: inProgress, color: "#3b82f6" },
        { name: "To Do", value: todo, color: "#e5e7eb" },
    ];

    // Prevent division by zero
    const progressPercentage = total === 0 ? 0 : Math.round((done / total) * 100);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* CARD 1: OVERVIEW NUMBERS */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                    <span className="text-2xl font-bold">{progressPercentage}%</span>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground mt-1">
                        {done} completed out of {total} tasks
                    </div>
                    {/* Simple Progress Bar */}
                    <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* CARD 2: THE DONUT CHART */}
            <Card className="col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between h-32 px-6">

                    {/* Chart Legend */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm text-muted-foreground">Done ({done})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm text-muted-foreground">In Progress ({inProgress})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                            <span className="text-sm text-muted-foreground">To Do ({todo})</span>
                        </div>
                    </div>

                    {/* The Chart */}
                    <div className="h-full w-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={35}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>
        </div>
    );
}