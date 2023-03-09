import Link from "next/link";
import type { IBlogPost } from "../../server/lib/blog/utils";
import Authors from "./Authors";

const BlogCard: React.FC<{
  post: IBlogPost;
}> = ({ post }) => {
  return (
    <div className="card w-96 bg-base-300 shadow-xl transition-all duration-300 ease-in-out hover:!rounded-3xl">
      <div className="card-body">
        <h2 className="card-title">{post.title}</h2>
        <p>{post.description}</p>
        <div className="card-actions justify-end">
          <Authors authors={post.authors} />
          <Link href={`/blog/${post.slug}`} className="btn-ghost btn">
            Read more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
