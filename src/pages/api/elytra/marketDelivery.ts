import { AuctionStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

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

  const itemb64s = itemsInTransit
    .filter((item) => item.type)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- filtered out nulls
    .map((item) => item.type!.base64);

  return res.status(200).json({ items: itemb64s });
}
