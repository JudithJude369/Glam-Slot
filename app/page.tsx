import { Hero } from "@/components/landing/hero";
import { InfoRow } from "@/components/landing/info-row";
import { RitualsGrid } from "@/components/landing/rituals-grid";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StickyBookBar } from "@/components/landing/sticky-book-bar";
import { getPublicSalonDetails, type PublicSalonDetails } from "@/lib/public-salon";
import { getPublicServices } from "@/lib/public-content";

export default async function Home() {
  const [salon, services] = await Promise.all([
    getPublicSalonDetails(),
    getPublicServices(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader salon={salon} />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-[100px] pt-5 md:px-6 md:pb-0 md:pt-6">
        <div className="flex flex-col gap-10 md:gap-12">
          <Hero salon={salon} />
          <RitualsGrid services={services} salon={salon} />
          <InfoRow salon={salon} />
        </div>
      </main>
      <SiteFooter salon={salon} />
      <StickyBookBar />
    </div>
  );
}

export type { PublicSalonDetails };