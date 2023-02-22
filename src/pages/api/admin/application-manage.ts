import { ApplicationStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "../../../server/db/client";
import { updateRoleMeta } from "../../../server/lib/discord";
import { syncUser } from "../../../server/lib/linking";
import { getTSMPUser } from "../../../server/lib/utils";
import adminMiddleware from "../../../utils/adminMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const json = z
    .object({
      player: z.string(), // discord id
      action: z.literal("NotMember").or(z.literal("Member")),
    })
    .parse(req.body);

  const tsmpUser = await getTSMPUser(json.player);

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

    res.status(200).json({
      syncedUser,
      syncedRoleMeta,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "internal server error",
    });
  }
}

export default adminMiddleware(handler);
