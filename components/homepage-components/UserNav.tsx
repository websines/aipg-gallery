import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, User2Icon } from "lucide-react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AuthForm } from "../auth-components/AuthForm";
import { SignOutUser } from "@/actions/auth-actions";
import { type User as UserType } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export function UserNav({ user }: { user: UserType | null }) {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {user ? (
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0 overflow-hidden border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/50">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.user_metadata?.avatar_url || ""} alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                  <User2Icon className="w-5 h-5 text-white" />
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="px-4 py-2 rounded-md bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50 hover:border-zinc-600 text-white"
            >
              <span className="text-sm font-medium">Sign In</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        {user ? (
          <DropdownMenuContent className="w-56 bg-zinc-900 border border-zinc-800" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-zinc-400">
                  {user?.aud}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white">
                Profile
                <DropdownMenuShortcut>
                  <User className="w-4 h-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white"
              onClick={() => SignOutUser()}
            >
              Log Out
              <DropdownMenuShortcut>
                <LogOut className="w-4 h-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className="w-56 bg-zinc-900 border border-zinc-800" align="end" forceMount>
            <DialogTrigger className="w-full">
              <DropdownMenuItem className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white">
                Log In
                <DropdownMenuShortcut>
                  <LogIn className="w-4 h-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      <DialogContent className="bg-zinc-900 border border-zinc-800">
        <AuthForm />
      </DialogContent>
    </Dialog>
  );
}
