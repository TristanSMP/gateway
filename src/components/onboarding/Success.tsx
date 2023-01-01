import { CheckCircleIcon } from "@heroicons/react/24/outline";
import DiscordServerSteps from "./DiscordServerSteps";

const Success: React.FC = () => {
  return (
    <div>
      <div className="flex flex-col rounded-md bg-slate-700 lg:flex-row">
        <div className="flex flex-col rounded-md p-4 sm:p-6 md:p-8">
          <h1 className="flex flex-row gap-1 text-2xl">
            <CheckCircleIcon className="-mb-px h-6 w-6 self-center" />
            <div>Application submitted</div>
          </h1>

          <p className="mt-1 text-sm">
            You can check your application status in your application channel of
            the TristanSMP{" "}
            <a href="/discord" className="link">
              Discord server
            </a>
            .
          </p>
        </div>
      </div>
      <div className="mt-5">
        <DiscordServerSteps />
      </div>
    </div>
  );
};

export default Success;
