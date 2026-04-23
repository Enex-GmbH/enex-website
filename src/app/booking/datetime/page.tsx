import type { Metadata } from "next";
import DateTimeStep from "@/components/booking/datetime-step";
import { getSiteUrl } from "@/lib/site-url";

const path = "/booking/datetime";
const url = `${getSiteUrl()}${path}`;

export const metadata: Metadata = {
  title: "Datum & Uhrzeit",
  description:
    "Wunschtermin für die mobile Fahrzeugpflege wählen – Verfügbarkeit in Echtzeit.",
  alternates: { canonical: url },
  openGraph: { url, title: "Termin wählen | ENEX Buchung" },
};

export default function DateTimePage() {
  return <DateTimeStep />;
}
