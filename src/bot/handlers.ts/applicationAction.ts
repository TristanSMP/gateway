import { ApplicationStatus } from "@prisma/client";
import { MessageFlags } from "discord-api-types/v10";
import type { ButtonHandler, ButtonInteraction } from "disploy";
import { prisma } from "../../server/db/client";
import { updateRoleMeta } from "../../server/lib/discord";
import { syncUser } from "../../server/lib/linking";
import { getDiscordUser } from "../../server/lib/utils";
import { createStatusEmbed } from "../utils/embeds";

const staff = ["616469681678581781", "97470053615673344"];

async function handle(
  interaction: ButtonInteraction,
  action: "accept" | "deny",
  applicationId: string
) {
  if (!staff.includes(interaction.user.id)) {
    return void interaction.reply({
      content: "You are not a staff member.",
      flags: MessageFlags.Ephemeral,
    });
  }

  interaction.deferReply();

  console.log("finding application");

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
    console.log("updating application");
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

    console.log("syncing user");

    const syncedUser = await syncUser({
      ...application.user,
      application: updatedApplication,
    })
      .then(() => true)
      .catch(() => false);

    console.log("updating role meta");

    const syncedRoleMeta = await updateRoleMeta({
      ...application.user,
      application: updatedApplication,
    })
      .then(() => true)
      .catch(() => false);

    console.log("finding discord user");

    const discordUser = getDiscordUser(application.user.accounts);

    console.log("sending response");

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
