import { getSiteUrl } from "@/lib/site-url";

const structuredData = () => {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "@id": `${url}/#organization`,
    name: "ENEX Fahrzeugpflege",
    legalName: "Enex GmbH",
    url,
    description:
      "Professionelle mobile Fahrzeugpflege – Buchung und Serviceinformationen online.",
    image: `${url}/opengraph-image`,
    telephone: "+49-7233-9749801",
    email: "hallo@enexdetailing.de",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bahnhofstr. 59",
      addressLocality: "Niefern-Öschelbronn",
      postalCode: "75223",
      addressCountry: "DE",
    },
    priceRange: "$$",
    areaServed: {
      "@type": "State",
      name: "Baden-Württemberg",
    },
    serviceType: [
      "Mobile Fahrzeugpflege",
      "Fahrzeugaufbereitung",
      "Innenreinigung Fahrzeug",
    ],
  };
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData()),
      }}
    />
  );
}
