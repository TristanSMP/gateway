import {
  ApplicationCommandOptionType,
  ChannelType,
  MessageFlags,
} from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { env } from "../../env/server.mjs";
import { EmbedColor } from "../utils/embeds";

const ChangeLogChannel = "1057651322901495859";

const ChangeLog: Command = {
  name: "changelog",
  description: "manipulate the changelog",
  options: [
    {
      name: "action",
      description: "addition or removal",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "+ add",
          value: "add",
        },
        {
          name: "- remove",
          value: "remove",
        },
      ],
      required: true,
    },
    {
      name: "entry",
      description: "the changelog entry",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "side-effects",
      description: "the changelog entry's side effects",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const action = interaction.options.getString("action") as "add" | "remove";
    const entry = interaction.options.getString("entry");
    const sideEffects = interaction.options.getString("side-effects", true);

    if (interaction.guild?.id !== env.DISCORD_GUILD_ID) return;

    const guild = await interaction.guild.fetch();
    const channel = await guild.channels.fetch(ChangeLogChannel);

    if (channel.type !== ChannelType.GuildText) return;

    await channel.send({
      embeds: [
        {
          title: action === "add" ? "Added" : "Removed",
          description: entry,
          fields: sideEffects
            ? [
                {
                  name: "Side Effects",
                  value: sideEffects,
                },
              ]
            : [],
          color: action === "add" ? EmbedColor.Green : EmbedColor.Red,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    interaction.reply({ content: "ok", flags: MessageFlags.Ephemeral });
  },
};

export default ChangeLog;
