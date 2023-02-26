import { MessageFlags } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { elytra } from "../../server/db/client";
import { EmbedColor } from "../utils/embeds";

const OnlinePlayers: Command = {
  name: "playerlist",
  description: "Display the playerlist",

  async run(interaction: ChatInputInteraction) {
    const onlinePlayers = await elytra.players.get().catch(() => null);

    if (!onlinePlayers) {
      return void interaction.reply({
        content: "Failed to fetch players",
        flags: MessageFlags.Ephemeral,
      });
    }

    interaction.reply({
      embeds: [
        {
          title: "Server Info",
          description: [
            `**Online Players:** (${onlinePlayers.length})`,
            onlinePlayers.map((player) => `• \`${player.name}\``).join("\n"),
            "",
            "**Fun Facts:**",
            `• There's \`${onlinePlayers.reduce(
              (acc, player) =>
                acc +
                player.inventory.items
                  .map((item) => item?.amount || 0)
                  .reduce((a, b) => a + b, 0),
              0
            )}\` items loaded in the inventory of all players.`,
            `• \`${onlinePlayers
              .map((player) => player.name)
              .reduce((a, b) =>
                a.length > b.length ? a : b
              )}\` has the longest name.`,
            "",
            "**Nerd Info:**",
            `• Base MCV: \`${elytra.minecraftVersion}\``,
            `• Paper Version: \`${elytra.bukkitVersion}\``,
            `• Vercel Deployment: [\`${
              process.env.VERCEL_GIT_COMMIT_SHA
                ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
                : "N/A"
            }\`](${process.env.VERCEL_URL ?? "N/A"})`,
            `• Node.js Version: \`${process.version}\``,
          ].join("\n"),

          color: EmbedColor.Invisible,
        },
      ],
    });
  },
};

export default OnlinePlayers;
