import { Account, Application, ApplicationStatus, User } from "@prisma/client";
import type {
  RESTPostAPIGuildChannelJSONBody,
  RESTPostAPIGuildChannelResult,
} from "discord-api-types/v10";
import {
  ButtonStyle,
  ChannelType,
  ComponentType,
  OverwriteType,
  Routes,
} from "discord-api-types/v10";
import { DisployApp } from "../../bot/main";
import { EmbedColor } from "../../bot/utils/embeds";
import { env } from "../../env/server.mjs";
import { prisma } from "../db/client";
import { getDiscordUser } from "./utils";

export async function updateRoleMeta(
  userOrId:
    | string
    | (User & {
        application: Application | null;
        accounts: Account[];
      })
) {
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
    throw new Error("User not found");
  }

  const discordUser = getDiscordUser(user.accounts);

  if (user.application?.status === ApplicationStatus.Approved) {
    await DisployApp.rest.put(
      Routes.guildMemberRole(
        env.DISCORD_GUILD_ID,
        discordUser.id,
        "1054689107248427069" // Yes I know this is bad, I could not be bothered to go through the effort of setting another env variable
      )
    );
  } else {
    await DisployApp.rest.delete(
      Routes.guildMemberRole(
        env.DISCORD_GUILD_ID,
        discordUser.id,
        "1054689107248427069"
      )
    );
  }
}

export async function createApplicationChannel(
  application: Application,
  discordId: string,
  data: { whyJoin: string; howLongWillYouPlay: string }
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

  await DisployApp.rest.put(Routes.channelPermission(channel.id, discordId), {
    allow: `${1 << 10}`, // VIEW_CHANNEL
    type: OverwriteType.Member,
  });

  await channel.send({
    content: `<@&${env.DISCORD_REVIEW_ROLE_ID}> New application from <@${discordId}>.`,
    embeds: [
      {
        title: "Application",
        fields: [
          {
            name: "Why do you want to join?",
            value: data.whyJoin,
          },
          {
            name: "How long will you play?",
            value: data.howLongWillYouPlay,
          },
        ],
        color: EmbedColor.Invisible,
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
