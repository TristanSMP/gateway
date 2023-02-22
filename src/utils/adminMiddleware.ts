// Next.js api route middleware to check if user is admin
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../env/server.mjs";

export default function adminMiddleware(
  func: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (!env.ADMIN_API_TOKEN) {
      res.status(500).json({ error: "Admin API token not set" });
      return;
    }

    const token = req.headers.authorization;

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (token !== env.ADMIN_API_TOKEN) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    return void (await func(req, res));
  };
}
