import { PublicImage } from "@/components/public-image";
import Link from "next/link";
import type { PublicStaff } from "@/lib/public-content";

export function TeamCard({ member }: { member: PublicStaff }) {
  const altRole = member.roleDesktop.split("•")[0]?.trim() || member.roleDesktop;

  return (
    <article className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-4 md:h-[150px] md:flex-col md:justify-center md:gap-2 md:p-4 md:text-center lg:h-[115px] lg:flex-row lg:items-center lg:gap-6 lg:p-6 lg:text-left">
      <PublicImage
        src={member.photo}
        alt={`${member.name}, ${altRole.toLowerCase()}`}
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-full object-cover md:size-16 lg:size-[65px]"
      />

      <div className="flex min-w-0 flex-col lg:gap-1">
        <p className="text-base font-medium text-card-foreground md:text-lg lg:font-serif lg:text-[22px] lg:leading-tight">
          {member.name}
        </p>
        <p className="text-sm text-muted-foreground md:hidden">
          {member.roleMobile}
        </p>
        <p className="hidden text-sm text-muted-foreground md:block lg:hidden">
          {member.roleShort}
        </p>
        <p className="hidden text-[15px] text-muted-foreground lg:block">
          {member.roleDesktop}
        </p>
      </div>

      <Link
        href="/book"
        className="ml-auto flex h-11 shrink-0 items-center rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
      >
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Book
        </span>
      </Link>
    </article>
  );
}