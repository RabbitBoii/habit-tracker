import { router } from "./trpc";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user"; // <--- Import this

export const appRouter = router({
  user: userRouter, // <--- Add this
  project: projectRouter,
});

export type AppRouter = typeof appRouter;