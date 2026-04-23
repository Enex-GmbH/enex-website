import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passwort vergessen",
  description: "Link zum Zurücksetzen Ihres ENEX-Passworts anfordern.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
