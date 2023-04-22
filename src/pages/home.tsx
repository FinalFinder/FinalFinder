import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

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

  if (userExams.isSuccess && userExams.data?.length === 0) {
    router.push("/edit");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-start">
      <h1 className="text-center text-2xl font-bold">
        Welcome back, {session?.user?.name}!
      </h1>

      <div className="my-2 w-5/6 rounded-md bg-gray-2 p-2">
        <h2 className="text-center text-xl">Upcoming Exams</h2>
      </div>

      <div className="my-2 w-5/6 rounded-md bg-gray-2 p-2">
        <h2 className="text-center text-xl">Study Sessions</h2>
      </div>
    </div>
  );
}
