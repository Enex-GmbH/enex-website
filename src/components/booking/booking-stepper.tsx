"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Standort", path: "/booking/location" },
  { number: 2, label: "Fahrzeug & Paket", path: "/booking/package" },
  { number: 3, label: "Datum & Uhrzeit", path: "/booking/datetime" },
  { number: 4, label: "Angaben", path: "/booking/details" },
  { number: 5, label: "Zahlung", path: "/booking/payment" },
] as const;

function StepCircle(props: {
  stepNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  compact?: boolean;
}) {
  const { stepNumber, isCompleted, isCurrent, compact } = props;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors",
        compact
          ? "h-9 w-9 text-sm"
          : "h-10 w-10 text-base",
        isCompleted && "bg-green-600 text-white",
        isCurrent && "bg-enex-primary text-white",
        !isCompleted && !isCurrent && "bg-gray-200 text-gray-600"
      )}
    >
      {isCompleted ? (
        <CheckCircle2 className={compact ? "h-5 w-5" : "h-6 w-6"} />
      ) : (
        stepNumber
      )}
    </div>
  );
}

export default function BookingStepper() {
  const pathname = usePathname();

  const currentStepIndex = steps.findIndex((step) =>
    pathname.includes(step.path)
  );
  const currentStepNumber =
    currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
  const currentLabel =
    currentStepIndex >= 0
      ? steps[currentStepIndex].label
      : steps[0].label;

  return (
    <div className="w-full">
      {/* Mobile: dots + bars only; step name below (full width) */}
      <div className="flex w-full items-center px-0.5 md:hidden">
        {steps.map((step, index) => {
          const isCompleted = currentStepNumber > step.number;
          const isCurrent = currentStepNumber === step.number;
          const isLast = index === steps.length - 1;

          return (
            <Fragment key={step.number}>
              <div className="flex shrink-0 flex-col items-center">
                <StepCircle
                  stepNumber={step.number}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  compact
                />
              </div>
              {!isLast && (
                <div className="mx-0 flex h-1 min-h-1 min-w-2 flex-1 px-1" aria-hidden>
                  <div
                    className={cn(
                      "h-full w-full rounded-full transition-colors",
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* md+: labels under each bullet */}
      <div className="hidden md:flex md:w-full md:items-center md:justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStepNumber > step.number;
          const isCurrent = currentStepNumber === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex min-w-0 flex-1 items-center">
              <div className="flex w-full min-w-0 flex-col items-center">
                <StepCircle
                  stepNumber={step.number}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                />
                <span
                  className={cn(
                    "mt-2 max-w-[min(140px,12vw)] text-center text-sm font-medium leading-tight lg:max-w-[160px]",
                    isCurrent && "font-semibold text-enex-primary",
                    isCompleted && "text-green-600",
                    !isCompleted && !isCurrent && "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
                {isCurrent && step.number === 5 && (
                  <span className="mt-1 max-w-[min(140px,12vw)] text-center text-[10px] font-medium leading-tight text-gray-500 lg:max-w-[160px] lg:text-xs">
                    Demnächst
                  </span>
                )}
              </div>

              {!isLast && (
                <div className="mx-3 h-1 min-w-[1.5rem] flex-1 lg:mx-5" aria-hidden>
                  <div
                    className={cn(
                      "h-full rounded-full transition-colors",
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: readable current step (replaces cramped under-dot labels) */}
      <div className="mt-4 border-t border-gray-100 pt-4 text-center md:hidden">
        <p className="text-sm text-gray-600">
          Schritt {currentStepNumber} von {steps.length}
        </p>
        <p className="mt-1 text-base font-semibold leading-snug text-enex-primary">
          {currentLabel}
        </p>
        {currentStepNumber === 5 && (
          <p className="mt-2 text-xs font-medium text-gray-500">Demnächst</p>
        )}
      </div>
    </div>
  );
}
