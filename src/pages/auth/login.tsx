import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

const Login: NextPage = () => {
  useEffect(() => {
    signIn("discord");
  }, []);

  return (
    <>
      <main className="flex h-screen w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <div className="flex w-1/2 flex-col gap-4">
          <div>loading...</div>
        </div>
      </main>
    </>
  );
};

export default Login;
