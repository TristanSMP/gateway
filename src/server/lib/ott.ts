import type { User } from "@prisma/client";
import * as Crypto from "node:crypto";
import { prisma } from "../db/client";

export async function GenerateOTT(
  user: User,
  expiresInMins: number
): Promise<string>;
/**
 * Generates an OTT for 5mins
 */
export async function GenerateOTT(user: User): Promise<string>;
export async function GenerateOTT(
  user: User,
  expiresInMinsOrAt?: number | Date
): Promise<string> {
  const token = generateToken();

  const expires = expiresInMinsOrAt
    ? typeof expiresInMinsOrAt === "number"
      ? new Date(Date.now() + expiresInMinsOrAt * 60 * 1000)
      : expiresInMinsOrAt
    : new Date(Date.now() + 5 * 60 * 1000);

  const ott = await prisma.oneTimeToken.create({
    data: {
      expires,
      token,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return ott.token;
}

export async function ConsumeOTT(token: string) {
  await prisma.oneTimeToken.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  const ott = await prisma.oneTimeToken.findFirst({
    where: {
      token,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!ott) {
    return null;
  }

  await prisma.oneTimeToken.delete({
    where: {
      id: ott.id,
    },
  });

  return ott;
}

function generateToken() {
  return Crypto.randomBytes(32).toString("hex");
}
