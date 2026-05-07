import type { Metadata } from "next";
import Link from "next/link";
import { LegalSectionTitle, LegalSubTitle } from "@/components/legal/legal-headings";
import { getSiteUrl } from "@/lib/site-url";

const url = `${getSiteUrl()}/standorte`;

export const metadata: Metadata = {
  title: "Unsere Standorte",
  description:
    "ENEX Fahrzeugpflege: Mobiler Service in Pforzheim und Umgebung. Weitere Standorte wie Karlsruhe in Planung.",
  alternates: { canonical: url },
  openGraph: {
    url,
    title: "Unsere Standorte | ENEX Fahrzeugpflege",
    description:
      "Wir kommen zu Ihnen – Pforzheim und Umgebung. Karlsruhe bald verfügbar.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Unsere Standorte | ENEX Fahrzeugpflege",
  },
};

export default function StandortePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <article className="rounded-lg bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Unsere Standorte – Wir kommen zu Ihnen
          </h1>

          <div className="max-w-none space-y-6 text-base leading-relaxed text-gray-700">
            <p>
              Aktuell ist Enex in <strong className="font-semibold text-gray-900">Pforzheim und Umgebung</strong> für Sie im Einsatz. Als mobiler Service
              kommen wir direkt zu Ihnen – egal ob nach Hause, zur Arbeit oder
              zum Autohaus.
            </p>

            <p>
              Unser Ziel ist es, Ihnen maximale Flexibilität zu bieten, ohne dass
              Sie Zeit verlieren.
            </p>

            <LegalSectionTitle>Weitere Standorte im Aufbau:</LegalSectionTitle>
            <LegalSubTitle>Karlsruhe – bald verfügbar</LegalSubTitle>

            <p>
              Wir arbeiten kontinuierlich daran, unser Netzwerk zu erweitern, um
              unseren Premium-Service in Zukunft in weiteren Städten anbieten zu
              können.
            </p>

            <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50/80 p-6 md:p-8">
              <p className="text-lg font-medium text-gray-900">
                Sie sind sich unsicher, ob wir zu Ihnen kommen?
              </p>
              <p className="mt-3 text-gray-700">
                Kontaktieren Sie uns einfach – wir finden eine Lösung.{" "}
                <a
                  href="mailto:hallo@enexdetailing.de"
                  className="font-medium text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                >
                  hallo@enexdetailing.de
                </a>
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Oder buchen Sie direkt online:{" "}
                <Link
                  href="/booking/location"
                  className="font-medium text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                >
                  Jetzt Termin wählen
                </Link>
                .
              </p>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
