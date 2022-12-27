import { App } from "disploy";
import { env } from "../env/server.mjs";
import { Commands } from "./commands/_router";
import { Handlers } from "./handlers.ts/_router";

const DisployApp = new App({
  logger: {
    debug: true,
  },
  commands: Commands,
  handlers: Handlers,
});

DisployApp.start({
  clientId: env.DISCORD_CLIENT_ID,
  token: env.DISCORD_TOKEN,
  publicKey: env.DISCORD_PUBLIC_KEY,
});

export { DisployApp };
