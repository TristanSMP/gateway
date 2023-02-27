import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import JoinSteps from "../../components/onboarding/JoinSteps";
import { trpc } from "../../utils/trpc";

const LinkMinecraftStage: React.FC<{
  username: string;
  setUsername: (username: string) => void;
  next: () => void;
}> = ({ setUsername, username, next }) => {
  const [bedrock, setBedrock] = useState(false);
  const [inputUsername, setInputUsername] = useState(username);

  const profile = trpc.onboarding.findPlayer.useQuery({
    mcUsername: bedrock ? `.${inputUsername}` : inputUsername,
  });

  useEffect(() => {
    if (inputUsername.startsWith(".")) {
      setBedrock(true);
    } else {
      setBedrock(false);
    }
  }, [inputUsername]);

  return (
    <div>
      <div className="flex flex-col rounded-md bg-slate-700 lg:flex-row">
        <div className="flex flex-col rounded-md p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl">Link Minecraft</h1>

          <p className="mt-1 text-sm">
            To link your Minecraft account, please enter your Minecraft username
            below.
          </p>

          <div>
            <div className="flex flex-row py-5">
              <input
                type="text"
                placeholder="Minecraft username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="input-bordered input mt-5 -ml-0.5 w-full max-w-xs"
              />

              <button
                onClick={() => {
                  setBedrock(!bedrock);
                }}
                className="btn-secondary btn mt-5 -ml-0.5 w-1/3 max-w-xs"
              >
                {bedrock ? "Bedrock" : "Java"}
              </button>
            </div>

            <button
              onClick={() => {
                setUsername(bedrock ? `.${inputUsername}` : inputUsername);
              }}
              className={`btn-primary btn ${
                profile.isLoading && username !== "" ? "loading" : ""
              }`}
              disabled={
                username !== "" &&
                (inputUsername === username || profile.isLoading)
              }
            >
              Find
            </button>
          </div>
        </div>

        {username !== "" && (
          <div className="flex flex-col rounded-md p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl">Profile</h2>

            {profile.isLoading && <div>Loading...</div>}

            {profile.data && (
              <div className="flex flex-col gap-5">
                <div className="ml-0.5 mt-5 mb-2 flex flex-row items-center gap-5">
                  <div className="">
                    <div className="h-12 w-12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.data.avatar}
                        alt="avatar"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-xl">{profile.data.name}</div>
                    <div className="text-sm">{profile.data.id}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {username !== "" && profile.data && (
        <div className="pt-8">
          <h2 className="mb-4 text-2xl">Verify</h2>
          <JoinSteps />
          <p className="mt-4">
            When you&apos;ve joined TristanSMP, click the button below to
            continue.
          </p>
          <button
            className="btn-primary btn mt-3"
            onClick={
              profile.data.online
                ? next
                : () => {
                    console.log(profile.data);
                    showNotification({
                      title: "You are not online",
                      message: "Please join tristansmp.com before verifying",
                      color: "red",
                    });
                  }
            }
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default LinkMinecraftStage;
