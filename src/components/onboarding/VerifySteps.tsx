import Image from "next/image";
import Instruction from "../Instruction";
import imgMinecraftVerifyCode from "../../../public/assets/images/onboarding/minecraft-verify-code.png";

const VerifySteps: React.FC<{ code: string }> = ({ code }) => {
  return (
    <div className="flex flex-col gap-3">
      <Instruction step="1">
        Open chat by pressing <kbd className="kbd kbd-sm">T</kbd> (Open Chat)
      </Instruction>
      <Instruction step="2">
        <span className="inline-flex items-center gap-2">
          <span>Enter </span>
          <span className="input-group-sm input-group w-auto">
            <input
              type="text"
              placeholder="Loading…"
              className="input-bordered input input-sm w-20 font-mono"
              value={code && `~${code}`}
            />
            <button
              className="btn-sm btn"
              onClick={() => code && navigator.clipboard.writeText(`~${code}`)}
            >
              Copy
            </button>
          </span>{" "}
          <span>into the chat</span>
        </span>
        <div className="mt-1 max-w-[24rem]">
          <Image
            src={imgMinecraftVerifyCode}
            alt="~YOUR_CODE_HERE entered into the chat"
            className="rounded-md"
          />
        </div>
      </Instruction>
      <Instruction step="3">
        Press <kbd className="kbd kbd-sm">Enter</kbd> to send the message
      </Instruction>
    </div>
  );
};

export default VerifySteps;
