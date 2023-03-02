import { ApplicationStatus } from "@prisma/client";
import {
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { UUIDToProfile } from "../../server/lib/minecraft";
import { getTSMPUser } from "../../server/lib/utils";
import { EmbedColor } from "../utils/embeds";
import { Emoji } from "../utils/emojis";

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
    const mcProfile = tsmpUser?.minecraftUUID
      ? await UUIDToProfile(tsmpUser.minecraftUUID).catch(() => null)
      : null;

    interaction.reply({
      embeds: [
        {
          title: "Debug User",
          description: [
            "**Identity**",
            `${Emoji.Discord} ${user} [${user.username}#${user.discriminator}] (${user.id})`,
            `${Emoji.Minecraft} ${
              tsmpUser?.minecraftUUID
                ? `\`${mcProfile?.name ?? "Failed to resolve"}\` (${
                    tsmpUser.minecraftUUID
                  })`
                : "No linked Minecraft account"
            }`,
            `${Emoji.TristanSMP} ${
              tsmpUser ? `Resolved TSMPU from Discord ${tsmpUser.id}` : "No"
            }`,
            "",
            `**Application status** ${
              tsmpUser?.application?.status === ApplicationStatus.PendingReview
                ? "Pending review"
                : "Not pending review"
            }`,
            `${Emoji.TristanSMP} ${
              tsmpUser?.application?.status === ApplicationStatus.Approved
                ? "Approved"
                : "Not approved"
            }`,
          ].join("\n"),
          color: EmbedColor.Invisible,
        },
      ],
      flags: show ? MessageFlags.Ephemeral : undefined,
    });
  },
};

export default DebugUser;
