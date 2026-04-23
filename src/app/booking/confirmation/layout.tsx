import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buchung bestätigt",
  description:
    "Ihre Buchung bei ENEX Fahrzeugpflege wurde entgegengenommen. Vielen Dank!",
  robots: { index: false, follow: false, nocache: true },
};

export default function BookingConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
