import { MessageFlags } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";

const WillThereBeASeason2: Command = {
  name: "will-there-be-a-season-2",
  description: "will tsmp season 2 happen? (check votes)",

  async run(interaction: ChatInputInteraction) {
    const voteMessage = await interaction.app.messages.fetch(
      "952064632187658261",
      "952069009069735966",
      "1125000199186681868"
    );

    const reactions = voteMessage.reactions;

    if (!reactions) {
      return void interaction.reply({
        content: "No reactions found",
        flags: MessageFlags.Ephemeral,
      });
    }

    const yesReactionCount = reactions
      .filter((reaction) => reaction.emoji.name === "👍")
      .map((reaction) => reaction.count)
      .reduce((a, b) => a + b);

    const noReactionCount = reactions
      .filter((reaction) => reaction.emoji.name === "👎")
      .map((reaction) => reaction.count)
      .reduce((a, b) => a + b);

    const totalVotes = yesReactionCount + noReactionCount;

    return void interaction.reply({
      content: [
        `Currently as of <t:${Math.floor(
          Date.now() / 1000
        )}:F>, there are \`${yesReactionCount}\` **votes for yes**.`,
        `This is \`${Math.round(
          (yesReactionCount / totalVotes) * 100
        )}%\` of **the people who voted**.`,
        `There **will be** a season 2, if this number reaches **\`95%\`**.`,
        `You have **until Friday** to vote!`,
      ].join("\n"),
    });
  },
};

export default WillThereBeASeason2;
