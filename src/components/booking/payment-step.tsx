"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentSchema,
  PaymentFormData,
} from "@/lib/validations/booking-schemas";
import { useBookingStore } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Tag } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  applyCoupon,
  createBooking,
  createPaymentIntent,
  confirmBooking,
} from "@/lib/actions";

export default function PaymentStep() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState<{
    eur: number;
    dkr: number;
  } | null>(null);
  const {
    location,
    package: pkg,
    dateTime,
    contactDetails,
    payment,
    setPayment,
    isStepComplete,
    getTotalPrice,
    resetBooking,
  } = useBookingStore();

  const totalPrice = getTotalPrice();
  const finalPrice = discountedPrice || totalPrice;

  const {
    register,
    handleSubmit,
    watch,
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

  const couponCodeValue = watch("couponCode");

  useEffect(() => {
    if (!isStepComplete(4)) {
      router.push("/booking/details");
    }
  }, [isStepComplete, router]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    setPayment(data);

    try {
      // Calculate final price with discount (in cents for consistency)
      const finalPriceInCents = Math.round(finalPrice.eur * 100);

      // Step 1: Create booking in database with discounted price
      const bookingResult = await createBooking(
        {
          location,
          package: pkg,
          dateTime,
          contactDetails,
          payment: data,
        },
        finalPriceInCents // Pass discounted price in cents
      );

      if (!bookingResult.success || !bookingResult.bookingId) {
        alert(bookingResult.message || "Rezervasyon oluşturulamadı");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create payment intent (use the same finalPriceInCents)
      const amountInCents = finalPriceInCents;
      const paymentIntentResult = await createPaymentIntent(
        amountInCents,
        "eur",
        bookingResult.reference!,
        contactDetails!.email
      );

      if (!paymentIntentResult.success || !paymentIntentResult.clientSecret) {
        alert(paymentIntentResult.message || "Ödeme işlemi başlatılamadı");
        setIsSubmitting(false);
        return;
      }

      // TODO: Step 3: Integrate Stripe Elements here
      // For now, we'll simulate payment success
      // In production, you would:
      // 1. Use Stripe Elements to collect card details
      // 2. Confirm the payment intent with Stripe
      // 3. Wait for payment confirmation

      // Simulate payment confirmation (remove this when Stripe is integrated)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 4: Confirm booking after payment succeeds
      const confirmResult = await confirmBooking(
        bookingResult.bookingId,
        paymentIntentResult.paymentIntentId!,
        amountInCents
      );

      if (!confirmResult.success) {
        alert(confirmResult.message || "Rezervasyon onaylanamadı");
        setIsSubmitting(false);
        return;
      }

      // Step 5: Navigate to confirmation page with booking reference
      resetBooking();
      router.push(`/booking/confirmation?reference=${bookingResult.reference}`);
    } catch (error) {
      console.error("Error processing booking:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    const couponCode = couponCodeValue || payment?.couponCode;
    if (!couponCode || !couponCode.trim()) {
      alert("Lütfen bir kupon kodu girin");
      return;
    }

    setApplyingCoupon(true);
    try {
      const result = await applyCoupon(couponCode, totalPrice.eur * 100); // Convert to cents

      if (result.success && result.discount && result.discountedPrice) {
        setCouponApplied(true);
        setDiscount(result.discount);
        // Convert discounted price back from cents to euros
        const discountedEur = result.discountedPrice / 100;
        // Calculate DKK equivalent (assuming same ratio)
        const ratio = totalPrice.dkr / totalPrice.eur;
        const newDiscountedPrice = {
          eur: discountedEur,
          dkr: Math.round(discountedEur * ratio),
        };
        setDiscountedPrice(newDiscountedPrice);
        // Update payment data with coupon code
        if (payment) {
          setPayment({
            ...payment,
            couponCode: couponCode,
          });
        }
      } else {
        alert(result.message || "Kupon kodu geçersiz");
        setCouponApplied(false);
        setDiscount(0);
        setDiscountedPrice(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      alert("Kupon kodu uygulanırken bir hata oluştu");
    } finally {
      setApplyingCoupon(false);
    }
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Rezervasyon 5/5 - Ödeme & Onaylar
      </h1>

      {/* Order Summary */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-3">
          Özet: Tarih/Saat, Adres, Paket, Toplam (KDV dahil)
        </h2>
        <div className="space-y-2 text-sm">
          {dateTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tarih/Saat:</span>
              <span className="font-medium">
                {format(dateTime.date, "PPP", { locale: de })} -{" "}
                {dateTime.timeSlot}
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
                <span className="font-medium capitalize">
                  {pkg.selectedPlan}
                </span>
              </div>

              {pkg.addOns.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Add-ons:</span>
                  <span className="font-medium">
                    {pkg.addOns.map((a) => a.name).join(", ")}
                  </span>
                </div>
              )}
            </>
          )}

          {couponApplied && discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>İndirim:</span>
              <span>-€{(discount / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold">
              <span>TOPLAM (KDV dahil):</span>
              <span>
                €{finalPrice.eur} / {finalPrice.dkr}kr
              </span>
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
          <label
            htmlFor="couponCode"
            className="block text-sm font-medium mb-2"
          >
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
              disabled={applyingCoupon || !couponCodeValue?.trim()}
              className="flex-shrink-0"
            >
              <Tag className="w-4 h-4 mr-2" />
              {applyingCoupon ? "Uygulanıyor..." : "Uygula"}
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
            <p className="text-red-500 text-sm">
              {errors.agreedToTerms.message}
            </p>
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
            <p className="text-red-500 text-sm">
              {errors.agreedToPrivacy.message}
            </p>
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
            <p className="text-red-500 text-sm">
              {errors.agreedToService.message}
            </p>
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
