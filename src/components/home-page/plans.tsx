import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Car, CarFront, Check, Clock, Sparkles, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLANS_MARKETING,
  type PlanVehicleClass,
} from "@/lib/data/plans-marketing";

const VEHICLE_ICONS: Record<PlanVehicleClass, LucideIcon> = {
  kleinwagen: CarFront,
  standard: Car,
  suv: Truck,
};

/** Equal card height on large screens; long lists scroll inside. */
const CARD_LG_HEIGHT = "lg:h-[min(88vh,52rem)]";

const Plans = () => {
  return (
    <section className="bg-gray-50/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-10 py-12 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
              Pakete
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Unsere Pakete – Für jedes Fahrzeug die passende Pflege
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Jedes Fahrzeug hat unterschiedliche Anforderungen. Deshalb bieten
              wir Ihnen drei klar strukturierte Pakete – von der gründlichen
              Innenreinigung bis zur vollständigen Premium-Aufbereitung.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6 lg:items-stretch">
            {PLANS_MARKETING.map((plan) => (
              <article
                key={plan.key}
                className={cn(
                  "flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm",
                  CARD_LG_HEIGHT,
                  plan.featuredVisual
                    ? "border-gray-900 shadow-md ring-1 ring-black/5"
                    : "border-gray-200"
                )}
              >
                <div
                  className={cn(
                    "relative flex h-32 shrink-0 items-center justify-center sm:h-36",
                    "overflow-hidden bg-gray-200"
                  )}
                >
                  {plan.popular && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Beliebt
                    </span>
                  )}
                  <Image
                    src={plan.imageSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 32vw"
                    priority={plan.key === "basic"}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <div
                    className={cn(
                      "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-4 pt-5 md:px-7 md:pt-6",
                      "[scrollbar-width:thin] [scrollbar-color:rgb(209_213_219)_transparent]"
                    )}
                  >
                    <header className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {plan.subtitle}
                      </p>
                      {plan.callout && (
                        <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">
                          {plan.callout}
                        </p>
                      )}
                    </header>

                    <div className="mt-5 flex flex-col gap-5">
                      {plan.sections.map((section) => (
                        <div key={section.title} className="space-y-2.5">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-900">
                            {section.title}
                          </p>
                          <ul className="flex flex-col gap-2.5">
                            {section.items.map((item) => (
                              <li key={item} className="flex gap-3">
                                <span
                                  className={cn(
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                    plan.featuredVisual
                                      ? "bg-black text-white"
                                      : "bg-gray-200 text-gray-600"
                                  )}
                                >
                                  <Check
                                    className="h-3 w-3"
                                    strokeWidth={3}
                                    aria-hidden
                                  />
                                </span>
                                <span className="text-sm leading-snug text-gray-700">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {plan.closing && (
                      <p className="mt-5 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">
                        {plan.closing}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 space-y-3 border-t border-gray-200 bg-white px-6 py-5 md:px-7">
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5 text-sm text-gray-700">
                        <Clock
                          className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                          aria-hidden
                        />
                        <span>{plan.duration}</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm text-gray-700">
                        <Car
                          className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                          aria-hidden
                        />
                        <span>{plan.forLabel}</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm text-gray-700">
                        <Sparkles
                          className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                          aria-hidden
                        />
                        <span>{plan.idealShort}</span>
                      </div>
                      {plan.priceTiers && plan.priceTiers.length > 0 && (
                        <div className="pt-1">
                          <ul className="flex flex-col gap-2.5">
                            {plan.priceTiers.map((tier) => {
                              const Icon = VEHICLE_ICONS[tier.vehicleClass];
                              return (
                                <li
                                  key={`${plan.key}-${tier.vehicleClass}`}
                                  className="flex items-center gap-3"
                                >
                                  <span
                                    className={cn(
                                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                      plan.featuredVisual
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-700"
                                    )}
                                    aria-hidden
                                  >
                                    <Icon
                                      className="h-[1.15rem] w-[1.15rem]"
                                      strokeWidth={1.75}
                                    />
                                  </span>
                                  <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 sm:justify-start">
                                    <span className="text-lg font-bold tabular-nums text-gray-900">
                                      €{tier.priceEur}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {tier.label}
                                    </span>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          {plan.priceFootnote && (
                            <p className="mt-2.5 text-xs text-gray-500">
                              — {plan.priceFootnote}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
