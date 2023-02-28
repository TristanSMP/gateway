import { AuctionStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { ItemStack } from "elytra";
import { z } from "zod";
import { MarketSerializer } from "../../lib/market/serialization";
import { MarketUtils } from "../../lib/market/utils";
import {
  onlinePlayerMemberProcedure,
  playerMemberProcedure,
  router,
} from "../trpc";

export const marketRouter = router({
  discoveredItemTypes: playerMemberProcedure.query(async ({}) => {
    const discoveredItems = await MarketUtils.items.getDiscoveredItemTypes();

    return discoveredItems;
  }),
  getItemType: playerMemberProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input: { id } }) => {
      const itemType = await MarketUtils.items.getItemType(id);

      if (!itemType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item type not found",
        });
      }

      return MarketSerializer.serializeDiscoveredItem(itemType);
    }),
  inventory: onlinePlayerMemberProcedure.query(async ({ ctx: { player } }) => {
    const items = MarketSerializer.serializeInventory(player.inventory.items);

    return items;
  }),
  sellItem: onlinePlayerMemberProcedure
    .input(
      z.object({
        index: z.number(),
        price: z.number().positive().int().min(1),
      })
    )
    .mutation(async ({ ctx: { user, player }, input: { index, price } }) => {
      const item = player.inventory.items[index];

      if (!item) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Item not found",
        });
      }

      await player.inventory.removeItem(index);

      try {
        await MarketUtils.items.listItem(item, price, user);

        return true;
      } catch (error) {
        await player.inventory.addItem(item);
        throw error;
      }
    }),
  depositDiamonds: onlinePlayerMemberProcedure
    .input(
      z.object({
        amount: z.number().positive().int().min(1),
      })
    )
    .mutation(async ({ ctx: { player, prisma, user }, input: { amount } }) => {
      const diamondsInInventory = player.inventory.items.filter(
        (item) => item?.id === "minecraft:diamond"
      ).length;

      if (diamondsInInventory < amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Not enough diamonds in inventory",
        });
      }

      const takenItems: ItemStack[] = [];

      try {
        for (let i = 0; i < amount; i++) {
          const index = player.inventory.items.findIndex(
            (item) => item?.id === "minecraft:diamond"
          );

          await player.inventory.removeItem(index);
          const stack = player.inventory.items[index];
          if (stack) takenItems.push(stack);
        }

        await prisma.user.update({
          data: {
            balance: {
              increment: amount,
            },
          },
          where: {
            id: user.id,
          },
        });
      } catch (error) {
        for (const stack of takenItems) {
          await player.inventory.addItem(stack);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to deposit diamonds",
        });
      }
    }),
  balance: onlinePlayerMemberProcedure.query(async ({ ctx: { user } }) => {
    return user.balance;
  }),
  buyItem: onlinePlayerMemberProcedure
    .input(
      z.object({
        id: z.string(), // id of the auctioneditem
      })
    )
    .mutation(async ({ ctx: { player, user, prisma }, input: { id } }) => {
      const auctionedItem = await prisma.auctionedItem.findFirst({
        where: {
          id,
          status: AuctionStatus.ACTIVE,
        },
        include: {
          seller: true,
          type: true,
        },
      });

      if (!auctionedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found",
        });
      }

      await MarketUtils.items.buyItem(auctionedItem, user, player);

      return true;
    }),
});
