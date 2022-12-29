import {
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { getTSMPUser } from "../../server/lib/utils";

const DebugUser: Command = {
  name: "debug-user",
  description: "reset a tsmp user",
  options: [
    {
      name: "user",
      description: "the user to reset",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "show",
      description: "remove messageflags.ephemeral or not",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const user = interaction.options.getUser("user");
    const show = interaction.options.getBoolean("show", true) || false;

    const tsmpUser = await getTSMPUser(user.id).catch(() => null);

    const fields = tsmpUser
      ? [
          {
            name: "Has TSMP account",
            value: `Yes (${tsmpUser.id})`,
            inline: true,
          },
          {
            name: "Has linked Minecraft account",
            value: `${
              tsmpUser.minecraftUUID ? `Yes (${tsmpUser.minecraftUUID})` : "No"
            }`,
            inline: true,
          },
          {
            name: "Has application",
            value: `${
              tsmpUser.application
                ? `Yes (${tsmpUser.application.id}) [${tsmpUser.application.status}]`
                : "No"
            }`,
            inline: true,
          },
        ]
      : [
          {
            name: "Has TSMP account",
            value: "No",
            inline: true,
          },
        ];

    interaction.reply({
      embeds: [
        {
          title: "Debug User",
          description: `Debugging ${user} (${user.id})`,
          fields: fields,
        },
      ],
      flags: show ? MessageFlags.Ephemeral : undefined,
    });
  },
};

export default DebugUser;
