import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { projects, tasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Groq from "groq-sdk";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const aiRouter = router({
    generateTasks: protectedProcedure
        .input(z.object({ projectId: z.number() }))
        .mutation(async ({ ctx, input }) => {

            // Check user credits
            const user = await ctx.db.query.users.findFirst({
                where: eq(users.clerkId, ctx.session.userId),
            });

            if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

            if (user.credits <= 0) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "You have run out of credits! Upgrade to continue."
                });
            }

            // Fetch the Project details to understand context
            const project = await ctx.db.query.projects.findFirst({
                where: eq(projects.id, input.projectId),
            });

            if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

            // AI Prompt
            const prompt = `
        You are a project manager AI.
        The user has a project named: "${project.name}".
        Description: "${project.description || 'No description provided'}".
        
        Goal: Break this project into 5-7 actionable, chronological tasks.
        
        Strictly return a JSON OBJECT with a key "tasks" containing an array of objects.
        Each object must have:
        - "title" (string, max 60 chars)
        - "description" (string, 1 short actionable sentence explaining what to do)
        - "priority" (string: "low", "medium", or "high")
        
        Example Output:
        {
          "tasks": [
            { "title": "Install dependencies", "description": "Run npm install to set up the environment.", "priority": "high" },
            { "title": "Design database schema", "description": "Define tables and relationships to structure your application data efficiently." ,"priority": "medium" }
          ]
        }
      `;

            // Call the AI
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile", // Fast and cheap model
                response_format: { type: "json_object" }, // Force JSON mode
            });

            const aiResponse = completion.choices[0]?.message?.content;
            if (!aiResponse) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned empty" });

            // Parse and validate AI response
            try {
                const parsedData = JSON.parse(aiResponse);

                const AiResponseSchema = z.object({
                    tasks: z.array(z.object({
                        title: z.string(),
                        description: z.string().optional().default(""),
                        priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
                    }))
                });

                const validatedData = AiResponseSchema.parse(parsedData);

                // Insert Tasks into Database
                const tasksToInsert = validatedData.tasks.map((task, index) => ({
                    projectId: project.id,
                    userId: project.userId,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    position: index + 1,
                }));

                await ctx.db.insert(tasks).values(tasksToInsert);

                // Update user credits
                await ctx.db.update(users)
                    .set({ credits: user.credits - 1 })
                    .where(eq(users.id, user.id));

                return { success: true, tasksGenerated: tasksToInsert.length };

            } catch (error) {
                console.error("AI Parse Error:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse AI response" });
            }
        }),
});