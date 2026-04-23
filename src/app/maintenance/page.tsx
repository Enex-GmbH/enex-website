import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wartung",
  description:
    "Die Website von ENEX Fahrzeugpflege wird gerade gewartet. Bitte versuchen Sie es später erneut.",
  robots: { index: false, follow: false, nocache: true },
};

export default function MaintenancePage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-gray-50">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
          Wartung
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Wir sind gleich wieder da
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Unsere Website wird gerade gewartet. Bitte versuchen Sie es in Kürze
          erneut. Vielen Dank für Ihr Verständnis.
        </p>
        <p className="mt-8 text-sm text-gray-500">
          Administrator?{" "}
          <Link
            href="/login"
            className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700"
          >
            Anmelden
          </Link>
        </p>
      </div>
    </main>
  );
}
