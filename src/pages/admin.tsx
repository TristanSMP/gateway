import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

const Admin: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const deployBotMutation = trpc.discord.deployBotCommands.useMutation();

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (!sessionData) {
    return <div>Not signed in</div>;
  }

  return (
    <>
      <h1>Admin</h1>
      <button onClick={() => deployBotMutation.mutate()}>
        deploy bot commands
      </button>
    </>
  );
};

export default Admin;
