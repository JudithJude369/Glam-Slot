import { Icon } from "@/components/landing/icon";
import { infoCards } from "@/lib/sample-content";

export function InfoRow() {
  return (
    <section
      aria-label="Find us"
      className="hidden grid-cols-3 gap-6 lg:grid"
    >
      {infoCards.map((card) => (
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