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

export function UserNav({ user }: { user: UserType | null }) {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {user ? (
            <Button variant="ghost" className="h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 p-1">
                <User2Icon className="w-6 h-6 z-50" />
              </Avatar>
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="px-4 py-2 rounded-sm focus:outline-none flex flex-row gap-1 items-center outline-none"
            >
              <span className="text-sm font-medium">Get started</span>{" "}
            </Button>
          )}
        </DropdownMenuTrigger>
        {user ? (
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.aud}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                Profile
                <DropdownMenuShortcut>
                  <User className="w-4 h-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => SignOutUser()}
            >
              Log Out
              <DropdownMenuShortcut>
                <LogOut className="w-4 h-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DialogTrigger className="w-full">
              <DropdownMenuItem className="cursor-pointer">
                Log In
                <DropdownMenuShortcut>
                  <LogIn className="w-4 h-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      <DialogContent>
        <AuthForm />
      </DialogContent>
    </Dialog>
  );
}
