import { TeamCard } from "@/components/about/team-card";
import type { PublicStaff } from "@/lib/public-content";

export function TeamSection({ team }: { team: PublicStaff[] }) {
  return (
    <section aria-labelledby="meet-the-team">
      <h2
        id="meet-the-team"
        className="font-serif text-[22px] leading-tight text-foreground lg:text-[32px]"
      >
        Meet the team
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-[13px] md:grid-cols-3 md:gap-3 lg:gap-[22px]">
        {team.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}