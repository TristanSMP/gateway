/* eslint-disable @next/next/no-img-element */
import { Tooltip } from "@mui/material";
import type { IBlogAuthor } from "../../server/lib/blog/utils";

const Author: React.FC<{
  author: IBlogAuthor;
}> = ({ author }) => {
  return (
    <Tooltip title={author.name}>
      <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
        <div className="w-10 rounded-full">
          {author.avatar ? (
            <img width={80} height={80} alt={author.name} src={author.avatar} />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-center">
              {author.name[0]}
            </div>
          )}
        </div>
      </label>
    </Tooltip>
  );
};

export default Author;
