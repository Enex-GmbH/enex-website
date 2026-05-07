import type { Metadata } from "next";
import Link from "next/link";
import { PreisePaketeContent } from "@/components/preise-pakete/preise-pakete-content";
import { getSiteUrl } from "@/lib/site-url";

const url = `${getSiteUrl()}/preise-pakete`;

export const metadata: Metadata = {
  title: "Preise & Pakete",
  description:
    "Paketpreise nach Fahrzeugklasse und optionale Zusatzleistungen für ENEX mobile Fahrzeugpflege. Transparent, inklusive MwSt.",
  alternates: { canonical: url },
  openGraph: {
    url,
    title: "Preise & Pakete | ENEX Fahrzeugpflege",
    description:
      "Basis, Premium und Exclusive – Preise für Kleinwagen, Standardwagen und SUV.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Preise & Pakete | ENEX Fahrzeugpflege",
  },
};

export default function PreisePaketePage() {
  return (
    <main className="mt-10 min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-800">
            Startseite
          </Link>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-800">Preise &amp; Pakete</span>
        </div>
      </nav>

      <header className="border-b border-gray-200 bg-white py-10 md:py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-enex-primary">
            ENEX Fahrzeugpflege
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            Preise &amp; Pakete
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600 lg:mx-0">
            Übersicht über unsere Pakete nach Fahrzeugklasse und alle optionalen
            Zusatzleistungen. Ihre gültige{" "}
            <strong className="font-semibold text-gray-800">Preisliste 2026</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/booking/package"
              className="inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
            >
              Paket auswählen &amp; buchen
            </Link>
            <Link
              href="/warum-enex"
              className="inline-flex rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Warum Enex?
            </Link>
          </div>
        </div>
      </header>

      <PreisePaketeContent />
    </main>
  );
}
