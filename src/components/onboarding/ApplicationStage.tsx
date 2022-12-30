import { TRPCClientError } from "@trpc/client";
import React, { useRef, useState } from "react";
import { trpc } from "../../utils/trpc";
import CharacterCount from "../../components/CharacterCount";
import type { applicationLengths } from "../../server/trpc/router/onboarding";

const ApplicationStage: React.FC<{
  refetch: () => void;
  applicationLengths: typeof applicationLengths;
}> = ({ refetch, applicationLengths }) => {
  const howLongRef = useRef<HTMLTextAreaElement>(null);
  const whyJoinRef = useRef<HTMLTextAreaElement>(null);
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
    <div>
      <div className="flex max-w-4xl flex-col rounded-md bg-slate-700 lg:flex-row">
        <div className="flex flex-col rounded-md p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl">Apply to TristanSMP</h1>

          <p className="mt-1 text-sm">
            Please fill out the application below to apply to the server.
          </p>

          {error && <div className="mt-1 text-sm text-red-500">{error}</div>}

          <div className="mt-3 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="why-join" className="text-sm">
                Why do you want to join?{" "}
                <CharacterCount
                  limit={applicationLengths.whyJoin}
                  value={whyJoinRef.current?.value ?? ""}
                />
              </label>
              <div className="-ml-0.5 w-[60vw] min-w-full max-w-lg">
                <textarea
                  id="why-join"
                  className="input h-24 w-full py-1 px-2"
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value)}
                  ref={whyJoinRef}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="how-long" className="text-sm">
                How long do you plan on playing?{" "}
                <CharacterCount
                  limit={applicationLengths.howLongWillYouPlay}
                  value={howLongRef.current?.value ?? ""}
                />
              </label>
              <div className="-ml-0.5 w-[60vw] min-w-full max-w-lg">
                <textarea
                  id="how-long"
                  className="input h-24 w-full py-1 px-2"
                  value={howLongWillYouPlay}
                  onChange={(e) => setHowLongWillYouPlay(e.target.value)}
                  ref={howLongRef}
                />
              </div>
            </div>

            <div className="flex flex-row">
              <button
                onClick={onSubmit}
                className={`btn-primary btn ${
                  submitApplication.isLoading ? "loading" : ""
                }}`}
                disabled={submitApplication.isLoading}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStage;
