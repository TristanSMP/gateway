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

export interface IPlayerBalance {
  balance: number;
  itemsInTransit: number;
}

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
  balance: playerMemberProcedure.query(async ({ ctx: { user, prisma } }) => {
    const itemsInTransit = await prisma.auctionedItem.count({
      where: {
        buyer: {
          id: user.id,
        },
        status: AuctionStatus.IN_TRANSIT,
      },
    });

    return { balance: user.balance, itemsInTransit } satisfies IPlayerBalance;
  }),
  buyItem: playerMemberProcedure
    .input(
      z.object({
        id: z.string(), // id of the auctioneditem
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input: { id } }) => {
      const auctionedItem = await prisma.auctionedItem.findFirst({
        where: {
          id,
          status: AuctionStatus.ACTIVE,
        },
        include: {
          seller: {
            include: {
              accounts: true,
            },
          },
          type: true,
        },
      });

      if (!auctionedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Item not found",
        });
      }

      await MarketUtils.items.buyItem(auctionedItem, user);

      return true;
    }),
});
