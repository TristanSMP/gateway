import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import Features from "../components/Features";
import PlayersOnlineHero from "../components/PlayersOnlineHero";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex min-h-screen flex-col bg-base-200">
        <div className="isolate">
          <>
            <div className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
              <svg
                className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
                viewBox="0 0 1155 678"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                  fillOpacity=".3"
                  d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
                />
                <defs>
                  <linearGradient
                    id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                    x1="1155.49"
                    x2="-78.208"
                    y1=".177"
                    y2="474.645"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7775D6" />
                    <stop offset="1" stopColor="#E935C1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="hero min-h-screen">
              <div className="hero-content flex-col lg:flex-row">
                <div>
                  <h1 className="text-5xl font-bold text-info">
                    Tristan SMP for,{" "}
                    <span className="text-primary shadow-purple-600 drop-shadow-2xl">
                      everyone
                    </span>
                    .
                  </h1>
                  <p className="my-5 py-6 text-lg">
                    Tristan SMP is a semi-vanilla Minecraft server for both Java
                    and Bedrock hosted in Sydney that offers an immersive and
                    unique experience to its players.
                  </p>
                  <Link href="/onboarding" className="btn-primary btn">
                    Get Started
                  </Link>
                </div>
                <div className="shadow">
                  <Image
                    src="https://cdn.tristancamejo.com/tsmp/signin.png"
                    alt="hero"
                    width={900}
                    height={500}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </>

          <PlayersOnlineHero />
          <Features />

          <div>
            <div className="mx-auto max-w-7xl py-24 md:px-6 md:py-32 lg:px-8">
              <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:px-16 md:rounded-3xl md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024"
                  className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:translate-y-0 lg:-translate-x-1/2"
                  aria-hidden="true"
                >
                  <circle
                    cx={512}
                    cy={512}
                    r={512}
                    fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                    fillOpacity="0.7"
                  />
                  <defs>
                    <radialGradient
                      id="759c1415-0410-454c-8f7c-9a820de03641"
                      cx={0}
                      cy={0}
                      r={1}
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(512 512) rotate(90) scale(512)"
                    >
                      <stop stopColor="#7775D6" />
                      <stop offset={1} stopColor="#E935C1" stopOpacity={0} />
                    </radialGradient>
                  </defs>
                </svg>
                <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Join us today,
                    <br />
                    and be a part of our growing{" "}
                    <span className="text-primary">community</span>.
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-gray-300">
                    Simply start the onboarding process by clicking the button
                    below.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                    <Link href="/onboarding" className="btn-primary btn">
                      Get started
                    </Link>
                  </div>
                </div>
                <div className="mb-4 mt-8 flex items-center justify-center self-center sm:mb-12 lg:mt-0">
                  <div className="max-w-max">
                    <Image
                      className="rounded-md"
                      src="https://cdn.tristancamejo.com/tsmp/player-record.png"
                      alt="Tristan standing with all the players online in the background"
                      width={1824}
                      height={1080}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
