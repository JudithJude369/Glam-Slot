"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[16px] border border-border bg-card p-6 text-center">
        <h1 className="font-serif text-[24px] text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          The calendar could not be loaded. Your bookings are safe.
        </p>
        <Button onClick={reset} className="mt-5">
          Try again
        </Button>
      </div>
    </div>
  );
}
