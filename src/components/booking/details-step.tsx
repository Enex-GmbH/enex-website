"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactDetailsSchema,
  ContactDetailsFormData,
} from "@/lib/validations/booking-schemas";
import { useBookingStore } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DetailsStep() {
  const router = useRouter();
  const { contactDetails, setContactDetails, isStepComplete } =
    useBookingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactDetailsFormData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: contactDetails || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licensePlate: "",
      carMake: "",
      parkingNote: "",
    },
  });

  useEffect(() => {
    if (!isStepComplete(3)) {
      router.push("/de/booking/datetime");
    }
  }, [isStepComplete, router]);

  const onSubmit = (data: ContactDetailsFormData) => {
    setContactDetails(data);
    router.push("/de/booking/payment");
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rezervasyon 4/5 - Detaylar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium mb-2"
            >
              Ad
            </label>
            <Input
              id="firstName"
              type="text"
              {...register("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium mb-2"
            >
              Soyad
            </label>
            <Input
              id="lastName"
              type="text"
              {...register("lastName")}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            E-posta
          </label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Telefon
          </label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* License Plate (Optional) */}
        <div>
          <label
            htmlFor="licensePlate"
            className="block text-sm font-medium mb-2"
          >
            Plaka (opsiyonel)
          </label>
          <Input id="licensePlate" type="text" {...register("licensePlate")} />
        </div>

        {/* Car Make/Model (Optional) */}
        <div>
          <label htmlFor="carMake" className="block text-sm font-medium mb-2">
            Marka/Model
          </label>
          <Input
            id="carMake"
            type="text"
            placeholder="z.B. BMW 3er"
            {...register("carMake")}
          />
        </div>

        {/* Parking/Access Note */}
        <div>
          <label
            htmlFor="parkingNote"
            className="block text-sm font-medium mb-2"
          >
            Adres notu (park/erişim)
          </label>
          <textarea
            id="parkingNote"
            rows={4}
            {...register("parkingNote")}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="z.B. Hinterhof, 2. Stock, Tiefgarage..."
          />
        </div>

        {/* Water & Electricity Availability */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="hasWater" disabled className="w-4 h-4" />
            <label htmlFor="hasWater" className="text-sm">
              Su var
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasElectricity"
              disabled
              className="w-4 h-4"
            />
            <label htmlFor="hasElectricity" className="text-sm">
              Elektrik var
            </label>
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
            Ödemeye geç
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
