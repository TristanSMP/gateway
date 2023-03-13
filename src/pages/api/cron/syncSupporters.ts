import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { userIsSupporter } from "../../../server/lib/supporter";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const last = await prisma.cacheKV.findFirst({
    where: {
      key: "lastSupporterSync",
    },
  });

  if (!last) {
    return await syncSupporters(res);
  }

  const lastSync = new Date(last.value);

  if (lastSync.getTime() + 1000 * 60 * 60 * 24 > new Date().getTime()) {
    return res.status(200).json({ message: "Not syncing yet" });
  }

  return await syncSupporters(res);
}

export default handler;

async function syncSupporters(res: NextApiResponse) {
  const supporters = await prisma.user.findMany({
    where: {
      supporterUntil: {
        gt: new Date(),
      },
    },
  });

  const supporterToHasSupporter = await Promise.all(
    supporters.map(async (supporter) => {
      const hasSupporter = await userIsSupporter(supporter);
      return {
        user: supporter.id,
        hasSupporter,
      };
    })
  );

  await prisma.cacheKV.upsert({
    where: {
      key: "lastSupporterSync",
    },
    create: {
      key: "lastSupporterSync",
      value: new Date().toISOString(),
    },
    update: {
      value: new Date().toISOString(),
    },
  });

  return res
    .status(200)
    .json({ message: "Synced", sideEffects: supporterToHasSupporter });
}
