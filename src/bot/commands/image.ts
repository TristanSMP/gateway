import { ApplicationStatus } from "@prisma/client";
import type { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import {
  ApplicationCommandOptionType,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";
import { env } from "../../env/server.mjs";
import { prisma } from "../../server/db/client";
import { getTSMPUser } from "../../server/lib/utils";

const allowedContentTypes = ["image/png", "image/jpeg", "image/gif"];

const Image: Command = {
  name: "image",
  description: "Post an image",
  options: [
    {
      name: "image",
      description: "The image to post",
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    },
  ],

  async run(interaction: ChatInputInteraction) {
    const attachment = interaction.options.getAttachment("image");

    if (
      !attachment.contentType ||
      !allowedContentTypes.includes(attachment.contentType)
    ) {
      return void interaction.reply({
        content: "Invalid content type.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const tsmpUser = await getTSMPUser(interaction.user.id).catch(() => null);

    if (
      !tsmpUser ||
      tsmpUser.application?.status !== ApplicationStatus.Approved
    ) {
      return void interaction.reply({
        content: "You are not a member.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const image = await prisma.image.create({
      data: {
        url: attachment.url,
        creator: {
          connect: {
            id: tsmpUser.id,
          },
        },
      },
    });

    await interaction.app.rest.post<RESTPostAPIChannelMessageJSONBody, unknown>(
      Routes.channelMessages(env.DISCORD_REVIEW_QUEUE_CHANNEL_ID),
      {
        content: `<@&${env.DISCORD_REVIEW_ROLE_ID}>`,
        embeds: [
          {
            title: "New Image",
            description: `Submitted by ${interaction.user}`,
            image: {
              url: image.url,
            },
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                label: "Approve",
                custom_id: `image-approve-${image.id}`,
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                label: "Deny",
                custom_id: `image-deny-${image.id}`,
              },
            ],
          },
        ],
      }
    );

    interaction.reply({
      embeds: [
        {
          title: "Submitted Image",
          description:
            "Your image has been submitted. It will be reviewed by a staff member.",
          image: {
            url: image.url,
          },
        },
      ],
    });
  },
};

export default Image;
