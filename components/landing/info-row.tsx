import { Icon } from "@/components/landing/icon";
import type { PublicSalonDetails } from "@/lib/public-salon";

export function InfoRow({ salon }: { salon: PublicSalonDetails }) {
  const cards = [
    {
      icon: "pin" as const,
      title: salon.addressShort,
      detail: salon.nearby,
    },
    {
      icon: "clock" as const,
      title: salon.hours,
      detail: salon.closedNote,
    },
    {
      icon: "chat" as const,
      title: "WhatsApp concierge",
      detail: salon.whatsappNumber,
    },
  ];

  return (
    <section
      aria-label="Find us"
      className="hidden grid-cols-3 gap-6 lg:grid"
    >
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex items-start gap-3 rounded-[20px] border border-border bg-card p-5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Icon name={card.icon} className="size-5" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-base font-medium text-card-foreground">
              {card.title}
            </span>
            <span className="text-sm text-muted-foreground">{card.detail}</span>
          </span>
        </div>
      ))}
    </section>
  );
}