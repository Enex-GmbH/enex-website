"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { packageSchema, PackageFormData } from "@/lib/validations/booking-schemas";
import { useBookingStore, AddOn, CarType } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckCircle2, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const availableAddOns: AddOn[] = [
  {
    id: "ozone",
    name: "Ozon",
    priceEur: 29,
    priceDkr: 15,
    durationMinutes: 0,
  },
  {
    id: "rim-polish",
    name: "Jant Parlatma",

    priceEur: 25,
    priceDkr: 15,
    durationMinutes: 0,
  },
  {
    id: "deep-clean",
    name: "Yoğun tüy temizliği",
    priceEur: 39,
    priceDkr: 0,
    durationMinutes: 0,
  },
  {
    id: "window-cleaner",
    name: "Cam su itici",
    priceEur: 15,
    priceDkr: 0,
    durationMinutes: 0,
  },
];

export default function PackageStep() {
  const router = useRouter();
  const t = useTranslations("HOME.plans");
  const { package: pkg, setPackage, isStepComplete } = useBookingStore();
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>(pkg?.addOns || []);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: pkg || {
      carType: undefined,
      selectedPlan: undefined,
      addOns: [],
    },
  });

  const carType = watch("carType");
  const selectedPlan = watch("selectedPlan");

  useEffect(() => {
    if (!isStepComplete(1)) {
      router.push("/de/booking/location");
    }
  }, [isStepComplete, router]);

  const handleCarTypeChange = (value: CarType) => {
    setValue("carType", value);
  };

  const handlePlanSelect = (plan: "basic" | "premium" | "exclusive") => {
    setValue("selectedPlan", plan);
  };

  const toggleAddOn = (addOn: AddOn) => {
    const exists = selectedAddOns.find((a) => a.id === addOn.id);
    if (exists) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addOn.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const onSubmit = (data: PackageFormData) => {
    setPackage({
      ...data,
      addOns: selectedAddOns,
    });
    router.push("/de/booking/datetime");
  };

  const plans = [
    { id: "basic", key: "basicPlan" },
    { id: "premium", key: "premiumPlan" },
    { id: "exclusive", key: "exclusivePlan" },
  ];

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rezervasyon 2/5 - Araç & Paket & Ekstralar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Car Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Araç Tipi: [Sedan] [SUV] [Van]
          </label>
          <Select value={carType} onValueChange={handleCarTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Araç tipini seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sedan">Sedan</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Hatchback">Hatchback</SelectItem>
              <SelectItem value="Coupe">Coupe</SelectItem>
            </SelectContent>
          </Select>
          {errors.carType && (
            <p className="text-red-500 text-sm mt-1">{errors.carType.message}</p>
          )}
        </div>

        {/* Package Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Paket Seçimi</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id as "basic" | "premium" | "exclusive")}
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-enex-primary",
                  selectedPlan === plan.id
                    ? "border-enex-primary bg-enex-primary/5"
                    : "border-gray-200"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{t(`${plan.key}.title`)}</h3>
                  {selectedPlan === plan.id && (
                    <CheckCircle2 className="w-5 h-5 text-enex-primary" />
                  )}
                </div>
                <div className="text-sm space-y-1 text-gray-600">
                  <p>Seçenekler</p>
                  <p>Süre</p>
                  <p className="font-semibold text-gray-900">
                    KDV dahil fiyat<br />[Seç]
                  </p>
                </div>
              </div>
            ))}
          </div>
          {errors.selectedPlan && (
            <p className="text-red-500 text-sm mt-1">{errors.selectedPlan.message}</p>
          )}
        </div>

        {/* Add-ons */}
        <div>
          <label className="block text-sm font-medium mb-3">Ekstralar:</label>
          <div className="space-y-2">
            {availableAddOns.map((addOn) => {
              const isSelected = selectedAddOns.find((a) => a.id === addOn.id);
              return (
                <div
                  key={addOn.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:border-enex-primary cursor-pointer"
                  onClick={() => toggleAddOn(addOn)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => { }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{addOn.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    +{addOn.priceEur}€ / +{addOn.priceDkr}dk
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Geri
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-enex-primary hover:bg-enex-hover text-white"
          >
            Devam
          </Button>
        </div>
      </form>
    </Card>
  );
}
