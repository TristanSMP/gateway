import type { InferGetStaticPropsType, NextPage } from "next";
import { NextSeo } from "next-seo";
import BlogCard from "../../components/blog/BlogCard";
import { GetBlogPosts } from "../../server/lib/blog/utils";

export const getStaticProps = async () => {
  const posts = await GetBlogPosts();

  return {
    props: {
      posts: posts.map((post) => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
      })),
    },
    revalidate: 10,
  };
};

const BlogPosts: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
}) => {
  return (
    <>
      <NextSeo title="TSMP: Blog" description="The Tristan SMP blog!" />
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-y-16 gap-x-8 border-t border-opacity-30 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                post={{
                  ...post,
                  createdAt: new Date(post.createdAt),
                }}
                key={post.id}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPosts;
