import type { IBlogPost } from "../../server/lib/blog/utils";
import Authors from "./Authors";
import BlogTag from "./BlogTag";

const BlogPageInfo: React.FC<{
  post: IBlogPost;
}> = ({ post }) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-center text-2xl font-bold lg:text-7xl">
        {post.title}
      </h1>
      <div className="flex flex-row items-center justify-evenly p-5">
        <p className="text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>

        <div className="flex flex-row items-center justify-evenly space-x-4 p-5">
          {post.tags.map((tag) => (
            <BlogTag tag={tag} key={tag.name} />
          ))}
        </div>

        <Authors authors={post.authors} playerAuthors={post.players} />
      </div>
    </div>
  );
};

export default BlogPageInfo;
