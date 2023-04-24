import { z } from "zod";

import { protectedProcedure, router } from "../trpc";
import prisma from "@/db/prisma";

import type { StudySession } from "@prisma/client";

const slackPostHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
};

async function getUserExams(userId: string) {
  return (
    await prisma.user.findUnique({
      where: {
        id: userId,
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
            sessions: true,
          },
        },
      },
    })
  )?.exams;
}

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
      const examSlug = input.name.trim().toLowerCase().replace(/\s+/g, "-");

      // Create slack channel
      const createRes = await fetch(
        "https://slack.com/api/conversations.create",
        {
          method: "POST",
          body: JSON.stringify({
            name: `exam-${examSlug}`,
          }),
          headers: slackPostHeaders,
        }
      );

      // Invite user
      const channel = await createRes.json();

      await fetch("https://slack.com/api/conversations.invite", {
        method: "POST",
        body: JSON.stringify({
          channel: channel.channel.id,
          users: ctx.session.user.slackId,
        }),
        headers: slackPostHeaders,
      });

      // Store in db
      const exam = await prisma.exam.create({
        data: {
          name: input.name,
          slug: input.name.trim().toLowerCase().replace(/\s+/g, "-"),
          slackId: channel.channel.id,
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

      const exam = await prisma.exam.findUnique({
        where: {
          name: input.exam,
        },
      });

      await fetch("https://slack.com/api/conversations.invite", {
        method: "POST",
        body: JSON.stringify({
          channel: exam!.slackId,
          users: ctx.session.user.slackId,
        }),
        headers: slackPostHeaders,
      });
    }),
  getExam: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await prisma.exam.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          dates: {
            include: {
              users: true,
            },
          },
          users: true,
          sessions: true,
        },
      });
    }),
  userExams: protectedProcedure.query(async ({ ctx }) => {
    return await getUserExams(ctx.session.user.id);
  }),
  createSession: protectedProcedure
    .input(
      z.object({
        exam: z.string(),
        time: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.studySession.create({
        data: {
          exam: {
            connect: { name: input.exam },
          },
          time: input.time,
        },
      });
    }),
  userSessions: protectedProcedure.query(async ({ ctx }) => {
    const userExams = await getUserExams(ctx.session.user.id);
    if (!userExams) return [];
    let sessions: StudySession[] = [];

    for (const exam of userExams) {
      for (const session of exam.sessions) {
        sessions.push(session);
      }
    }

    sessions = sessions.filter((session) => session.time >= new Date());

    sessions = sessions.sort((a, b) => a.time.valueOf() - b.time.valueOf());

    return sessions;
  }),
});

export type AppRouter = typeof appRouter;
