import { AuctionStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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
  depositDiamonds: onlinePlayerMemberProcedure.mutation(async ({}) => {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "bug found in depositDiamonds",
    });

    // const diamondsInInventory = player.inventory.items
    //   .map((item: ItemStack | null, index: number) => ({
    //     item,
    //     index,
    //   }))
    //   .filter((item) => item.item?.id === "DIAMOND")
    //   .filter((item) => item.item !== null) as {
    //   item: ItemStack;
    //   index: number;
    // }[];

    // if (diamondsInInventory.length === 0) {
    //   throw new TRPCError({
    //     code: "BAD_REQUEST",
    //     message: "Not enough diamonds in inventory",
    //   });
    // }

    // let diamondsDeposited = 0;

    // try {
    //   for (const diamond of diamondsInInventory) {
    //     diamondsDeposited += diamond.item.amount;

    //     console.log(diamond);

    //     await player.inventory.removeItem(diamond.index);
    //   }

    //   await prisma.user.update({
    //     data: {
    //       balance: {
    //         increment: diamondsDeposited,
    //       },
    //     },
    //     where: {
    //       id: user.id,
    //     },
    //   });
    // } catch (error) {
    //   console.error(error);

    //   const newPlayer = await elytra.players.get(player.uuid);

    //   if (!newPlayer) {
    //     throw new TRPCError({
    //       code: "INTERNAL_SERVER_ERROR",
    //       message: "Failed to deposit diamonds",
    //     });
    //   }

    //   const newDiamondsInInventory = newPlayer.inventory.items
    //     .filter((item: ItemStack | null) => item?.id === "DIAMOND")
    //     .filter((item: ItemStack | null) => item !== null) as ItemStack[];

    //   if (newDiamondsInInventory.length !== diamondsInInventory.length) {
    //     const difference =
    //       diamondsInInventory.length - newDiamondsInInventory.length;

    //     for (let i = 0; i < difference; i++) {
    //       await newPlayer.inventory.addItem(SingleDiamondB64);
    //     }
    //   }

    //   throw new TRPCError({
    //     code: "INTERNAL_SERVER_ERROR",
    //     message: "Failed to deposit diamonds",
    //   });
    // }
  }),
  balance: playerMemberProcedure.query(async ({ ctx: { user } }) => {
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
