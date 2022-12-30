import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="dark h-full" data-theme="dracula">
      <Head />
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
