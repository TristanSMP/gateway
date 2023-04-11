import type { Account, User } from "@prisma/client";
import { Routes } from "discord-api-types/v10";
import { DisployApp } from "../../bot/main";
import { env } from "../../env/server.mjs";
import { elytra, prisma } from "../db/client";
import { getDiscordUser } from "./utils";

export async function userIsSupporter(user: User): Promise<boolean> {
  if (!user.supporterUntil) return false;

  if (user.supporterUntil.getTime() < new Date().getTime()) {
    await manageSupporter(user, null);
    return false;
  }

  return true;
}

/**
 * Manage a user's supporter status
 * @param user The user to manage
 * @param supporterUntil A date a user should be supporter until. If null, the user will have supporter removed.
 */
export async function manageSupporter(
  user: User,
  supporterUntil: Date | null
): Promise<void> {
  const newUser = await prisma.user.update({
    where: { id: user.id },
    data: { supporterUntil },
    include: { accounts: true },
  });

  await performSupporterSideEffects(newUser);
}

/**
 * Perform side effects of a user becoming a supporter
 * @param user The user to perform side effects for
 */
async function performSupporterSideEffects(
  user: User & { accounts: Account[] }
): Promise<void> {
  const discordUser = getDiscordUser(user.accounts);

  // Discord
  try {
    if (discordUser) {
      if (user.supporterUntil) {
        await DisployApp.rest.put(
          Routes.guildMemberRole(
            env.DISCORD_GUILD_ID,
            discordUser.id,
            "1077383525579378718" // Yes I know this is bad, I could not be bothered to go through the effort of setting another env variable
          )
        );
      } else {
        await DisployApp.rest.delete(
          Routes.guildMemberRole(
            env.DISCORD_GUILD_ID,
            discordUser.id,
            "1077383525579378718"
          )
        );
      }
    }
  } catch (error) {
    console.log(error);
  }

  // Minecraft
  try {
    if (user.minecraftUUID) {
      if (user.supporterUntil) {
        await elytra.lp.addPermission(user.minecraftUUID, "group.supporter");
      } else {
        await elytra.lp.removePermission(user.minecraftUUID, "group.supporter");
      }
    }
  } catch (error) {
    console.log(error);
  }
}
