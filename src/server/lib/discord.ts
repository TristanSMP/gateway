import type { Account, Application, User } from "@prisma/client";
import { ApplicationStatus } from "@prisma/client";
import type {
  RESTPostAPIGuildChannelJSONBody,
  RESTPostAPIGuildChannelResult,
  RESTPutAPICurrentUserApplicationRoleConnectionJSONBody,
} from "discord-api-types/v10";
import {
  ButtonStyle,
  ChannelType,
  ComponentType,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { DisployApp } from "../../bot/main";
import { env } from "../../env/server.mjs";
import { prisma } from "../db/client";
import type { MinecraftProfile } from "./minecraft";
import { UUIDToProfile } from "./minecraft";
import { getDiscordUser } from "./utils";

export async function updateRoleMeta(
  userOrId:
    | string
    | (User & {
        application: Application | null;
        accounts: Account[];
      })
) {
  try {
    const user =
      typeof userOrId === "string"
        ? await prisma.user.findUnique({
            where: {
              id: userOrId,
            },
            include: {
              accounts: true,
              application: true,
            },
          })
        : userOrId;

    if (!user || !user.minecraftUUID) {
      return;
    }

    const discordUser = getDiscordUser(user.accounts);

    if (!discordUser.accessToken) {
      return;
    }

    const profile = await UUIDToProfile(user.minecraftUUID);

    const res = await fetch(
      `${RouteBases.api}${Routes.userApplicationRoleConnection(
        env.DISCORD_CLIENT_ID
      )}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${discordUser.accessToken}`,
        },
        body: JSON.stringify(createRoleMeta(profile, user)),
      }
    );

    if (res.status >= 400) {
      res.json().then(console.log);
      throw new Error(
        `Failed to update role meta: ${res.status} ${res.statusText}`
      );
    }
  } catch (e) {
    console.log("something went wrong while updating role meta");
    console.error(e);
  }
}

function createRoleMeta(
  profile: MinecraftProfile,
  user: User & {
    application: Application | null;
  }
): RESTPutAPICurrentUserApplicationRoleConnectionJSONBody {
  return {
    platform_name: "TristanSMP",
    platform_username: profile.name,
    metadata: {
      is_member: user.application?.status == ApplicationStatus.Approved ? 1 : 0,
    },
  };
}

export async function createApplicationChannel(
  application: Application,
  discordId: string,
  data: { mcUsername: string; whyJoin: string; howLongWillYouPlay: string }
) {
  const channel = DisployApp.channels.constructChannel(
    await DisployApp.rest.post<
      RESTPostAPIGuildChannelJSONBody,
      RESTPostAPIGuildChannelResult
    >(Routes.guildChannels(env.DISCORD_GUILD_ID), {
      name: `application-${application.id}`,
      parent_id: env.DISCORD_CATEGORY_ID,
    })
  );

  if (channel.type !== ChannelType.GuildText)
    throw new Error("Channel is not a text channel");

  await channel.send({
    content: `New application from <@${discordId}>`,
    embeds: [
      {
        title: "Application",
        fields: [
          {
            name: "Minecraft Username",
            value: data.mcUsername,
          },
          {
            name: "Why do you want to join?",
            value: data.whyJoin,
          },
          {
            name: "How long will you play?",
            value: data.howLongWillYouPlay,
          },
        ],
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: "Accept",
            style: ButtonStyle.Primary,
            custom_id: `accept-application-${application.id}`,
          },
          {
            type: ComponentType.Button,
            label: "Deny",
            style: ButtonStyle.Danger,
            custom_id: `deny-application-${application.id}`,
          },
        ],
      },
    ],
  });

  return channel;
}
