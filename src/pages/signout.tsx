import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

let signingOut = false;

export default function SignOut() {
  const router = useRouter();

  useEffect(() => {
    if (signingOut) return;
    signingOut = true;
    signOut({ redirect: false }).then(() => {
      signingOut = false;
      router.push("/");
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <p className="text-center text-2xl">Signing out...</p>;
}
