"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

import { UserNav } from "../homepage-components/UserNav";
import { User } from "@supabase/supabase-js";

const Navbar = ({ user }: { user: User | null }) => {
  return (
    <div className="z-50">
      <header className="top-0 p-4 flex flex-row justify-between items-center z-50">
        <Link
          href="/"
          className="text-black dark:text-white font-medium flex flex-row gap-2 text-sm z-50"
        >
          <img
            src="/aipg_logo_small.png"
            alt="aipowergrid"
            className="w-6 h-6"
          />
          AI PowerGrid
        </Link>
        <NavigationMenu className="md:block hidden">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/generate" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Generate
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/history" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  History
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/likes" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Likes
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <UserNav user={user} />
      </header>
    </div>
  );
};

export default Navbar;
