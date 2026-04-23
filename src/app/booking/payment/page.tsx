import type { Metadata } from "next";
import PaymentStep from "@/components/booking/payment-step";
import { getSiteUrl } from "@/lib/site-url";

const path = "/booking/payment";
const url = `${getSiteUrl()}${path}`;

export const metadata: Metadata = {
  title: "Bezahlung",
  description:
    "Sichere Bezahlung Ihrer Fahrzeugpflege-Buchung bei ENEX – Übersicht und Abschluss.",
  alternates: { canonical: url },
  openGraph: { url, title: "Bezahlung | ENEX Buchung" },
};

export default function PaymentPage() {
  return <PaymentStep />;
}
