import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { SkinViewer, WalkingAnimation } from "skinview3d";
import { z } from "zod";
import { UsernameToProfile } from "../../server/lib/minecraft";
import { getUserStats, translateSkillNames } from "../../server/lib/pipe";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const username = z.string().parse(context.query.username);

  const profile = await UsernameToProfile(username);

  if (!profile) {
    return {
      props: {
        notFound: true,
      },
    };
  }

  const stats = await getUserStats(profile.id);

  if (stats.error) {
    throw new Error("Failed to get stats for user.");
  }

  return {
    props: {
      profile,
      mcmmoData: translateSkillNames(stats),
    },
  };
};

const StatsViewer: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ mcmmoData, notFound, profile }) => {
  while (notFound || !mcmmoData || mcmmoData.error || !profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-4xl text-white drop-shadow-2xl">
        Hey it seems like this username doesn&apos;t exist.
      </div>
    );
  }

  const { name: username, id: uuid } = profile;

  return (
    <>
      <Head>
        <title>{username} - TSMPstats</title>
        <meta content={`${username}, TSMP Stats`} property="og:title" />
        <meta
          content={`TSMP Stats for ${username}. Their Power Level is ${
            mcmmoData["Power Level"] ?? 0
          }`}
          property="og:description"
        />
        <meta content="https://stats.tristansmp.com/" property="og:url" />
        <meta
          content={`https://crafatar.com/renders/body/${uuid}`}
          property="og:image"
        />
      </Head>

      <section className="">
        <div className="flex flex-col items-center justify-center md:h-screen md:flex-row">
          <div className="mx-10 my-5 py-8 px-10 text-center text-3xl font-bold">
            <canvas
              id="skinviewer"
              className="h-full w-full"
              ref={(canvas) => {
                if (!canvas) return;
                if (!canvas?.width) return;
                if (!canvas?.height) return;

                new SkinViewer({
                  canvas: canvas,
                  width: 300,
                  height: 400,
                  skin: `https://crafatar.com/skins/${uuid}`,
                  animation: new WalkingAnimation(),
                });
              }}
            />
            {username}
          </div>

          <div className="relative mb-8 flex w-[85%] min-w-0 flex-col break-words rounded-lg bg-gray-900 md:mb-0 md:w-72">
            <div className="mb-0 rounded-t-lg bg-gray-200 py-3 px-8 text-gray-900">
              <strong>McMMO Stats</strong>
            </div>
            <div className="flex-auto rounded-b-lg bg-base-300 py-4 px-4">
              {Object.entries(mcmmoData).map(([skillName, skillValue]) => {
                if (skillValue === false) return null;

                return (
                  <>
                    <div className="flex items-center">
                      <div className="relative max-w-full px-8 pr-4 pl-4 text-gray-300 lg:order-1">
                        <p>{skillName}</p>
                      </div>
                      <div
                        className="relative w-full px-8 pr-4 pl-4 text-right lg:order-2 lg:flex-1 lg:flex-grow"
                        style={{ fontSize: "90%" }}
                      >
                        <p className="font-mono text-xl font-extrabold text-gray-200">
                          {skillValue}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StatsViewer;
