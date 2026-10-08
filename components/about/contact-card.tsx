import { Button } from "@/components/ui/button";
import { Icon } from "@/components/landing/icon";
import type { PublicSalonDetails } from "@/lib/public-salon";

export function ContactCard({ salon }: { salon: PublicSalonDetails }) {
  return (
    <section id="visit" className="scroll-mt-24 lg:hidden">
      <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-4 md:hidden">
        <h2 className="font-serif text-lg text-card-foreground">Contact</h2>
        <p className="flex items-start gap-2 text-sm text-foreground">
          <Icon name="phone" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <a href={salon.phoneHref} className="underline underline-offset-4">
            {salon.phone}
          </a>
        </p>
        <p className="flex items-start gap-2 text-sm text-foreground">
          <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          {salon.addressShort}
        </p>
        <Button
          asChild
          className="mt-1 h-12 w-full rounded-xl bg-accent text-base font-medium text-accent-foreground hover:bg-accent/85"
        >
          <a href={salon.whatsappHref}>
            <Icon name="chat" className="size-4" />
            WhatsApp
          </a>
        </Button>
      </div>

      <div className="hidden min-h-[85px] items-center justify-between gap-4 rounded-[20px] border border-border bg-card px-5 py-4 md:flex">
        <p className="text-base text-foreground">{salon.visitLine}</p>
        <Button
          asChild
          className="h-12 shrink-0 rounded-xl bg-accent px-5 text-base font-medium text-accent-foreground hover:bg-accent/85"
        >
          <a href={salon.whatsappHref}>
            <Icon name="chat" className="size-4" />
            WhatsApp
          </a>
        </Button>
      </div>
    </section>
  );
}