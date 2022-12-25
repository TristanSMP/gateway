import Link from "next/link";
import { ProfileIcon } from "./ProfileIcon";

export const NavBar = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link className="btn-ghost btn text-xl normal-case" href="/">
          TristanSMP
        </Link>
      </div>
      <div className="flex-none gap-2">
        <ProfileIcon />
      </div>
    </div>
  );
};
