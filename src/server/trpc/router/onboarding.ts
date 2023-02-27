import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createApplicationChannel } from "../../lib/discord";
import { generateLinkChallenge } from "../../lib/linking";
import { UsernameToProfile } from "../../lib/minecraft";
import { getDiscordUser } from "../../lib/utils";
import { protectedProcedure, router } from "../trpc";

export const applicationLengths = {
  whyJoin: 1000,
  howLongWillYouPlay: 50,
} as const;

export const ApplicationSchema = z.object({
  whyJoin: z.string().max(applicationLengths.whyJoin),
  howLongWillYouPlay: z.string().max(applicationLengths.howLongWillYouPlay),
});

export const onboardingRouter = router({
  findPlayer: protectedProcedure
    .input(
      z.object({
        mcUsername: z.string().max(48),
      })
    )
    .query(async ({ ctx, input: { mcUsername } }) => {
      if (mcUsername.startsWith(".")) {
        return {
          id: "00000000-0000-0000-0000-000000000000",
          name: mcUsername,
          avatar:
            "https://crafatar.com/avatars/00000000-0000-0000-0000-000000000000?size=128&overlay",
          online: true,
        };
      }

      const profile = await UsernameToProfile(mcUsername);

      if (!profile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Player not found",
        });
      }

      const player = await ctx.elytra.players.get(mcUsername);

      return {
        ...profile,
        avatar: `https://crafatar.com/avatars/${profile.id}?size=128&overlay`,
        online: player ? true : false,
      };
    }),
  prepareVerification: protectedProcedure
    .input(
      z.object({
        mcUsername: z.string().max(48),
      })
    )
    .mutation(async ({ ctx, input: { mcUsername } }) => {
      const players = await ctx.elytra.players.get();
      const player = players.find((p) => p.name === mcUsername);

      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Player not found, make sure you're online",
        });
      }

      let challenge = ctx.user.linkChallenge;

      if (!challenge) {
        challenge = generateLinkChallenge();

        await ctx.prisma.user.update({
          where: {
            id: ctx.user.id,
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
      const players = await ctx.elytra.players.get();
      const player = players.find((p) => p.name === mcUsername);

      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Player not found, make sure you're online on tristansmp.com",
        });
      }

      const challenge = await player.chat.checkCollector();

      if (challenge.status !== "collected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to collect challenge, try again",
          cause: challenge.status,
        });
      }

      if (challenge.result !== ctx.user.linkChallenge) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Challenge is incorrect",
        });
      }

      await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
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
    .mutation(
      async ({
        ctx: { user, prisma },
        input: { whyJoin, howLongWillYouPlay },
      }) => {
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

        const application = await prisma.application.create({
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
      }
    ),
  status: protectedProcedure.query(async ({ ctx: { user } }) => {
    return {
      stages: {
        linkMinecraft: !!user.minecraftUUID,
        doApplication: !!user.application,
      },
      applicationLengths,
    };
  }),
});
