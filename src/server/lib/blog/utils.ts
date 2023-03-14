/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Client, isFullPage } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { env } from "../../../env/server.mjs";
import { UUIDToProfile } from "../minecraft";

export interface IBlogAuthor {
  name: string;
  avatar: string | null;
}

export interface IBlogPlayerAuthor {
  name: string;
  uuid: string;
}

export interface IBlogTag {
  name: string;
  color: string;
}

export interface IBlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  createdAt: Date;
  authors: IBlogAuthor[];
  players: IBlogPlayerAuthor[];
  coverImage: string | null;
  tags: IBlogTag[];
}

export async function ParseBlogPost(
  page: PageObjectResponse | PartialPageObjectResponse
): Promise<IBlogPost | null> {
  if (!isFullPage(page)) return null;

  // @ts-ignore
  const slug = page.properties.Slug.rich_text[0].plain_text;
  // @ts-ignore
  const title = page.properties.Name.title[0].plain_text;
  // @ts-ignore
  const description = page.properties.Description.rich_text[0].plain_text;
  // @ts-ignore
  const createdAt = page.properties.Date.created_time;
  // @ts-ignore
  const authors = page.properties.Authors.people.map((author) => ({
    name: author.name,
    avatar: author?.avatar_url || null,
  }));
  // @ts-ignore
  const coverImage =
    page.cover?.type === "external"
      ? page.cover.external.url
      : page.cover?.file.url || null;
  // @ts-ignore
  const tags = page.properties.Tags.multi_select.map((tag) => ({
    name: tag.name,
    color: tag.color,
  }));
  const players: IBlogPlayerAuthor[] = [];

  if ("Players" in page.properties) {
    const uuids =
      // @ts-ignore
      (page.properties.Players.rich_text[0]?.plain_text.split(
        ","
      ) as string[]) || [];

    const resolved = await Promise.all(
      uuids.map(async (uuid) => {
        const profile = await UUIDToProfile(uuid);
        if (!profile) return null;
        return {
          name: profile.name,
          uuid,
        };
      })
    );

    players.push(
      ...(resolved.filter((player) => player !== null) as IBlogPlayerAuthor[])
    );
  }

  return {
    id: page.id,
    slug,
    title,
    description,
    createdAt: new Date(createdAt),
    authors,
    players,
    coverImage,
    tags,
  };
}

export async function GetBlogPosts(
  {
    tag,
    limit,
    startCursor,
  }: { tag?: string; limit?: number; startCursor?: string } = {
    limit: 10,
    startCursor: undefined,
  }
): Promise<{
  posts: IBlogPost[];
  nextCursor: string | null;
}> {
  const token = env.NOTION_TOKEN;
  const dbId = env.NOTION_DATABASE_ID;

  if (!token || !dbId) {
    throw new Error("Missing Notion token or database ID");
  }

  const notion = new Client({
    auth: token,
  });

  const response = await notion.databases.query({
    database_id: dbId,
    page_size: limit,
    start_cursor: startCursor,
    filter: {
      and: [
        {
          property: "Slug",
          rich_text: {
            is_not_empty: true,
          },
        },
        {
          property: "Description",
          rich_text: {
            is_not_empty: true,
          },
        },
        {
          property: "Date",
          date: {
            is_not_empty: true,
          },
        },
        {
          property: "Authors",
          people: {
            is_not_empty: true,
          },
        },
        {
          property: "Public",
          checkbox: {
            equals: true,
          },
        },
        ...(tag
          ? [
              {
                property: "Tags",
                multi_select: {
                  contains: tag,
                },
              },
            ]
          : []),
      ],
    },
  });

  const posts = (await Promise.all(
    response.results
      .map(async (page) => {
        const parsed = await ParseBlogPost(page);
        if (!parsed) return null;
        return parsed;
      })
      .filter((post) => post !== null)
  )) as IBlogPost[];

  return {
    posts,
    nextCursor: response.next_cursor || null,
  };
}
