import {
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { updateRoleMeta } from "../../server/lib/discord";
import { getTSMPUser } from "../../server/lib/utils";

const Refresh: Command = {
  name: "refresh",
  description: "force refresh someone",
  options: [
    {
      name: "user",
      description: "the user to refresh",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const user = interaction.options.getUser("user");
    const tsmpUser = await getTSMPUser(user.id).catch(() => null);

    if (!tsmpUser) {
      return void interaction.reply({
        content: "Failed to find linked TSMP user!",
        flags: MessageFlags.Ephemeral,
      });
    }

    await updateRoleMeta(user.id);

    interaction.reply({ content: "Refreshed!" });
  },
};

export default Refresh;
