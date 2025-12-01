import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 h-16 border-b flex items-center">
                    <h1 className="text-xl font-bold tracking-tight">🚀 Habit<span className="text-blue-600">AI</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                        📂 Projects
                    </Link>
                    <div className="text-xs font-semibold text-gray-400 mt-6 mb-2 px-4 uppercase">
                        Account
                    </div>
                    <div className="px-4 text-sm text-gray-600">
                        {/* We will add credit count here later */}
                        Credits: ...
                    </div>
                </nav>

                <div className="p-4 border-t">
                    <UserButton showName />
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}   