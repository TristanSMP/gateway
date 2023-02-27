import Image from "next/image";
import imgDiscordApplicationChannel from "../../../public/assets/images/onboarding/discord-application-channel.png";
import Instruction from "../Instruction";

const DiscordServerSteps: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <Instruction step="1">
        Navigate to your application&apos;s channel
        <div className="mt-1 max-w-[24rem]">
          <Image
            src={imgDiscordApplicationChannel}
            alt="Navigate to your #application-xyz channel"
            className="rounded-md"
          />
        </div>
      </Instruction>
    </div>
  );
};

export default DiscordServerSteps;
