import type { Account, AuctionedItem, ItemType, User } from "@prisma/client";
import { AuctionStatus } from "@prisma/client";
import type { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import type { ItemStack } from "elytra";
import type { z } from "zod";
import { DisployApp } from "../../../bot/main";
import { EmbedColor } from "../../../bot/utils/embeds";
import { sha256 } from "../../../utils/hashing";
import { prisma } from "../../db/client";
import { UserError } from "../UserError";
import { BarrierTexture, ItemTextures } from "../textures";
import { getDiscordUserSafe } from "../utils";
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
    seller: User & {
      accounts: Account[];
    };
  },
  buyerUser: User & {
    accounts: Account[];
  }
) {
  if (
    buyerUser.minecraftUUID === null ||
    auctionedItem.seller.minecraftUUID === null
  ) {
    throw new UserError(
      "You or the seller does not have a linked Minecraft account. Please link your Minecraft account to your tsmp market account by running `/link <your minecraft username>`."
    );
  }

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

  const buyerDiscord = await getDiscordUserSafe(buyerUser.accounts);
  const sellerDiscord = await getDiscordUserSafe(auctionedItem.seller.accounts);

  const meta = MarketItemMetadata.parse(auctionedItem.type.metadata);

  await DisployApp.rest.post(Routes.channelMessages("1095921015843991593"), {
    embeds: [
      {
        title: "Item Purchased",
        description: `**Buyer**: ${
          buyerDiscord?.id
            ? `<@${buyerDiscord.id}>`
            : `\`buyerUser.minecraftUUID\``
        }\n**Seller**: ${
          sellerDiscord?.id
            ? `<@${sellerDiscord.id}>`
            : `\`auctionedItem.seller.minecraftUUID\``
        }\n**Item**: [${
          auctionedItem.type.name
        }](https://tristansmp.com/market/${auctionedItem.type.b64key}) x ${
          meta.amount
        }\n**Price**: ${auctionedItem.price} diamonds`,
        color: EmbedColor.Invisible,
        thumbnail: {
          url: `https://tristansmp.com/api/i/${auctionedItem.type.namespacedId}`,
        },
      },
    ],
  } satisfies RESTPostAPIChannelMessageJSONBody);
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
