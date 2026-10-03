import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/landing/icon";
import {
  badges,
  desktopTrustItems,
  heroParagraphs,
  photos,
  salon,
} from "@/lib/sample-content";

export function Hero() {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card md:grid md:min-h-[440px] md:grid-cols-[52fr_48fr] lg:min-h-[500px]">
      <div className="relative h-[208px] w-full md:col-start-2 md:row-start-1 md:h-full">
        <Image
          src={photos.hero}
          alt="Inside the GlamSlot salon"
          fill
          priority
          sizes="(min-width: 1024px) 520px, (min-width: 768px) 48vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center gap-4 bg-blush p-5 md:col-start-1 md:row-start-1 md:p-8 md:text-left lg:p-12">
        <div className="flex flex-wrap gap-2">
          <Badge>{badges.mobile}</Badge>
          <Badge className="hidden md:inline-flex">{badges.tablet}</Badge>
          <Badge className="hidden lg:inline-flex">
            <Star className="size-3 fill-current" aria-hidden="true" />
            {badges.desktop}
          </Badge>
        </div>

        <h1 className="font-serif text-[34px] leading-[38px] text-foreground md:text-[40px] md:leading-[44px] lg:text-[52px] lg:leading-[58px]">
          Good hair days,{" "}
          <br />
          booked in{" "}
          <br className="hidden md:inline lg:hidden" />
          seconds.
        </h1>

        <p className="max-w-[62ch] text-base text-muted-foreground md:hidden">
          {heroParagraphs.mobile}
        </p>
        <p className="hidden max-w-[62ch] text-base text-muted-foreground md:block lg:hidden">
          {heroParagraphs.tablet}
        </p>
        <p className="hidden max-w-[62ch] text-lg text-muted-foreground lg:block">
          {heroParagraphs.desktop}
        </p>

        <Button
          asChild
          className="h-[52px] w-full rounded-xl text-base font-medium md:hidden"
        >
          <Link href="/book">Book Now — from {salon.heroFromPrice}</Link>
        </Button>

        <div className="hidden flex-wrap gap-3 md:flex">
          <Button asChild className="h-12 rounded-xl px-6 text-base font-medium lg:hidden">
            <Link href="/book">Book Now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-xl border-border bg-card px-6 text-base font-medium text-foreground md:hidden lg:inline-flex"
          >
            <Link href="/book">View services</Link>
          </Button>
          <Button asChild className="hidden h-12 rounded-xl px-6 text-base font-medium lg:inline-flex">
            <Link href="/book">Book Now — from {salon.heroFromPrice}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hidden h-12 rounded-xl border-border bg-card px-6 text-base font-medium text-foreground lg:inline-flex"
          >
            <Link href="/about">Our story</Link>
          </Button>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
          <Icon name="shield" className="size-4" />
          {salon.cancellation} • Pay deposit only
        </p>

        <ul className="hidden flex-wrap items-center gap-6 lg:flex">
          {desktopTrustItems.map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <Icon name={item.icon} className="size-4" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground ${className}`}
    >
      {children}
    </span>
  );
}