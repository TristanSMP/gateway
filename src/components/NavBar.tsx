import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ProfileIcon from "./ProfileIcon";

const links: { name: string; href: string; newTab: boolean }[] = [
  {
    name: "Join",
    href: "/blog/join",
    newTab: false,
  },
  {
    name: "Market",
    href: "/market",
    newTab: false,
  },
  {
    name: "Stats",
    href: "/stats",
    newTab: false,
  },
  {
    name: "Discord",
    href: "/discord",
    newTab: true,
  },
  {
    name: "Blog",
    href: "/blog",
    newTab: false,
  },
];

export const NavBar = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn-ghost btn p-2 lg:hidden">
            <Bars3Icon className="h-6 w-6" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-200 p-2 shadow-sm"
          >
            {links.map((link) => (
              <li key={`${link.name}:${link.href}`}>
                <Link
                  href={link.href}
                  target={link.newTab ? "_blank" : undefined}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link className="btn-ghost btn text-xl normal-case" href="/">
          TristanSMP
        </Link>
        <ul className="menu menu-horizontal hidden px-1 lg:flex">
          {links.map((link) => (
            <li key={`${link.name}:${link.href}`}>
              <Link
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        <ProfileIcon />
      </div>
    </div>
  );
};
