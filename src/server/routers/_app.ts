import { protectedProcedure, router } from "../trpc";
import prisma from "@/db/prisma";

export const appRouter = router({
  allExams: protectedProcedure.query(async () => {
    return await prisma.exam.findMany();
  }),
});

export type AppRouter = typeof appRouter;
