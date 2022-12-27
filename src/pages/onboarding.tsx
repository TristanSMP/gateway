import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MinecraftAvatar from "../components/MinecraftAvatar";
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

  const status = trpc.auth.getStatus.useQuery();

  while (status.status === "loading") {
    return <div>loading (root)...</div>;
  }

  if (status.status === "error") {
    return <div>error</div>;
  }

  return (
    <>
      <main className="flex h-screen w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <div className="flex w-1/2 flex-col gap-4">
          {(() => {
            if (!status.data.sentApplication) {
              return <ApplicationStage refetch={status.refetch} />;
            }

            if (!status.data.linked) {
              return (
                <LinkStage
                  linkChallenge={status.data.linkChallenge}
                  refetch={status.refetch}
                />
              );
            }

            return <div>you are already linked</div>;
          })()}
        </div>
      </main>
    </>
  );
};

function ApplicationStage({ refetch }: { refetch: () => Promise<unknown> }) {
  const [username, setUsername] = useState("");
  const [howLongWillYouPlay, setHowLongWillYouPlay] = useState("");
  const [why, setWhy] = useState("");

  const mutation = trpc.applications.submitApplication.useMutation();

  useEffect(() => {
    if (mutation.isSuccess) {
      refetch();
    }
  }, [mutation.isSuccess, refetch]);

  return (
    <>
      <h1 className="text-5xl font-bold">Welcome to TristanSMP!</h1>

      <div className="flex flex-col gap-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">What is your Minecraft username?</span>
          </label>
          <input
            type="text"
            placeholder="twisttaan"
            className="input-bordered input w-full max-w-xs"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <MinecraftAvatar uuidOrUsername={username} />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Why do you want to join?</span>
          </label>
          <textarea
            className="textarea-bordered textarea h-24"
            placeholder="I want to join because..."
            value={why}
            maxLength={1000}
            onChange={(e) => setWhy(e.target.value)}
          />
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">How much time will you play?</span>
          </label>
          <input
            type="text"
            placeholder="1-2 hours a day"
            className="input-bordered input w-full max-w-xs"
            value={howLongWillYouPlay}
            maxLength={50}
            onChange={(e) => setHowLongWillYouPlay(e.target.value)}
          />
        </div>
      </div>
      <button
        onClick={() => {
          mutation.mutate({
            howLongWillYouPlay: howLongWillYouPlay,
            mcUsername: username,
            whyJoin: why,
          });
        }}
        className="btn-primary btn"
      >
        submit application
      </button>
    </>
  );
}

function LinkStage({
  linkChallenge,
  refetch,
}: {
  linkChallenge: string;
  refetch: () => Promise<unknown>;
}) {
  const mutation = trpc.auth.verifyLinkChallenge.useMutation();
  const createCollector = trpc.auth.createCollector.useMutation();

  useEffect(() => {
    if (mutation.isSuccess) {
      refetch();
    }
  }, [mutation.isSuccess, refetch]);

  useEffect(() => {
    createCollector.mutate();
  }, []);

  return (
    <>
      <div>
        please type this in chat to verify your account:
        <br />
        <pre>
          <code>~{linkChallenge}</code>
        </pre>
        {mutation.isError && (
          <div className="text-error">error: {mutation.error.message}</div>
        )}
        <button
          onClick={() => {
            mutation.mutate();
          }}
          className="btn-primary btn"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? "checking..." : "check"}
        </button>
      </div>
    </>
  );
}

export default OnBoarding;
