// src/server/router/_app.ts
import { router } from "@/server/trpc/trpc";

import { taskRouter } from "./tasks";

export const appRouter = router({
  tasks: taskRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
