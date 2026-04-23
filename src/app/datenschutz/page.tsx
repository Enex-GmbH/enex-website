/* eslint-disable react/no-unescaped-entities -- Legal copy uses quotation marks in body text */
import type { Metadata } from "next";
import {
  LegalSectionTitle,
  LegalSubTitle,
} from "@/components/legal/legal-headings";
import { getSiteUrl } from "@/lib/site-url";

const url = `${getSiteUrl()}/datenschutz`;

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung der Enex GmbH: Informationen zur Verarbeitung personenbezogener Daten auf dieser Website.",
  alternates: { canonical: url },
  openGraph: {
    url,
    title: "Datenschutz | ENEX Fahrzeugpflege",
    description: "Datenschutzinformationen der Enex GmbH.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Datenschutz | ENEX Fahrzeugpflege",
  },
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <article className="rounded-lg bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Datenschutzerklärung
          </h1>

          <div className="max-w-none space-y-1 text-gray-700">
            <LegalSectionTitle>
              Allgemeiner Hinweis und Pflichtinformationen
            </LegalSectionTitle>

            <LegalSubTitle>Benennung der verantwortlichen Stelle</LegalSubTitle>
            <p className="leading-relaxed">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser
              Website ist:
            </p>
            <p className="mt-4 leading-relaxed">
              Enex GmbH
              <br />
              Enes Soysal
              <br />
              Bahnhofstraße 59
              <br />
              75223 Niefern-Öschelbronn
            </p>
            <p className="mt-4 leading-relaxed">
              Die verantwortliche Stelle entscheidet allein oder gemeinsam mit
              anderen über die Zwecke und Mittel der Verarbeitung von
              personenbezogenen Daten (z.B. Namen, Kontaktdaten o. Ä.).
            </p>

            <LegalSubTitle>
              Widerruf Ihrer Einwilligung zur Datenverarbeitung
            </LegalSubTitle>
            <p className="leading-relaxed">
              Nur mit Ihrer ausdrücklichen Einwilligung sind einige Vorgänge der
              Datenverarbeitung möglich. Ein Widerruf Ihrer bereits erteilten
              Einwilligung ist jederzeit möglich. Für den Widerruf genügt eine
              formlose Mitteilung per E-Mail. Die Rechtmäßigkeit der bis zum
              Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
              unberührt.
            </p>

            <LegalSubTitle>
              Recht auf Beschwerde bei der zuständigen Aufsichtsbehörde
            </LegalSubTitle>
            <p className="leading-relaxed">
              Als Betroffener steht Ihnen im Falle eines datenschutzrechtlichen
              Verstoßes ein Beschwerderecht bei der zuständigen Aufsichtsbehörde
              zu. Zuständige Aufsichtsbehörde bezüglich datenschutzrechtlicher
              Fragen ist der Landesdatenschutzbeauftragte des Bundeslandes, in
              dem sich der Sitz unseres Unternehmens befindet. Der folgende Link
              stellt eine Liste der Datenschutzbeauftragten sowie deren
              Kontaktdaten bereit:{" "}
              <a
                href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
              .
            </p>

            <LegalSubTitle>Recht auf Datenübertragbarkeit</LegalSubTitle>
            <p className="leading-relaxed">
              Ihnen steht das Recht zu, Daten, die wir auf Grundlage Ihrer
              Einwilligung oder in Erfüllung eines Vertrags automatisiert
              verarbeiten, an sich oder an Dritte aushändigen zu lassen. Die
              Bereitstellung erfolgt in einem maschinenlesbaren Format. Sofern
              Sie die direkte Übertragung der Daten an einen anderen
              Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch
              machbar ist.
            </p>

            <LegalSubTitle>
              Recht auf Auskunft, Berichtigung, Sperrung, Löschung
            </LegalSubTitle>
            <p className="leading-relaxed">
              Sie haben jederzeit im Rahmen der geltenden gesetzlichen
              Bestimmungen das Recht auf unentgeltliche Auskunft über Ihre
              gespeicherten personenbezogenen Daten, Herkunft der Daten, deren
              Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht
              auf Berichtigung, Sperrung oder Löschung dieser Daten.
              Diesbezüglich und auch zu weiteren Fragen zum Thema
              personenbezogene Daten können Sie sich jederzeit über die im
              Impressum aufgeführten Kontaktmöglichkeiten an uns wenden.
            </p>

            <LegalSubTitle>SSL- bzw. TLS-Verschlüsselung</LegalSubTitle>
            <p className="leading-relaxed">
              Aus Sicherheitsgründen und zum Schutz der Übertragung
              vertraulicher Inhalte, die Sie an uns als Seitenbetreiber senden,
              nutzt unsere Website eine SSL-bzw. TLS-Verschlüsselung. Damit sind
              Daten, die Sie über diese Website übermitteln, für Dritte nicht
              mitlesbar. Sie erkennen eine verschlüsselte Verbindung an der
              „https://“ Adresszeile Ihres Browsers und am Schloss-Symbol in der
              Browserzeile.
            </p>

            <LegalSubTitle>Server-Log-Dateien</LegalSubTitle>
            <p className="leading-relaxed">
              In Server-Log-Dateien erhebt und speichert der Provider der
              Website automatisch Informationen, die Ihr Browser automatisch an
              uns übermittelt. Dies sind:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 leading-relaxed">
              <li>Besuchte Seite auf unserer Domain</li>
              <li>Datum und Uhrzeit der Serveranfrage</li>
              <li>Browsertyp und Browserversion</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>IP-Adresse</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Es findet keine Zusammenführung dieser Daten mit anderen
              Datenquellen statt. Grundlage der Datenverarbeitung bildet Art. 6
              Abs. 1 lit. b DSGVO, der die Verarbeitung von Daten zur Erfüllung
              eines Vertrags oder vorvertraglicher Maßnahmen gestattet.
            </p>

            <LegalSubTitle>Kontaktformular</LegalSubTitle>
            <p className="leading-relaxed">
              Per Kontaktformular übermittelte Daten werden einschließlich Ihrer
              Kontaktdaten gespeichert, um Ihre Anfrage bearbeiten zu können oder
              um für Anschlussfragen bereitzustehen. Eine Weitergabe dieser Daten
              findet ohne Ihre Einwilligung nicht statt.
            </p>
            <p className="mt-4 leading-relaxed">
              Die Verarbeitung der in das Kontaktformular eingegebenen Daten
              erfolgt ausschließlich auf Grundlage Ihrer Einwilligung (Art. 6
              Abs. 1 lit. a DSGVO). Ein Widerruf Ihrer bereits erteilten
              Einwilligung ist jederzeit möglich. Für den Widerruf genügt eine
              formlose Mitteilung per E-Mail. Die Rechtmäßigkeit der bis zum
              Widerruf erfolgten Datenverarbeitungsvorgänge bleibt vom Widerruf
              unberührt.
            </p>
            <p className="mt-4 leading-relaxed">
              Über das Kontaktformular übermittelte Daten verbleiben bei uns,
              bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur
              Speicherung widerrufen oder keine Notwendigkeit der
              Datenspeicherung mehr besteht. Zwingende gesetzliche Bestimmungen -
              insbesondere Aufbewahrungsfristen - bleiben unberührt.
            </p>

            <LegalSubTitle>YouTube</LegalSubTitle>
            <p className="leading-relaxed">
              Für Integration und Darstellung von Videoinhalten nutzt unsere
              Website Plugins von YouTube. Anbieter des Videoportals ist die
              YouTube, LLC, 901 Cherry Ave., San Bruno, CA 94066, USA.
            </p>
            <p className="mt-4 leading-relaxed">
              Bei Aufruf einer Seite mit integriertem YouTube-Plugin wird eine
              Verbindung zu den Servern von YouTube hergestellt. YouTube erfährt
              hierdurch, welche unserer Seiten Sie aufgerufen haben.
            </p>
            <p className="mt-4 leading-relaxed">
              YouTube kann Ihr Surfverhalten direkt Ihrem persönlichen Profil
              zuzuordnen, sollten Sie in Ihrem YouTube Konto eingeloggt sein.
              Durch vorheriges Ausloggen haben Sie die Möglichkeit, dies zu
              unterbinden.
            </p>
            <p className="mt-4 leading-relaxed">
              Die Nutzung von YouTube erfolgt im Interesse einer ansprechenden
              Darstellung unserer Online-Angebote. Dies stellt ein berechtigtes
              Interesse im Sinne von Art. 6 Abs. 1 lit. f DSGVO dar.
            </p>
            <p className="mt-4 leading-relaxed">
              Einzelheiten zum Umgang mit Nutzerdaten finden Sie in der
              Datenschutzerklärung von YouTube unter:{" "}
              <a
                href="https://www.youtube.com/t/terms"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
              .
            </p>

            <LegalSubTitle>Cookies</LegalSubTitle>
            <p className="leading-relaxed">
              Unsere Website verwendet Cookies. Das sind kleine Textdateien, die
              Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns
              dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer
              zu machen.
            </p>
            <p className="mt-4 leading-relaxed">
              Einige Cookies sind „Session-Cookies.“ Solche Cookies werden nach
              Ende Ihrer Browser-Sitzung von selbst gelöscht. Hingegen bleiben
              andere Cookies auf Ihrem Endgerät bestehen, bis Sie diese selbst
              löschen. Solche Cookies helfen uns, Sie bei Rückkehr auf unserer
              Website wiederzuerkennen.
            </p>
            <p className="mt-4 leading-relaxed">
              Mit einem modernen Webbrowser können Sie das Setzen von Cookies
              überwachen, einschränken oder unterbinden. Viele Webbrowser lassen
              sich so konfigurieren, dass Cookies mit dem Schließen des
              Programms von selbst gelöscht werden. Die Deaktivierung von
              Cookies kann eine eingeschränkte Funktionalität unserer Website zur
              Folge haben.
            </p>
            <p className="mt-4 leading-relaxed">
              Das Setzen von Cookies, die zur Ausübung elektronischer
              Kommunikationsvorgänge oder der Bereitstellung bestimmter, von
              Ihnen erwünschter Funktionen (z.B. Warenkorb) notwendig sind,
              erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Als Betreiber
              dieser Website haben wir ein berechtigtes Interesse an der
              Speicherung von Cookies zur technisch fehlerfreien und
              reibungslosen Bereitstellung unserer Dienste. Sofern die Setzung
              anderer Cookies (z.B. für Analyse-Funktionen) erfolgt, werden
              diese in dieser Datenschutzerklärung separat behandelt.
            </p>

            <LegalSubTitle>Google Analytics</LegalSubTitle>
            <p className="leading-relaxed">
              Unsere Website verwendet Funktionen des Webanalysedienstes Google
              Analytics. Anbieter des Webanalysedienstes ist die Google Inc.,
              1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.
            </p>
            <p className="mt-4 leading-relaxed">
              Google Analytics verwendet „Cookies.“ Das sind kleine Textdateien,
              die Ihr Webbrowser auf Ihrem Endgerät speichert und eine Analyse
              der Website-Benutzung ermöglichen. Mittels Cookie erzeugte
              Informationen über Ihre Benutzung unserer Website werden an einen
              Server von Google übermittelt und dort gespeichert.
              Server-Standort ist im Regelfall die USA.
            </p>
            <p className="mt-4 leading-relaxed">
              Das Setzen von Google-Analytics-Cookies erfolgt auf Grundlage von
              Art. 6 Abs. 1 lit. f DSGVO. Als Betreiber dieser Website haben wir
              ein berechtigtes Interesse an der Analyse des Nutzerverhaltens, um
              unser Webangebot und ggf. auch Werbung zu optimieren.
            </p>

            <LegalSubTitle>IP-Anonymisierung</LegalSubTitle>
            <p className="leading-relaxed">
              Wir setzen Google Analytics in Verbindung mit der Funktion
              IP-Anonymisierung ein. Sie gewährleistet, dass Google Ihre
              IP-Adresse innerhalb von Mitgliedstaaten der Europäischen Union
              oder in anderen Vertragsstaaten des Abkommens über den Europäischen
              Wirtschaftsraum vor der Übermittlung in die USA kürzt. Es kann
              Ausnahmefälle geben, in denen Google die volle IP-Adresse an einen
              Server in den USA überträgt und dort kürzt. In unserem Auftrag
              wird Google diese Informationen benutzen, um Ihre Nutzung der
              Website auszuwerten, um Reports über Websiteaktivitäten zu
              erstellen und um weitere mit der Websitenutzung und der
              Internetnutzung verbundene Dienstleistungen gegenüber uns zu
              erbringen. Es findet keine Zusammenführung der von Google
              Analytics übermittelten IP-Adresse mit anderen Daten von Google
              statt.
            </p>

            <LegalSubTitle>Browser Plugin</LegalSubTitle>
            <p className="leading-relaxed">
              Das Setzen von Cookies durch Ihren Webbrowser ist verhinderbar.
              Einige Funktionen unserer Website könnten dadurch jedoch
              eingeschränkt werden. Ebenso können Sie die Erfassung von Daten
              bezüglich Ihrer Website-Nutzung einschließlich Ihrer IP-Adresse
              mitsamt anschließender Verarbeitung durch Google unterbinden. Dies
              ist möglich, indem Sie das über folgenden Link erreichbare
              Browser-Plugin herunterladen und installieren:{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout?hl=de"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
              .
            </p>

            <LegalSubTitle>Widerspruch gegen die Datenerfassung</LegalSubTitle>
            <p className="leading-relaxed">
              Sie können die Erfassung Ihrer Daten durch Google Analytics
              verhindern, indem Sie auf folgenden Link klicken. Es wird ein
              Opt-Out-Cookie gesetzt, der die Erfassung Ihrer Daten bei
              zukünftigen Besuchen unserer Website verhindert:{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout?hl=de"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics deaktivieren
              </a>
              .
            </p>

            <p className="mt-4 leading-relaxed">
              Einzelheiten zum Umgang mit Nutzerdaten bei Google Analytics
              finden Sie in der Datenschutzerklärung von Google:{" "}
              <a
                href="https://policies.google.com/privacy?hl=de"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
              .
            </p>

            <LegalSubTitle>Auftragsverarbeitung</LegalSubTitle>
            <p className="leading-relaxed">
              Zur vollständigen Erfüllung der gesetzlichen Datenschutzvorgaben
              haben wir mit Google einen Vertrag über die Auftragsverarbeitung
              abgeschlossen.
            </p>

            <LegalSubTitle>Demografische Merkmale bei Google Analytics</LegalSubTitle>
            <p className="leading-relaxed">
              Unsere Website verwendet die Funktion „demografische Merkmale“ von
              Google Analytics. Mit ihr lassen sich Berichte erstellen, die
              Aussagen zu Alter, Geschlecht und Interessen der Seitenbesucher
              enthalten. Diese Daten stammen aus interessenbezogener Werbung von
              Google sowie aus Besucherdaten von Drittanbietern. Eine Zuordnung
              der Daten zu einer bestimmten Person ist nicht möglich. Sie können
              diese Funktion jederzeit deaktivieren. Dies ist über die
              Anzeigeneinstellungen in Ihrem Google-Konto möglich oder indem Sie
              die Erfassung Ihrer Daten durch Google Analytics, wie im Punkt
              „Widerspruch gegen die Datenerfassung“ erläutert, generell
              untersagen.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
