import type { Metadata } from "next";
import LocationStep from "@/components/booking/location-step";
import { getSiteUrl } from "@/lib/site-url";

const path = "/booking/location";
const url = `${getSiteUrl()}${path}`;

export const metadata: Metadata = {
  title: "Standort & Postleitzahl",
  description:
    "Geben Sie Ihre Adresse oder Postleitzahl ein – wir planen die mobile Fahrzeugpflege bei Ihnen vor Ort.",
  alternates: { canonical: url },
  openGraph: { url, title: "Standort wählen | ENEX Buchung" },
};

export default function LocationPage() {
  return <LocationStep />;
}
