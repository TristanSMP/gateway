/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Client, isFullPage } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { env } from "../../../env/server.mjs";

export interface IBlogAuthor {
  name: string;
  avatar: string | null;
}

export interface IBlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  createdAt: Date;
  authors: IBlogAuthor[];
}

export function ParseBlogPost(
  page: PageObjectResponse | PartialPageObjectResponse
) {
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

  return {
    id: page.id,
    slug,
    title,
    description,
    createdAt: new Date(createdAt),
    authors,
  };
}

export async function GetBlogPosts(): Promise<IBlogPost[]> {
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
      ],
    },
  });

  const posts = response.results
    .map((page) => {
      const parsed = ParseBlogPost(page);
      if (!parsed) return null;
      return parsed;
    })
    .filter((post) => post !== null) as IBlogPost[];

  return posts;
}
