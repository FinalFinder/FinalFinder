import { z } from "zod";

import { protectedProcedure, router } from "../trpc";
import prisma from "@/db/prisma";

export const appRouter = router({
  allExams: protectedProcedure.query(async () => {
    return await prisma.exam.findMany();
  }),
  createExam: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        date: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const exam = await prisma.exam.create({
        data: {
          name: input.name,
          users: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      const date = await prisma.examDate.create({
        data: {
          date: input.date,
          exam: {
            connect: { name: exam.name },
          },
        },
      });

      await prisma.examDate.update({
        where: { id: date.id },
        data: {
          users: {
            create: {
              user: { connect: { id: ctx.session.user.id } },
              examDateId: date.id,
            },
          },
        },
      });
    }),
  addUserToExam: protectedProcedure
    .input(
      z.object({
        exam: z.string(),
        date: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let date = await prisma.examDate.findFirst({
        where: {
          examName: input.exam,
          date: input.date,
        },
      });

      if (date) {
        await prisma.examDate.update({
          where: { id: date.id },
          data: {
            users: {
              create: {
                user: { connect: { id: ctx.session.user.id } },
                examDateId: date.id,
              },
            },
          },
        });
        await prisma.exam.update({
          where: { name: input.exam },
          data: {
            users: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      } else {
        date = await prisma.examDate.create({
          data: {
            date: input.date,
            exam: {
              connect: { name: input.exam },
            },
          },
        });

        await prisma.exam.update({
          where: {
            name: input.exam,
          },
          data: {
            users: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      }
    }),
  userExams: protectedProcedure.query(async ({ ctx }) => {
    return (
      await prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          exams: {
            include: {
              dates: {
                include: {
                  users: true,
                },
              },
              users: true,
            },
          },
        },
      })
    )?.exams;
  }),
});

export type AppRouter = typeof appRouter;
