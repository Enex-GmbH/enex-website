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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LocationStep() {
  const router = useRouter();
  const { location, setLocation } = useBookingStore();
  const [tollFeeEur, setTollFeeEur] = useState(0);

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
  const zone = watch("zone");

  // Calculate toll fee based on zone
  useEffect(() => {
    if (zone === "outside") {
      setTollFeeEur(9);
    } else {
      setTollFeeEur(0);
    }
  }, [zone]);

  // Determine zone based on postal code
  // Pforzheim and Karlsruhe postal codes are inside the service zone
  useEffect(() => {
    if (postalCode && postalCode.length >= 5) {
      // Check if postal code is in supported cities (Pforzheim or Karlsruhe)
      const pforzheimCodes = ["75172", "75173", "75175", "75177", "75179", "75180", "75181", "75217", "75223", "75210", "75196"];
      const karlsruheCodes = ["76131", "76133", "76135", "76137", "76139", "76149", "76185", "76187", "76189", "76227", "76228", "76327", "76307"];
      
      if (pforzheimCodes.includes(postalCode) || karlsruheCodes.includes(postalCode)) {
        setValue("zone", "inside");
      } else {
        setValue("zone", "outside");
      }
    }
  }, [postalCode, setValue]);

  const onSubmit = (data: LocationFormData) => {
    setLocation({
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
