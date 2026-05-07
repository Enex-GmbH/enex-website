"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  locationSchema,
  LocationFormData,
} from "@/lib/validations/booking-schemas";
import { useBookingStore } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PostalCodeSelect } from "@/components/ui/postal-code-select";
import { isInsideServiceZone } from "@/lib/data/postal-codes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LocationStep() {
  const router = useRouter();
  const { location, setLocation, finalizeLocationStep } = useBookingStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      postalCode: location?.postalCode || "",
      address: location?.address || "",
      zone: location?.zone || "inside",
      hasWater: location?.hasWater ?? false,
      hasElectricity: location?.hasElectricity ?? false,
    },
  });

  const postalCode = watch("postalCode");
  const address = watch("address");
  const zone = watch("zone");
  const hasWater = watch("hasWater");
  const hasElectricity = watch("hasElectricity");

  // Keep sidebar / pricing in sync before "Weiter".
  useEffect(() => {
    const fee = zone === "outside" ? 9 : 0;
    setLocation({
      postalCode: postalCode ?? "",
      address: address ?? "",
      zone: zone ?? "inside",
      tollFeeEur: fee,
      hasWater: !!hasWater,
      hasElectricity: !!hasElectricity,
    });
  }, [
    postalCode,
    address,
    zone,
    hasWater,
    hasElectricity,
    setLocation,
  ]);

  // Determine zone based on postal code (nur gebuchte PLZ-Liste = ohne Zuschlag)
  useEffect(() => {
    if (postalCode && postalCode.length >= 5) {
      setValue("zone", isInsideServiceZone(postalCode) ? "inside" : "outside");
    }
  }, [postalCode, setValue]);

  const onSubmit = (data: LocationFormData) => {
    const tollFeeEur = data.zone === "outside" ? 9 : 0;
    finalizeLocationStep({
      ...data,
      address: data.address ?? "",
      tollFeeEur,
    });
    router.push("/booking/package");
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buchung 1/5 – Standort</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Postal Code */}
        <div>
          <label
            htmlFor="postalCode"
            className="block text-sm font-medium mb-2"
          >
            PLZ
          </label>
          <PostalCodeSelect
            value={postalCode}
            onValueChange={(value) => {
              setValue("postalCode", value);
            }}
            placeholder="PLZ auswählen"
            className={errors.postalCode ? "border-red-500" : ""}
          />
          {errors.postalCode && (
            <p className="text-red-500 text-sm mt-1">
              {errors.postalCode.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Adresse
          </label>
          <Input
            id="address"
            type="text"
            autoComplete="street-address"
            placeholder="Straße und Hausnummer"
            {...register("address")}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Utilities */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasWater"
              {...register("hasWater")}
              className="w-4 h-4 text-enex-primary"
            />
            <label htmlFor="hasWater" className="text-sm">
              Wasseranschluss vorhanden
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasElectricity"
              {...register("hasElectricity")}
              className="w-4 h-4 text-enex-primary"
            />
            <label htmlFor="hasElectricity" className="text-sm">
              Stromanschluss vorhanden
            </label>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          type="submit"
          className="w-full bg-enex-primary hover:bg-enex-hover text-white"
        >
          Weiter
        </Button>
      </form>
    </Card>
  );
}
