import type { Metadata } from "next";
import BookingFlowLayoutClient from "./booking-flow-layout-client";

export const metadata: Metadata = {
  title: {
    template: "%s | ENEX Buchung",
    default: "Termin buchen",
  },
  description:
    "Mobile Fahrzeugpflege online buchen: Standort, Paket, Termin und Bezahlung in wenigen Schritten.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "ENEX Fahrzeugpflege",
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BookingFlowLayoutClient>{children}</BookingFlowLayoutClient>;
}
