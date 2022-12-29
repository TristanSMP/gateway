import { APIEmbedField } from "discord-api-types/v10";
import { z } from "zod";
import { chunkUUID } from "./minecraft";

const McMMODataSchema = z.object({
  error: z.literal(false),
  powerLevel: z.number(),
  excavation: z.number(),
  fishing: z.number(),
  Herbalism: z.number(),
  mining: z.number(),
  woodcutting: z.number(),
  archery: z.number(),
  axes: z.number(),
  swords: z.number(),
  taming: z.number(),
  unarmed: z.number(),
  acrobatics: z.number(),
  alchemy: z.number(),
  repair: z.number(),
});

const McMMOGetSchema = z.union([
  z.object({
    error: z.literal(true),
    message: z.string(),
  }),
  McMMODataSchema,
]);

export type APIStats = z.infer<typeof McMMODataSchema>;
export type GetStatsJSONResult = z.infer<typeof McMMOGetSchema>;

const skillNameMap: Record<keyof APIStats, string> = {
  repair: "Repair",
  fishing: "Fishing",
  axes: "Axes",
  swords: "Swords",
  powerLevel: "Power Level",
  alchemy: "Alchemy",
  Herbalism: "Herbalism",
  mining: "Mining",
  acrobatics: "Acrobatics",
  woodcutting: "Woodcutting",
  excavation: "Excavation",
  unarmed: "Unarmed",
  archery: "Archery",
  taming: "Taming",
  error: "Error",
};

export async function getUserStats(uuid: string): Promise<GetStatsJSONResult> {
  const stats = await fetch(
    `https://pipe.tristansmp.com/players/uuid/${chunkUUID(uuid)}/mcmmo`
  );

  if (stats.status !== 200) {
    throw new Error("Failed to fetch stats");
  }

  const json = await stats.json();

  return McMMOGetSchema.parse(json);
}

export function getStatsEmbedFields(
  stats: GetStatsJSONResult
): APIEmbedField[] {
  if (stats.error) {
    return [
      {
        name: "Error",
        value: stats.message,
      },
    ];
  }

  return Object.entries(stats)
    .filter(([key]) => key !== "error")
    .map(([key, value]) => ({
      name: skillNameMap[key as keyof APIStats],
      value: value.toString(),
    }));
}

export function translateSkillNames(stats: APIStats): APIStats {
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [
      skillNameMap[key as keyof APIStats],
      value,
    ])
  ) as APIStats;
}
