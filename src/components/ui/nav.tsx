"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Menu, X, User, LogOut, Shield, Settings } from "lucide-react";

export function Navigation() {
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setAvatarDropdownOpen(false);
  };

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "ME";
  };

  const navItems = [
    { href: "/pricing", label: "Preise" },
    { href: "/coverage", label: "Deckung" },
    { href: "/corporate", label: "Corporate" },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="logo" width={100} height={47} />
        </Link>

        {/* Middle: Nav items (desktop only) */}
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg font-medium border-b-2 border-transparent hover:border-b-2 hover:border-black transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth buttons or Avatar + Mobile menu button */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <Popover
              open={avatarDropdownOpen}
              onOpenChange={setAvatarDropdownOpen}
            >
              <PopoverTrigger asChild>
                <button className="cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {getUserInitials(session.user?.name, session.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user?.name || "Benutzer"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setAvatarDropdownOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Buchungen</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setAvatarDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                  {session.user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                      onClick={() => setAvatarDropdownOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-left w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Abmelden</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Anmelden
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-enex-primary hover:bg-enex-hover text-white"
                >
                  Registrieren
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden border-t bg-white mt-2.5">
          <nav className="flex flex-col items-start gap-3 mt-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-lg font-medium text-gray-800 hover:text-black transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!session && (
              <>
                <Link
                  href="/login"
                  className="block text-lg font-medium text-gray-800 hover:text-black transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Anmelden
                </Link>
                <Link
                  href="/register"
                  className="block text-lg font-medium text-gray-800 hover:text-black transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Registrieren
                </Link>
              </>
            )}
            {session && (
              <>
                <Link
                  href="/account"
                  className="block text-lg font-medium text-gray-800 hover:text-black transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Buchungen
                </Link>
                <Link
                  href="/profile"
                  className="block text-lg font-medium text-gray-800 hover:text-black transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Profil
                </Link>
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="block text-lg font-medium text-gray-800 hover:text-black transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
