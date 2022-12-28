import {
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { createApplicationChannel } from "../../server/lib/discord";
import { getTSMPUser } from "../../server/lib/utils";
import { ApplicationSchema } from "../../server/trpc/router/onboarding";

const ForceCreateApplicationChannel: Command = {
  name: "force-create-application-channel",
  description: "Force create an application channel",
  options: [
    {
      name: "user",
      description: "the application's owner",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const user = interaction.options.getUser("user");

    const tsmpUser = await getTSMPUser(user.id);

    if (!tsmpUser.application) {
      return void interaction.reply({ content: "Application not found." });
    }

    const channel = await createApplicationChannel(
      tsmpUser.application,
      user.id,
      ApplicationSchema.parse(tsmpUser.application.data)
    );

    interaction.reply({
      content: `Created ${channel}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default ForceCreateApplicationChannel;
