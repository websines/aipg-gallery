"use client";

import { Aperture, BookHeart, Home, Image } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FooterNav = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden flex fixed bottom-0 p-2 z-10  w-full bg-zinc-950/30 backdrop-blur-lg">
      <div className="flex flex-row justify-around items-center bg-transparent w-full">
        <Link
          href="/"
          className={`hover:bg-zinc-800 ${
            pathname === "/" ? "bg-zinc-800" : ""
          } p-2 rounded-md`}
        >
          <Home className="w-4 h-4" />
        </Link>
        <Link
          href="/generate"
          className={`hover:bg-zinc-800 ${
            pathname === "/generate" ? "bg-zinc-800" : ""
          } p-2 rounded-md`}
        >
          <Image className="w-4 h-4" />
        </Link>
        <Link
          href="/history"
          className={`hover:bg-zinc-800 ${
            pathname === "/history" ? "bg-zinc-800" : ""
          } p-2 rounded-md`}
        >
          <Aperture className="w-4 h-4" />
        </Link>
        <Link
          href="/likes"
          className={`hover:bg-zinc-800 ${
            pathname === "/likes" ? "bg-zinc-800" : ""
          } p-2 rounded-md `}
        >
          <BookHeart className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default FooterNav;
