import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const metadataBase = new URL(siteUrl);
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase,
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  title: {
    default: "ENEX Fahrzeugpflege",
    template: "%s | ENEX Fahrzeugpflege",
  },
  description:
    "Professionelle mobile Fahrzeugpflege in Baden-Württemberg: Aufbereitung, Innenreinigung und Schutz – bequem online buchen.",
  applicationName: "ENEX Fahrzeugpflege",
  keywords: [
    "mobile Fahrzeugpflege",
    "Fahrzeugaufbereitung",
    "Auto Innenreinigung",
    "Niefern-Öschelbronn",
    "Baden-Württemberg",
    "ENEX",
    "Termin buchen",
  ],
  authors: [{ name: "Enex GmbH" }],
  creator: "Enex GmbH",
  publisher: "Enex GmbH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "ENEX Fahrzeugpflege",
    title: "ENEX Fahrzeugpflege",
    description:
      "Professionelle mobile Fahrzeugpflege – online buchen, Service vor Ort.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ENEX Fahrzeugpflege",
    description:
      "Professionelle mobile Fahrzeugpflege – online buchen, Service vor Ort.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Automotive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <QueryProvider>
          <AuthSessionProvider>
            <Header />
            {children}
            <Footer />
          </AuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
