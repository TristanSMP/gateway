import { showNotification } from "@mantine/notifications";
import { TRPCClientError } from "@trpc/client";
import React, { useCallback, useEffect, useState } from "react";
import VerifySteps from "../../components/onboarding/VerifySteps";
import { trpc } from "../../utils/trpc";

const VerifyMinecraftStage: React.FC<{
  username: string;
  refetch: () => void;
}> = ({ username, refetch }) => {
  const prepareVerification = trpc.onboarding.prepareVerification.useMutation();
  const verification = trpc.onboarding.verify.useMutation();

  const [code, setCode] = useState("");

  const prepare = useCallback(async () => {
    try {
      const data = await prepareVerification.mutateAsync({
        mcUsername: username,
      });

      setCode(data.challenge);
    } catch (e) {
      if (e instanceof TRPCClientError) {
        showNotification({
          title: "An error occurred",
          message: e.message,
          color: "red",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const onCheckPress = async () => {
    try {
      await verification.mutateAsync({
        mcUsername: username,
      });
      refetch();
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
        if (e.message) {
          showNotification({
            title: "An error occurred",
            message: e.message,
            color: "red",
          });
        }
      }
    }
  };

  useEffect(() => {
    prepare();
  }, [prepare]);

  return (
    <div>
      <div className="flex flex-col rounded-md bg-slate-700 lg:flex-row">
        <div className="flex flex-col rounded-md p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl">Verify Minecraft</h1>

          <p className="mt-1 text-sm">
            Link your Minecraft account by using the command below in-game.
          </p>

          <div>
            <div className="input-group mt-4">
              <input
                type="text"
                placeholder="Loading…"
                className="input-bordered input font-mono"
                value={code && `/link ${code}`}
              />
              <button
                className="btn"
                onClick={() =>
                  code && navigator.clipboard.writeText(`/link ${code}`)
                }
              >
                Copy
              </button>
            </div>

            <button
              onClick={onCheckPress}
              className={`btn-primary btn mt-4 ${
                verification.isLoading ? "loading" : ""
              }`}
              disabled={verification.isLoading}
            >
              Check
            </button>
          </div>
        </div>
      </div>
      <div className="h-5" />
      <VerifySteps code={code} />
      <button
        onClick={onCheckPress}
        className={`btn-primary btn mt-4 ${
          verification.isLoading ? "loading" : ""
        }`}
        disabled={verification.isLoading}
      >
        Check
      </button>
    </div>
  );
};

export default VerifyMinecraftStage;
