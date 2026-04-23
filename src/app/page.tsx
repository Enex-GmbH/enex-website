import type { Metadata } from "next";
import Hero from "@/components/home-page/hero";
import Plans from "@/components/home-page/plans";
import HowItWorks from "@/components/home-page/how-it-works";
import WhyChooseUs from "@/components/home-page/why-choose-us";
import { Showcase } from "@/components/home-page/showcase/Showcase";
import { SHOWCASE_ITEMS } from "@/components/home-page/showcase/showcase-items";
import CTASection from "@/components/home-page/cta-section";
import { ClearBookingOnHomeMount } from "@/components/home-page/clear-booking-on-home-mount";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { getSiteUrl } from "@/lib/site-url";

const homeUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Mobile Fahrzeugpflege & Aufbereitung",
  description:
    "ENEX: Mobile Fahrzeugpflege und Aufbereitung in Baden-Württemberg. Schnell online Termin buchen – professionell, transparent, vor Ort.",
  alternates: {
    canonical: `${homeUrl}/`,
  },
  openGraph: {
    type: "website",
    url: `${homeUrl}/`,
    title: "ENEX Fahrzeugpflege – Mobile Fahrzeugpflege",
    description:
      "Professionelle mobile Fahrzeugpflege: Pakete, Showcase und Online-Buchung.",
  },
  twitter: {
    title: "ENEX Fahrzeugpflege – Mobile Fahrzeugpflege",
    description:
      "Professionelle mobile Fahrzeugpflege: Pakete, Showcase und Online-Buchung.",
  },
};

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <main className="flex flex-col gap-20 mt-10">
        <ClearBookingOnHomeMount />
        <Hero />
        <HowItWorks />
        <Plans />
        <Showcase items={SHOWCASE_ITEMS} />
        <WhyChooseUs />
        <CTASection />
      </main>
    </>
  );
}
