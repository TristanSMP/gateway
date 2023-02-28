import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { prisma } from "../../server/db/client";
import { EmbedColor } from "../utils/embeds";

const MarketLeaderboard: Command = {
  name: "market-leaderboard",
  description: "view the market leaderboard",
  options: [
    {
      name: "sort",
      description: "sort by?",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Most Diamonds",
          value: "balance",
        },
      ],
      required: true,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    //   const sort = interaction.options.getString("sort");

    const users = await prisma.user.findMany({
      orderBy: {
        balance: "desc",
      },
      take: 10,
    });

    return void interaction.reply({
      embeds: [
        {
          title: "Market Leaderboard",
          description: users
            .map(
              (user, index) =>
                `**\`${index + 1}\`** \`${user.name}\` - \`${user.balance}\``
            )
            .join("\n"),
          footer: {
            text: "Top 10 users with the most diamonds in their market balance.",
          },
          color: EmbedColor.Invisible,
        },
      ],
    });
  },
};

export default MarketLeaderboard;
