import lqip from "lqip-modern";
import type {
  ExtendedRecordMap,
  PreviewImage,
  PreviewImageMap,
} from "notion-types";
import { getPageImageUrls, normalizeUrl } from "notion-utils";
import pMap from "p-map";
import pMemoize from "p-memoize";
import { prisma } from "../../db/client";
import { mapImageUrl } from "./mapImageUrl";

export async function getPreviewImageMap(
  recordMap: ExtendedRecordMap
): Promise<PreviewImageMap> {
  const urls: string[] = getPageImageUrls(recordMap, {
    mapImageUrl,
  }).filter(Boolean);

  const previewImagesMap = Object.fromEntries(
    await pMap(
      urls,
      async (url) => {
        const cacheKey = normalizeUrl(url);
        return [cacheKey, await getPreviewImage(url, { cacheKey })];
      },
      {
        concurrency: 8,
      }
    )
  );

  return previewImagesMap;
}

async function createPreviewImage(
  url: string,
  { cacheKey }: { cacheKey: string }
): Promise<PreviewImage | null> {
  try {
    try {
      const cachedPreviewImage = await prisma.cacheKV.findUnique({
        where: {
          key: cacheKey,
        },
      });

      if (cachedPreviewImage) {
        return JSON.parse(cachedPreviewImage.value);
      }
    } catch {
      // ignore redis errors
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    const result = await lqip(body);
    console.log("lqip", { ...result.metadata, url, cacheKey });

    const previewImage = {
      originalWidth: result.metadata.originalWidth,
      originalHeight: result.metadata.originalHeight,
      dataURIBase64: result.metadata.dataURIBase64,
    };

    try {
      await prisma.cacheKV.upsert({
        where: {
          key: cacheKey,
        },
        update: {
          value: JSON.stringify(previewImage),
        },
        create: {
          key: cacheKey,
          value: JSON.stringify(previewImage),
        },
      });
    } catch {
      // ignore redis errors
    }

    return previewImage;
  } catch (err) {
    console.warn("error creating preview image", url, err);
    return null;
  }
}

export const getPreviewImage = pMemoize(createPreviewImage);
