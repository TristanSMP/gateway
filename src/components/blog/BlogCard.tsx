import Image from "next/image";
import Link from "next/link";
import type { IBlogPost } from "../../server/lib/blog/utils";
import Authors from "./Authors";
import BlogTag from "./BlogTag";

const BlogCard: React.FC<{
  post: IBlogPost;
}> = ({ post }) => {
  return (
    <article className="flex max-w-xl flex-col items-start justify-between gap-y-4 rounded-3xl bg-black bg-opacity-30 p-8">
      <Link href={`/blog/${post.slug}`} className="h-1/2">
        <Image
          src={
            post.coverImage || "https://cdn.tristancamejo.com/tsmp/signin.png"
          }
          alt={post.title}
          width={800}
          height={400}
          className="aspect-video h-full rounded-3xl"
          style={{ objectFit: "cover" }}
        />
      </Link>

      <div className="flex items-center gap-x-4 text-xs">
        <time dateTime={post.createdAt.toISOString()} className="text-gray-500">
          {post.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {post.tags.map((tag) => (
          <BlogTag tag={tag} key={tag.name} />
        ))}
      </div>
      <div className="group relative">
        <h3 className="mt-3 text-lg font-semibold leading-6 group-hover:text-secondary">
          <Link href={`/blog/${post.slug}`}>
            <span className="absolute inset-0" />
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-3 mt-5 text-sm leading-6 text-gray-200">
          {post.description}
        </p>
      </div>
      <div className="relative mt-8 flex items-center gap-x-4">
        <Authors authors={post.authors} playerAuthors={post.players} />
      </div>
    </article>
  );
};

export default BlogCard;
