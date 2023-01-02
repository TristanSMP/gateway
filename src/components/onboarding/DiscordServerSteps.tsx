import Image from "next/image";
import Instruction from "../Instruction";
import imgDiscordJoinServer from "../../../public/assets/images/onboarding/discord-join-server.png";
import imgDiscordApplicationChannel from "../../../public/assets/images/onboarding/discord-application-channel.png";

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
            src={imgDiscordJoinServer}
            alt="Join the Discord server"
            className="rounded-md"
          />
        </div>
      </Instruction>
      <Instruction step="2">
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
