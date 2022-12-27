import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "../common/get-server-auth-session";
import { elytra, prisma } from "../db/client";

type CreateContextOptions = {
  session: Session | null;
  req: NextApiRequest;
  res: NextApiResponse;
};

export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    req: opts.req,
    res: opts.res,
    session: opts.session,
    prisma,
    elytra,
  };
};

export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  const session = await getServerAuthSession({ req, res });

  return await createContextInner({
    session,
    req,
    res,
  });
};

export type Context = inferAsyncReturnType<typeof createContext>;
