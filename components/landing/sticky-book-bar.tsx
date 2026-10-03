import Link from "next/link";

export function StickyBookBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-5 pb-5 md:hidden">
      <Link
        href="/book"
        data-testid="sticky-book-bar"
        className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Book Now
      </Link>
    </div>
  );
}