import { AuctionStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { SingleDiamondB64 } from "../../../utils/Constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== env.ELYTRA_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const data = z
    .object({
      uuid: z.string(),
    })
    .parse(req.body);

  const itemsInTransit = await prisma.auctionedItem.findMany({
    where: {
      buyer: {
        minecraftUUID: data.uuid,
      },
      status: AuctionStatus.IN_TRANSIT,
    },
    include: {
      type: true,
    },
  });

  const updated = await prisma.auctionedItem.updateMany({
    where: {
      buyer: {
        minecraftUUID: data.uuid,
      },
      status: AuctionStatus.IN_TRANSIT,
    },

    data: {
      status: AuctionStatus.SOLD,
    },
  });

  if (updated.count !== itemsInTransit.length) {
    return res.status(400).json({ error: "Mismatched items" });
  }

  const itemb64s = itemsInTransit
    .filter((item) => item.type)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- filtered out nulls
    .map((item) => item.type!.base64);

  if (itemb64s.length === 0) {
    const user = await prisma.user.findUnique({
      where: {
        minecraftUUID: data.uuid,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.balance < 1) {
      return res.status(200).json({ items: [] });
    }

    await prisma.user.update({
      where: {
        minecraftUUID: data.uuid,
      },
      data: {
        balance: 0,
      },
    });

    const diamonds = Array.from(
      { length: user.balance },
      () => SingleDiamondB64
    );

    return res.status(200).json({ items: diamonds });
  }

  return res.status(200).json({ items: itemb64s });
}
