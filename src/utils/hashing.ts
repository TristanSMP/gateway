import { createHash } from "node:crypto";

export const sha256 = (base64: string) => {
  return createHash("sha256").update(base64).digest("hex");
};
