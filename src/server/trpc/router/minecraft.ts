import { z } from "zod";
import {
  looksLikeUUID,
  UsernameToProfile,
  UUIDToProfile,
} from "../../lib/minecraft";
import { protectedProcedure, router } from "../trpc";

export const minecraftRouter = router({
  getProfile: protectedProcedure
    .input(
      z.object({
        usernameOrUUID: z.string(),
      })
    )
    .query(async ({ input: { usernameOrUUID } }) => {
      return looksLikeUUID(usernameOrUUID)
        ? await UUIDToProfile(usernameOrUUID)
        : await UsernameToProfile(usernameOrUUID);
    }),
});
