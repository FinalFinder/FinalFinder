import NextAuth from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "../../../db/prisma";

export default NextAuth({
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
        include: {
          exams: true,
        },
      });

      if (!dbUser) {
        throw new Error("Unable to fetch session user data");
      }

      session.user.exams = dbUser.exams;

      return session;
    },
  },
});
