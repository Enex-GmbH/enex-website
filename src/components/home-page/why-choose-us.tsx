import type { LucideIcon } from "lucide-react";
import { Paintbrush, Sparkles, Wind, Truck } from "lucide-react";

const benefits: {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Card + icon colors (Tailwind classes) */
  theme: {
    card: string;
    iconWrap: string;
    icon: string;
    titleAccent: string;
  };
}[] = [
  {
    icon: Paintbrush,
    title: "Lackschonung & Werterhalt",
    body: "Unsere Methoden und Produkte sind speziell darauf ausgelegt, den Lack Ihres Fahrzeugs schonend zu reinigen und langfristig zu schützen. Durch professionelle Aufbereitung bleibt der Wert Ihres Fahrzeugs erhalten – und oft wird er sogar gesteigert.",
    theme: {
      card:
        "border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-white hover:border-amber-300/90",
      iconWrap: "bg-amber-100 ring-1 ring-amber-200/60",
      icon: "text-amber-700",
      titleAccent: "text-amber-950",
    },
  },
  {
    icon: Sparkles,
    title: "Sauberkeit auf Premium-Niveau",
    body: "Wir reinigen nicht nur oberflächlich – wir gehen ins Detail. Jede Ecke, jede Fläche und jedes Material wird gezielt behandelt, um ein perfektes Gesamtbild zu schaffen.",
    theme: {
      card:
        "border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-white hover:border-sky-300/90",
      iconWrap: "bg-sky-100 ring-1 ring-sky-200/60",
      icon: "text-sky-700",
      titleAccent: "text-sky-950",
    },
  },
  {
    icon: Wind,
    title: "Hygiene & Wohlbefinden",
    body: "Ein sauberer Innenraum bedeutet nicht nur Optik, sondern auch Gesundheit und Komfort. Durch gründliche Reinigung und moderne Verfahren sorgen wir für ein frisches und hygienisches Fahrgefühl.",
    theme: {
      card:
        "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-white hover:border-emerald-300/90",
      iconWrap: "bg-emerald-100 ring-1 ring-emerald-200/60",
      icon: "text-emerald-700",
      titleAccent: "text-emerald-950",
    },
  },
  {
    icon: Truck,
    title: "Mobiler Service – direkt bei Ihnen",
    body: "Sie sparen Zeit – wir kommen zu Ihnen. Unser mobiler Service ermöglicht Ihnen eine professionelle Fahrzeugaufbereitung ohne Aufwand und Wartezeit.",
    theme: {
      card:
        "border-[color-mix(in_oklab,var(--enex-primary)_22%,transparent)] bg-gradient-to-br from-[color-mix(in_oklab,var(--enex-primary)_6%,white)] via-white to-white hover:border-[color-mix(in_oklab,var(--enex-primary)_35%,transparent)]",
      iconWrap:
        "bg-[color-mix(in_oklab,var(--enex-primary)_12%,white)] ring-1 ring-[color-mix(in_oklab,var(--enex-primary)_22%,transparent)]",
      icon: "text-[var(--enex-primary)]",
      titleAccent: "text-gray-900",
    },
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-10 py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="bg-gradient-to-r from-gray-900 via-enex-primary to-gray-900 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Warum Enex?
            </h2>
            <p className="mt-3 text-lg font-medium text-enex-primary md:text-xl">
              Qualität, die man sieht und spürt
            </p>
            <p className="mt-6 text-left text-base leading-relaxed text-gray-700 md:text-center">
              Ein Fahrzeug ist mehr als nur ein Fortbewegungsmittel – es ist
              Wert, Komfort und oft auch Leidenschaft. Genau deshalb setzen wir
              bei Enex auf höchste Qualität, professionelle Pflege und
              nachhaltigen Werterhalt.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              const { theme } = benefit;
              return (
                <div
                  key={benefit.title}
                  className={`rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${theme.card}`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${theme.iconWrap}`}
                      aria-hidden
                    >
                      <Icon
                        className={`h-6 w-6 ${theme.icon}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-lg font-semibold ${theme.titleAccent}`}
                      >
                        {benefit.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-700 md:text-base">
                        {benefit.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
