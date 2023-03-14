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
import Head from "next/head";
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
        <div className="isolate">
          <>
            <div className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
              <svg
                className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
                viewBox="0 0 1155 678"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                  fillOpacity=".3"
                  d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
                />
                <defs>
                  <linearGradient
                    id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                    x1="1155.49"
                    x2="-78.208"
                    y1=".177"
                    y2="474.645"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7775D6" />
                    <stop offset="1" stopColor="#E935C1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </>
        </div>
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
          images: [
            {
              url: "https://tristansmp.com/assets/images/TLogo.png",
              width: 256,
              height: 256,
              alt: "Tristan SMP",
            },
          ],
        }}
      />

      <Head>
        <link rel="icon" type="image/png" href="/assets/images/TLogo.png" />
      </Head>

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
