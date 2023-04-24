import NextAuth from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "../../../db/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOpts: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          slackId: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (!dbUser || !dbUser.slackId) {
        throw new Error("Error in fetching session user data");
      }

      session.user.id = dbUser.id;
      session.user.slackId = dbUser.slackId;

      return session;
    },
  },
};

export default NextAuth(authOpts);
