import { DefaultSession } from "next-auth";

import Exam from "@/data/Exam";

declare module "next-auth" {
  interface Session {
    user: {
      exams: Exam[];
    } & DefaultSession["user"];
  }
}
