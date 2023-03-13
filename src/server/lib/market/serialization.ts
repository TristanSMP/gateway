import type { AuctionedItem, ItemType, User } from "@prisma/client";
import type { ItemStack } from "elytra";
import {
  formatEnchantmentLevel,
  formatEnchantmentName,
} from "./enchantmentLang";
import { MarketItemMetadata } from "./schemas";

export interface PartialItemPayload {
  name: string;
  image: string;
  type: string;
  amount: number;
}

export interface ItemPayload extends PartialItemPayload {
  /**
   * The inventory index of the un-abstracted item
   */
  index: number;
}

function serializeItem(item: ItemStack, index: number): ItemPayload {
  return {
    name: item.name,
    amount: item.amount,
    image: `/api/i/${item.id}`,
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

    /**
     * The seller's name
     */
    name: string;
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

    /**
     * The seller's name
     */
    name: string;
  } | null;

  /**
   * The enchantments on the item
   */
  enchantments: string[];

  lore: string[];

  /**
   * The namespaced id of the item
   */
  namespacedId: string;
}

function serializeDiscoveredItem(
  item: ItemType & {
    stock: (AuctionedItem & {
      seller: User;
    })[];
  }
): DiscoveredItemPayload {
  const cheapest =
    item.stock.length > 0
      ? item.stock.reduce((prev, curr) =>
          prev.price < curr.price ? prev : curr
        )
      : null;

  const metadata = MarketItemMetadata.parse(item.metadata);

  return {
    name: item.name,
    amount: metadata.amount,
    enchantments: metadata.enchantments.map(
      (enchantment) =>
        `${formatEnchantmentName(enchantment.id)} ${formatEnchantmentLevel(
          enchantment.level
        )}`
    ),
    lore: metadata.lore,
    image: `/api/i/${item.namespacedId}`,
    type: item.id,
    namespacedId: item.namespacedId,
    sellers: item.stock.map((stock) => ({
      price: stock.price,
      id: stock.id,
      name: stock.seller.name || "Unknown",
    })),
    id: item.b64key,
    cheapest: cheapest
      ? {
          price: cheapest.price,
          id: cheapest.id,
          name: cheapest.seller.name || "Unknown",
        }
      : null,
  };
}

export const MarketSerializer = {
  serializeItem,
  serializeInventory,
  serializeDiscoveredItem,
};
