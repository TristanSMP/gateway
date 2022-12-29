import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import {
  getStatsEmbedFields,
  getUserStats,
  translateSkillNames,
} from "../../server/lib/pipe";
import { getTSMPUser } from "../../server/lib/utils";
import { EmbedColor } from "../utils/embeds";

const UserStats: Command = {
  name: "stats",
  description: "Get stats for a user",
  options: [
    {
      name: "user",
      description: "The user to get stats for",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const user = interaction.options.getUser("user");

    const tsmpUser = await getTSMPUser(user.id).catch(() => null);

    if (!tsmpUser || !tsmpUser.minecraftUUID) {
      return void interaction.reply({ content: "Player not found." });
    }

    const stats = await getUserStats(tsmpUser.minecraftUUID).catch(() => null);

    if (!stats || stats.error) {
      return void interaction.reply({ content: "Stats not found." });
    }

    console.log(getStatsEmbedFields(translateSkillNames(stats)));

    interaction.reply({
      embeds: [
        {
          description: `TSMP stats for ${user.username}`,
          fields: getStatsEmbedFields(translateSkillNames(stats)),
          thumbnail: {
            url: `https://crafatar.com/avatars/${tsmpUser.minecraftUUID}?overlay`,
          },
          color: EmbedColor.Invisible,
        },
      ],
    });
  },
};

export default UserStats;
