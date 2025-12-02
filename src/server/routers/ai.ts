import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { projects, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Groq from "groq-sdk";

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const aiRouter = router({
    generateTasks: protectedProcedure
        .input(z.object({ projectId: z.number() }))
        .mutation(async ({ ctx, input }) => {
            // 1. Fetch the Project details to understand context
            const project = await ctx.db.query.projects.findFirst({
                where: eq(projects.id, input.projectId),
            });

            if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

            // 2. Construct the Prompt
            const prompt = `
        You are a project manager AI.
        The user has a project named: "${project.name}".
        Description: "${project.description || 'No description provided'}".
        
        Goal: Break this project into 5-7 actionable, chronological tasks.
        
        Strictly return a JSON OBJECT with a key "tasks" containing an array of objects.
        Each object must have:
        - "title" (string, max 60 chars)
        - "priority" (string: "low", "medium", or "high")
        
        Example Output:
        {
          "tasks": [
            { "title": "Install dependencies", "priority": "high" },
            { "title": "Design database schema", "priority": "medium" }
          ]
        }
      `;

            // 3. Call the AI
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile", // Fast and cheap model
                response_format: { type: "json_object" }, // Force JSON mode
            });

            const aiResponse = completion.choices[0]?.message?.content;
            if (!aiResponse) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned empty" });

            // 4. Parse and Validate the AI Output
            // We wrap this in try-catch because AI can sometimes hallucinate bad JSON
            try {
                const parsedData = JSON.parse(aiResponse);

                // Define a schema just for validation
                const AiResponseSchema = z.object({
                    tasks: z.array(z.object({
                        title: z.string(),
                        priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
                    }))
                });

                const validatedData = AiResponseSchema.parse(parsedData);

                // 5. Insert Tasks into Database
                // We map over the AI tasks and add the required DB fields (projectId, userId)
                const tasksToInsert = validatedData.tasks.map((task, index) => ({
                    projectId: project.id,
                    userId: project.userId,
                    title: task.title,
                    priority: task.priority,
                    position: index + 1, // Keep the AI's chronological order
                }));

                await ctx.db.insert(tasks).values(tasksToInsert);

                return { success: true, tasksGenerated: tasksToInsert.length };

            } catch (error) {
                console.error("AI Parse Error:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse AI response" });
            }
        }),
});