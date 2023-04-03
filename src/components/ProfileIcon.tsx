import { UserIcon } from "@heroicons/react/24/solid";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";

const ProfileIcon = () => {
  const { data: sessionData } = useSession();
  const localUser = trpc.auth.getLocalUser.useQuery();

  return sessionData?.user ? (
    <div className="dropdown-end dropdown">
      <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
        <div className="w-10 rounded-full">
          <Image
            width={80}
            height={80}
            alt="Your profile picture"
            src={sessionData.user.image ?? "/assets/images/TLogo.png"}
          />
        </div>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
      >
        {localUser?.data?.canAccessAdminDashboard && (
          <li>
            <Link href="/admin">Admin</Link>
          </li>
        )}
        <li>
          <Link href="/onboarding">My application</Link>
        </li>
        <li>
          <a onClick={() => signOut()}>Logout</a>
        </li>
      </ul>
    </div>
  ) : (
    <div className="dropdown-end dropdown">
      <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
        <div className="w-10 rounded-full">
          <UserIcon className="h-10 w-10" />
        </div>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
      >
        <li>
          <a onClick={() => signIn("discord")}>Login</a>
        </li>
      </ul>
    </div>
  );
};

export default ProfileIcon;
