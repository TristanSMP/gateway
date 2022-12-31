import { TRPCError } from "@trpc/server";
import type { ItemStack } from "elytra";
import { z } from "zod";
import { sha256 } from "../../../utils/hashing";
import { ItemTextures } from "../../lib/textures";
import type { Inventory, Item } from "../../types";
import { protectedProcedure, router } from "../trpc";

const parseItem = (item: ItemStack, index: number): Item => {
  return {
    name: item.name,
    amount: item.amount,
    image: ItemTextures.items.find((texture) => {
      return texture.id.includes(`minecraft:${item.id.toLowerCase()}`);
    })?.texture,
    type: item.id,
    index: index,
  };
};

const parseItems = (items: (ItemStack | null)[]): Inventory => {
  return {
    hotBar: items
      .slice(0, 9)
      .map((item) => (item ? parseItem(item, items.indexOf(item)) : null)),
    inventory: items
      .slice(9, 36)
      .map((item) => (item ? parseItem(item, items.indexOf(item)) : null)),
    armor: items
      .slice(36, 40)
      .map((item) => (item ? parseItem(item, items.indexOf(item)) : null)),
    offHand: items
      .slice(40, 41)
      .map((item) => (item ? parseItem(item, items.indexOf(item)) : null)),
  };
};

export const marketRouter = router({
  discoveredItemTypes: protectedProcedure.query(async ({ ctx }) => {
    const discoveredItems = await ctx.prisma.itemType.findMany();

    return discoveredItems.map((item) => {
      return {
        name: item.name,
        image: ItemTextures.items.find((texture) => {
          return texture.id.includes(
            `minecraft:${item.namespacedId.toLowerCase()}`
          );
        })?.texture,
      };
    });
  }),
  inventory: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.minecraftUUID) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You must link your Minecraft account",
      });
    }

    const player = await ctx.elytra.players.get(user.minecraftUUID);

    if (!player) {
      throw new Error("Player not found");
    }

    const items = parseItems(player.inventory.items);

    return items;
  }),
  sellItem: protectedProcedure
    .input(
      z.object({
        index: z.number(),
        price: z.number().positive().int().min(1),
      })
    )
    .mutation(async ({ ctx, input: { index, price } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.minecraftUUID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must link your Minecraft account",
        });
      }

      const player = await ctx.elytra.players.get(user.minecraftUUID);

      if (!player) {
        throw new Error("Player not found");
      }

      const item = player.inventory.items[index];

      if (!item) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Item not found",
        });
      }

      await player.inventory.removeItem(index);

      const hashedItem = sha256(item.base64);

      try {
        const itemType = await ctx.prisma.itemType.upsert({
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
        });

        await ctx.prisma.auctionedItem.create({
          data: {
            price,
            seller: {
              connect: {
                id: user.id,
              },
            },
            type: {
              connect: {
                b64key: itemType.b64key,
              },
            },
          },
        });

        return true;
      } catch (error) {
        await player.inventory.addItem(item);
        throw error;
      }
    }),
});
