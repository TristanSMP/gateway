import type { Account } from "@prisma/client";
import { prisma } from "../db/client";

export interface DiscordAccount {
  id: string;
  accessToken: string | null;
}

export function getDiscordUser(accounts: Account[]): DiscordAccount {
  const pac = accounts.find((a) => a.provider === "discord");
  if (!pac) throw new Error("No discord account found");
  return {
    id: pac.providerAccountId,
    accessToken: pac.access_token,
  };
}

export async function getTSMPUser(discordUserId: string) {
  const user = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "discord",
        providerAccountId: discordUserId,
      },
    },
    include: {
      user: {
        include: {
          application: true,
          accounts: true,
        },
      },
    },
  });

  if (!user) throw new Error("No user found");
  return user.user;
}
