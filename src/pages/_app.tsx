import { Analytics } from "@vercel/analytics/react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { useRouter } from "next/router";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import "../styles/globals.css";
import { trpc } from "../utils/trpc";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const layoutWrapper = (Comp: JSX.Element) => {
    return (
      <>
        <NavBar />
        <main className="flex h-screen flex-1 flex-col">{Comp}</main>
        <Footer />
      </>
    );
  };

  const router = useRouter();
  const { pathname } = router;

  const wrapApp = !pathname.includes("/docs");

  return (
    <SessionProvider session={session}>
      <Analytics />
      {wrapApp ? (
        layoutWrapper(<Component {...pageProps} />)
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
