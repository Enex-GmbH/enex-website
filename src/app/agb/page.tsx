/* eslint-disable react/no-unescaped-entities -- Legal copy uses typographic marks */
import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalSectionTitle,
} from "@/components/legal/legal-headings";
import { getSiteUrl } from "@/lib/site-url";

const url = `${getSiteUrl()}/agb`;

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen (AGB)",
  description:
    "Allgemeine Geschäftsbedingungen der Enex GmbH, ENEX Fahrzeugpflege.",
  alternates: { canonical: url },
  openGraph: {
    url,
    title: "AGB | ENEX Fahrzeugpflege",
    description: "Allgemeine Geschäftsbedingungen der Enex GmbH.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AGB | ENEX Fahrzeugpflege",
  },
};

export default function AgbPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <article className="rounded-lg bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>
          <p className="text-sm font-medium text-gray-600">Stand: Oktober 2025</p>
          <p className="mt-4 leading-relaxed text-gray-700">
            Enex GmbH · Bahnhofstraße 59 · 75223 Niefern-Öschelbronn
            <br />
            Tel.&nbsp;07233&nbsp;9749801 · E-Mail{" "}
            <a
              href="mailto:enes@autohaus-enzklusive.de"
              className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
            >
              enes@autohaus-enzklusive.de
            </a>
          </p>

          <div className="max-w-none space-y-1 text-gray-700">
            <LegalSectionTitle>1. Geltungsbereich</LegalSectionTitle>
            <p className="leading-relaxed">
              Diese AGB gelten für alle Leistungen der Enex GmbH im Bereich
              mobiler Fahrzeugaufbereitung, Innen- und Außenreinigung sowie
              Zusatzleistungen. Abweichende Bedingungen des Kunden werden nicht
              anerkannt, es sei denn, sie werden schriftlich bestätigt.
            </p>

            <LegalSectionTitle>2. Vertragsschluss</LegalSectionTitle>
            <p className="leading-relaxed">
              Ein Vertrag kommt zustande, wenn der Kunde einen Auftrag
              schriftlich, telefonisch oder elektronisch erteilt und die Enex GmbH
              diesen bestätigt oder mit der Ausführung beginnt. Angebote sind
              freibleibend.
            </p>

            <LegalSectionTitle>3. Leistungsumfang</LegalSectionTitle>
            <p className="leading-relaxed">
              Der Umfang der Arbeiten ergibt sich aus dem gebuchten Paket
              (Basic, Premium, Exclusive) und ggf. zusätzlich vereinbarten
              Add-ons. Leistungsänderungen oder Sonderwünsche bedürfen der
              Zustimmung der Enex GmbH.
            </p>
            <p className="mt-4 leading-relaxed">
              Bei mobilen Einsätzen muss ein geeigneter Standort (Strom- und
              Wasseranschluss, Zugang zum Fahrzeug) vorhanden sein.
            </p>

            <LegalSectionTitle>4. Preise und Zahlung</LegalSectionTitle>
            <p className="leading-relaxed">
              Alle Preise verstehen sich in Euro inkl. MwSt. Zahlung erfolgt
              nach Leistungserbringung in bar, per EC-Karte oder nach
              Rechnungsstellung innerhalb von 7 Tagen.
            </p>
            <p className="mt-4 leading-relaxed">
              Bei Zahlungsverzug kann die Enex GmbH Verzugszinsen in
              gesetzlicher Höhe berechnen.
            </p>

            <LegalSectionTitle>5. Terminänderung / Stornierung</LegalSectionTitle>
            <p className="leading-relaxed">
              Vereinbarte Termine sind verbindlich. Absagen müssen mindestens 24
              Stunden vor Beginn erfolgen.
            </p>
            <p className="mt-4 leading-relaxed">
              Bei kurzfristigen Absagen oder Nichtbereitstellung des Fahrzeugs
              kann eine Aufwandsentschädigung bis zu 50&nbsp;% des Auftragswerts
              berechnet werden.
            </p>

            <LegalSectionTitle>6. Haftung</LegalSectionTitle>
            <p className="leading-relaxed">
              Die Enex GmbH haftet nur für Schäden, die auf Vorsatz oder grober
              Fahrlässigkeit beruhen.
            </p>
            <p className="mt-4 leading-relaxed">
              Für bereits vorhandene Schäden, Vorschäden oder Mängel (z.&nbsp;B.
              Lack, Elektronik, Dichtungen, Nachlackierungen) wird keine Haftung
              übernommen.
            </p>
            <p className="mt-4 leading-relaxed">
              Bei Einsätzen auf Privat- oder Firmengrundstücken haftet der
              Kunde für Schäden, die durch ungeeignete Platz- oder
              Umweltbedingungen entstehen.
            </p>

            <LegalSectionTitle>7. Gewährleistung / Reklamationen</LegalSectionTitle>
            <p className="leading-relaxed">
              Beanstandungen sind unmittelbar bei Übergabe geltend zu machen.
            </p>
            <p className="mt-4 leading-relaxed">
              Nachträgliche Reklamationen können nur berücksichtigt werden, wenn
              sie innerhalb von 24&nbsp;Stunden nach Leistung schriftlich
              erfolgen und durch Fotos belegt sind.
            </p>

            <LegalSectionTitle>
              8. Foto- und Videoverwendung / Datenschutz
            </LegalSectionTitle>
            <p className="leading-relaxed">
              Der Kunde erklärt sich damit einverstanden, dass Fotos und Videos
              des Fahrzeugs zur Dokumentation und&nbsp;– mit gesonderter
              Zustimmung&nbsp;– zu Werbezwecken (Website, Social Media,
              Werbematerial) verwendet werden dürfen.
            </p>
            <p className="mt-4 leading-relaxed">
              Eine Veröffentlichung mit sichtbarem Kennzeichen erfolgt nur,
              wenn der Kunde dem ausdrücklich zustimmt.
            </p>
            <p className="mt-4 leading-relaxed">
              Die Verarbeitung personenbezogener Daten erfolgt gemäß DSGVO;
              Hinweise hierzu enthält unsere separate{" "}
              <Link
                href="/datenschutz"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>

            <LegalSectionTitle>9. Eigentumsvorbehalt</LegalSectionTitle>
            <p className="leading-relaxed">
              Verwendete Materialien (Pflegemittel, Versiegelungen u.&nbsp;A.)
              bleiben bis zur vollständigen Bezahlung Eigentum der Enex GmbH.
            </p>

            <LegalSectionTitle>
              10. Gerichtsstand / Schlussbestimmungen
            </LegalSectionTitle>
            <p className="leading-relaxed">
              Gerichtsstand ist Pforzheim. Es gilt deutsches Recht.
            </p>
            <p className="mt-4 leading-relaxed">
              Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die
              Wirksamkeit der übrigen Regelungen unberührt.
            </p>
          </div>

          <p className="mt-12 text-sm leading-relaxed text-gray-600">
            © Enex GmbH – Bahnhofstraße 59, 75223 Niefern-Öschelbronn –{" "}
            enes@autohaus-enzklusive.de – 07233 9749801
          </p>

          <nav className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-gray-100 pt-8 text-center text-sm text-gray-600">
            <Link
              href="/"
              className="text-enex-primary underline-offset-4 hover:underline"
            >
              Zur Startseite
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link
              href="/datenschutz"
              className="text-enex-primary underline-offset-4 hover:underline"
            >
              Datenschutzerklärung
            </Link>
            <span className="text-gray-300" aria-hidden>
              |
            </span>
            <Link
              href="/impressum"
              className="text-enex-primary underline-offset-4 hover:underline"
            >
              Impressum
            </Link>
          </nav>
        </article>
      </div>
    </main>
  );
}
