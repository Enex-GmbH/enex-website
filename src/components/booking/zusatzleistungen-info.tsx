"use client";

import type { AddOn } from "@/store/booking-store";
import {
  ZUSATZLEISTUNGEN_FOOTNOTE,
  ZUSATZLEISTUNGEN_INTRO,
  ZUSATZLEISTUNGEN_KATALOG,
  ZUSATZLEISTUNGEN_TITLE,
} from "@/lib/data/zusatzleistungen";
import { cn } from "@/lib/utils";

type Props = {
  selectedIds: Set<string>;
  onToggle: (addOn: AddOn) => void;
};

export function ZusatzleistungenPicklist({ selectedIds, onToggle }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 md:p-5">
      <h2 className="text-lg font-bold text-gray-900">{ZUSATZLEISTUNGEN_TITLE}</h2>
      <p className="mt-2 text-sm font-medium text-gray-800">
        {ZUSATZLEISTUNGEN_INTRO}
      </p>

      <div className="mt-5 space-y-6">
        {ZUSATZLEISTUNGEN_KATALOG.map((section) => (
          <div key={section.heading}>
            <h3 className="text-sm font-semibold text-gray-900">
              {section.heading}
            </h3>
            <ul className="mt-3 space-y-2">
              {section.addOns.map((addOn) => {
                const checked = selectedIds.has(addOn.id);
                return (
                  <li key={addOn.id}>
                    <label
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                        checked
                          ? "border-enex-primary bg-enex-primary/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(addOn)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-enex-primary"
                      />
                      <span className="min-w-0 flex-1 leading-snug text-gray-800">
                        {addOn.name}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-gray-900">
                        +{addOn.priceEur} €
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-gray-200 pt-4 text-sm italic text-gray-600">
        {ZUSATZLEISTUNGEN_FOOTNOTE}
      </p>
    </div>
  );
}
