import { DefaultSession } from "next-auth";

import type { Exam, ExamDate, User } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
