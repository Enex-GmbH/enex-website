"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  packageSchema,
  PackageFormData,
} from "@/lib/validations/booking-schemas";
import {
  useBookingStore,
  AddOn,
  CarType,
  normalizeCarType,
} from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZusatzleistungenPicklist } from "@/components/booking/zusatzleistungen-info";
import { ZUSATZLEISTUNGEN_BY_ID } from "@/lib/data/zusatzleistungen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlanBaseEur, type PlanPriceKey } from "@/lib/pricing";

const eurFmt = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Alte Checkbox-IDs → neuer Katalog (Preisliste 2026). */
const ADDON_ID_LEGACY: Record<string, string> = {
  "spezial-glas-nano": "spezial-glas",
  "premium-innen-nano": "premium-dachhimmel",
};

/** Map stored add-on ids to the current catalog so prices stay in sync. */
function normalizeCatalogAddOns(addOns: AddOn[] | undefined): AddOn[] {
  if (!addOns?.length) return [];
  return addOns.map((a) => {
    const id = ADDON_ID_LEGACY[a.id] ?? a.id;
    return ZUSATZLEISTUNGEN_BY_ID[id] ?? a;
  });
}

export default function PackageStep() {
  const router = useRouter();
  const { package: pkg, setPackage, finalizePackageStep, isStepComplete } =
    useBookingStore();
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>(() =>
    normalizeCatalogAddOns(pkg?.addOns)
  );

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema) as Resolver<PackageFormData>,
    defaultValues: {
      carType: normalizeCarType(pkg?.carType),
      selectedPlan: pkg?.selectedPlan ?? "basic",
      addOns: normalizeCatalogAddOns(pkg?.addOns),
    },
  });

  const carType = watch("carType");
  const selectedPlan = watch("selectedPlan");

  const effectiveCarType = useMemo(
    () => normalizeCarType(carType ?? pkg?.carType),
    [carType, pkg?.carType]
  );

  const selectedAddOnIds = useMemo(
    () => new Set(selectedAddOns.map((a) => a.id)),
    [selectedAddOns]
  );

  useEffect(() => {
    setPackage({
      carType: effectiveCarType,
      selectedPlan: selectedPlan ?? "basic",
      addOns: selectedAddOns,
    });
  }, [effectiveCarType, selectedPlan, selectedAddOns, setPackage]);

  useEffect(() => {
    setValue("addOns", selectedAddOns);
  }, [selectedAddOns, setValue]);

  useEffect(() => {
    if (!isStepComplete(1)) {
      router.push("/booking/location");
    }
  }, [isStepComplete, router]);

  const handleCarTypeChange = (value: CarType) => {
    setValue("carType", value);
  };

  const handlePlanSelect = (plan: "basic" | "premium" | "exclusive") => {
    setValue("selectedPlan", plan);
  };

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      }
      return [...prev, addOn];
    });
  };

  const onSubmit = (data: PackageFormData) => {
    finalizePackageStep({
      ...data,
      addOns: data.addOns ?? selectedAddOns,
    });
    router.push("/booking/datetime");
  };

  const plans: { id: PlanPriceKey; key: string }[] = [
    { id: "basic", key: "basicPlan" },
    { id: "premium", key: "premiumPlan" },
    { id: "exclusive", key: "exclusivePlan" },
  ];

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Buchung 2/5 – Fahrzeug, Paket & Extras
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Car Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Fahrzeugklasse
          </label>
          <Select value={carType} onValueChange={handleCarTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Fahrzeugklasse wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kleinwagen">Kleinwagen</SelectItem>
              <SelectItem value="standardwagen">Standardwagen</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
            </SelectContent>
          </Select>
          {errors.carType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.carType.message}
            </p>
          )}
        </div>

        {/* Package Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Paketauswahl</label>
          <p className="text-sm text-muted-foreground mb-3">
            Paketpreis für Ihre Fahrzeugklasse (inkl. MwSt.).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const planPriceEur = getPlanBaseEur(plan.id, effectiveCarType);
              return (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={cn(
                    "border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-enex-primary",
                    selectedPlan === plan.id
                      ? "border-enex-primary bg-enex-primary/5"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">
                      {plan.key === "basicPlan" && "Basis-Paket"}
                      {plan.key === "premiumPlan" && "Premium-Paket"}
                      {plan.key === "exclusivePlan" && "Exclusive-Paket"}
                    </h3>
                    {selectedPlan === plan.id && (
                      <CheckCircle2 className="w-5 h-5 text-enex-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-enex-primary tabular-nums">
                    {eurFmt.format(planPriceEur)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    zzgl. Anfahrt / Zusatzleistungen
                  </p>
                </div>
              );
            })}
          </div>
          {errors.selectedPlan && (
            <p className="text-red-500 text-sm mt-1">
              {errors.selectedPlan.message}
            </p>
          )}
        </div>

        {/* Zusatzleistungen */}
        <div>
          <label className="mb-3 block text-sm font-medium">
            Zusatzleistungen (optional)
          </label>
          <ZusatzleistungenPicklist
            selectedIds={selectedAddOnIds}
            onToggle={toggleAddOn}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Zurück
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-enex-primary hover:bg-enex-hover text-white"
          >
            Weiter
          </Button>
        </div>
      </form>
    </Card>
  );
}
