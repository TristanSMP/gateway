/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { Client } from "@notionhq/client";
import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";

import { NextSeo } from "next-seo";
import Image from "next/image";
import Link from "next/link";
import { NotionAPI } from "notion-client";
import { NotionRenderer } from "react-notion-x";
import { z } from "zod";
import BlogPageInfo from "../../components/blog/BlogPageInfo";
import { env } from "../../env/server.mjs";
import { getPreviewImageMap } from "../../server/lib/blog/previewImages";
import { GetBlogPosts, ParseBlogPost } from "../../server/lib/blog/utils";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const token = env.NOTION_TOKEN;
  const dbId = env.NOTION_DATABASE_ID;
  const activeUser = env.NOTION_ACTIVE_USER;
  const authToken = env.NOTION_TOKEN_V2;

  if (!token || !dbId || !activeUser || !authToken) {
    throw new Error("Missing Notion token or database ID!");
  }

  const notion = new Client({
    auth: token,
  });

  const notionX = new NotionAPI({
    activeUser: env.NOTION_ACTIVE_USER,
    authToken: env.NOTION_TOKEN_V2,
  });

  const slug = z.string().parse(context.params?.id);

  if (slug.startsWith("dpid-")) {
    const pageId = slug.replace("dpid-", "");
    const page = await notion.pages.retrieve({ page_id: pageId });
    const parsed = await ParseBlogPost(page);

    if (!parsed) {
      return {
        props: {
          error: {
            message: `"${context.params?.id}" does not seem to exist.`,
            statusCode: 404,
          },
        },
      };
    }

    return {
      redirect: {
        destination: `/blog/${parsed.slug}`,
        permanent: false,
      },
      revalidate: 10,
    };
  }

  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      and: [
        {
          property: "Slug",
          rich_text: {
            equals: z.string().parse(context.params?.id),
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

  const first = response.results[0];

  if (!first) {
    return {
      props: {
        error: {
          message: `"${context.params?.id}" does not seem to exist.`,
          statusCode: 404,
        },
      },
    };
  }

  const parsed = await ParseBlogPost(first);

  if (!parsed) {
    return {
      props: {
        error: {
          message: `"${context.params?.id}" does not seem to exist.`,
          statusCode: 404,
        },
      },
    };
  }

  const recordMap = await notionX.getPage(first.id);

  const previewImageMap = await getPreviewImageMap(recordMap);

  const recordMapWithPreviewImages = {
    ...recordMap,
    preview_images: previewImageMap,
  };

  return {
    props: {
      recordMap: recordMapWithPreviewImages,
      parsed: {
        ...parsed,
        createdAt: parsed.createdAt.toISOString(),
      },
    },
    revalidate: 10,
  };
};

export const getStaticPaths = async () => {
  const posts = await GetBlogPosts();

  const paths = posts.posts.map((post) => {
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
  parsed,
  error,
}) => {
  if (error) {
    return (
      <>
        <NextSeo title={error.message} description={error.message} />
        <div className="flex h-screen flex-col items-center justify-center">
          <h1 className="text-center text-4xl font-bold">{error.message}</h1>
          <Link href="/blog" className="btn-primary btn">
            Find other blog posts
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <NextSeo
        title={parsed.title}
        description={parsed.description}
        openGraph={{
          title: parsed.title,
          description: parsed.description,
          url: `https://tristansmp.com/blog/${parsed.slug}`,
          article: {
            publishedTime: parsed.createdAt,
          },
        }}
      />
      <div className="flex flex-col items-center justify-center">
        <BlogPageInfo
          post={{
            ...parsed,
            createdAt: new Date(parsed.createdAt),
          }}
        />

        <NotionRenderer
          recordMap={recordMap}
          fullPage={false}
          darkMode={true}
          components={{
            nextImage: Image,
            nextLink: Link,
          }}
          previewImages={!!recordMap.preview_images}
          showTableOfContents={true}
          mapPageUrl={(pageId) => `/blog/dpid-${pageId}`}
        />
      </div>
    </>
  );
};

export default BlogPost;
