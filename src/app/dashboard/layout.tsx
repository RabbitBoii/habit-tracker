"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { LayoutDashboard } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user } = trpc.user.getMe.useQuery();
    return (
        <div className="flex h-screen bg-muted/40 w-full overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-64 bg-background border-r hidden md:flex flex-col shrink-0">
                <div className="p-6 h-16 border-b flex items-center gap-2">
                    {/* LOGO FIXED: Uses standard text colors */}
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                    <Link href="/">
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            Habit<span className="text-primary">AI</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-muted rounded-md transition-colors">
                        📂 Projects
                    </Link>
                    {/* You can add more links here later */}
                </nav>

                {/* Credit count moved to bottom of sidebar */}
                <div className="p-4 border-t text-sm text-muted-foreground flex justify-between items-center">
                    <span>Credits:</span>
                    <span className="font-bold text-primary">{user?.credits ?? " - "}</span>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-auto min-h-0">
                {/* NEW TOP HEADER */}
                <header className="h-16 border-b bg-background flex items-center px-6 justify-between shrink-0">
                    {/* Title or Breadcrumb (Optional) */}
                    <h1 className="text-lg font-semibold md:hidden">HabitAI</h1>
                    <div className="hidden md:block text-muted-foreground text-sm">
                        Dashboard &gt; Overview
                    </div>

                    {/* RIGHT SIDE ACTIONS */}
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <UserButton />
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-8 pb-32 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}