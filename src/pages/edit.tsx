import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "@/components/Button";

import type Exam from "@/data/Exam";

export default function Edit() {
  const [examName, setExamName] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });

  if (status !== "authenticated")
    return <p className="text-center text-2xl">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-start">
      <h1 className="text-center text-2xl font-bold">
        Welcome, {session.user?.name}!
      </h1>
      <p className="max-w-xs text-center text-lg">
        Tell us what exams you&apos;ll be taking this year
      </p>
      <div className="my-4 grid w-5/6 grid-cols-5 border-2 border-cyan-1">
        <input
          className="col-span-4 pl-1 text-black"
          placeholder="ex. AP Computer Science A"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
        />
        <button
          className="colspan-1 bg-cyan-1 text-center text-2xl"
          onClick={() => {
            setExams([
              ...exams,
              {
                name: examName,
                // TODO: input date
                date: new Date(),
              },
            ]);
            setExamName("");
          }}
        >
          +
        </button>
      </div>
      <div className="my-2 flex w-5/6 flex-col items-center justify-between rounded-md bg-gray-2 p-2">
        {exams.length === 0 ? (
          <p className="text-center text-lg">
            Add an exam using the above input
          </p>
        ) : (
          exams.map((exam) => (
            <div className="my-2 w-full rounded-md bg-blue p-2" key={exam.name}>
              <p className="font-bold">{exam.name}</p>
              <p className="text-lg">{exam.date.toDateString()}</p>
            </div>
          ))
        )}
      </div>
      <div className="my-2 w-5/6">
        <Button
          onClick={() => {
            // TODO: save exams to db
          }}
        >
          <p className="text-lg">Save</p>
        </Button>
      </div>
    </div>
  );
}
