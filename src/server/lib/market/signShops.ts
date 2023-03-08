import type { AuctionedItem } from "@prisma/client";
import { elytra, prisma } from "../../db/client";

export async function RefreshKnownSignShops(auctionedItem: AuctionedItem) {
  const signShops = await prisma.signShop.findMany({
    where: {
      itemb64: auctionedItem.typeb64,
      ownerId: auctionedItem.sellerId,
    },
  });

  if (signShops.length === 0) return;

  for (const signShop of signShops) {
    await elytra
      .post("/signshop/refresh", {
        location: signShop.location,
      })
      .catch((e) => {
        console.error("Failed to refresh sign shop: ", e);
      });
  }
}
