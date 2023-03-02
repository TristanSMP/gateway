import { ApplicationStatus } from "@prisma/client";
import { UUIDToProfile } from "../../lib/minecraft";
import { getDiscordUserSafe } from "../../lib/utils";
import { adminProcedure, router } from "../trpc";

export interface IAdminDashboardUser {
  /**
   * TSMPU Id
   */
  id: string;

  /**
   * TSMPU Name
   */
  name: string;

  /**
   * A TSMP Member or not
   */
  isMember: boolean;

  /**
   * Discord Id
   */
  discordId?: string;

  /**
   * Minecraft stuff
   */
  minecraft?: {
    /**
     * Minecraft UUID
     */
    uuid: string;

    /**
     * Minecraft Username
     */
    username: string;

    /**
     * Minecraft Alternative Accounts
     */
    alts: {
      /**
       * Minecraft UUID
       */
      uuid: string;

      /**
       * Minecraft Username
       */
      username: string;
    }[];
  };
}

export const adminRouter = router({
  getEveryUser: adminProcedure.query(async ({ ctx: { prisma } }) => {
    // this has to be a bad idea fetching all users from the database

    const users = await prisma.user.findMany({
      include: {
        minecraftAlternativeAccounts: true,
        accounts: true,
        application: true,
      },
    });

    const mappedUsers: IAdminDashboardUser[] = await Promise.all(
      users.map(async (user) => {
        const minecraft = user.minecraftUUID
          ? {
              uuid: user.minecraftUUID,
              username: await UUIDToProfile(user.minecraftUUID)
                .then((p) => p.name)
                .catch(() => "Failed to resolve!"),
              alts: await Promise.all(
                user.minecraftAlternativeAccounts.map(async (alt) => ({
                  uuid: alt.minecraftUUID,
                  username: await UUIDToProfile(alt.minecraftUUID)
                    .then((p) => p.name)
                    .catch(() => "Failed to resolve!"),
                }))
              ),
            }
          : undefined;

        const discord = getDiscordUserSafe(user.accounts);

        return {
          id: user.id,
          name: user.name ?? "Unnamed",
          discordId: discord?.id,
          minecraft,
          isMember:
            user.application?.status === ApplicationStatus.Approved
              ? true
              : false,
        };
      })
    );

    return mappedUsers;
  }),
});
