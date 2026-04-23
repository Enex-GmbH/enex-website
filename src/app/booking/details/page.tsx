import type { Metadata } from "next";
import DetailsStep from "@/components/booking/details-step";
import { getSiteUrl } from "@/lib/site-url";

const path = "/booking/details";
const url = `${getSiteUrl()}${path}`;

export const metadata: Metadata = {
  title: "Fahrzeugdetails",
  description:
    "Fahrzeugtyp und Angaben für Ihre Buchung – damit wir optimal vorbereitet sind.",
  alternates: { canonical: url },
  openGraph: { url, title: "Fahrzeugdetails | ENEX Buchung" },
};

export default function DetailsPage() {
  return <DetailsStep />;
}
