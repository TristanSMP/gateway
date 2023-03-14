import type { Account, Application, User } from "@prisma/client";

export type TSMPUser = User & {
  application: Application | null;
  accounts: Account[];
};
