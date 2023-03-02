import { ApplicationStatus } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Protected procedure (needs client to be logged in)
 **/
export const protectedProcedure = t.procedure
  .use(isAuthed)
  .use(async ({ ctx, next }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        application: true,
        accounts: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
        user,
      },
    });
  });

/**
 * playerProcedure (needs client to be logged in and have a minecraft account linked)
 */
export const playerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.minecraftUUID) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You must have a Minecraft account linked to do this",
    });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
      user: { ...ctx.user, minecraftUUID: ctx.user.minecraftUUID },
    },
  });
});

/**
 * onlinePlayerProcedure (needs client to be logged in and have a minecraft account linked that's online)
 */
export const onlinePlayerProcedure = playerProcedure.use(
  async ({ ctx, next }) => {
    const player = await ctx.elytra.players.get(ctx.user.minecraftUUID);

    if (!player) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must be online to do this",
      });
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
        player,
      },
    });
  }
);

/**
 * playerMemberProcedure (needs client to be logged in and have a minecraft account linked that's online and a member of the server)
 */
export const playerMemberProcedure = playerProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.user.application?.status !== ApplicationStatus.Approved) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must be a member to do this",
      });
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  }
);

/**
 * onlinePlayerMemberProcedure (needs client to be logged in and have a minecraft account linked that's online and a member of the server)
 */
export const onlinePlayerMemberProcedure = onlinePlayerProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.user.application?.status !== ApplicationStatus.Approved) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must be a member to do this",
      });
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
        player: ctx.player,
      },
    });
  }
);

/**
 * adminProcedure (needs client to be logged in have admin dashboard access)
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.canAccessAdminDashboard) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You must be an admin to do this",
    });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
      user: { ...ctx.user },
    },
  });
});
