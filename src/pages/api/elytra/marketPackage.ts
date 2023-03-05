import { ItemStack, ItemStackSchema } from "elytra";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { elytra, prisma } from "../../../server/db/client";
import { MarketUtils } from "../../../server/lib/market/utils.js";

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
      price: z.number(),
      item: ItemStackSchema,
    })
    .parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      minecraftUUID: data.uuid,
    },
  });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const item = new ItemStack(elytra, data.item);

  await MarketUtils.items.listItem(item, data.price, user);

  return res.status(200).json({
    success: true,
  });
}
