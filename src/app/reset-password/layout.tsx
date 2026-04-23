import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen",
  description: "Neues Passwort für Ihr ENEX-Konto festlegen.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
