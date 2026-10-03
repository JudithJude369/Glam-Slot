import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/landing/icon";
import { salon } from "@/lib/sample-content";

export function VisitCard() {
  return (
    <article
      id="visit"
      className="flex scroll-mt-24 flex-col gap-4 rounded-[20px] border border-border bg-card p-4 lg:hidden"
    >
      <h3 className="font-serif text-lg text-card-foreground">Visit us</h3>

      <div className="flex flex-col gap-2 text-sm text-foreground md:hidden">
        <p className="flex items-start gap-2">
          <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {salon.address}
        </p>
        <p className="flex items-start gap-2">
          <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {salon.hours}
        </p>
      </div>

      <p className="hidden items-start gap-2 text-sm text-foreground md:flex">
        <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        {salon.visitLine}
      </p>

      <div className="mt-auto flex gap-3 md:hidden">
        <Button
          asChild
          className="h-12 flex-1 rounded-xl bg-accent text-base font-medium text-accent-foreground hover:bg-accent/85"
        >
          <a href={salon.whatsappHref}>WhatsApp</a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-12 flex-1 rounded-xl border-border bg-card text-base font-medium text-foreground"
        >
          <a href={salon.phoneHref}>Call salon</a>
        </Button>
      </div>

      <Button
        asChild
        className="hidden h-12 w-full rounded-xl bg-plum text-base font-medium text-white hover:bg-plum/85 md:inline-flex"
      >
        <Link href="/book">Book Now</Link>
      </Button>
    </article>
  );
}