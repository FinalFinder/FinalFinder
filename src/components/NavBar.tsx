import Image from "next/image";
import Link from "next/link";
import {
  a,
  useSpring,
  useSpringRef,
  useChain,
  useTransition,
} from "@react-spring/web";
import { useState } from "react";
import { useSession } from "next-auth/react";

import orpheusFlag from "public/flag-orpheus-top.svg";
import hamburger from "public/hamburger.svg";

const ALink = a(Link);

const authLinks = [
  {
    href: "/home",
    text: "Home",
  },
  {
    href: "/edit",
    text: "Edit Exams",
  },
  {
    href: "/signout",
    text: "Sign Out",
  },
];

const unauthLinks = [
  {
    href: "/signin",
    text: "Sign In",
  },
];

export default function NavBar() {
  const { status } = useSession();

  const links = status === "authenticated" ? authLinks : unauthLinks;

  const [menuOpen, setMenuOpen] = useState(false);
  const hRef = useSpringRef();
  const hSpring = useSpring({
    ref: hRef,
    from: {
      opacity: menuOpen ? 1 : 0,
      right: menuOpen ? "0%" : "100%",
    },
    to: {
      opacity: menuOpen ? 0 : 1,
      right: menuOpen ? "100%" : "0%",
    },
  });

  const lRef = useSpringRef();
  const lTransition = useTransition(menuOpen ? links : [], {
    ref: lRef,
    from: {
      opacity: menuOpen ? 0 : 1,
      left: menuOpen ? "100%" : "0%",
    },
    enter: {
      opacity: 1,
      left: "0%",
    },
    leave: {
      opacity: 0,
      left: "100%",
    },
  });
  useChain(menuOpen ? [hRef, lRef] : [lRef, hRef], [0, 1], 100);

  return (
    <nav className="relative flex items-center justify-between bg-gray-2">
      <div className="relative flex items-start self-start">
        <Image
          src={orpheusFlag}
          alt="Hack Club Orpheus Flag"
          width={80}
          height={40}
          className="mr-3"
        />
        <a.h1
          style={{ opacity: hSpring.opacity, right: hSpring.right }}
          className="relative py-3 text-center font-secular-one text-2xl lg:text-3xl"
        >
          FinalFinder
        </a.h1>
      </div>
      <div className="absolute left-24 items-center justify-between overflow-hidden md:hidden">
        {lTransition((style, item) => (
          <ALink
            href={item.href}
            className="relative mx-2"
            style={style}
            key={item.text}
          >
            {item.text}
          </ALink>
        ))}
      </div>
      <div className="hidden items-center justify-evenly md:flex">
        {links.map((link) => (
          <Link href={link.href} className="mx-2 text-xl" key={link.text}>
            {link.text}
          </Link>
        ))}
      </div>
      <Image
        src={hamburger}
        alt="Hamburger Menu"
        className="mr-5 cursor-pointer md:hidden"
        onClick={() => {
          setMenuOpen((m) => !m);
        }}
      />
    </nav>
  );
}
