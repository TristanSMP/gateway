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
          title: "Playerlist",
          description: [
            "```json",
            "[",
            ...onlinePlayers.map((p) => `  "${p.name}",`),
            "]",
            "```",
          ].join("\n"),
          fields: [
            {
              name: "Players",
              value: `${onlinePlayers.length}`,
            },
          ],
          color: EmbedColor.Invisible,
        },
      ],
    });
  },
};

export default OnlinePlayers;
