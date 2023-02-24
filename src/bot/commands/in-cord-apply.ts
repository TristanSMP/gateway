import { MessageFlags } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { prisma } from "../../server/db/client";
import { generateLinkChallenge } from "../../server/lib/linking";

const InDiscordApply: Command = {
  name: "apply",
  description: "Apply for TristanSMP",

  async run(interaction: ChatInputInteraction) {
    const tsmpAccount = await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "discord",
          providerAccountId: interaction.user.id,
        },
      },
      create: {
        provider: "discord",
        providerAccountId: interaction.user.id,
        type: "discord-bot",
        user: {
          create: {
            name: interaction.user.username,
            linkChallenge: generateLinkChallenge(),
          },
        },
      },
      update: {
        user: {
          update: {
            linkChallenge: generateLinkChallenge(),
          },
        },
      },
      include: {
        user: true,
      },
    });

    if (!tsmpAccount.user.minecraftUUID) {
      return void (await interaction.reply({
        content: `You have not linked your Minecraft account yet. Please do so by sending \`~link ${tsmpAccount.user.linkChallenge}\` in-game.`,
        flags: MessageFlags.Ephemeral,
      }));
    } else {
      return void (await interaction.reply({
        content: `not implemented, yet`,
        flags: MessageFlags.Ephemeral,
      }));
    }
  },
};

export default InDiscordApply;
