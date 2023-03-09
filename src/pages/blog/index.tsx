import * as Mui from "@mui/material";
import type { InferGetStaticPropsType, NextPage } from "next";
import Link from "next/link";
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
    revalidate: 60,
  };
};

const BlogPosts: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
}) => {
  return (
    <Mui.Container>
      <Mui.Grid container spacing={2}>
        {posts.map((post) => (
          <div className="card w-96 bg-base-100 shadow-xl" key={post.id}>
            <div className="card-body">
              <h2 className="card-title">{post.title}</h2>
              <p>{post.description}</p>
              <div className="card-actions justify-end">
                <Link href={`/blog/${post.slug}`} className="btn-primary btn">
                  Read more
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Mui.Grid>
    </Mui.Container>
  );
};

export default BlogPosts;
