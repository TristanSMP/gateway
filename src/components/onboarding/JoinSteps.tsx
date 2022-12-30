import Image from "next/image";
import Instruction from "../Instruction";
import imgJoinStep1 from "../../../public/assets/images/onboarding-join-step-1.png";
import imgJoinStep2 from "../../../public/assets/images/onboarding-join-step-2.png";

const JoinSteps: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <Instruction step="1">
        Go to Multiplayer and click on Add Server
        <div className="mt-1 max-w-[24rem]">
          <Image
            src={imgJoinStep1}
            alt="Add Server button in Minecraft"
            className="rounded-md"
          />
        </div>
      </Instruction>
      <Instruction step="2">
        Enter <strong>tristansmp.com</strong> into Server Address
        <div className="mt-1 max-w-[24rem]">
          <Image
            src={imgJoinStep2}
            alt="tristansmp.com in the Server Address field"
            className="rounded-md"
          />
        </div>
      </Instruction>
      <Instruction step="3">Click Done then join the server</Instruction>
    </div>
  );
};

export default JoinSteps;
