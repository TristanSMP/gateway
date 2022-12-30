import Image from "next/image";
import Instruction from "../Instruction";
import imgDiscordServerStep1 from "../../../public/assets/images/onboarding-discord-server-step-1.png";
import imgDiscordServerStep2 from "../../../public/assets/images/onboarding-discord-server-step-2.png";

const DiscordServerSteps: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <Instruction step="1">
        Join the Discord server:{" "}
        <a className="link" href="/discord" target="_blank">
          https://new.tristansmp.com/discord
        </a>
        <div className="mt-1 max-w-[24rem]">
          <Image
            src={imgDiscordServerStep1}
            alt="Join the Discord server"
            className="rounded-md"
          />
        </div>
      </Instruction>
      <Instruction step="2">
        Navigate to your application&apos;s channel
        <div className="mt-1 max-w-[24rem]">
          <Image
            src={imgDiscordServerStep2}
            alt="Navigate to your #application-xyz channel"
            className="rounded-md"
          />
        </div>
      </Instruction>
    </div>
  );
};

export default DiscordServerSteps;
