/* eslint-disable @next/next/no-img-element */
import { showNotification } from "@mantine/notifications";
import { TRPCClientError } from "@trpc/client";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

const LinkMinecraftStage = ({
  setUsername,
  username,
  next,
}: {
  username: string;
  setUsername: (username: string) => void;
  next: () => void;
}) => {
  const profile = trpc.onboarding.findPlayer.useQuery({
    mcUsername: username,
  });

  const [inputUsername, setInputUsername] = useState(username);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row">
        <div className="flex w-96 flex-col bg-slate-700 p-8">
          <h1 className="text-2xl">Link Minecraft</h1>

          <p className="pb-3 text-sm">
            To link your Minecraft account, please enter your Minecraft username
            below.
          </p>

          <div>
            <input
              type="text"
              placeholder="Minecraft username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="input-bordered input m-5 w-full max-w-xs"
            />

            <button
              onClick={() => {
                setUsername(inputUsername);
              }}
              className="btn-primary btn ml-2"
              disabled={
                username !== "" &&
                (inputUsername === username || profile.isLoading)
              }
            >
              {profile.isLoading && username !== "" ? (
                <progress className="progress w-56"></progress>
              ) : (
                "Find"
              )}
            </button>
          </div>
        </div>

        {username !== "" && (
          <div className="flex flex-col bg-slate-700 p-8">
            <h2 className="text-2xl">Profile</h2>

            {profile.isLoading && <div>Loading...</div>}

            {profile.data && (
              <div className="flex flex-col gap-5">
                <div className="m-5 flex flex-row gap-5">
                  <div className="h-20 w-20">
                    <img
                      src={profile.data.avatar}
                      alt="avatar"
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="text-xl">{profile.data.name}</div>
                    <div className="text-sm">{profile.data.id}</div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p>
                    Make sure to join <code>tristansmp.com</code> before
                    verifying.
                  </p>
                  <button
                    className="btn-primary btn ml-2"
                    onClick={
                      profile.data.online
                        ? next
                        : () => {
                            showNotification({
                              title: "You are not online",
                              message:
                                "Please join tristansmp.com before verifying",
                              color: "red",
                            });
                          }
                    }
                  >
                    {profile.data.online ? "Verify" : "Join"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const VerifyMinecraftStage = ({ username }: { username: string }) => {
  const prepareVerification = trpc.onboarding.prepareVerification.useMutation();
  const verification = trpc.onboarding.verify.useMutation();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const prepare = useCallback(async () => {
    try {
      const data = await prepareVerification.mutateAsync({
        mcUsername: username,
      });

      setCode(data.challenge);
    } catch (e) {
      if (e instanceof TRPCClientError) {
        setError(e.message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const onCheckPress = async () => {
    try {
      await verification.mutateAsync({
        mcUsername: username,
      });
    } catch (e) {
      if (e instanceof TRPCClientError) {
        if (
          e.message.includes("Failed to collect challenge") &&
          e.cause?.cause === "no-collector"
        ) {
          prepare();
          onCheckPress();
        }

        prepare();
        setError(e.message);
      }
    }
  };

  useEffect(() => {
    prepare();
  }, [prepare]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row">
        <div className="flex w-96 flex-col bg-slate-700 p-8">
          <h1 className="text-2xl">Verify Minecraft</h1>

          <p className="pb-3 text-sm">
            To verify your Minecraft account, please enter the code below in the
            in-game chat.
          </p>

          <div className="flex flex-row">
            <div className="flex flex-col">
              <code className="rounded bg-slate-600 p-2 font-mono text-sm">
                ~{code || "Loading..."}
              </code>
              <span className="ml-2 text-sm">make sure to include the ~</span>
            </div>

            <button
              onClick={onCheckPress}
              className="btn-primary btn ml-2"
              disabled={verification.isLoading}
            >
              {verification.isLoading ? (
                <progress className="progress w-56"></progress>
              ) : (
                "Check"
              )}
            </button>
          </div>

          {error && <div className="mt-5 text-sm text-red-500">{error}</div>}
        </div>
      </div>
    </div>
  );
};

const ApplicationStage = ({ refetch }: { refetch: () => void }) => {
  const [whyJoin, setWhyJoin] = useState("");
  const [howLongWillYouPlay, setHowLongWillYouPlay] = useState("");

  const submitApplication = trpc.onboarding.submitApplication.useMutation();

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      await submitApplication.mutateAsync({
        whyJoin,
        howLongWillYouPlay,
      });

      refetch();
    } catch (e) {
      if (e instanceof TRPCClientError) {
        setError(e.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row">
        <div className="flex w-96 flex-col bg-slate-700 p-8">
          <h1 className="text-2xl">Application</h1>

          <p className="pb-3 text-sm">
            Please fill out the application below to apply for the server.
          </p>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label htmlFor="why-join" className="text-sm">
                Why do you want to join?
              </label>
              <textarea
                id="why-join"
                className="input"
                value={whyJoin}
                onChange={(e) => setWhyJoin(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="how-long" className="text-sm">
                How long do you plan on playing?
              </label>
              <textarea
                id="how-long"
                className="input"
                value={howLongWillYouPlay}
                onChange={(e) => setHowLongWillYouPlay(e.target.value)}
              />
            </div>

            <div className="flex flex-row">
              <button
                onClick={onSubmit}
                className="btn-primary btn ml-2"
                disabled={submitApplication.isLoading}
              >
                {submitApplication.isLoading ? (
                  <progress className="progress w-56"></progress>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <main className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
        <VerifyMinecraftStage username={username} />
      )}

      {status.data.stages.linkMinecraft &&
        !status.data.stages.doApplication && (
          <ApplicationStage refetch={() => status.refetch()} />
        )}

      {status.data.stages.linkMinecraft && status.data.stages.doApplication && (
        <div>Application submitted!</div>
      )}
    </main>
  );
};

export default OnBoarding;
