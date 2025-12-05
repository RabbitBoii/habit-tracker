import { router, protectedProcedure } from "../trpc";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
    // GET USER 
    getMe: protectedProcedure.query(async ({ ctx }) => {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        // A. Check if user exists in our DB
        const dbUser = await ctx.db.query.users.findFirst({
            where: eq(users.clerkId, ctx.session.userId),
        });

        // B. If user exists, return them
        if (dbUser) {
            return dbUser;
        }

        // C. If NOT exists, create them (Sync)
        // We grab the primary email from Clerk
        const email = clerkUser.emailAddresses[0]?.emailAddress ?? "no-email@example.com";

        const [newUser] = await ctx.db.insert(users).values({
            clerkId: ctx.session.userId,
            email: email,
            name: `${clerkUser.firstName} ${clerkUser.lastName}`,
            credits: 10,
        }).returning(); 

        return newUser;
    }),
});