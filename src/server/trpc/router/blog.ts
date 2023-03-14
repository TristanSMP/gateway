import { z } from "zod";
import { GetBlogPosts } from "../../lib/blog/utils";
import { publicProcedure, router } from "../trpc";

export const blogRouter = router({
  loadMorePosts: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(5).default(5),
        tag: z.string().optional(),
      })
    )
    .query(async ({ input: { cursor, limit, tag } }) => {
      if (!cursor && !tag) {
        throw new Error("Missing cursor or tag");
      }

      const posts = await GetBlogPosts({
        startCursor: cursor,
        limit: limit,
        tag: tag,
      });

      return posts;
    }),
});
