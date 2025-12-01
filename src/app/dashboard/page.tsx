export default function DashboardPage() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">My Projects</h2>
                <button className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium">
                    + New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder Card */}
                <div className="border rounded-lg p-6 bg-white shadow-sm h-40 flex items-center justify-center text-gray-400 border-dashed">
                    No projects yet. Create one!
                </div>
            </div>
        </div>
    );
}