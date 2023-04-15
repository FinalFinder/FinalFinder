import { useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    signIn("slack", { callbackUrl: "/", redirect: false });
  }, []);

  if (status === "authenticated") {
    router.push("/");
    return null;
  } else {
    return <p className="text-center text-2xl">Signing in...</p>;
  }
}
