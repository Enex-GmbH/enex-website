import { LegalSectionTitle } from "@/components/legal/legal-headings";

export const metadata = {
  title: "Impressum | Enex",
  description: "Impressum - Rechtliche Angaben",
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <article className="rounded-lg bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Impressum
          </h1>

          <div className="max-w-none space-y-1 text-gray-700">
            <p className="text-base leading-relaxed">
              Enex GmbH
              <br />
              Bahnhofstr.59
              <br />
              75223 Niefern-Öschelbronn
            </p>

            <LegalSectionTitle>Kontakt</LegalSectionTitle>
            <ul className="list-none space-y-2 pl-0">
              <li>
                <span className="font-medium text-gray-900">Telefon:</span>{" "}
                +497233 9749801
              </li>
              <li>
                <span className="font-medium text-gray-900">Fax:</span>{" "}
                +497233 9749803
              </li>
              <li>
                <span className="font-medium text-gray-900">eMail:</span>{" "}
                <a
                  href="mailto:enes@autohaus-enzklusive.de"
                  className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                >
                  enes@autohaus-enzklusive.de
                </a>
              </li>
            </ul>

            <p className="mt-6 leading-relaxed">
              Umsatzsteuer-Identifikationsnr. nach § 27a Umsatzsteuergesetz:
              <br />
              <span className="font-medium text-gray-900">DE458128096</span>
            </p>

            <p className="mt-6 leading-relaxed">
              <span className="font-medium text-gray-900">Geschäftsführer:</span>{" "}
              Enes Soysal
            </p>

            <LegalSectionTitle>EU-Streitschlichtung</LegalSectionTitle>
            <p className="leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              .
              <br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>

            <LegalSectionTitle>
              Verbraucher­streit­beilegung/Universal­schlichtungs­stelle
            </LegalSectionTitle>
            <p className="leading-relaxed">
              Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
