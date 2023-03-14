import type { InferGetStaticPropsType, NextPage } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BlogCards from "../../components/blog/BlogCards";
import type { IBlogPost } from "../../server/lib/blog/utils";
import { GetBlogPosts } from "../../server/lib/blog/utils";
import { trpc } from "../../utils/trpc";

export const getStaticProps = async () => {
  const posts = await GetBlogPosts();

  return {
    props: {
      initialPosts: posts.posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
      })),
      nextCursor: posts.nextCursor,
    },
    revalidate: 10,
  };
};

const BlogPosts: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  initialPosts,
  nextCursor,
}) => {
  const [posts, setPosts] = useState<IBlogPost[]>(
    initialPosts.map((post) => ({
      ...post,
      createdAt: new Date(post.createdAt),
    }))
  );

  const router = useRouter();

  const loadMorePostsQuery = trpc.blog.loadMorePosts.useQuery(
    {
      cursor: nextCursor ?? undefined,
      limit: 5,
      tag: router.query.tag as string,
    },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    const tag = router.query.tag as string;

    if (tag) {
      loadMorePostsQuery.refetch();

      if (loadMorePostsQuery.data) {
        setPosts(loadMorePostsQuery.data.posts);
      }
    } else {
      if (loadMorePostsQuery.data) {
        setPosts((prevPosts) => {
          return [...prevPosts, ...loadMorePostsQuery.data.posts];
        });
      }
    }
  }, [loadMorePostsQuery, router.query.tag]);

  return (
    <>
      <NextSeo title="TSMP: Blog" description="The Tristan SMP blog!" />
      <div className="py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary">
            Blog
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-secondary sm:mt-4">
            The latest news and updates from Tristan SMP!
          </p>
        </div>

        {router.query.tag && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => {
                router.push("/blog");
              }}
              className="hover:bg-primary-dark focus:ring-primary-dark inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Clear Tag Filter ({router.query.tag})
            </button>
          </div>
        )}

        <BlogCards posts={posts} />

        {nextCursor && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => {
                loadMorePostsQuery.refetch();
              }}
              className="hover:bg-primary-dark focus:ring-primary-dark inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {loadMorePostsQuery.isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPosts;
