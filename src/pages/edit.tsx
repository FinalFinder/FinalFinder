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
  const [dropdownVal, setDropdownVal] = useState<string>("");
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
        <div className="my-2 w-full rounded-md bg-gray-2 p-4">
          <p className="text-xl">Existing exams</p>
          <select
            className="my-2 w-full p-2 text-lg text-black"
            value={dropdownVal}
            onChange={(e) => setDropdownVal(e.target.value)}
          >
            {allExams.data?.map((exam) => (
              <option key={exam.slug} value={exam.name}>
                {exam.name}
              </option>
            ))}
          </select>
          <div className="my-2 w-full">
            <Button
              onClick={() => {
                if (dropdownVal === "") return;
                let d = new Date();

                addUserExam
                  .mutateAsync({
                    exam: dropdownVal,
                    date: fixTimezone(d.toISOString().split("T")[0]),
                  })
                  .then(() => {
                    userExams.refetch();
                  });
              }}
            >
              <p className="text-lg">Add</p>
            </Button>
          </div>
        </div>

        <div className="my-2 w-full rounded-md bg-gray-2 p-4">
          <p className="text-xl">Add a new exam</p>
          <p className="text-lg italic">
            Make sure to check the existing exams first!
          </p>
          <div className="relative my-4 h-16 w-full border-2 border-cyan-1 md:my-2 md:border-4">
            <input
              className="peer h-full w-full pl-1 text-black outline-none"
              placeholder="ex. AP Computer Science A"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>

          <div className="my-2 w-full">
            <Button
              onClick={async () => {
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
              <p className="text-lg">Add</p>
            </Button>
          </div>
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
                refresh={userExams.refetch}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function AddedExam({
  name,
  date,
  refresh,
}: {
  name: string;
  date: string;
  refresh: () => void;
}) {
  const changeExamDate = trpc.changeExamDate.useMutation();

  return (
    <div className="my-2 flex w-full flex-col items-center justify-start rounded-md bg-blue p-2">
      <p className="w-full text-left text-xl  font-bold">{name}</p>
      <div className="relative my-4 h-16 w-full border-2 border-cyan-1 md:my-1 md:border-4">
        <input
          className="peer h-full w-full pl-1 text-black outline-none"
          placeholder="Date"
          value={date.split("T")[0] ?? ""}
          type="date"
          onChange={(e) => {
            changeExamDate
              .mutateAsync({
                exam: name,
                date: fixTimezone(e.target.value),
              })
              .then(() => {
                refresh();
              });
          }}
        />
      </div>
    </div>
  );
}
