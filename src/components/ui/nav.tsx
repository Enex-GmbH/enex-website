"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function Navigation() {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("HOME.header.nav");

  const navItems = [
    { href: "/pricing", label: t("pricing") },
    { href: "/coverage", label: t("coverage") },
    { href: "/corporate", label: t("corporate") },
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

        {/* Right: Avatar + Mobile menu button */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://avatars.githubusercontent.com/u/1?v=4" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>

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
          </nav>
        </div>
      )}
    </>
  );
}
