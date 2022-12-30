import React from "react";

const Steps: React.FC<{
  stages: {
    linkMinecraft: boolean;
    doApplication: boolean;
  };
  verifyStage: boolean;
}> = ({ stages, verifyStage }) => {
  return (
    <ul className="steps steps-horizontal self-center lg:self-auto lg:steps-vertical">
      <li
        className={`${
          !stages.linkMinecraft && !verifyStage
            ? "step-accent"
            : verifyStage || (stages.linkMinecraft && !stages.doApplication)
            ? "step-primary"
            : stages.doApplication
            ? "step-primary"
            : ""
        } step mx-6 lg:mx-0`}
      >
        <div>
          <span>Link</span>
          <span className="hidden lg:inline"> Minecraft</span>
        </div>
      </li>
      <li
        className={`${
          verifyStage && !stages.linkMinecraft
            ? "step-accent"
            : stages.linkMinecraft
            ? "step-primary"
            : ""
        } step`}
      >
        <div>
          <span>Verify</span>
          <span className="hidden lg:inline"> Minecraft</span>
        </div>
      </li>
      <li
        className={`${
          stages.linkMinecraft && !stages.doApplication
            ? "step-accent"
            : stages.linkMinecraft && stages.doApplication
            ? "step-primary"
            : ""
        } step`}
      >
        Apply
      </li>
    </ul>
  );
};

export default Steps;
