import { useRouter } from "next/router";
import { useConfig } from "nextra-theme-docs";

export default {
  logo: <span>tsmp</span>,
  logoLink: "/",
  project: {
    link: "https://github.com/tristansmp/web",
  },
  docsRepositoryBase: "https://github.com/tristansmp/web/blob",
  footer: {
    text: <span>TristanSMP by Tristan, for the community.</span>,
  },
  head: () => {
    const { frontMatter } = useConfig();

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          property="og:title"
          content={
            frontMatter.title ? `${frontMatter.title} - tsmp docs` : "tsmp docs"
          }
        />
        <meta
          property="og:description"
          content={frontMatter.description || "TristanSMP Documentation"}
        />
      </>
    );
  },
  useNextSeoProps() {
    const { route } = useRouter();

    if (route !== "/docs") {
      return {
        titleTemplate: "%s – tsmp",
      };
    }
  },
};
