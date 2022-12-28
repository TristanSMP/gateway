import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createApplicationChannel } from "../../lib/discord";
import { generateLinkChallenge } from "../../lib/linking";
import { UsernameToProfile } from "../../lib/minecraft";
import { getDiscordUser } from "../../lib/utils";
import { protectedProcedure, router } from "../trpc";

export const ApplicationSchema = z.object({
  whyJoin: z.string().max(1000),
  howLongWillYouPlay: z.string().max(50),
});

export const onboardingRouter = router({
  findPlayer: protectedProcedure
    .input(
      z.object({
        mcUsername: z.string().max(48),
      })
    )
    .query(async ({ input: { mcUsername } }) => {
      const profile = await UsernameToProfile(mcUsername);

      if (!profile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Player not found",
        });
      }

      return {
        ...profile,
        avatar: `https://crafatar.com/avatars/${profile.id}?size=128&overlay`,
      };
    }),
  prepareVerification: protectedProcedure
    .input(
      z.object({
        mcUsername: z.string().max(48),
      })
    )
    .mutation(async ({ ctx, input: { mcUsername } }) => {
      const player = await ctx.elytra.players.get(mcUsername);

      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Player not found, make sure you're online",
        });
      }

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

      await player.chat.createCollector().catch(() => {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create collector",
        });
      });

      return {
        challenge,
      };
    }),
  verify: protectedProcedure
    .input(
      z.object({
        mcUsername: z.string().max(48),
      })
    )
    .mutation(async ({ ctx, input: { mcUsername } }) => {
      const player = await ctx.elytra.players.get(mcUsername);

      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Player not found, make sure you're online",
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const challenge = await player.chat.checkCollector();

      if (challenge.status !== "collected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to collect challenge, try again",
          cause: challenge.status,
        });
      }

      if (challenge.result !== user.linkChallenge) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Challenge is incorrect",
        });
      }

      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          linkChallenge: null,
          minecraftUUID: player.uuid,
        },
      });

      return {
        success: true,
      };
    }),

  submitApplication: protectedProcedure
    .input(ApplicationSchema)
    .mutation(async ({ ctx, input: { whyJoin, howLongWillYouPlay } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          accounts: true,
          application: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.minecraftUUID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must link your Minecraft account",
        });
      }

      if (user.application) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already applied",
        });
      }

      const application = await ctx.prisma.application.create({
        data: {
          data: {
            whyJoin,
            howLongWillYouPlay,
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      await createApplicationChannel(
        application,
        getDiscordUser(user.accounts).id,
        {
          whyJoin,
          howLongWillYouPlay,
        }
      );

      return {
        applicationId: application.id,
      };
    }),
  status: protectedProcedure.query(async ({ ctx }) => {
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

    return {
      stages: {
        linkMinecraft: !!user.minecraftUUID,
        doApplication: !!user.application,
      },
    };
  }),
});
