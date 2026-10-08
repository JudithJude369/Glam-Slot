import { Hero } from "@/components/landing/hero";
import { RitualsGrid } from "@/components/landing/rituals-grid";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StickyBookBar } from "@/components/landing/sticky-book-bar";
import { getPublicSalonDetails, type PublicSalonDetails } from "@/lib/public-salon";
import { getPublicServices } from "@/lib/public-content";
import { koboToNaira } from "@/lib/money";

export default async function Home() {
  const [salon, services] = await Promise.all([
    getPublicSalonDetails(),
    getPublicServices(),
  ]);
  const cheapestActivePrice = services.reduce<number | null>(
    (cheapest, service) =>
      cheapest === null ? service.priceKobo : Math.min(cheapest, service.priceKobo),
    null,
  );

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader salon={salon} />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-[100px] pt-5 md:px-6 md:pb-0 md:pt-6">
        <div className="flex flex-col gap-10 md:gap-12">
          <Hero
            salon={salon}
            fromPrice={cheapestActivePrice === null ? null : koboToNaira(cheapestActivePrice)}
          />
          <RitualsGrid services={services.slice(0, 3)} salon={salon} />
        </div>
      </main>
      <SiteFooter salon={salon} />
      <StickyBookBar />
    </div>
  );
}

export type { PublicSalonDetails };