import {
  Account,
  Application,
  ApplicationStatus,
  MinecraftAlternativeAccount,
  User,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "../../../server/db/client";
import { updateRoleMeta } from "../../../server/lib/discord";
import { syncUser } from "../../../server/lib/linking";
import { UUIDToProfile } from "../../../server/lib/minecraft";
import { getTSMPUser } from "../../../server/lib/utils";
import adminMiddleware from "../../../utils/adminMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const json = z
    .object({
      player: z.string(), // discord id or tsmp id
      action: z.literal("NotMember").or(z.literal("Member")),
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

  if (!tsmpUser.application) {
    res.status(404).json({
      error: "user has no application",
    });
    return;
  }

  if (!tsmpUser.minecraftUUID) {
    res.status(404).json({
      error: "user has no minecraft account linked (missing minecraftUUID)",
    });
    return;
  }

  try {
    console.log("updating application");

    const updatedApplication = await prisma.application.update({
      where: {
        id: tsmpUser.application.id,
      },
      data: {
        status:
          json.action === "Member"
            ? ApplicationStatus.Approved
            : ApplicationStatus.Denied,
      },
    });

    const syncedUser = await syncUser({
      ...tsmpUser,
      application: updatedApplication,
    })
      .then(() => "success")
      .catch((e) => {
        if (e instanceof Error) return e.message;
        return "unknown error";
      });

    console.log("updating role meta");

    const syncedRoleMeta = await updateRoleMeta({
      ...tsmpUser,
      application: updatedApplication,
    })
      .then(() => "success")
      .catch((e) => {
        if (e instanceof Error) return e.message;
        return "unknown error";
      });

    const profile = await UUIDToProfile(tsmpUser.minecraftUUID);

    res.status(200).json({
      syncedUser,
      syncedRoleMeta,
      minecraftUsername: profile.name,
      minecraftUUID: tsmpUser.minecraftUUID,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "internal server error",
    });
  }
}

export default adminMiddleware(handler);
