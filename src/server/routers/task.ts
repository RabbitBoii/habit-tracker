import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { tasks, users, priorityEnum, statusEnum } from "@/db/schema"; // Import enums!
import { eq, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const taskRouter = router({
    // 1. GET TASKS BY PROJECT
    getByProject: protectedProcedure
        .input(z.object({ projectId: z.number() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.query.tasks.findMany({
                where: eq(tasks.projectId, input.projectId),
                orderBy: [asc(tasks.position)], // Order by position for Drag-n-Drop!
            });
        }),

    // 2. CREATE MANUAL TASK
    create: protectedProcedure
        .input(z.object({
            projectId: z.number(),
            title: z.string(),
            priority: z.enum(["low", "medium", "high"]).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });

            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            // Find the last position so we can append to the bottom
            // (Optional optimization: Just set to 0 and let user drag it)

            await ctx.db.insert(tasks).values({
                userId: user.id,
                projectId: input.projectId,
                title: input.title,
                priority: input.priority || "medium",
                position: 9999, // Put it at the end for now
            });

            return { success: true };
        }),

    // 3. UPDATE STATUS (Todo -> Done)
    updateStatus: protectedProcedure
        .input(z.object({ taskId: z.number(), status: z.enum(["todo", "in_progress", "done"]) }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.update(tasks)
                .set({ status: input.status })
                .where(eq(tasks.id, input.taskId));
        }),
});