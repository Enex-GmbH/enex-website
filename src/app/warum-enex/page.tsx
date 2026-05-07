import type { Metadata } from "next";
import Link from "next/link";
import WhyChooseUs from "@/components/home-page/why-choose-us";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";

const url = `${getSiteUrl()}/warum-enex`;

export const metadata: Metadata = {
  title: "Warum Enex?",
  description:
    "Qualität, Werterhalt und mobiler Service: warum ENEX Ihre Fahrzeugpflege vor Ort übernehmen sollte.",
  alternates: { canonical: url },
  openGraph: {
    url,
    title: "Warum Enex? | ENEX Fahrzeugpflege",
    description:
      "Lackschonung, Premium-Sauberkeit, Hygiene und Service bei Ihnen – die Vorteile von ENEX.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Warum Enex? | ENEX Fahrzeugpflege",
  },
};

export default function WarumEnexPage() {
  return (
    <main className="mt-10 flex flex-col">
      <WhyChooseUs />
      <div className="border-t border-slate-100 bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">
            Überzeugt? Buchen Sie Ihren Wunschtermin in wenigen Schritten.
          </p>
          <Button
            asChild
            className="bg-enex-primary hover:bg-enex-hover text-white"
          >
            <Link href="/booking/location">Jetzt Termin buchen</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
