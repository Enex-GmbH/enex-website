"use client";

import BookingStepper from "@/components/booking/booking-stepper";
import BookingSummary from "@/components/booking/booking-summary";
import { usePathname } from "next/navigation";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isConfirmationPage = pathname === "/booking/confirmation";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {!isConfirmationPage && <BookingStepper />}
        <div
          className={`${isConfirmationPage ? "" : "mt-8"} grid grid-cols-1 ${isConfirmationPage ? "" : "lg:grid-cols-3"} gap-6`}
        >
          <div className={isConfirmationPage ? "" : "lg:col-span-2"}>
            {children}
          </div>
          {!isConfirmationPage && (
            <div className="lg:col-span-1">
              <BookingSummary />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
