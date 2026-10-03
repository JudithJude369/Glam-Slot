import { AboutHero } from "@/components/about/about-hero";
import { ContactCard } from "@/components/about/contact-card";
import { TeamSection } from "@/components/about/team-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StickyBookBar } from "@/components/landing/sticky-book-bar";

const AboutPage = () => {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-[100px] pt-5 md:px-6 md:pb-0 md:pt-6">
        <div className="flex flex-col gap-7 md:gap-10 lg:gap-16">
          <AboutHero />
          <TeamSection />
          <ContactCard />
        </div>
      </main>
      <SiteFooter />
      <StickyBookBar />
    </div>
  );
};

export default AboutPage;