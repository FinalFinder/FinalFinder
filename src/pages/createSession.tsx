import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { trpc } from "@/utils/trpc";
import Button from "@/components/Button";
import ErrorComponent from "@/components/Error";

export default function CreateSession() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });
  const [sessionDate, setSessionDate] = useState("");
  const [invalid, setInvalid] = useState(false);
  const router = useRouter();

  const userExams = trpc.userExams.useQuery();
  const createSession = trpc.createSession.useMutation();
  const [examName, setExamName] = useState(userExams.data?.[0].name ?? "");

  if (status !== "authenticated")
    return (
      <div className="flex w-full flex-col items-center justify-start">
        <p className="m-2 w-5/6 rounded-md bg-yellow p-2 text-center text-2xl md:w-3/4">
          Loading...
        </p>
      </div>
    );

  if (userExams.error)
    return (
      <ErrorComponent
        error="fetching your exams"
        message={userExams.error.message}
      />
    );

  if (createSession.error)
    return (
      <ErrorComponent
        error="creating the study session"
        message={createSession.error.message}
      />
    );

  return (
    <div className="flex flex-col items-center justify-start">
      <h1 className="text-center text-2xl font-bold">Create Study Session</h1>
      {createSession.isLoading && (
        <p className="m-2 w-5/6 rounded-md bg-yellow p-2 text-2xl md:w-3/4">
          Creating study session...
        </p>
      )}
      {invalid && (
        <p className="m-2 w-5/6 rounded-md bg-red-600 p-2 text-2xl md:w-3/4">
          Invalid exam or date + time
        </p>
      )}
      <div className="flex w-5/6 flex-col items-center justify-start md:w-3/4 md:justify-evenly">
        <div className="relative my-4 h-16 w-full border-2 border-cyan-1 md:my-1 md:border-4">
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

        <div className="relative my-4 flex h-16 w-full flex-col items-start justify-start border-2 border-cyan-1 md:my-1 md:border-4">
          <input
            className="peer h-full w-full pl-1 text-black outline-none"
            placeholder="Date"
            value={sessionDate}
            type="datetime-local"
            onChange={(e) => setSessionDate(e.target.value)}
          />
        </div>

        {new Date(sessionDate).valueOf() - new Date().valueOf() <= 60 * 1000 ? (
          <p className="self-start text-lg text-red-500">
            Study sessions should be scheduled at least 1 minute in advance
          </p>
        ) : null}

        <div className="my-2 w-full">
          <Button
            onClick={async () => {
              if (sessionDate === "" || examName === "") {
                setInvalid(true);
                return;
              }
              setInvalid(false);

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
