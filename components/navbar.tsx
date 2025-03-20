"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Trophy,
  User,
  LogOut,
  Plus,
  Bookmark,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/redux/store";
import { checkAuth, logout } from "@/lib/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const isActive = (path: string) => {
    return pathname === path;
  };

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Update the handleLogout function
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logout()).unwrap();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ContestHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/contests"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/contests") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Contests
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/bookmarks"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/bookmarks")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Bookmarks
                </Link>
                <Link
                  href="/solutions"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/solutions")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Solutions
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated && user ? (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden md:flex"
              >
                <Link href="/contests/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contest
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/contests/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contest
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/bookmarks">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Bookmarks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/solutions">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Solutions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
