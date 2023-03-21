import FormData from "form-data";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { ConsumeOTT } from "../../../server/lib/ott";
import { getDiscordUserSafe } from "../../../server/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ott = req.headers.authorization;
  if (!ott) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const resolvedToken = await ConsumeOTT(ott);

  if (!resolvedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const data = z
    .object({
      ss: z.string(), // base64 encoded png
    })
    .parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      id: resolvedToken.userId,
    },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const discord = getDiscordUserSafe(user.accounts);

  if (!discord) {
    return res.status(400).json({ error: "Discord not linked" });
  }

  const hook = env.CHAT_LINK_WEBHOOK;

  if (!hook) {
    return res.status(500).json({ error: "Webhook not set" });
  }

  const formData = new FormData();

  formData.append(
    "payload_json",
    JSON.stringify({
      username: "TSMP Companion",
      content: `From <@${discord.id}> via [TSMP Companion](https://tristansmp.com/companion)`,
      attachments: [
        {
          id: 0,
          filename: "screenshot.png",
        },
      ],
    })
  );

  formData.append("files[0]", Buffer.from(data.ss, "base64"), {
    filename: "screenshot.png",
    contentType: "image/png",
  });

  const resp = await fetch(hook, {
    method: "POST",
    headers: formData.getHeaders(),
    body: formData.getBuffer(),
  });

  if (!resp.ok) {
    return res.status(500).json({ error: "Webhook failed" });
  }

  return res.status(200).json({
    success: true,
  });
}
