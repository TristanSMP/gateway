import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import {
  filterStockedItems,
  getCheapestStockedItem,
} from "../../../server/lib/market/filter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== env.ELYTRA_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const data = z
    .object({
      location: z.string(),
    })
    .parse(req.body);

  const signShop = await prisma.signShop.findUnique({
    where: {
      location: data.location,
    },
    include: {
      owner: true,
      item: {
        include: {
          stock: true,
        },
      },
    },
  });

  if (!signShop || !signShop.item) {
    return res.status(400).json({ userLandError: "Sign Shop not found" });
  }

  if (!signShop.owner.minecraftUUID) {
    return res.status(400).json({ userLandError: "Sign Shop owner not found" });
  }

  const filtered = filterStockedItems(signShop.item.stock, signShop.owner.id);

  const cheapest = getCheapestStockedItem(filtered);

  return res.status(200).json({
    id: signShop.id,
    location: signShop.location,
    owner: signShop.owner.minecraftUUID,
    item: signShop.item.base64,
    price: cheapest?.price || null,
    stock: filtered.length,
  });
}
