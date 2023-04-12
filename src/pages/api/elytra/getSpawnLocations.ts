import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.headers.authorization !== env.ELYTRA_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }


  const spawns = await prisma.spawnLocation.findMany();



  return res.status(200).json({
    spawns: spawns.map((spawn) => {
        return {
            seriLoc: spawn.location,
            name: spawn.name,
            b64ItemIcon: spawn.b64ItemIcon
        }
    })
  });
}
