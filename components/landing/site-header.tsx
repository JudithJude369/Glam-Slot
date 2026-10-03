"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/landing/icon";
import {
  desktopNavItems,
  mobileNavItems,
  photos,
  salon,
} from "@/lib/sample-content";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-[68px] w-full max-w-[1120px] items-center justify-between px-5 md:px-6 lg:h-[88px]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={photos.logo}
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full object-cover lg:size-12"
            priority
          />
          <span className="flex flex-col">
            <span className="font-serif text-lg leading-tight text-foreground lg:text-xl">
              {salon.name}
            </span>
            <span className="hidden text-xs text-muted-foreground lg:block">
              {salon.tagline}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            asChild
            className="h-9 rounded-xl px-3 text-sm font-medium"
          >
            <Link href="/book">Book Now</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
            className="size-11 rounded-xl border-border"
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <nav
          aria-label="Main"
          className="hidden items-center gap-6 lg:flex"
        >
          {desktopNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "border-b-2 border-primary pb-0.5 text-sm font-medium text-primary"
                    : "text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                }
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="#visit"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Icon name="pin" className="size-4" />
            Find us
          </Link>
          <Button asChild className="h-11 rounded-xl px-5 text-base font-medium">
            <Link href="/book">Book Now</Link>
          </Button>
        </nav>
      </div>

      {menuOpen ? (
        <nav
          id="landing-mobile-nav"
          aria-label="Mobile"
          className="border-t border-border bg-card px-5 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {mobileNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-2 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}