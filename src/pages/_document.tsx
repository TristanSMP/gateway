import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="dark min-h-full" data-theme="tsmp">
      <Head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
