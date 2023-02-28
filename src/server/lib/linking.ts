import type {
  Application,
  MinecraftAlternativeAccount,
  User,
} from "@prisma/client";
import { ApplicationStatus } from "@prisma/client";
import { elytra } from "../db/client";

export function generateLinkChallenge(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export async function syncUser(
  user: User & {
    application: Application | null;
    minecraftAlternativeAccounts: MinecraftAlternativeAccount[];
  }
): Promise<void> {
  if (!user.minecraftUUID || !user.application) {
    throw new Error("User not linked or has no application");
  }

  const actions: Promise<unknown>[] = [];

  switch (user.application.status) {
    case ApplicationStatus.Approved: {
      actions.push(elytra.lp.addPermission(user.minecraftUUID, "group.active"));

      if (user.minecraftAlternativeAccounts.length > 0) {
        actions.push(
          ...user.minecraftAlternativeAccounts.map((account) =>
            elytra.lp.addPermission(account.minecraftUUID, "group.active")
          )
        );
      }

      break;
    }
    default: {
      actions.push(
        elytra.lp.removePermission(user.minecraftUUID, "group.active")
      );

      if (user.minecraftAlternativeAccounts.length > 0) {
        actions.push(
          ...user.minecraftAlternativeAccounts.map((account) =>
            elytra.lp.removePermission(account.minecraftUUID, "group.active")
          )
        );
      }
      break;
    }
  }

  try {
    await Promise.all(actions);
  } catch (error) {
    console.log(
      [
        `Failed to sync user ${user.id} with UUID ${user.minecraftUUID}`,
        `Application status: ${user.application.status}`,
        `Error:`,
      ].join("\n"),
      error
    );

    throw error;
  }
}
