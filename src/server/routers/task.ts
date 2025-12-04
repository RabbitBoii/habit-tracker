import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { tasks, users, priorityEnum, statusEnum } from "@/db/schema"; // Import enums!
import { eq, and, asc, desc } from "drizzle-orm";
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
            description: z.string().optional(),
            priority: z.enum(["low", "medium", "high"]).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });

            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            const lastTask = await ctx.db.query.tasks.findFirst({
                where: eq(tasks.projectId, input.projectId),
                orderBy: [desc(tasks.position)],
            });

            const newPosition = lastTask ? lastTask.position + 1 : 0;

            await ctx.db.insert(tasks).values({
                userId: user.id,
                projectId: input.projectId,
                title: input.title,
                description: input.description,
                priority: input.priority || "medium",
                position: newPosition,
            });
            return { success: true };
        }),

    // DELETE TASK
    delete: protectedProcedure
        .input(z.object({ taskId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });
            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            // We use 'and()' to ensure we only delete if it belongs to THIS user
            const deleted = await ctx.db.delete(tasks)
                .where(and(
                    eq(tasks.id, input.taskId),
                    eq(tasks.userId, user.id)
                ))
                .returning();

            if (!deleted.length) throw new TRPCError({ code: "NOT_FOUND" });

            return { success: true };
        }),

    // UPDATE TASK
    update: protectedProcedure
        .input(z.object({
            taskId: z.number(),
            title: z.string().min(1).optional(),
            description: z.string().optional(),
            priority: z.enum(["low", "medium", "high"]).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });
            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            const [updatedTask] = await ctx.db.update(tasks)
                .set({
                    // Only update fields that were provided
                    ...(input.title ? { title: input.title } : {}),
                    ...(input.description ? { description: input.description } : {}),
                    ...(input.priority ? { priority: input.priority } : {})
                })
                .where(and(
                    eq(tasks.id, input.taskId),
                    eq(tasks.userId, user.id)
                ))
                .returning();

            if (!updatedTask) throw new TRPCError({ code: "NOT_FOUND" });

            return updatedTask;
        }),
    // SAVE NEW ORDER (DRAG AND DROP)
    saveOrder: protectedProcedure
        .input(z.object({
            projectId: z.number(),
            newOrder: z.array(z.number()) // Array of Task IDs in the new order
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });
            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            // We use a Transaction to ensure all updates happen, or none do.
            // This prevents the list from getting corrupted if the internet cuts out.
            const updates = input.newOrder.map((taskId, index) => {
                return ctx.db.update(tasks)
                    .set({ position: index })
                    .where(and(
                        eq(tasks.id, taskId),
                        eq(tasks.projectId, input.projectId)
                    ));
            });
            await Promise.all(updates);

            return { success: true };
        }),


    //  UPDATE STATUS 
    updateStatus: protectedProcedure
        .input(z.object({ taskId: z.number(), status: z.enum(["todo", "in_progress", "done"]) }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.update(tasks)
                .set({ status: input.status })
                .where(eq(tasks.id, input.taskId));
        }),
});