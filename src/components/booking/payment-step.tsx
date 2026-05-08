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
import Link from "next/link";
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
  } | null>(null);
  const {
    location,
    package: pkg,
    dateTime,
    contactDetails,
    payment,
    setPayment,
    setCouponAdjustment,
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

  useEffect(() => {
    return () => setCouponAdjustment(null);
  }, [setCouponAdjustment]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    setPayment(data);

    try {
      // Calculate final price with discount (in cents for consistency)
      const finalPriceInCents = Math.round(finalPrice.eur * 100);

      // Step 1: Create booking (final amount computed on server from line items + coupon)
      const bookingResult = await createBooking({
        location,
        package: pkg,
        dateTime,
        contactDetails,
        payment: data,
      });

      if (!bookingResult.success || !bookingResult.bookingId) {
        alert(bookingResult.message || "Buchung konnte nicht erstellt werden");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create payment intent (use the same finalPriceInCents)
      const amountInCents = finalPriceInCents;
      const paymentIntentResult = await createPaymentIntent(
        amountInCents,
        "eur",
        bookingResult.reference!,
        contactDetails!.email,
        bookingResult.bookingId
      );

      if (!paymentIntentResult.success || !paymentIntentResult.paymentIntentId) {
        alert(
          paymentIntentResult.message || "Zahlung konnte nicht gestartet werden"
        );
        setIsSubmitting(false);
        return;
      }

      // Phase 2: Stripe Elements + real PI confirmation (see phase2-stripe-notes.ts)
      // Phase 1: short delay only — no card processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 4: Confirm booking after payment succeeds
      const confirmResult = await confirmBooking(
        bookingResult.bookingId,
        paymentIntentResult.paymentIntentId!,
        amountInCents
      );

      if (!confirmResult.success) {
        alert(confirmResult.message || "Buchung konnte nicht bestätigt werden");
        setIsSubmitting(false);
        return;
      }

      // Step 5: Navigate to confirmation page with booking reference
      resetBooking();
      router.push(`/booking/confirmation?reference=${bookingResult.reference}`);
    } catch (error) {
      console.error("Error processing booking:", error);
      alert("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => {
    const couponCode = couponCodeValue || payment?.couponCode;
    if (!couponCode || !couponCode.trim()) {
      alert("Bitte geben Sie einen Gutscheincode ein");
      return;
    }

    setApplyingCoupon(true);
    try {
      const result = await applyCoupon(couponCode, totalPrice.eur * 100); // Convert to cents

      if (
        result.success &&
        result.discount !== undefined &&
        result.discountedPrice !== undefined
      ) {
        setCouponApplied(true);
        setDiscount(result.discount);
        // Convert discounted price back from cents to euros
        const discountedEur = result.discountedPrice / 100;
        setDiscountedPrice({ eur: discountedEur });
        setCouponAdjustment({
          discountCents: result.discount,
          discountedTotalEur: discountedEur,
        });
        // Update payment data with coupon code
        if (payment) {
          setPayment({
            ...payment,
            couponCode: couponCode,
          });
        }
      } else {
        alert(result.message || "Gutscheincode ungültig");
        setCouponApplied(false);
        setDiscount(0);
        setDiscountedPrice(null);
        setCouponAdjustment(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      alert("Der Gutscheincode konnte nicht angewendet werden");
      setCouponAdjustment(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Buchung 5/5 – Zahlung & Bestätigung
      </h1>

      {/* Order Summary */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-3">
          Übersicht: Datum, Adresse, Paket, Gesamt (inkl. MwSt.)
        </h2>
        <div className="space-y-2 text-sm">
          {dateTime && (
            <div className="flex justify-between">
              <span className="text-gray-600">Datum & Uhrzeit:</span>
              <span className="font-medium">
                {format(dateTime.date, "PPP", { locale: de })} -{" "}
                {dateTime.timeSlot}
              </span>
            </div>
          )}

          {location && (
            <div className="flex justify-between">
              <span className="text-gray-600">Adresse:</span>
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
                  <span className="text-gray-600">Zusatzoptionen:</span>
                  <span className="font-medium">
                    {pkg.addOns.map((a) => a.name).join(", ")}
                  </span>
                </div>
              )}
            </>
          )}

          {couponApplied && discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Rabatt:</span>
              <span>-€{(discount / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold">
              <span>Gesamt (inkl. MwSt.):</span>
              <span>€{finalPrice.eur}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment method: real card UI coming later — overlay for now */}
        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="p-4 opacity-[0.62] select-none" aria-hidden="true">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-700">
                Kartenzahlung (3DS/SCA)
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Die Zahlung wird sicher per 3D Secure abgewickelt
            </p>
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-white/45 backdrop-blur-[1px]">
            <span className="rounded-md border border-gray-300/80 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-800 shadow-sm">
              Demnächst
            </span>
            <span className="max-w-[240px] text-center text-sm font-medium text-gray-800">
              Online-Kartenzahlung folgt in Kürze
            </span>
          </div>
        </div>

        {/* Coupon Code */}
        <div>
          <label
            htmlFor="couponCode"
            className="block text-sm font-medium mb-2"
          >
            Gutscheincode
          </label>
          <div className="flex gap-2">
            <Input
              id="couponCode"
              type="text"
              placeholder="Gutscheincode eingeben"
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
              {applyingCoupon ? "Wird angewendet…" : "Anwenden"}
            </Button>
          </div>
        </div>

        {/* Legal Checkboxes */}
        <div className="space-y-4 border rounded-lg p-4">
          <label
            htmlFor="agreedToTerms"
            className="flex cursor-pointer items-start gap-2 text-sm leading-relaxed"
          >
            <input
              type="checkbox"
              id="agreedToTerms"
              {...register("agreedToTerms")}
              className="w-4 h-4 mt-1 shrink-0"
            />
            <span className={errors.agreedToTerms ? "text-red-500" : ""}>
              Ich akzeptiere die{" "}
              <Link
                href="/agb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                onClick={(e) => e.stopPropagation()}
              >
                AGB
              </Link>
              .
            </span>
          </label>
          {errors.agreedToTerms && (
            <p className="text-red-500 text-sm">
              {errors.agreedToTerms.message}
            </p>
          )}

          <label
            htmlFor="agreedToPrivacy"
            className="flex cursor-pointer items-start gap-2 text-sm leading-relaxed"
          >
            <input
              type="checkbox"
              id="agreedToPrivacy"
              {...register("agreedToPrivacy")}
              className="w-4 h-4 mt-1 shrink-0"
            />
            <span className={errors.agreedToPrivacy ? "text-red-500" : ""}>
              Ich habe die{" "}
              <Link
                href="/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-enex-primary underline decoration-gray-300 underline-offset-2 hover:decoration-enex-primary"
                onClick={(e) => e.stopPropagation()}
              >
                Datenschutzerklärung
              </Link>{" "}
              zur Kenntnis genommen.
            </span>
          </label>
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
                Ich stimme zu, dass die Leistung innerhalb von 14 Tagen beginnen
                kann.
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
            Zurück
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-enex-primary hover:bg-enex-hover text-white disabled:opacity-50"
          >
            {isSubmitting ? "Wird verarbeitet…" : "Buchung bestätigen"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
