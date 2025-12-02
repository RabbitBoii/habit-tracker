import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { projects, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const projectRouter = router({
    // 1. GET ALL PROJECTS (For Sidebar)
    getAll: protectedProcedure.query(async ({ ctx }) => {
        // A. Find the user first
        const user = await ctx.db.query.users.findFirst({
            where: eq(users.clerkId, ctx.session.userId),
        });

        if (!user) return []; // If sync hasn't happened yet, return empty

        // B. Get their projects
        return await ctx.db.query.projects.findMany({
            where: eq(projects.userId, user.id),
            orderBy: [desc(projects.createdAt)], // Newest first
        });
    }),

    getProject: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {

            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });

            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            const project = await ctx.db.query.projects.findFirst({
                where: eq(projects.id, input.id),
            });

            if (!project) throw new TRPCError({ code: "NOT_FOUND" });

            if (project.userId !== user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

            return project;
        }),

    // 2. CREATE PROJECT
    create: protectedProcedure
        .input(z.object({ name: z.string().min(1), description: z.string().optional(), color: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
            // A. Get the real user ID
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });

            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            // B. Insert Project
            const [newProject] = await ctx.db.insert(projects).values({
                userId: user.id,
                name: input.name,
                description: input.description,
                colorCode: input.color || "#000000",
            }).returning();

            return newProject;
        }),

    // 3. DELETE PROJECT
    delete: protectedProcedure
        .input(z.object({ projectId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            // We delete directly. Simple.
            await ctx.db.delete(projects).where(eq(projects.id, input.projectId));
            return { success: true };
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.number(),
            name: z.string().min(1),
            description: z.string().optional(),
            color: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // A. Verify ownership first
            const project = await ctx.db.query.projects.findFirst({
                where: eq(projects.id, input.id),
            });

            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });

            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            if (!project) throw new TRPCError({ code: "NOT_FOUND" });
            if (project.userId !== user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
            // if (project.userId !== ctx.session.userId) throw new TRPCError({ code: "UNAUTHORIZED" });

            // B. Update the project
            const [updatedProject] = await ctx.db.update(projects)
                .set({
                    name: input.name,
                    description: input.description,
                    colorCode: input.color,
                })
                .where(eq(projects.id, input.id))
                .returning();

            return updatedProject;
        }),

});