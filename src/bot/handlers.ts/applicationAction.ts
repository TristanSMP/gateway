import { ApplicationStatus } from "@prisma/client";
import type { ButtonHandler, ButtonInteraction } from "disploy";
import { prisma } from "../../server/db/client";
import { updateRoleMeta } from "../../server/lib/discord";
import { syncUser } from "../../server/lib/linking";
import { getDiscordUser } from "../../server/lib/utils";
import { createStatusEmbed } from "../utils/embeds";

async function handle(
  interaction: ButtonInteraction,
  action: "accept" | "deny",
  applicationId: string
) {
  interaction.deferReply();

  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      user: {
        include: {
          accounts: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    return void interaction.editReply({
      content: "Application not found.",
    });
  }

  try {
    const updatedApplication = await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status:
          action === "accept"
            ? ApplicationStatus.Approved
            : ApplicationStatus.Denied,
        reviewer: interaction.user.id,
      },
    });

    const syncedUser = await syncUser({
      ...application.user,
      application: updatedApplication,
    })
      .then(() => true)
      .catch(() => false);

    const syncedRoleMeta = await updateRoleMeta({
      ...application.user,
      application: updatedApplication,
    })
      .then(() => true)
      .catch(() => false);

    const discordUser = getDiscordUser(application.user.accounts);

    return void interaction.editReply({
      embeds: [
        createStatusEmbed({
          entity: "User Application",
          description: `Updated application status to ${
            action === "accept" ? "approved" : "denied"
          }. for <@${discordUser.id}>`,
          sideEffects: {
            "Synced user": syncedUser,
            "Updated role meta": syncedRoleMeta,
          },
          success: action === "accept",
        }),
      ],
    });
  } catch (error) {
    console.error(error);
    return void interaction.editReply({
      content: "An error occurred.",
    });
  }
}

const AcceptApplication: ButtonHandler = {
  customId: "accept-application-:id",

  async run(interaction) {
    const applicationId = interaction.params.getParam("id");
    return await handle(interaction, "accept", applicationId);
  },
};

const DenyApplication: ButtonHandler = {
  customId: "deny-application-:id",

  async run(interaction) {
    const applicationId = interaction.params.getParam("id");
    return await handle(interaction, "deny", applicationId);
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default [AcceptApplication, DenyApplication];
