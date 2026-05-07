"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Clock, Car, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLANS_MARKETING,
  type PlanVehicleClass,
} from "@/lib/data/plans-marketing";
import {
  ZUSATZLEISTUNGEN_INTRO,
  ZUSATZLEISTUNGEN_KATALOG,
  ZUSATZLEISTUNGEN_FOOTNOTE,
} from "@/lib/data/zusatzleistungen";
import { Button } from "@/components/ui/button";

const VEHICLE_TABS: { key: PlanVehicleClass; label: string }[] = [
  { key: "kleinwagen", label: "Kleinwagen" },
  { key: "standard", label: "Standardwagen" },
  { key: "suv", label: "SUV / große Fahrzeuge" },
];

const eurFmt = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function PreisePaketeContent() {
  const [vehicle, setVehicle] = useState<PlanVehicleClass>("kleinwagen");

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Paketpreise — spacing below page hero „Preise & Pakete“ */}
      <section className="container mx-auto max-w-6xl px-4 pt-12 md:pt-16 lg:pt-20">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Paketpreise
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              Wählen Sie Ihre Fahrzeugklasse – alle Paketpreise aktualisieren sich
              entsprechend. Alle Beträge inklusive MwSt.&nbsp;Zzgl.
              Anfahrtspauschale bei Buchung.
            </p>
          </div>
          <Button asChild className="shrink-0 bg-enex-primary hover:bg-enex-hover text-white">
            <Link href="/booking/package">Paket wählen &amp; buchen</Link>
          </Button>
        </div>

        <div
          className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
          role="tablist"
          aria-label="Fahrzeugklasse"
        >
          {VEHICLE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={vehicle === tab.key}
              className={cn(
                "flex-1 min-w-[8.5rem] rounded-lg px-4 py-3 text-sm font-semibold transition-colors md:text-base",
                vehicle === tab.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => setVehicle(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {PLANS_MARKETING.map((plan) => {
            const tier = plan.priceTiers?.find((t) => t.vehicleClass === vehicle);
            const priceEur = tier?.priceEur ?? null;

            return (
              <article
                key={plan.key}
                className={cn(
                  "flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm",
                  /* Equal card height from lg upward; shorter lists leave empty footer (scroll still works) */
                  "max-h-[min(92vh,48rem)] min-h-[28rem] lg:h-[42rem]",
                  plan.featuredVisual
                    ? "border-gray-900 shadow-md ring-1 ring-black/5"
                    : "border-gray-200"
                )}
              >
                <div className="relative h-36 shrink-0 bg-gray-200">
                  {plan.popular && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Beliebt
                    </span>
                  )}
                  <Image
                    src={plan.imageSrc}
                    alt={`Paketvisual ${plan.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw,33vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <div className="flex min-h-0 flex-1 flex-col p-6 md:p-7">
                  <header className="shrink-0 border-b border-gray-100 pb-5">
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {plan.subtitle}
                    </p>
                    {plan.callout && (
                      <p className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs leading-relaxed text-gray-800 md:text-sm">
                        {plan.callout}
                      </p>
                    )}
                    {priceEur != null ? (
                      <p className="mt-5 text-3xl font-bold tabular-nums text-enex-primary md:text-4xl">
                        {eurFmt.format(priceEur)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-gray-500">
                      {[tier?.label, plan.priceFootnote]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </header>

                  <div
                    className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain pb-2 pr-1 pt-5 [scrollbar-gutter:stable]"
                    aria-label={`Leistungen für ${plan.title}`}
                  >
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex gap-2">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <span>{plan.duration}</span>
                      </div>
                      <div className="flex gap-2">
                        <Car className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <span>{plan.forLabel}</span>
                      </div>
                      <div className="flex gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <span>{plan.idealShort}</span>
                      </div>
                    </div>

                    {plan.sections.map((section) => (
                      <div key={section.title} className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-900">
                          {section.title}
                        </p>
                        <ul className="flex flex-col gap-2">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-2.5 text-sm text-gray-700">
                              <Check
                                className={cn(
                                  "mt-0.5 h-4 w-4 shrink-0",
                                  plan.featuredVisual
                                    ? "text-gray-900"
                                    : "text-enex-primary"
                                )}
                                strokeWidth={2.5}
                                aria-hidden
                              />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {plan.closing && (
                      <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800">
                        {plan.closing}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Zusatzleistungen — Preisliste */}
      <section className="border-t border-gray-200 bg-gray-50/80 py-14">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {ZUSATZLEISTUNGEN_INTRO}
          </h2>
          <p className="mt-2 max-w-2xl text-gray-600">
            Ergänzen Sie Ihr gebuchtes Paket mit optionalen Services. Die Auswahl
            erfolgt in der Online-Buchung.
          </p>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {ZUSATZLEISTUNGEN_KATALOG.map((block) => (
              <div key={block.heading}>
                <h3 className="text-lg font-semibold text-gray-900">
                  {block.heading}
                </h3>
                <ul className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                  {block.addOns.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span className="leading-snug text-gray-800">{a.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-gray-900">
                        {eurFmt.format(a.priceEur)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-gray-600">{ZUSATZLEISTUNGEN_FOOTNOTE}</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
          Jetzt Termin sichern
        </h2>
        <p className="mt-3 text-gray-600">
          Wählen Sie Paket, Ort und Zeit – unverbindlich nach Ihren Vorstellungen.
        </p>
        <Button
          asChild
          className="mt-6 bg-enex-primary hover:bg-enex-hover text-white"
          size="lg"
        >
          <Link href="/booking/location">Zur Buchung</Link>
        </Button>
      </section>
    </div>
  );
}
