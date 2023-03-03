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
      amount: z.number(),
    })
    .parse(req.body);

  await prisma.user.update({
    data: {
      balance: {
        increment: data.amount,
      },
    },
    where: {
      minecraftUUID: data.uuid,
    },
  });

  return res.status(200).json({ success: true });
}
