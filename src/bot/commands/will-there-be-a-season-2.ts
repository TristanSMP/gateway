import { MessageFlags } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { prisma } from "../../server/db/client";

const WillThereBeASeason2: Command = {
  name: "will-there-be-a-season-2",
  description: "will tsmp season 2 happen? (check votes)",

  async run(interaction: ChatInputInteraction) {
    const voteMessage = await interaction.app.messages.fetch(
      "952064632187658261",
      "1125000199186681868"
    );

    const reactions = voteMessage.reactions;

    if (!reactions) {
      return void interaction.reply({
        content: "No reactions found",
        flags: MessageFlags.Ephemeral,
      });
    }

    const totalMembers = await prisma.user.count({
      where: {
        application: {
          status: "Approved",
        },
      },
    });

    const yesReactionCount = reactions.filter(
      (reaction) => reaction.emoji.name === "👍"
    ).length;

    return void interaction.reply({
      content: [
        `Currently as of ${new Date().toLocaleString()}, there are ${yesReactionCount} votes for yes.`,
        `This is ${Math.round(
          (yesReactionCount / totalMembers) * 100
        )}% of the server.`,
        `There will be a season 2, if this number reaches 95%.`,
        `You have until Friday to vote!`,
      ].join("\n"),
    });
  },
};

export default WillThereBeASeason2;
