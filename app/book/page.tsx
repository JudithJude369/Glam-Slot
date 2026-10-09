import { getPublicServices, getPublicTeam } from "@/lib/public-content";
import { getPublicSalonDetails } from "@/lib/public-salon";
import { BookingFlow } from "./booking-flow";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import type { PublicSalonDetails } from "@/lib/public-salon";

export const metadata = {
  title: "Book | GlamSlot",
  description: "Book your appointment at GlamSlot",
};

export default async function BookingPage() {
  const [salon, services, staff] = await Promise.all([
    getPublicSalonDetails(),
    getPublicServices(),
    getPublicTeam(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader salon={salon} />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-[100px] pt-5 md:px-6 md:pb-0 md:pt-6">
        <BookingFlow
          salon={salon}
          services={services}
          staff={staff}
        />
      </main>
      <SiteFooter salon={salon} />
    </div>
  );
}