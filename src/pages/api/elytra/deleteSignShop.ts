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
      location: z.string(),
    })
    .parse(req.body);

  await prisma.signShop.delete({
    where: {
      location: data.location,
    },
  });

  return res.status(200).json({
    success: true,
  });
}
