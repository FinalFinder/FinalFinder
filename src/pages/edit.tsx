import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "@/components/Button";
import ErrorComponent from "@/components/Error";
import { trpc } from "@/utils/trpc";

const fixTimezone = (oldDate: string) => {
  const tzo = new Date().getTimezoneOffset();
  const tz = Math.abs(tzo);
  const date = new Date(
    oldDate +
      "T00:00:00" +
      (tzo < 0 ? "+" : "-") +
      (Number((tz / 60).toFixed(0)) < 10
        ? `0${Number((tz / 60).toFixed(0)).toFixed(0)}`
        : Number((tz / 60).toFixed(0)).toFixed(0)) +
      (tz % 60 < 10 ? `0${(tz % 60).toFixed(0)}` : (tz % 60).toFixed(0))
  );
  return date;
};

export default function Edit() {
  const [examName, setExamName] = useState<string>("");
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
    exam.name.toLowerCase().includes(examName.toLowerCase())
  );

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

        <div className="relative my-4 h-16 w-full border-2 border-cyan-1 md:my-2 md:border-4">
          <input
            className="peer h-full w-full pl-1 text-black outline-none"
            placeholder="Search exams..."
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
            className="absolute top-full z-10 max-h-44 w-full overflow-y-auto rounded-b border-2 border-t-0 border-cyan-2 bg-cyan-1 p-1 md:w-2/5"
          >
            {filteredExams?.slice(0, 3).map((exam) => (
              <option
                key={exam.name}
                value={exam.name}
                className="block rounded-md p-2 text-lg text-white hover:bg-cyan-2"
                onClick={() => {
                  let d = new Date();

                  addUserExam
                    .mutateAsync({
                      exam: exam.name,
                      date: fixTimezone(d.toISOString().split("T")[0]),
                    })
                    .then(() => {
                      userExams.refetch();
                    });

                  setExamName("");
                }}
              >
                {exam.name}
              </option>
            ))}
            {examName !== "" && (
              <option
                value="CREATE"
                className="block rounded-md p-2 text-lg text-white hover:bg-cyan-2"
                onClick={() => {
                  if (examName === "") return;
                  let d = new Date();

                  createExam
                    .mutateAsync({
                      name: examName,
                      date: fixTimezone(d.toISOString().split("T")[0]),
                    })
                    .then(() => {
                      userExams.refetch();
                    });

                  setExamName("");
                }}
              >
                Create exam &quot;{examName}&quot;
              </option>
            )}
          </datalist>
        </div>
      </div>

      <div className="my-2 flex w-5/6 flex-col items-center justify-between rounded-md bg-gray-2 p-4 md:w-3/4">
        {!userExams.data || userExams.data?.length === 0 ? (
          <p className="text-center text-lg">
            Add an exam using the above form
          </p>
        ) : (
          userExams.data?.map((exam) => {
            const date = exam.dates.find(
              (d) =>
                d.users.findIndex((u) => u.userId === session.user.id) !== -1
            )?.date;

            return (
              <AddedExam
                key={exam.name}
                name={exam.name}
                date={date?.toISOString() ?? ""}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function AddedExam({ name, date }: { name: string; date: string }) {
  const [unsaved, setUnsaved] = useState(false);
  const [newDate, setNewDate] = useState(date.split("T")[0] ?? "");
  const changeExamDate = trpc.changeExamDate.useMutation();

  return (
    <div className="my-2 flex w-full flex-col items-center justify-start rounded-md bg-blue p-2">
      <p className="w-full text-left text-xl font-bold">
        {name}
        <span className="text-xl font-bold text-red-500">
          {unsaved ? "*" : ""}
        </span>
      </p>
      <div className="relative my-4 flex h-16 w-full flex-row items-center justify-start border-2 border-cyan-1 md:my-1 md:border-4">
        <input
          className="peer h-full flex-grow pl-1 text-black outline-none"
          placeholder="Date"
          value={newDate}
          type="date"
          onChange={(e) => {
            setNewDate(e.target.value);
            setUnsaved(true);
          }}
        />
        <p
          className="flex h-full w-32 cursor-pointer flex-col items-center justify-center bg-cyan-1 text-2xl"
          onClick={() => {
            changeExamDate.mutateAsync({
              exam: name,
              date: fixTimezone(newDate),
            });
            setUnsaved(false);
          }}
        >
          Save
        </p>
      </div>
    </div>
  );
}
