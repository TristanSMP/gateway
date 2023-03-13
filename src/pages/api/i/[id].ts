import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import { z } from "zod";
import { MarketUtils } from "../../../server/lib/market/utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = z.string().parse(req.query.id);

  const texture = MarketUtils.items.findItemTexture(id);

  const buf = Buffer.from(
    texture.replace("data:image/png;base64,", ""),
    "base64"
  );

  const resized = await sharp(buf)
    .resize(1024, 1024, {
      fit: "contain",
      kernel: "nearest",
    })
    .png()
    .toBuffer();

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.status(200).send(resized);

  return;
}

export default handler;
