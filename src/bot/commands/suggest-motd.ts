import { ApplicationStatus } from "@prisma/client";
import type { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import {
  ApplicationCommandOptionType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { env } from "../../env/server.mjs";
import { getTSMPUser } from "../../server/lib/utils";
import { EmbedColor } from "../utils/embeds";

const SuggestMOTD: Command = {
  name: "suggest-motd",
  description: "Suggest an MOTD",
  options: [
    {
      name: "line1",
      description: "The first line of the MOTD",
      type: ApplicationCommandOptionType.String,
      required: true,
      max_length: 30,
    },
    {
      name: "line2",
      description: "The second line of the MOTD",
      type: ApplicationCommandOptionType.String,
      required: false,
      max_length: 30,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const tsmpUser = await getTSMPUser(interaction.user.id).catch(() => null);

    if (
      !tsmpUser ||
      tsmpUser.application?.status !== ApplicationStatus.Approved
    ) {
      return void interaction.reply({
        content: "You are not a member.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const line1 = interaction.options.getString("line1", false);
    const line2 = interaction.options.getString("line2", true);

    await interaction.app.rest.post<RESTPostAPIChannelMessageJSONBody, unknown>(
      Routes.channelMessages(env.DISCORD_REVIEW_QUEUE_CHANNEL_ID),
      {
        content: `<@97470053615673344>`,
        embeds: [
          {
            title: "New MOTD",
            description: [
              `Submitted by ${interaction.user}`,
              "```",
              "      - |-",
              `        &d&l&oTS &6${line1}&r`,
              `        &d&l&oMP &6${line2 ?? ""}`,
              "```",
            ].join("\n"),
            color: EmbedColor.Invisible,
          },
        ],
      }
    );

    interaction.reply({
      embeds: [
        {
          title: "Submitted MOTD",
          description:
            "Your MOTD has been submitted. It will be considered by tristan himself.",
          color: EmbedColor.Invisible,
        },
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default SuggestMOTD;
