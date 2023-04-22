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
  }

  return null;
}
