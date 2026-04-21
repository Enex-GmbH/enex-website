import type { LucideIcon } from "lucide-react";
import { CalendarDays, CarFront, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps: {
  stepLabel: string;
  bgNum: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  detail: string;
}[] = [
  {
    stepLabel: "SCHRITT 01",
    bgNum: "01",
    icon: CalendarDays,
    title: "Buchen",
    tagline: "PLZ, Paket & Zeit wählen",
    detail:
      "Wählen Sie Ihren Standort, das gewünschte Reinigungspaket und einen passenden Termin aus.",
  },
  {
    stepLabel: "SCHRITT 02",
    bgNum: "02",
    icon: CarFront,
    title: "Wir kommen zu Ihnen",
    tagline: "Zuhause oder Arbeitsplatz",
    detail:
      "Unser professionelles Team kommt direkt zu Ihrem Standort – bequem und zeitsparend.",
  },
  {
    stepLabel: "SCHRITT 03",
    bgNum: "03",
    icon: Sparkles,
    title: "Sauberes Auto genießen",
    tagline: "Ohne Aufwand",
    detail:
      "Nach der Reinigung übergeben wir Ihnen Ihr Fahrzeug in gepflegtem Zustand – Sie müssen nichts weiter tun.",
  },
];

const HowItWorks = () => {
  return (
    <section>
      <div className="container mx-auto">
        <div className="flex flex-col gap-12 py-12 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
              Prozess
            </p>
            <h2 className="mt-3 text-4xl font-bold text-gray-900">
              So funktioniert&apos;s
            </h2>
            <p className="mt-3 text-lg text-gray-600 leading-relaxed">
              Einfach, schnell und transparent. In nur drei Schritten zu Ihrem
              sauberen Auto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.stepLabel}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm",
                    "transition-[border-color,box-shadow] duration-200",
                    "hover:border-gray-900 hover:shadow-md"
                  )}
                >
                  <span
                    className="pointer-events-none absolute right-2 top-1 z-0 select-none text-[4.5rem] font-bold leading-none text-gray-100 sm:text-[5.5rem] md:text-[4.25rem] lg:text-[5rem]"
                    aria-hidden
                  >
                    {step.bgNum}
                  </span>

                  <div className="relative z-10 flex flex-col gap-5">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                        "text-gray-700",
                        "group-hover:bg-black group-hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-900">
                        {step.stepLabel}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">{step.tagline}</p>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-700">
                      {step.detail}
                    </p>
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

export default HowItWorks;
