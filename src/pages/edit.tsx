import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "@/components/Button";
import Exam from "@/components/Exam";
import ErrorComponent from "@/components/Error";
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

  if (userExams.error)
    return (
      <ErrorComponent
        error="fetching your exams"
        message={userExams.error.message}
      />
    );

  if (allExams.error)
    return (
      <ErrorComponent
        error="fetching all exams"
        message={allExams.error.message}
      />
    );

  if (createExam.error) {
    return (
      <ErrorComponent
        error="creating the exam"
        message={createExam.error.message}
      />
    );
  }

  if (addUserExam.error) {
    return (
      <ErrorComponent
        error="adding you to the exam"
        message={addUserExam.error.message}
      />
    );
  }

  const filteredExams = allExams.data?.filter((exam) =>
    exam.name.toUpperCase().startsWith(examName.toUpperCase())
  );

  if (status !== "authenticated")
    return <p className="text-center text-2xl">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-start">
      {createExam.isLoading && (
        <p className="m-2 w-5/6 rounded-md bg-yellow p-2 text-2xl md:w-3/4">
          Creating exam...
        </p>
      )}
      {addUserExam.isLoading && (
        <p className="m-2 w-5/6 rounded-md bg-yellow p-2 text-2xl md:w-3/4">
          Adding you to the exam...
        </p>
      )}
      <h1 className="text-center text-2xl font-bold">
        Welcome, {session.user?.name}!
      </h1>
      <div className="flex w-5/6 flex-col items-center justify-start md:w-3/4 md:justify-evenly">
        <p className="w-full text-center text-lg md:text-2xl">
          Tell us what exams you&apos;ll be taking this year
        </p>
        <div className="relative my-4 h-16 w-full border-2 border-cyan-1 md:my-1 md:border-4">
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
            className="absolute top-full z-10 max-h-40 w-full overflow-y-auto rounded-b border-2 border-t-0 border-cyan-2 bg-cyan-1 p-1 md:w-2/5"
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

        <div className="relative my-4 h-16 w-full border-2 border-cyan-1 md:my-1 md:border-4">
          <input
            className="peer h-full w-full pl-1 text-black outline-none"
            placeholder="Date"
            value={examDate}
            type="date"
            onChange={(e) => setExamDate(e.target.value.split("T")[0])}
          />
        </div>

        <div className="my-2 w-full">
          <Button
            onClick={async () => {
              if (examDate === "" || examName === "") return;

              const tzo = new Date().getTimezoneOffset();
              const tz = Math.abs(tzo);
              const date = new Date(
                examDate +
                  "T00:00:00" +
                  (tzo < 0 ? "+" : "-") +
                  (Number((tz / 60).toFixed(0)) < 10
                    ? `0${Number((tz / 60).toFixed(0)).toFixed(0)}`
                    : Number((tz / 60).toFixed(0)).toFixed(0)) +
                  (tz % 60 < 10
                    ? `0${(tz % 60).toFixed(0)}`
                    : (tz % 60).toFixed(0))
              );

              const index = allExams.data?.findIndex(
                (e) => e.name === examName
              );
              if (!index || index === -1) {
                createExam.mutateAsync({ date, name: examName }).then(() => {
                  allExams.refetch();
                  userExams.refetch();
                });
              } else {
                addUserExam
                  .mutateAsync({
                    date,
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

      <div className="my-2 flex w-5/6 flex-col items-center justify-between rounded-md bg-gray-2 p-2 md:w-3/4">
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
