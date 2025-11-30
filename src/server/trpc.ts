import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { db } from "@/db";
import { ZodError } from "zod";

// 1. CONTEXT
// This runs for every request. We check who the user is here.
export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await auth();
    return {
        db,
        session,
        ...opts,
    };
};

// 2. INITIALIZATION
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

// 3. EXPORTS
export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

// 4. PROTECTED PROCEDURE (The Gatekeeper)
// If you use this, the user MUST be logged in.
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            // We overwrite the session to be Non-Nullable here
            session: { ...ctx.session, userId: ctx.session.userId },
        },
    });
});