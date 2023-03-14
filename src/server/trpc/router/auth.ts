import { z } from "zod";
import type { TSMPUser } from "../../../types/users";
import { UUIDToProfile } from "../../lib/minecraft";
import { playerMemberProcedure, publicProcedure, router } from "../trpc";

export interface ITSMPUser {
  minecraftUUID: string | null;
  minecraftName: string | null;
  id: string;
  name: string | null;
  image: string | null;
}

export interface ITSMPLocalUser extends ITSMPUser {
  balance: number;
  isBotAdmin: boolean;
  canAccessAdminDashboard: boolean;
}

export const authRouter = router({
  getLocalUser: playerMemberProcedure.query(async ({ ctx: { user } }) => {
    const localUser = await createLocalUserModel(user);

    return localUser;
  }),
  getUser: publicProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number(),
      })
    )
    .mutation(async ({ ctx: { prisma }, input: { skip, take } }) => {
      const dbUsers = await prisma.user.findMany({
        skip,
        take,
      });

      const users: ITSMPUser[] = await Promise.all(
        dbUsers.map(async (user) => ({
          minecraftUUID: user.minecraftUUID,
          minecraftName: user.minecraftUUID
            ? (
                await UUIDToProfile(user.minecraftUUID)
              ).name
            : null,
          id: user.id,
          name: user.name,
          image: user.image,
        }))
      );

      return users;
    }),
});

export async function createLocalUserModel(
  user: TSMPUser
): Promise<ITSMPLocalUser> {
  return {
    minecraftUUID: user.minecraftUUID,
    minecraftName: user.minecraftUUID
      ? (await UUIDToProfile(user.minecraftUUID)).name
      : null,
    id: user.id,
    name: user.name,
    image: user.image,
    balance: user.balance,
    isBotAdmin: user.isBotAdmin,
    canAccessAdminDashboard: user.canAccessAdminDashboard,
  };
}
