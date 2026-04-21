import Hero from "@/components/home-page/hero";
import Plans from "@/components/home-page/plans";
import HowItWorks from "@/components/home-page/how-it-works";
import WhyChooseUs from "@/components/home-page/why-choose-us";
import { Showcase } from "@/components/home-page/showcase/Showcase";
import { SHOWCASE_ITEMS } from "@/components/home-page/showcase/showcase-items";
import CTASection from "@/components/home-page/cta-section";
import { ClearBookingOnHomeMount } from "@/components/home-page/clear-booking-on-home-mount";

export default function Home() {
  return (
    <main className="flex flex-col gap-20 mt-10">
      <ClearBookingOnHomeMount />
      <Hero />
      <HowItWorks />
      <Plans />
      <Showcase items={SHOWCASE_ITEMS} />
      <WhyChooseUs />
      <CTASection />
    </main>
  );
}
