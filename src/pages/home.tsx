import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import Exam from "@/components/Exam";
import Button from "@/components/Button";
import StudySession from "@/components/Session";

import { trpc } from "@/utils/trpc";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });

  const userExams = trpc.userExams.useQuery();
  const userSessions = trpc.userSessions.useQuery();

  if (userExams.isSuccess && userExams.data?.length === 0) {
    router.push("/edit");
    return null;
  }

  let sortedExams = userExams.data?.filter(
    (exam) =>
      (exam.dates
        .find(
          (d) => d.users.findIndex((u) => u.userId === session?.user.id) !== -1
        )
        ?.date.valueOf() ?? 0) >= new Date().valueOf()
  );
  sortedExams = sortedExams?.sort(
    (a, b) =>
      (a.dates
        .find(
          (d) => d.users.findIndex((u) => u.userId === session?.user.id) !== -1
        )
        ?.date.valueOf() ?? 0) -
      (b.dates
        .find(
          (d) => d.users.findIndex((u) => u.userId === session?.user.id) !== -1
        )
        ?.date.valueOf() ?? 0)
  );

  return (
    <div className="flex flex-col items-center justify-start">
      <h1 className="text-center text-2xl font-bold">
        Welcome back, {session?.user?.name}!
      </h1>

      <div className="my-2 w-5/6 rounded-md bg-gray-2 p-2">
        <h2 className="text-center text-xl">Upcoming Exams</h2>
        {sortedExams?.map((exam) => {
          const dateStr = exam.dates.find(
            (d) =>
              d.users.findIndex((u) => u.userId === session?.user.id) !== -1
          )?.date;

          return (
            <Exam
              key={exam.name}
              name={exam.name}
              slug={exam.slug}
              date={new Date(dateStr ?? "")}
              clickable
            />
          );
        })}
      </div>

      <div className="my-2 flex w-5/6 flex-col items-center justify-start rounded-md bg-gray-2 p-2">
        <h2 className="text-center text-xl">Study Sessions</h2>

        <div className="my-2 w-full">
          {userSessions.data?.map((session) => {
            return (
              <StudySession
                key={session.id}
                name={session.examName}
                time={session.time}
              />
            );
          })}
          <Button
            onClick={() => {
              router.push("/createSession");
            }}
          >
            <p className="text-center text-lg">New Session</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
