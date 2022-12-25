import { PrismaClient } from "@prisma/client";
import { Client } from "elytra";
import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var elytra: Client;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export const elytra =
  global.elytra ||
  new Client({
    apiRoot: env.ELYTRA_API_ROOT,
    token: env.ELYTRA_TOKEN || undefined,
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
  global.elytra = elytra;
}
