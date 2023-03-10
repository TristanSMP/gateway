import { ApplicationStatus } from "@prisma/client";
import { MessageFlags } from "discord-api-types/v10";
import type { ButtonHandler, ButtonInteraction } from "disploy";
import { env } from "../../env/server.mjs";
import { prisma } from "../../server/db/client";
import { updateRoleMeta } from "../../server/lib/discord";
import { syncUser } from "../../server/lib/linking";
import { getDiscordUser } from "../../server/lib/utils";
import { createStatusEmbed } from "../utils/embeds";

const allowedRoles = [
  env.DISCORD_STAFF_ROLE_ID,
  "1078068239956988004", // Community Manager
];

async function handle(
  interaction: ButtonInteraction,
  action: "accept" | "deny",
  applicationId: string
) {
  if (!interaction.member?.roles.some((role) => allowedRoles.includes(role))) {
    return void interaction.reply({
      content: "You do not have permission to do this.",
      flags: MessageFlags.Ephemeral,
    });
  }

  console.log("finding application");

  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      user: {
        include: {
          minecraftAlternativeAccounts: true,
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

    return void interaction.reply({
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
          actioner: interaction.user,
        }),
      ],
    });
  } catch (error) {
    console.error(error);
    return void interaction.reply({
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
