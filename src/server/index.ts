import { router } from "./trpc";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user"; // <--- Import this
import { taskRouter } from "./routers/task";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
  user: userRouter, // <--- Add this
  project: projectRouter,
  task: taskRouter,
  ai: aiRouter,
});
export type AppRouter = typeof appRouter;