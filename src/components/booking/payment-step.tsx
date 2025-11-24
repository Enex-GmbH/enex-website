"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormData } from "@/lib/validations/booking-schemas";
import { useBookingStore } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Tag } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function PaymentStep() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    location,
    package: pkg,
    dateTime,
    contactDetails,
    payment,
    setPayment,
    isStepComplete,
    getTotalPrice
  } = useBookingStore();

  const totalPrice = getTotalPrice();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: payment || {
      couponCode: "",
      agreedToTerms: false,
      agreedToPrivacy: false,
      agreedToService: false,
    },
  });

  useEffect(() => {
    if (!isStepComplete(4)) {
      router.push("/de/booking/details");
    }
  }, [isStepComplete, router]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    setPayment(data);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    router.push("/de/booking/confirmation");
  };

  const handleApplyCoupon = () => {
    // Handle coupon validation
    alert("Kupon kodu uygulanıyor...");
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rezervasyon 5/5 - Ödeme & Onaylar</h1>

      {/* Order Summary */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-3">Özet: Tarih/Saat, Adres, Paket, Toplam (KDV dahil)</h2>
        <div className="space-y-2 text-sm">
          {dateTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tarih/Saat:</span>
              <span className="font-medium">
                {format(dateTime.date, "PPP", { locale: de })} - {dateTime.timeSlot}
              </span>
            </div>
          )}

          {location && (
            <div className="flex justify-between">
              <span className="text-gray-600">Adres:</span>
              <span className="font-medium">{location.address}</span>
            </div>
          )}

          {pkg && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Paket:</span>
                <span className="font-medium capitalize">{pkg.selectedPlan}</span>
              </div>

              {pkg.addOns.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Add-ons:</span>
                  <span className="font-medium">{pkg.addOns.map(a => a.name).join(', ')}</span>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold">
              <span>TOPLAM (KDV dahil):</span>
              <span>€{totalPrice.eur} / {totalPrice.dkr}kr</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment Method Section */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-enex-primary" />
            <h3 className="font-semibold">Kart Ödeme (3DS/SCA)</h3>
          </div>
          <p className="text-sm text-gray-600">
            Ödeme 3D Secure ile güvenli şekilde işlenecektir
          </p>
        </div>

        {/* Coupon Code */}
        <div>
          <label htmlFor="couponCode" className="block text-sm font-medium mb-2">
            Kupon Kodu
          </label>
          <div className="flex gap-2">
            <Input
              id="couponCode"
              type="text"
              placeholder="Kupon kodunuzu girin"
              {...register("couponCode")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCoupon}
              className="flex-shrink-0"
            >
              <Tag className="w-4 h-4 mr-2" />
              Uygula
            </Button>
          </div>
        </div>

        {/* Legal Checkboxes */}
        <div className="space-y-4 border rounded-lg p-4">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreedToTerms"
              {...register("agreedToTerms")}
              className="w-4 h-4 mt-1"
            />
            <label htmlFor="agreedToTerms" className="text-sm">
              <span className={errors.agreedToTerms ? "text-red-500" : ""}>
                AGB & Datenschutz
              </span>
            </label>
          </div>
          {errors.agreedToTerms && (
            <p className="text-red-500 text-sm">{errors.agreedToTerms.message}</p>
          )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreedToPrivacy"
              {...register("agreedToPrivacy")}
              className="w-4 h-4 mt-1"
            />
            <label htmlFor="agreedToPrivacy" className="text-sm">
              <span className={errors.agreedToPrivacy ? "text-red-500" : ""}>
                İptal/erteleme politikasını onaylıyorum
              </span>
            </label>
          </div>
          {errors.agreedToPrivacy && (
            <p className="text-red-500 text-sm">{errors.agreedToPrivacy.message}</p>
          )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreedToService"
              {...register("agreedToService")}
              className="w-4 h-4 mt-1"
            />
            <label htmlFor="agreedToService" className="text-sm">
              <span className={errors.agreedToService ? "text-red-500" : ""}>
                Hizmetin 14 gün içinde başlamasına açık onay veriyorum
              </span>
            </label>
          </div>
          {errors.agreedToService && (
            <p className="text-red-500 text-sm">{errors.agreedToService.message}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            Geri
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-enex-primary hover:bg-enex-hover text-white disabled:opacity-50"
          >
            {isSubmitting ? "İşleniyor..." : "Ödemeyi tamamla"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
