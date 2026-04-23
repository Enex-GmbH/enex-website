import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anmelden",
  description: "Melden Sie sich bei Ihrem ENEX-Konto an.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
