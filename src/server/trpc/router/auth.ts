import { TRPCError } from "@trpc/server";
import type { ItemStack } from "elytra";
import { generateLinkChallenge, parseLinkChallenge } from "../../lib/linking";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { ApplicationSchema } from "./applications";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let challenge = user.linkChallenge;

    if (!challenge) {
      challenge = generateLinkChallenge();

      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          linkChallenge: challenge,
        },
      });
    }

    return {
      linked: !!user.minecraftUUID,
      linkChallenge: challenge,
      sentApplication: !!user.applicationId,
    };
  }),
  verifyLinkChallenge: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        application: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.application) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No application",
      });
    }

    const appData = ApplicationSchema.safeParse(user.application.data);

    if (!appData.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid application",
      });
    }

    const { mcUsername } = appData.data;

    if (user.minecraftUUID) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already linked",
      });
    }

    const { linkChallenge } = user;

    if (!linkChallenge) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No link challenge",
      });
    }

    const player = await ctx.elytra.players.get(mcUsername);

    if (!player) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Player not found",
      });
    }

    const slots = player.inventory.items.splice(0, 4);

    for (const slot of slots) {
      if (!slot) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The first 4 slots must be filled with the challenge items",
        });
      }
    }

    const challengeItems = parseLinkChallenge(linkChallenge);

    for (let i = 0; i < 4; i++) {
      const slot = slots[i] as ItemStack;
      const challengeItem = challengeItems[i];

      if (slot.id !== challengeItem) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The first 4 slots must be filled with the challenge items",
        });
      }
    }

    await ctx.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        minecraftUUID: player.uuid,
        linkChallenge: null,
      },
    });

    return true;
  }),
});
