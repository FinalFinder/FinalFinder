import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "@/components/Button";
import Exam from "@/components/Exam";
import { trpc } from "@/utils/trpc";

export default function Edit() {
  const [examName, setExamName] = useState<string>("");
  const [examDate, setExamDate] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });

  const userExams = trpc.userExams.useQuery();
  const allExams = trpc.allExams.useQuery();
  const createExam = trpc.createExam.useMutation();
  const addUserExam = trpc.addUserToExam.useMutation();

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
            onClick={async () => {
              if (examDate === "" || examName === "") return;

              const index = allExams.data?.findIndex(
                (e) => e.name === examName
              );
              if (!index || index === -1) {
                createExam
                  .mutateAsync({ date: new Date(examDate), name: examName })
                  .then(() => {
                    allExams.refetch();
                    userExams.refetch();
                  });
              } else {
                addUserExam
                  .mutateAsync({
                    date: new Date(examDate),
                    exam: examName,
                  })
                  .then(() => {
                    userExams.refetch();
                  });
              }

              setExamName("");
              setExamDate("");
            }}
          >
            <p className="text-lg">Add</p>
          </Button>
        </div>
      </div>

      <div className="my-2 flex w-5/6 flex-col items-center justify-between rounded-md bg-gray-2 p-2">
        {!userExams.data || userExams.data?.length === 0 ? (
          <p className="text-center text-lg">
            Add an exam using the above form
          </p>
        ) : (
          userExams.data?.map((exam) => {
            const dateStr = exam.dates.find(
              (d) =>
                d.users.findIndex((u) => u.userId === session.user.id) !== -1
            )?.date;

            return (
              <Exam
                key={exam.name}
                name={exam.name}
                slug={exam.slug}
                date={new Date(dateStr ?? "")}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
