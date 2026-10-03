"use client";

import Link from "next/link";
import { ServiceCard } from "@/components/landing/service-card";
import { VisitCard } from "@/components/landing/visit-card";
import {
  defaultSelectedServiceId,
  services,
} from "@/lib/sample-content";
import { useState } from "react";

export function RitualsGrid() {
  const [selectedId, setSelectedId] = useState(defaultSelectedServiceId);

  return (
    <section aria-labelledby="featured-rituals">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="featured-rituals"
          className="font-serif text-2xl leading-tight text-foreground lg:text-[32px]"
        >
          Featured rituals
        </h2>
        <Link
          href="/book"
          className="hidden text-sm font-medium text-primary underline underline-offset-4 lg:block"
        >
          All services
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={service.id === selectedId}
            onSelect={() => setSelectedId(service.id)}
          />
        ))}
        <VisitCard />
      </div>
    </section>
  );
}