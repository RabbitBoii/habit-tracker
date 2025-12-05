import { router } from "./trpc";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";
import { taskRouter } from "./routers/task";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
  user: userRouter, 
  project: projectRouter,
  task: taskRouter,
  ai: aiRouter,
});
export type AppRouter = typeof appRouter;