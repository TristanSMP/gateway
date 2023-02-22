import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { updateRoleMeta } from "../../../server/lib/discord";
import { syncUser } from "../../../server/lib/linking";
import adminMiddleware from "../../../utils/adminMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const validUsers = await prisma.user.findMany({
    where: {
      application: {
        isNot: null,
      },
      minecraftUUID: {
        not: null,
      },
    },
    include: {
      application: true,
      accounts: true,
    },
  });

  let totalSyncedTSMPUsers = 0;
  let totalSyncedDiscordUsers = 0;

  let totalFailedSyncedTSMPUsers = 0;
  let totalFailedSyncedDiscordUsers = 0;

  for (const user of validUsers) {
    await syncUser(user)
      .then(() => {
        totalSyncedTSMPUsers++;
      })
      .catch(() => {
        totalFailedSyncedTSMPUsers++;
      });
    await updateRoleMeta(user)
      .then(() => {
        totalSyncedDiscordUsers++;
      })
      .catch(() => {
        totalFailedSyncedDiscordUsers++;
      });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  res.status(200).json({
    totalSyncedTSMPUsers,
    totalSyncedDiscordUsers,
    totalFailedSyncedTSMPUsers,
    totalFailedSyncedDiscordUsers,
  });
}

export default adminMiddleware(handler);
