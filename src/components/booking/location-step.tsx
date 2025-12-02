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
import { PlacesAutocomplete } from "@/components/ui/places-autocomplete";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export default function LocationStep() {
  const router = useRouter();
  const { location, setLocation } = useBookingStore();
  const [tollFee, setTollFee] = useState({ eur: 0, dkr: 0 });

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
  const address = watch("address");

  // Calculate toll fee based on zone
  useEffect(() => {
    if (zone === "outside") {
      setTollFee({ eur: 9, dkr: 0 }); // 9€ toll for outside zone
    } else {
      setTollFee({ eur: 0, dkr: 0 });
    }
  }, [zone]);

  // Determine zone based on postal code (simplified logic)
  useEffect(() => {
    if (postalCode && postalCode.length >= 5) {
      const code = parseInt(postalCode);
      // Example: Berlin postal codes 10000-14999 are inside
      if (code >= 10000 && code <= 14999) {
        setValue("zone", "inside");
      } else {
        setValue("zone", "outside");
      }
    }
  }, [postalCode, setValue]);

  // Handle place selection from Google Places autocomplete
  const handlePlaceSelect = (place: {
    address: string;
    postalCode?: string;
    city?: string;
    country?: string;
  }) => {
    // Update address
    setValue("address", place.address);

    // Update postal code if provided
    if (place.postalCode) {
      setValue("postalCode", place.postalCode);
    }
  };

  const onSubmit = (data: LocationFormData) => {
    setLocation({
      ...data,
      tollFeeEur: tollFee.eur,
      tollFeeDkr: tollFee.dkr,
    });
    router.push("/booking/package");
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rezervasyon 1/5 - Konum</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Postal Code */}
        <div>
          <label
            htmlFor="postalCode"
            className="block text-sm font-medium mb-2"
          >
            PLZ
          </label>
          <Input
            id="postalCode"
            type="text"
            placeholder="z.B. 10115"
            {...register("postalCode")}
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
            Adres (autocomplete)
          </label>
          <PlacesAutocomplete
            id="address"
            value={address || ""}
            onChange={(value) => setValue("address", value)}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Straße und Hausnummer"
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
              Su var
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
              Elektrik var
            </label>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          type="submit"
          className="w-full bg-enex-primary hover:bg-enex-hover text-white"
        >
          Devam
        </Button>
      </form>
    </Card>
  );
}
