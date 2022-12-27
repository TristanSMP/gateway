import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createApplicationChannel } from "../../lib/discord";
import { getDiscordUser } from "../../lib/utils";
import { protectedProcedure, router } from "../trpc";

export const ApplicationSchema = z.object({
  mcUsername: z.string().max(48),
  whyJoin: z.string().max(1000),
  howLongWillYouPlay: z.string().max(50),
});

export const applicationsRouter = router({
  submitApplication: protectedProcedure
    .input(ApplicationSchema)
    .mutation(async ({ ctx, input }) => {
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

      if (user.application) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already applied",
        });
      }

      const application = await ctx.prisma.application.create({
        data: {
          data: input,
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
        input
      );

      return {
        applicationId: application.id,
      };
    }),
});
