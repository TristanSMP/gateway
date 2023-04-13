import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { UserError } from "../../../server/lib/UserError";
import {
  filterStockedItems,
  getCheapestStockedItem,
} from "../../../server/lib/market/filter";
import { MarketUtils } from "../../../server/lib/market/utils";

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
      uuid: z.string(),
    })
    .parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      minecraftUUID: data.uuid,
    },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return res.status(400).json({ userLandError: "User not found" });
  }

  const signShop = await prisma.signShop.findFirst({
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

  if (!cheapest) {
    return res.status(400).json({ userLandError: "No stock" });
  }

  const item = await prisma.auctionedItem.findFirst({
    where: {
      id: cheapest.id,
    },
    include: {
      type: true,
      seller: {
        include: {
          accounts: true,
        },
      },
    },
  });

  if (!item) {
    return res.status(400).json({ userLandError: "Item not found" });
  }
  try {
    await MarketUtils.items.buyItem(item, user);

    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    if (UserError.isUserError(e)) {
      return res.status(400).json({ userLandError: e.message });
    }
    throw e;
  }
}
