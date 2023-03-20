import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { GenerateOTT } from "../../../server/lib/ott";

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
    })
    .parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      minecraftUUID: data.uuid,
    },
  });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const ott = await GenerateOTT(user);

  return res.status(200).json({
    token: ott,
  });
}
