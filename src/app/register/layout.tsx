import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrieren",
  description: "Neues Kundenkonto für ENEX Fahrzeugpflege anlegen.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
