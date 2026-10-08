import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/landing/icon";
import type { PublicSalonDetails } from "@/lib/public-salon";

const footerColumns = (salon: PublicSalonDetails) => [
  {
    title: "Visit",
    links: [
      { label: "Services", href: "/#featured-rituals" },
      { label: "About", href: "/about" },
      { label: "Book Now", href: "/book" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: salon.whatsappHref },
    ],
  },
] as const;

export function SiteFooter({ salon }: { salon: PublicSalonDetails }) {
  const columns = footerColumns(salon);

  return (
    <footer className="mt-10 bg-plum md:mt-12">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-5 py-10 md:flex-row md:justify-between md:px-6 md:py-12">
        <div className="flex flex-col items-start gap-2">
          <p className="font-serif text-2xl text-white">{salon.name}</p>
          <p className="text-sm text-primary-foreground/70">
            {salon.hoursFooter}
          </p>
          <Button
            asChild
            className="mt-2 h-12 rounded-xl bg-accent px-5 text-base font-medium text-accent-foreground hover:bg-accent/85"
          >
            <a href={salon.whatsappHref}>
              <Icon name="chat" className="size-4" />
              WhatsApp us
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-2">
              <p className="text-sm font-medium text-white">{column.title}</p>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}