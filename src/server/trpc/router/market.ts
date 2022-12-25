import { publicProcedure, router } from "../trpc";

export const marketRouter = router({
  getDiscoveredItemTypes: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.itemType.findMany();
  }),
});
