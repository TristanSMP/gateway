import type { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { DisployApp } from "../../../bot/main";
import { EmbedColor } from "../../../bot/utils/embeds";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== env.ELYTRA_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const data = z
    .object({
      pages: z.string().array(),
      uuid: z.string(),
      title: z.string(),
    })
    .parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      minecraftUUID: data.uuid,
    },
  });

  if (!user) {
    return res.status(400).json({ userLandError: "User not found" });
  }

  const blogBook = await prisma.blogBook.create({
    data: {
      content: data.pages.join(`\n%PAGE%\n`),

      title: data.title,
      author: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  await DisployApp.rest.post<RESTPostAPIChannelMessageJSONBody, unknown>(
    Routes.channelMessages(env.DISCORD_REVIEW_QUEUE_CHANNEL_ID),
    {
      content: `<@&${env.DISCORD_REVIEW_ROLE_ID}>`,
      embeds: [
        {
          title: "New Blog Book",
          description: [
            `**Title:** ${data.title}`,
            `**Author:** ${user.name}`,
            `**Link:** https://tristansmp.com/book/${blogBook.id}`,
          ].join("\n"),
          color: EmbedColor.Invisible,
        },
      ],
    }
  );

  return res.status(200).json({ success: true });
}
