import { useState } from "react";
import { useRouter } from "next/router";

import { trpc } from "@/utils/trpc";
import Button from "@/components/Button";

export default function CreateSession() {
  const [examName, setExamName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const router = useRouter();

  const userExams = trpc.userExams.useQuery();
  const createSession = trpc.createSession.useMutation();

  return (
    <div className="flex flex-col items-center justify-start">
      <h1 className="text-center text-2xl font-bold">Create Study Session</h1>
      <div className="flex w-5/6 flex-col items-center justify-start md:justify-evenly">
        <div className="relative my-4 h-16 w-5/6 border-2 border-cyan-1 md:my-1 md:w-3/4 md:border-4">
          <select
            className="peer h-full w-full pl-1 text-black outline-none"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          >
            {userExams.data?.map((exam) => (
              <option
                key={exam.name}
                value={exam.name}
                className="block rounded-md p-2 text-lg text-white hover:bg-cyan-2"
              >
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative my-4 h-16 w-5/6 border-2 border-cyan-1 md:my-1 md:w-3/4 md:border-4">
          <input
            className="peer h-full w-full pl-1 text-black outline-none"
            placeholder="Date"
            value={sessionDate}
            type="datetime-local"
            onChange={(e) => setSessionDate(e.target.value)}
          />
        </div>

        <div className="my-2 w-5/6 md:w-3/4">
          <Button
            onClick={async () => {
              if (sessionDate === "" || examName === "") return;

              createSession
                .mutateAsync({
                  exam: examName,
                  time: new Date(sessionDate),
                })
                .then(() => {
                  router.push("/home");
                });

              setExamName("");
              setSessionDate("");
            }}
          >
            <p className="text-lg">Add</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
