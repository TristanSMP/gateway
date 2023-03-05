import { z } from "zod";

export const MarketItemMetadata = z.object({
  enchantments: z.array(
    z.object({
      id: z.string(),
      level: z.number(),
    })
  ),
  name: z.string(),
  lore: z.array(z.string()),
  durability: z.number(),
  amount: z.number(),
});
