/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { RouteBases, Routes } from "discord-api-types/v10";
import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
    async jwt(token: any, user?: any, account?: any) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.accessToken,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async signIn({ user, account }) {
      console.log(user, account);
      if (user && account) {
        if (account.provider === "discord") {
          await prisma.account
            .update({
              where: {
                provider_providerAccountId: {
                  provider: "discord",
                  providerAccountId: user.id,
                },
              },
              data: {
                access_token: account.accessToken as string,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
            })
            .catch();
        }

        return true;
      }

      return false;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify+role_connections.write",
    }),
  ],
};

async function refreshAccessToken(token: any) {
  const res = await fetch(`${RouteBases.api}${Routes.oauth2TokenExchange()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  });

  if (res.status >= 400) {
    res.json().then(console.log);
    throw new Error(`Failed to refresh token: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  return {
    accessToken: json.access_token,
    accessTokenExpires: Date.now() + json.expires_in * 1000,
    refreshToken: json.refresh_token,
    user: token.user,
  };
}

export default NextAuth(authOptions);
