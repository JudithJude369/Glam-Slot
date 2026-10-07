"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { cn } from "cn";
import { Ticket, Users, Settings, Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const desktopNavItems = [
  { href: "/dashboard", label: "Calendar", icon: CalendarIcon },
  { href: "/dashboard/bookings", label: "Bookings", icon: Ticket },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const mobileNavItems = [
  { href: "/dashboard", label: "Calendar", icon: CalendarIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function DesktopSidebar({ deposits }: { deposits?: { count: number; pending: number; totalKobo: number } }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col bg-plum pt-5 pb-5 pl-5 pr-4 lg:flex">
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo.jpg"
          alt=""
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
        <div>
          <p className="font-serif text-[18px] text-background">GlamSlot</p>
          <p className="text-[13px] text-background/70">Owner studio</p>
        </div>
      </div>

      <nav className="mt-12 flex flex-col gap-1">
        {desktopNavItems.map((item) => {
          const active = isActive(item.href, pathname);
          const disabled = item.href === "/dashboard/bookings" || item.href === "/dashboard/clients";
          return (
            <Link
              key={item.href}
              href={disabled ? "#" : item.href}
              aria-disabled={disabled}
              className={cn(
                "flex items-center gap-3 rounded-[16px] px-3 py-2 text-[16px] transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-background/80 hover:bg-background/10",
                disabled && "opacity-50 pointer-events-none",
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {deposits && (
        <div className="mt-auto rounded-[20px] bg-plum/80 p-4">
          <p className="text-[15px] font-medium text-background">Today&apos;s deposits</p>
          <p className="mt-1 font-serif text-[26px] text-background">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
            }).format(deposits.totalKobo / 100)}
          </p>
          <p className="mt-1 text-[13px] text-background/70">
            {deposits.count} bookings • {deposits.pending} pending
          </p>
        </div>
      )}

      <form action={signOut} className="mt-3">
        <Button
          type="submit"
          variant="outline"
          className="w-full rounded-[16px] border-background/30 bg-transparent text-[16px] text-background hover:bg-background/10 hover:text-background"
        >
          Sign out
        </Button>
      </form>
    </aside>
  );
}

function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex bg-plum pb-[env(safe-area-inset-bottom)] lg:hidden">
      {mobileNavItems.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[13px]",
              active ? "text-background" : "text-background/70",
            )}
          >
            <item.icon className="size-6" />
            {item.label}
          </Link>
        );
      })}
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[13px]",
              pathname.startsWith("/dashboard/bookings") || pathname.startsWith("/dashboard/clients")
                ? "text-background"
                : "text-background/70",
            )}
          >
            <MoreHorizontal className="size-6" />
            More
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-plum text-background">
          <SheetHeader>
            <SheetTitle className="text-background">More</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-3 rounded-[16px] px-3 py-2 text-[16px] text-background/80 opacity-50 pointer-events-none"
              aria-disabled
            >
              <Ticket className="size-5 shrink-0" />
              Bookings
            </Link>
            <Link
              href="/dashboard/clients"
              className="flex items-center gap-3 rounded-[16px] px-3 py-2 text-[16px] text-background/80 opacity-50 pointer-events-none"
              aria-disabled
            >
              <Users className="size-5 shrink-0" />
              Clients
            </Link>
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                className="w-full rounded-[16px] border-background/30 bg-transparent text-[16px] text-background hover:bg-background/10 hover:text-background"
              >
                Sign out
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

export function OwnerShell({
  children,
  deposits,
}: {
  children: React.ReactNode;
  deposits?: { count: number; pending: number; totalKobo: number };
}) {
  return (
    <>
      <DesktopSidebar deposits={deposits} />
      <MobileTabBar />
      <main className="min-h-dvh bg-background pb-20 lg:ml-[240px] lg:pb-0">{children}</main>
    </>
  );
}
