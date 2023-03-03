import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";

export const metaRouter = router({
  getPlayerList: publicProcedure.query(async ({ ctx: { elytra } }) => {
    try {
      const players = await elytra.players.get();

      return {
        players: players.map((player) => {
          return {
            name: player.name,
            uuid: player.uuid,
          };
        }),
      };
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch players",
      });
    }
  }),
});
