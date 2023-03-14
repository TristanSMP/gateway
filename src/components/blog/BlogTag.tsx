import Link from "next/link";
import type { IBlogTag } from "../../server/lib/blog/utils";

const BlogTag: React.FC<{
  tag: IBlogTag;
}> = ({ tag }) => {
  return (
    <Link
      href={`/blog?tag=${tag.name}`}
      className="relative z-10 rounded-full bg-gray-50 py-1.5 px-3 font-medium text-gray-600 hover:bg-gray-100"
    >
      {tag.name}
    </Link>
  );
};

export default BlogTag;
