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
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (!dbUser) {
        throw new Error("Unable to fetch session user data");
      }

      session.user.id = dbUser.id;

      return session;
    },
  },
};

export default NextAuth(authOpts);
