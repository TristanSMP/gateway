import type { AuctionedItem, ItemType, User } from "@prisma/client";
import { AuctionStatus } from "@prisma/client";
import type { ItemStack, Player } from "elytra";
import { sha256 } from "../../../utils/hashing";
import { prisma } from "../../db/client";
import { BarrierTexture, ItemTextures } from "../textures";
import { MarketSerializer } from "./serialization";

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
      stock: true,
    },
  });
}

async function listItem(item: ItemStack, price: number, seller: User) {
  const itemType = await resolveItemType(item);

  await prisma.auctionedItem.create({
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
      stock: true,
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
  buyerUser: User,
  buyerPlayer: Player
) {
  if (auctionedItem.status !== AuctionStatus.ACTIVE) {
    throw new Error("Item is not for sale");
  }

  if (!auctionedItem.type) {
    throw new Error("Item type not found");
  }

  if (auctionedItem.seller.id === buyerUser.id) {
    throw new Error("You cannot buy your own item");
  }

  if (auctionedItem.price > buyerUser.balance) {
    throw new Error("You cannot afford this item");
  }

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

  try {
    await prisma.auctionedItem.update({
      where: {
        id: auctionedItem.id,
      },
      data: {
        status: AuctionStatus.SOLD,
        buyer: {
          connect: {
            id: buyerUser.id,
          },
        },
      },
    });

    await buyerPlayer.inventory.addItem(auctionedItem.type.base64);
  } catch (e) {
    await prisma.user.update({
      where: {
        id: buyerUser.id,
      },
      data: {
        balance: {
          increment: auctionedItem.price,
        },
      },
    });

    throw new Error("Failed to add item to inventory");
  }
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
