/* eslint-disable @next/next/no-img-element */
import type {
  IBlogAuthor,
  IBlogPlayerAuthor,
} from "../../server/lib/blog/utils";
import Author from "./Author";

const Authors: React.FC<{
  authors: IBlogAuthor[];
  playerAuthors: IBlogPlayerAuthor[];
}> = ({ authors, playerAuthors }) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <span className="text-secondary">Written by</span>
      <div className="flex flex-row space-x-2">
        {authors.map((author) => (
          <Author author={author} key={author.name} />
        ))}
        {playerAuthors.map((author) => (
          <Author
            author={{
              avatar: `https://crafatar.com/avatars/${author.uuid}?overlay=true`,
              name: author.name,
            }}
            key={author.name}
          />
        ))}
      </div>
    </div>
  );
};

export default Authors;
