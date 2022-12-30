import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

const Stats: NextPage = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();
  return (
    <>
      <div>
        <section className="">
          <div className="flex h-screen flex-col items-center justify-center">
            <Image
              className="rounded-full transition-all duration-500 ease-in-out hover:scale-110 hover:drop-shadow-2xl"
              src="/assets/images/TLogo.png"
              alt="TSMP Logo"
              width={250}
              height={352}
            />
            <div className="m-10 py-8 px-10 text-center text-3xl text-white">
              TSMPstats is a tool for TSMP players to see their stats.
              <form
                className=" items-center justify-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push(`/stats/${username}`);
                }}
              >
                <input
                  className="m-2 rounded-full bg-gray-800 px-4 py-2 text-white"
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  className="m-2 rounded-full bg-gray-800 px-4 py-2 text-white"
                  type="submit"
                >
                  Look-up
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Stats;
