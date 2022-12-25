import { router } from "../trpc";
import { applicationsRouter } from "./applications";
import { authRouter } from "./auth";
import { marketRouter } from "./market";

export const appRouter = router({
  auth: authRouter,
  market: marketRouter,
  applications: applicationsRouter,
});

export type AppRouter = typeof appRouter;
