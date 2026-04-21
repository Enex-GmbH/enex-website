"use client";

import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Standort", path: "/booking/location" },
  { number: 2, label: "Fahrzeug & Paket", path: "/booking/package" },
  { number: 3, label: "Datum & Uhrzeit", path: "/booking/datetime" },
  { number: 4, label: "Angaben", path: "/booking/details" },
  { number: 5, label: "Zahlung", path: "/booking/payment" },
];

export default function BookingStepper() {
  const pathname = usePathname();

  const currentStepIndex = steps.findIndex((step) =>
    pathname.includes(step.path)
  );
  const currentStep = currentStepIndex + 1;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                    isCompleted && "bg-green-600 text-white",
                    isCurrent && "bg-enex-primary text-white",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-600"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs md:text-sm font-medium text-center max-w-[100px]",
                    isCurrent && "text-enex-primary font-semibold",
                    isCompleted && "text-green-600",
                    !isCompleted && !isCurrent && "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-1 mx-2">
                  <div
                    className={cn(
                      "h-full rounded transition-colors",
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
