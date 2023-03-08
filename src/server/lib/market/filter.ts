import type { AuctionedItem } from "@prisma/client";
import { AuctionStatus } from "@prisma/client";

export function getCheapestStockedItem(
  stock: AuctionedItem[]
): AuctionedItem | null {
  if (stock.length === 0) return null;

  return stock.reduce((prev, current) =>
    prev.price > current.price ? current : prev
  );
}

export function filterStockedItems(
  stock: AuctionedItem[],
  filterByTSMPUID: string
): AuctionedItem[] {
  return stock.filter(
    (item) =>
      item.sellerId === filterByTSMPUID && item.status === AuctionStatus.ACTIVE
  );
}
