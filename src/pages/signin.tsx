import { useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";

let signingIn = false;

export default function SignIn() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (signingIn || status === "loading") return;
    if (status === "authenticated") {
      router.push("/home");
      return;
    }
    signingIn = true;
    signIn("slack", { callbackUrl: "/home" }).then(() => {
      signingIn = false;
    });
  }, [status, router]);

  return <p className="text-center text-2xl">Signing in...</p>;
}
