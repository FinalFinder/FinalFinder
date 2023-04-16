import { useEffect } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

let signingIn = false;

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    if (signingIn) return;
    signingIn = true;
    signIn("slack", { callbackUrl: "/" }).then(() => {
      signingIn = false;
      router.push("/");
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p className="text-center text-2xl">Signing in...</p>;
}
