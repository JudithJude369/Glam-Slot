import { Hero } from "@/components/landing/hero";
import { InfoRow } from "@/components/landing/info-row";
import { RitualsGrid } from "@/components/landing/rituals-grid";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StickyBookBar } from "@/components/landing/sticky-book-bar";

const Home = () => {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-[100px] pt-5 md:px-6 md:pb-0 md:pt-6">
        <div className="flex flex-col gap-10 md:gap-12">
          <Hero />
          <RitualsGrid />
          <InfoRow />
        </div>
      </main>
      <SiteFooter />
      <StickyBookBar />
    </div>
  );
};

export default Home;