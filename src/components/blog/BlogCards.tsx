import type { IBlogPost } from "../../server/lib/blog/utils";
import BlogCard from "./BlogCard";

const BlogCards: React.FC<{
  posts: IBlogPost[];
}> = ({ posts }) => {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-y-16 gap-x-8 border-t border-opacity-30 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
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
  );
};

export default BlogCards;
