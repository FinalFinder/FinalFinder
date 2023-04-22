import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "@/components/Button";
import { trpc } from "@/utils/trpc";

import type Exam from "@/data/Exam";

export default function Edit() {
  const [examName, setExamName] = useState<string>("");
  const [examDate, setExamDate] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });
  const allExams = trpc.allExams.useQuery();

  const filteredExams = allExams.data?.filter((exam) =>
    exam.name.toUpperCase().startsWith(examName.toUpperCase())
  );

  if (status !== "authenticated")
    return <p className="text-center text-2xl">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-start">
      <h1 className="text-center text-2xl font-bold">
        Welcome, {session.user?.name}!
      </h1>
      <div className="flex w-5/6 flex-col items-center justify-start md:justify-evenly">
        <p className="w-5/6 text-center text-lg md:text-2xl">
          Tell us what exams you&apos;ll be taking this year
        </p>
        <div className="relative my-4 h-16 w-5/6 border-2 border-cyan-1 md:my-1 md:w-3/4 md:border-4">
          <input
            className="peer h-full w-full pl-1 text-black outline-none"
            placeholder="ex. AP Computer Science A"
            value={examName}
            list=""
            onChange={(e) => setExamName(e.target.value)}
            onBlur={() => {
              // hacky way to be able to get the click event
              setTimeout(() => {
                setShowSuggestions(false);
              }, 100);
            }}
            onFocus={() => {
              setShowSuggestions(true);
            }}
          />
          <datalist
            id="exams-list"
            role="listbox"
            style={{
              display: showSuggestions ? "block" : "none",
            }}
            className="absolute top-full z-10 max-h-40 w-2/5 overflow-y-auto rounded-b border-2 border-t-0 border-cyan-2 bg-cyan-1 p-1"
          >
            {filteredExams?.map((exam) => (
              <option
                key={exam.name}
                value={exam.name}
                className="block rounded-md p-2 text-lg text-white hover:bg-cyan-2"
                onClick={() => {
                  setExamName(exam.name);
                  setExamDate(exam.date.split("T")[0]);
                }}
              >
                {exam.name}
              </option>
            ))}
          </datalist>
        </div>

        <div className="relative my-4 h-16 w-5/6 border-2 border-cyan-1 md:my-1 md:w-3/4 md:border-4">
          <input
            className="peer h-full w-full pl-1 text-black outline-none"
            placeholder="Date"
            value={examDate}
            type="date"
            onChange={(e) => setExamDate(e.target.value.split("T")[0])}
          />
        </div>

        <div className="my-2 w-5/6 md:w-3/4">
          <Button
            onClick={() => {
              setExams([
                ...exams,
                {
                  name: examName,
                  date: new Date(examDate),
                },
              ]);
              setExamName("");
              setExamDate("");
            }}
          >
            <p className="text-lg">Add</p>
          </Button>
        </div>
      </div>

      <div className="my-2 flex w-5/6 flex-col items-center justify-between rounded-md bg-gray-2 p-2">
        {exams.length === 0 ? (
          <p className="text-center text-lg">
            Add an exam using the above form
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
