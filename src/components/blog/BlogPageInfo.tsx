import type { IBlogPost } from "../../server/lib/blog/utils";
import Authors from "./Authors";

const BlogPageInfo: React.FC<{
  post: IBlogPost;
}> = ({ post }) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-7xl font-bold">{post.title}</h1>
      <div className="flex flex-row items-center justify-evenly p-5">
        <p className="text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>

        <Authors authors={post.authors} playerAuthors={post.players} />
      </div>
    </div>
  );
};

export default BlogPageInfo;
