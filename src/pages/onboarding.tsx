/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect, useState } from "react";
import ApplicationStage from "../components/onboarding/ApplicationStage";
import LinkMinecraftStage from "../components/onboarding/LinkMinecraftStage";
import Steps from "../components/onboarding/Steps";
import Success from "../components/onboarding/Success";
import VerifyMinecraftStage from "../components/onboarding/VerifyMinecraftStage";
import { trpc } from "../utils/trpc";

const OnBoarding: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (!sessionData?.user) {
      signIn("discord");
    }
  }, [sessionData, sessionStatus]);

  const status = trpc.onboarding.status.useQuery();
  const [username, setUsername] = useState("");
  const [verifyStage, setVerifyStage] = useState(false);

  if (sessionStatus === "loading" || status.isLoading) {
    return <div>Loading...</div>;
  }

  if (status.isError) {
    return <div>{status.error.message}</div>;
  }

  return (
    <main className="flex justify-center py-2 px-4 sm:px-6 lg:py-12 lg:px-8">
      <NextSeo
        title="TSMP: Onboarding"
        description="Apply to join the Tristan SMP server!"
      />
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-24">
        <Steps stages={status.data.stages} verifyStage={verifyStage} />
        {!status.data.stages.linkMinecraft && !verifyStage && (
          <LinkMinecraftStage
            setUsername={setUsername}
            username={username}
            next={() => {
              setVerifyStage(true);
            }}
          />
        )}
        {!status.data.stages.linkMinecraft && verifyStage && (
          <VerifyMinecraftStage
            username={username}
            refetch={() => status.refetch()}
          />
        )}
        {status.data.stages.linkMinecraft &&
          !status.data.stages.doApplication && (
            <ApplicationStage
              refetch={() => status.refetch()}
              applicationLengths={status.data.applicationLengths}
            />
          )}
        {status.data.stages.linkMinecraft &&
          status.data.stages.doApplication && <Success />}
      </div>
    </main>
  );
};

export default OnBoarding;
