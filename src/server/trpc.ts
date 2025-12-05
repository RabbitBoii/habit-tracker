import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { db } from "@/db";
import { ZodError } from "zod";

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await auth();
    return {
        db,
        session,
        ...opts,
    };
};

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

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;


export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
            session: { ...ctx.session, userId: ctx.session.userId },
        },
    });
});