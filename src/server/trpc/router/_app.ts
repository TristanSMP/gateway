import { router } from "../trpc";
import { applicationsRouter } from "./applications";
import { authRouter } from "./auth";
import { discordRouter } from "./discord";
import { marketRouter } from "./market";
import { minecraftRouter } from "./minecraft";

export const appRouter = router({
  auth: authRouter,
  market: marketRouter,
  applications: applicationsRouter,
  discord: discordRouter,
  minecraft: minecraftRouter,
});

export type AppRouter = typeof appRouter;
