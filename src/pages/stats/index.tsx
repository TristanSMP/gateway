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
              className="h-36 w-36 rounded-full transition-all duration-500 ease-in-out hover:scale-110 hover:drop-shadow-2xl"
              src="/assets/images/TLogo.png"
              alt="TSMP Logo"
              width={250}
              height={352}
            />
            <div className="py-8 text-center text-3xl">
              <div className="mb-8 px-2">
                TSMPstats is a tool for TSMP players to see their stats.
              </div>
              <form
                className="items-center justify-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push(`/stats/${username}`);
                }}
              >
                <div className="justify-center sm:input-group">
                  <input
                    className="input-bordered input mb-4 w-full max-w-xs"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <br />
                  <button className="btn-primary btn" type="submit">
                    Look up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Stats;
