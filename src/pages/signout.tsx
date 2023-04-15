import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignOut() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    signOut({ callbackUrl: "/", redirect: false });
  }, []);

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  } else {
    return <p className="text-center text-2xl">Signing out...</p>;
  }
}
