import { Secular_One, Outfit } from "next/font/google";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

import "@/styles/globals.css";
import NavBar from "@/components/NavBar";

import type { AppProps } from "next/app";

const secularOne = Secular_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-secular-one",
});
const outfit = Outfit({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>FinalFinder</title>
        <meta
          name="description"
          content="A web app and Slack integration to help Hack Clubbers study for finals"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${secularOne.variable} ${outfit.variable} min-h-screen bg-gray-1 text-white`}
      >
        <NavBar />
        <main className="font-outfit">
          <Component {...pageProps} />
        </main>
      </div>
    </SessionProvider>
  );
}
