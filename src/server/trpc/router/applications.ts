import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.applicationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already applied",
        });
      }

      const application = await ctx.prisma.application.create({
        data: {
          data: input,
          User: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return {
        applicationId: application.id,
      };
    }),
});
