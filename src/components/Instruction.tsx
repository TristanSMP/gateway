const Instruction: React.FC<{ step: string; children?: React.ReactNode }> = ({
  step,
  children,
}) => (
  <div className="flex flex-row">
    <div className="mr-2 flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-slate-700 font-bold">
      {step}
    </div>
    <div className="self-center">{children}</div>
  </div>
);

export default Instruction;
