import { ReviewStatus } from "@prisma/client";
import { MessageFlags } from "discord-api-types/v10";
import type { ButtonHandler, ButtonInteraction } from "disploy";
import { env } from "../../env/server.mjs";
import { prisma } from "../../server/db/client";
import { createStatusEmbed } from "../utils/embeds";

async function handle(
  interaction: ButtonInteraction,
  action: "accept" | "deny",
  imageId: string
) {
  if (!interaction.member?.roles.includes(env.DISCORD_STAFF_ROLE_ID)) {
    return void interaction.reply({
      content: "You are not a staff member.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const image = await prisma.image.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    return void interaction.reply({
      content: "Image not found.",
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    const updatedImage = await prisma.image.update({
      where: {
        id: image.id,
      },
      data: {
        reviewStatus:
          action === "accept" ? ReviewStatus.Approved : ReviewStatus.Denied,
        reviewer: interaction.user.id,
      },
    });

    await interaction.reply({
      content: "Image updated.",
      embeds: [
        createStatusEmbed({
          entity: "Image",
          description: `${action === "accept" ? "Approved" : "Denied"} image ${
            updatedImage.id
          }`,
          success: action === "accept",
          sideEffects: {},
          actioner: interaction.user,
        }),
      ],
    });
  } catch (error) {
    console.error(error);

    await interaction.reply({
      content: "An error occurred.",
    });
  }
}

const AcceptImage: ButtonHandler = {
  customId: "image-approve-:id",

  async run(interaction) {
    const imageId = interaction.params.getParam("id");
    return await handle(interaction, "accept", imageId);
  },
};

const DenyImage: ButtonHandler = {
  customId: "image-deny-:id",

  async run(interaction) {
    const imageId = interaction.params.getParam("id");
    return await handle(interaction, "deny", imageId);
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default [AcceptImage, DenyImage];
