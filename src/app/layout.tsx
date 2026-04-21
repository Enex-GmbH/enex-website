import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "ENEX Fahrzeugpflege",
  description:
    "Professionelle mobile Fahrzeugpflege – Buchung und Serviceinformationen.",
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
