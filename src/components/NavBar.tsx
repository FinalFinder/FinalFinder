import Image from "next/image";

import orpheusFlag from "public/flag-orpheus-top.svg";
import hamburger from "public/hamburger.svg";

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between bg-gray-2">
      <div className="flex items-start">
        <Image
          src={orpheusFlag}
          alt="Hack Club Orpheus Flag"
          width={80}
          height={40}
          className="mr-3"
        />
        <h1 className="py-3 text-center font-secular-one text-2xl">
          FinalFinder
        </h1>
      </div>
      <Image src={hamburger} alt="Hamburger Menu" className="mr-5" />
    </nav>
  );
}
