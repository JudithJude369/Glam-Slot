import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/landing/icon";
import type { PublicSalonDetails } from "@/lib/public-salon";

const aboutHero = {
  eyebrow: "Our story",
  heading: "A little salon with a big heart.",
  paragraphs: {
    mobile:
      "GlamSlot is a boutique studio for nails, hair, skin and brows. Our three specialists, Amara, Sofia and Lena, bring years of focused craft to every appointment, with time set aside for each client so nothing feels rushed. Reserve your slot online and arrive to a calm, unhurried visit.",
    tablet:
      "GlamSlot is a boutique studio for nails, hair, skin and brows. Our three specialists, Amara, Sofia and Lena, bring years of focused craft to every appointment, with time set aside for each client so nothing feels rushed. Reserve your slot online and arrive to a calm, unhurried visit.",
    desktop:
      "GlamSlot is a boutique studio for nails, hair, skin and brows. Our three specialists, Amara, Sofia and Lena, bring years of focused craft to every appointment, with time set aside for each client so nothing feels rushed. Reserve your slot online and arrive to a calm, unhurried visit.",
  },
  imageAlt: "GlamSlot salon interior",
} as const;

export function AboutHero({ salon }: { salon: PublicSalonDetails }) {
  return (
    <section className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-center md:gap-8 lg:gap-12">
      <div className="relative aspect-[335/192] w-full overflow-hidden rounded-3xl md:aspect-[350/288] lg:aspect-[540/490] lg:rounded-[32px] lg:order-2">
        <Image
          src="/images/dark-saloon.jpg"
          alt={aboutHero.imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-4 lg:order-1">
        <p className="hidden text-base text-primary lg:block">
          {aboutHero.eyebrow}
        </p>

        <h1 className="font-serif text-[32px] leading-[35px] text-foreground md:text-[34px] md:leading-[38px] lg:text-[52px] lg:leading-[58px]">
          A little salon with a big{" "}
          <br className="sm:hidden" />
          heart.
        </h1>

        <p className="max-w-[62ch] text-[15px] leading-5 text-muted-foreground md:hidden">
          {aboutHero.paragraphs.mobile}
        </p>
        <p className="hidden max-w-[62ch] text-[15px] leading-5 text-muted-foreground md:block lg:hidden">
          {aboutHero.paragraphs.tablet}
        </p>
        <p className="hidden max-w-[62ch] text-lg leading-7 text-muted-foreground lg:block">
          {aboutHero.paragraphs.desktop}
        </p>

        <Button
          asChild
          className="hidden h-11 w-full rounded-xl text-base font-medium md:inline-flex lg:hidden"
        >
          <Link href="/book">Book Now</Link>
        </Button>

        <div className="hidden flex-wrap gap-3 lg:flex">
          <Button asChild className="h-[52px] rounded-xl px-6 text-base font-medium">
            <Link href="/book">Book Now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-[52px] rounded-xl border-border bg-card px-6 text-base font-medium text-foreground"
          >
            <a href={salon.whatsappHref}>
              <Icon name="chat" className="size-4" />
              WhatsApp us
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}