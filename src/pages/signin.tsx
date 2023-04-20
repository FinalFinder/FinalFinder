import { useEffect } from "react";
import { signIn } from "next-auth/react";

let signingIn = false;

export default function SignIn() {
  useEffect(() => {
    if (signingIn) return;
    signingIn = true;
    signIn("slack", { callbackUrl: "/home" }).then(() => {
      signingIn = false;
    });
  }, []);

  return <p className="text-center text-2xl">Signing in...</p>;
}
