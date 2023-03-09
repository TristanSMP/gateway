import * as Mui from "@mui/material";
import type { InferGetStaticPropsType, NextPage } from "next";
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
    revalidate: 60,
  };
};

const BlogPosts: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  posts,
}) => {
  return (
    <Mui.Container>
      <Mui.Grid container spacing={2}>
        <Mui.Typography
          variant="h1"
          sx={{
            mb: 4,
          }}
        >
          Blog
        </Mui.Typography>
        <Mui.Grid container spacing={2}>
          {posts.map((post) => (
            <BlogCard
              post={{
                ...post,
                createdAt: new Date(post.createdAt),
              }}
              key={post.id}
            />
          ))}
        </Mui.Grid>
      </Mui.Grid>
    </Mui.Container>
  );
};

export default BlogPosts;
