"use client";

import Image from "next/image";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/sample-content";

export function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      data-selected={selected}
      className={
        selected
          ? "flex flex-row overflow-hidden rounded-[20px] border-2 border-primary bg-card ring-4 ring-primary/10 md:flex-col"
          : "flex flex-row overflow-hidden rounded-[20px] border border-border bg-card md:flex-col"
      }
    >
      <div className="relative w-24 shrink-0 self-stretch md:h-36 md:w-full">
        <Image
          src={service.photo}
          alt={service.name}
          fill
          sizes="(min-width: 1024px) 340px, (min-width: 768px) 45vw, 96px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="flex items-center gap-2 font-serif text-lg leading-tight text-card-foreground">
          {selected ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" aria-hidden="true" />
            </span>
          ) : null}
          {service.name}
        </h3>

        <p className="flex items-center gap-1.5 text-sm">
          <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">{service.duration}</span>
          <span className="text-foreground font-medium">{service.price}</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {service.deposit} deposit
          </span>
          <Button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={
              selected
                ? "h-9 rounded-xl bg-plum px-4 text-sm font-medium text-white hover:bg-plum/85"
                : "h-9 rounded-xl px-4 text-sm font-medium"
            }
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </article>
  );
}