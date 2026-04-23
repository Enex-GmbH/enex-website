import type { Metadata } from "next";
import PackageStep from "@/components/booking/package-step";
import { getSiteUrl } from "@/lib/site-url";

const path = "/booking/package";
const url = `${getSiteUrl()}${path}`;

export const metadata: Metadata = {
  title: "Paket wählen",
  description:
    "Wählen Sie Ihr Fahrzeugpflege-Paket: Leistungen und Preise transparent – passend zu Ihrem Fahrzeug.",
  alternates: { canonical: url },
  openGraph: { url, title: "Paket wählen | ENEX Buchung" },
};

export default function PackagePage() {
  return <PackageStep />;
}
