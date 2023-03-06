import type {
  Account,
  Application,
  MinecraftAlternativeAccount,
  User,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "../../../server/db/client";
import { manageSupporter } from "../../../server/lib/supporter";
import { getTSMPUser } from "../../../server/lib/utils";
import adminMiddleware from "../../../utils/adminMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const json = z
    .object({
      player: z.string(), // discord id or tsmp id
      supporterUntil: z.string().or(z.null()), // date iso string or null (if null, no more supporter role :( )
    })
    .parse(req.body);

  let tsmpUser:
    | (User & {
        application: Application | null;
        minecraftAlternativeAccounts: MinecraftAlternativeAccount[];
        accounts: Account[];
      })
    | null = null;

  const direct = await prisma.user.findUnique({
    where: {
      id: json.player,
    },
    include: {
      application: true,
      accounts: true,
      minecraftAlternativeAccounts: true,
    },
  });

  tsmpUser = direct;

  // If not found by id, try to find via discord id
  if (!tsmpUser) {
    const resolvedViaDiscord = await getTSMPUser(json.player).catch(() => null);
    tsmpUser = resolvedViaDiscord;
  }

  if (!tsmpUser) {
    res.status(404).json({
      error: "user not found",
    });
    return;
  }

  let supporterUntil: Date | null = null;
  if (json.supporterUntil) {
    supporterUntil = new Date(json.supporterUntil);
  }

  try {
    await manageSupporter(tsmpUser, supporterUntil);

    res.status(200).json({
      supporterUntil: supporterUntil?.toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "internal server error",
    });
  }
}

export default adminMiddleware(handler);
