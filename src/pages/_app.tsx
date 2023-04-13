import { Secular_One } from "next/font/google";

import "@/styles/globals.css";
import NavBar from "@/components/NavBar";

import type { AppProps } from "next/app";

const secularOne = Secular_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-secular-one",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${secularOne.className} min-h-screen bg-gray-1 text-white`}
    >
      <NavBar />
      <Component {...pageProps} />
    </div>
  );
}
