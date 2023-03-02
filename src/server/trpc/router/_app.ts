import { router } from "../trpc";
import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { discordRouter } from "./discord";
import { marketRouter } from "./market";
import { onboardingRouter } from "./onboarding";

export const appRouter = router({
  auth: authRouter,
  market: marketRouter,
  onboarding: onboardingRouter,
  discord: discordRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
