/* eslint-disable @next/next/no-img-element */
import type { IBlogAuthor } from "../../server/lib/blog/utils";
import Author from "./Author";

const Authors: React.FC<{
  authors: IBlogAuthor[];
}> = ({ authors }) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <span className="text-gray-500">By</span>
      <div className="flex flex-row space-x-2">
        {authors.map((author) => (
          <Author author={author} key={author.name} />
        ))}
      </div>
    </div>
  );
};

export default Authors;
