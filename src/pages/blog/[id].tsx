/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { NotionCompatAPI } from "notion-compat";

import { Client } from "@notionhq/client";
import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";

import type { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { z } from "zod";
import { env } from "../../env/server.mjs";
import { GetBlogPosts } from "../../server/lib/blog/utils";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const token = env.NOTION_TOKEN;
  const dbId = env.NOTION_DATABASE_ID;

  if (!token || !dbId) {
    return {
      props: {
        notFound: true,
      },
      revalidate: 60,
    };
  }

  const notion = new Client({
    auth: token,
  });

  const notionX = new NotionCompatAPI(notion) as NotionAPI;

  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: "Slug",
      rich_text: {
        equals: z.string().parse(context.params?.id),
      },
    },
  });

  const first = response.results[0];

  if (!first) {
    return {
      props: {
        notFound: true,
      },
      revalidate: 60,
    };
  }

  const recordMap = await notionX.getPage(first.id);

  return {
    props: {
      recordMap,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};

export const getStaticPaths = async () => {
  const posts = await GetBlogPosts();

  const paths = posts.map((post) => {
    return {
      params: {
        id: post.slug,
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

const BlogPost: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  recordMap,
  notFound,
}) => {
  while (notFound || !recordMap) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-4xl text-white drop-shadow-2xl">
        page no exist ok thx
      </div>
    );
  }

  return (
    <>
      <NotionRenderer recordMap={recordMap} fullPage={false} darkMode={true} />
    </>
  );
};

export default BlogPost;
