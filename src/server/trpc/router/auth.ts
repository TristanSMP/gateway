import { TRPCError } from "@trpc/server";
import { generateLinkChallenge } from "../../lib/linking";
import { protectedProcedure, router } from "../trpc";
import { ApplicationSchema } from "./applications";

export const authRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: { application: true },
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
      sentApplication: !!user.application,
    };
  }),
  createCollector: protectedProcedure.mutation(async ({ ctx }) => {
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

    const player = await ctx.elytra.players.get(mcUsername);

    if (!player) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Player not found",
      });
    }

    const collector = await player.chat.createCollector();

    return {
      created: collector,
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

    const message = await player.chat.checkCollector();

    if (message.status !== "collected") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No message collected",
      });
    }

    if (message.result !== linkChallenge) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid message",
      });
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
