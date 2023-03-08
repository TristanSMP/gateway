import type { AuctionedItem, ItemType, User } from "@prisma/client";
import { AuctionStatus } from "@prisma/client";
import type { ItemStack } from "elytra";
import type { z } from "zod";
import { sha256 } from "../../../utils/hashing";
import { prisma } from "../../db/client";
import { BarrierTexture, ItemTextures } from "../textures";
import { UserError } from "../UserError";
import { MarketItemMetadata } from "./schemas";
import { MarketSerializer } from "./serialization";
import { RefreshKnownSignShops } from "./signShops";

function createItemTypeMetadata(
  item: ItemStack
): z.infer<typeof MarketItemMetadata> {
  return MarketItemMetadata.parse({
    enchantments: Object.entries(item.enchantments).map(([id, level]) => ({
      id,
      level,
    })),
    name: item.name,
    lore: item.lore,
    durability: item.durability,
    amount: item.amount,
  });
}

async function resolveItemType(item: ItemStack) {
  const hashedItem = sha256(item.base64);

  return await prisma.itemType.upsert({
    where: {
      b64key: hashedItem,
    },
    create: {
      base64: item.base64,
      b64key: hashedItem,
      name: item.name,
      namespacedId: item.id,
      metadata: createItemTypeMetadata(item),
    },
    update: {},
    include: {
      stock: true,
    },
  });
}

async function getItemType(hashedItem: string) {
  return await prisma.itemType.findUnique({
    where: {
      b64key: hashedItem,
    },
    include: {
      stock: {
        include: {
          seller: true,
        },
        where: {
          status: AuctionStatus.ACTIVE,
        },
      },
    },
  });
}

async function listItem(item: ItemStack, price: number, seller: User) {
  const itemType = await resolveItemType(item);

  const auctionedItem = await prisma.auctionedItem.create({
    data: {
      price,
      status: AuctionStatus.ACTIVE,
      seller: {
        connect: {
          id: seller.id,
        },
      },
      type: {
        connect: {
          b64key: itemType.b64key,
        },
      },
    },
  });

  await RefreshKnownSignShops(auctionedItem); // mark my words this will be a problem when sign shops are scaled immensely and the vercel serverless function times out
}

function findItemTexture(namespacedId: string): string {
  const fuzzy = ItemTextures.items.find((texture) => {
    return texture.id === `minecraft:${namespacedId.toLowerCase()}`;
  })?.texture;

  if (!fuzzy) {
    return BarrierTexture;
  }

  return fuzzy;
}

async function getDiscoveredItemTypes() {
  const discoveredItems = await prisma.itemType.findMany({
    include: {
      stock: {
        include: {
          seller: true,
        },
        where: {
          status: AuctionStatus.ACTIVE,
        },
      },
    },
  });

  return discoveredItems.map((item) =>
    MarketSerializer.serializeDiscoveredItem(item)
  );
}

async function buyItem(
  auctionedItem: AuctionedItem & {
    type: ItemType | null;
    seller: User;
  },
  buyerUser: User
) {
  if (auctionedItem.status !== AuctionStatus.ACTIVE) {
    throw new UserError("Item is not for sale");
  }

  if (!auctionedItem.type) {
    throw new UserError("Item type not found");
  }

  if (auctionedItem.seller.id === buyerUser.id) {
    throw new UserError("You cannot buy your own item");
  }

  if (auctionedItem.price > buyerUser.balance) {
    throw new UserError(
      "You cannot afford this item. While holding diamonds, run `/deposit` to deposit them into your tsmp market balance."
    );
  }

  /**
   * Stage 1: Transactions
   */

  // Decrement buyer's balance
  await prisma.user.update({
    where: {
      id: buyerUser.id,
    },
    data: {
      balance: {
        decrement: auctionedItem.price,
      },
    },
  });

  // Increment seller's balance
  await prisma.user.update({
    where: {
      id: auctionedItem.seller.id,
    },
    data: {
      balance: {
        increment: auctionedItem.price,
      },
    },
  });

  /**
   * Stage 2: Modify item to be ready for delivery state
   */

  try {
    await prisma.auctionedItem.update({
      where: {
        id: auctionedItem.id,
      },
      data: {
        status: AuctionStatus.IN_TRANSIT,
        buyer: {
          connect: {
            id: buyerUser.id,
          },
        },
      },
    });
  } catch (e) {
    const nonce = Math.random().toString(36).substring(7);
    console.error(`Failed to update item state: ${nonce}`, e);
    throw new Error(`Failed to update item state (nonce: ${nonce})`);
  }

  await RefreshKnownSignShops(auctionedItem); // mark my words this will be a problem when sign shops are scaled immensely and the vercel serverless function times out
}

export const MarketUtils = {
  items: {
    resolveItemType,
    listItem,
    findItemTexture,
    getDiscoveredItemTypes,
    getItemType,
    buyItem,
  },
};
