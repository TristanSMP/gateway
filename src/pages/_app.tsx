import { ThemeProvider } from "@emotion/react";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { createTheme } from "@mui/material/styles";
import { Analytics } from "@vercel/analytics/react";
import "katex/dist/katex.min.css";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { type AppType } from "next/app";
import { useRouter } from "next/router";
import "prismjs/themes/prism-tomorrow.css";
import "react-notion-x/src/styles.css";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import "../styles/globals.css";
import { trpc } from "../utils/trpc";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "inherit",
  },
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const layoutWrapper = (Comp: JSX.Element) => {
    return (
      <>
        <NavBar />
        <main className="flex min-h-screen flex-1 flex-col">{Comp}</main>
        <Footer />
      </>
    );
  };

  const router = useRouter();
  const { pathname } = router;

  const wrapApp = !pathname.includes("/docs");

  return (
    <>
      <DefaultSeo
        openGraph={{
          type: "website",
          locale: "en_IE",
          url: "https://tristansmp.com",
          siteName: "Tristan SMP",
        }}
      />
      <SessionProvider session={session}>
        <Analytics />
        <MantineProvider
          theme={{
            colorScheme: "dark",
          }}
        >
          <ThemeProvider theme={theme}>
            <NotificationsProvider>
              {wrapApp ? (
                layoutWrapper(<Component {...pageProps} />)
              ) : (
                <Component {...pageProps} />
              )}
            </NotificationsProvider>
          </ThemeProvider>
        </MantineProvider>
      </SessionProvider>
    </>
  );
};

export default trpc.withTRPC(MyApp);
