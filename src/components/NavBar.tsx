import Image from "next/image";

import orpheusFlag from "public/flag-orpheus-top.svg";
import hamburger from "public/hamburger.svg";

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center bg-gray-2">
      <div className="flex items-start">
        <Image
          src={orpheusFlag}
          alt="Hack Club Orpheus Flag"
          width={80}
          height={40}
          className="mr-3"
        />
        <h1 className="font-secular-one text-2xl text-center py-3">
          FinalFinder
        </h1>
      </div>
      <Image src={hamburger} alt="Hamburger Menu" className="mr-5" />
    </nav>
  );
}
