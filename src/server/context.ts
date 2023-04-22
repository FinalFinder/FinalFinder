import { getServerSession } from "next-auth/next";

import { authOpts } from "@/pages/api/auth/[...nextauth]";

import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { inferAsyncReturnType } from "@trpc/server";

export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(opts.req, opts.res, authOpts);

  return {
    session,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
