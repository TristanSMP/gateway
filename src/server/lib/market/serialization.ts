import type { AuctionedItem, ItemType } from "@prisma/client";
import type { ItemStack } from "elytra";
import { MarketUtils } from "./utils";

export interface PartialItemPayload {
  name: string;
  image: string;
  type: string;
}

export interface ItemPayload extends PartialItemPayload {
  amount: number;

  /**
   * The inventory index of the un-abstracted item
   */
  index: number;
}

function serializeItem(item: ItemStack, index: number): ItemPayload {
  return {
    name: item.name,
    amount: item.amount,
    image: MarketUtils.items.findItemTexture(item.id),
    type: item.id,
    index: index,
  };
}

export type InventorySlotPayload = ItemPayload | null;

export interface InventoryPayload {
  hotBar: InventorySlotPayload[];
  inventory: InventorySlotPayload[];
  armor: InventorySlotPayload[];
  offHand: InventorySlotPayload[];
}

function serializeInventory(items: (ItemStack | null)[]): InventoryPayload {
  return {
    hotBar: items
      .slice(0, 9)
      .map((item) => (item ? serializeItem(item, items.indexOf(item)) : null)),
    inventory: items
      .slice(9, 36)
      .map((item) => (item ? serializeItem(item, items.indexOf(item)) : null)),
    armor: items
      .slice(36, 40)
      .map((item) => (item ? serializeItem(item, items.indexOf(item)) : null)),
    offHand: items
      .slice(40, 41)
      .map((item) => (item ? serializeItem(item, items.indexOf(item)) : null)),
  };
}

export interface DiscoveredItemPayload extends PartialItemPayload {
  sellers: {
    price: number;
    /**
     * The auctioned item id
     */
    id: string;
  }[];

  /**
   * the sha256 hash of the base64 encoded item from a bukkit helper
   */
  id: string;
  cheapest: {
    price: number;
    /**
     * The auctioned item id
     */
    id: string;
  };
}

function serializeDiscoveredItem(
  item: ItemType & {
    stock: AuctionedItem[];
  }
): DiscoveredItemPayload {
  const cheapest = item.stock.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr
  );

  return {
    name: item.name,
    image: MarketUtils.items.findItemTexture(item.namespacedId),
    type: item.id,
    sellers: item.stock.map((stock) => ({
      price: stock.price,
      id: stock.id,
    })),
    id: item.b64key,
    cheapest: {
      price: cheapest.price,
      id: cheapest.id,
    },
  };
}

export const MarketSerializer = {
  serializeItem,
  serializeInventory,
  serializeDiscoveredItem,
};
