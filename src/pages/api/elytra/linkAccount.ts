import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
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
      uuid: z.string(),
      code: z.string(),
    })
    .parse(req.body);

  const tsmpUser = await prisma.user.findFirst({
    where: {
      linkChallenge: data.code,
    },
  });

  if (!tsmpUser) {
    return res.status(404).json({ error: "Invalid code" });
  }

  await prisma.user.update({
    where: {
      id: tsmpUser.id,
    },
    data: {
      minecraftUUID: data.uuid,
      linkChallenge: null,
    },
  });

  return res.status(200).json({ success: true });
}
