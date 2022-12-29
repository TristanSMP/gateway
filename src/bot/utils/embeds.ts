import type { APIEmbed } from "discord-api-types/v10";

export enum EmbedColor {
  Red = 0xff0000,
  Green = 0x00ff00,
  Invisible = 0x2f3136,
}

export interface Status {
  entity: string;
  description: string;
  sideEffects: {
    [key: string]: boolean;
  };
  success: boolean;
}

export const createStatusEmbed = (status: Status): APIEmbed => {
  return {
    title: `Updated ${status.entity}`,
    description: status.description,
    fields: Object.entries(status.sideEffects).map(([key, value]) => ({
      name: key,
      value: value ? "✅" : "❌",
      inline: true,
    })),
    color: status.success ? EmbedColor.Green : EmbedColor.Red,
  };
};
