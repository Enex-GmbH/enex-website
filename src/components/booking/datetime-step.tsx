"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dateTimeSchema,
  DateTimeFormData,
} from "@/lib/validations/booking-schemas";
import { useBookingStore } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getAvailableTimeSlots } from "@/lib/actions/getAvailableTimeSlots";
import {
  BOOKING_SLOTS_WEEKDAY,
  BOOKING_SLOT_EXCLUSIVE_WEEKDAY,
  filterSlotsEligibleForBookingDay,
  getExpectedBookingTimeSlots,
  isBookingDaySelectable,
  isSameBookingCalendarDay,
} from "@/lib/booking-time-slots";

export default function DateTimeStep() {
  const router = useRouter();
  const { dateTime, setDateTime, isStepComplete, package: pkg } =
    useBookingStore();
  const selectedPlan = pkg?.selectedPlan ?? "basic";

  // Erste wählbare Buchung; gespeicherter Tag nur wenn gültig und nicht in der Vergangenheit
  const getInitialDate = (): Date => {
    const today = startOfDay(new Date());

    const firstSelectableFrom = (anchor: Date) => {
      for (let i = 0; i < 28; i++) {
        const cand = startOfDay(addDays(anchor, i));
        if (
          isBookingDaySelectable(cand, selectedPlan) &&
          !isBefore(cand, today)
        ) {
          return cand;
        }
      }
      return startOfDay(today);
    };

    if (dateTime?.date) {
      const storedDate =
        dateTime.date instanceof Date ? dateTime.date : new Date(dateTime.date);
      const day = startOfDay(storedDate);
      if (
        !isBefore(day, today) &&
        isBookingDaySelectable(day, selectedPlan)
      ) {
        return storedDate;
      }
    }

    return firstSelectableFrom(today);
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    getInitialDate()
  );

  const [selectedTime, setSelectedTime] = useState<string | undefined>(() => {
    if (!dateTime?.date || !dateTime?.timeSlot) return undefined;
    const plan = pkg?.selectedPlan ?? "basic";
    const d =
      dateTime.date instanceof Date ? dateTime.date : new Date(dateTime.date);
    const expected = getExpectedBookingTimeSlots(startOfDay(d), plan);
    return expected.some((s) => s === dateTime.timeSlot)
      ? dateTime.timeSlot
      : undefined;
  });

  // Initialize weekStart to the week containing the selected date (or today)
  const getInitialWeekStart = (): Date => {
    const dateToUse = selectedDate || new Date();
    return startOfWeek(dateToUse, { weekStartsOn: 1 });
  };

  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart());
  const [availableSlots, setAvailableSlots] = useState<
    { time: string; available: boolean }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DateTimeFormData>({
    resolver: zodResolver(dateTimeSchema),
    defaultValues: dateTime
      ? {
          // Ensure date is a Date object (it might be a string from persisted storage)
          date:
            dateTime.date instanceof Date
              ? dateTime.date
              : new Date(dateTime.date),
          timeSlot: dateTime.timeSlot,
        }
      : undefined,
  });

  useEffect(() => {
    if (!isStepComplete(2)) {
      router.push("/booking/package");
    }
  }, [isStepComplete, router]);

  /** Paketwechsel: Datum zurücksetzen, wenn für das Paket kein Slot mehr existiert (z. B. So) */
  useEffect(() => {
    setSelectedDate((prev) =>
      prev && !isBookingDaySelectable(prev, selectedPlan)
        ? undefined
        : prev
    );
  }, [selectedPlan]);

  useEffect(() => {
    if (selectedDate) {
      setValue("date", selectedDate);
      // Update weekStart to show the week containing the selected date
      const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      setWeekStart(newWeekStart);
    }
  }, [selectedDate, setValue]);

  useEffect(() => {
    if (selectedTime) {
      setValue("timeSlot", selectedTime);
    }
  }, [selectedTime, setValue]);

  useEffect(() => {
    if (!selectedTime || availableSlots.length === 0) return;
    const stillOk = availableSlots.some(
      (s) => s.time === selectedTime && s.available
    );
    if (!stillOk) setSelectedTime(undefined);
  }, [availableSlots, selectedTime]);

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      const localExpected = getExpectedBookingTimeSlots(
        selectedDate,
        selectedPlan
      );

      getAvailableTimeSlots(selectedDate, selectedPlan)
        .then((slots) => {
          if (localExpected.length === 0) {
            setAvailableSlots([]);
          } else if (slots.length > 0) {
            setAvailableSlots(
              filterSlotsEligibleForBookingDay(slots, selectedDate)
            );
          } else {
            setAvailableSlots(
              filterSlotsEligibleForBookingDay(
                localExpected.map((time) => ({ time, available: true })),
                selectedDate
              )
            );
          }
          setLoadingSlots(false);
        })
        .catch((error) => {
          console.error("Error fetching time slots:", error);
          if (localExpected.length === 0) {
            setAvailableSlots([]);
          } else {
            setAvailableSlots(
              filterSlotsEligibleForBookingDay(
                localExpected.map((time) => ({ time, available: true })),
                selectedDate
              )
            );
          }
          setLoadingSlots(false);
        });
    } else {
      const preview =
        selectedPlan === "exclusive"
          ? [BOOKING_SLOT_EXCLUSIVE_WEEKDAY]
          : [...BOOKING_SLOTS_WEEKDAY];
      setAvailableSlots(
        preview.map((time) => ({
          time,
          available: false,
        }))
      );
    }
  }, [selectedDate, selectedPlan]);

  useEffect(() => {
    if (loadingSlots || !selectedDate) return;
    const free = availableSlots.filter((s) => s.available);
    if (free.length !== 1) return;
    const only = free[0].time;
    setSelectedTime((t) => (t === only ? t : only));
  }, [loadingSlots, availableSlots, selectedDate]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get today's date at start of day for comparison
  const today = startOfDay(new Date());

  // Check if a date is in the past
  const isPastDate = (date: Date): boolean => {
    return isBefore(startOfDay(date), today);
  };

  // Check if previous week would contain any valid (non-past) dates
  const canGoToPrevWeek = (): boolean => {
    const prevWeekStart = addDays(weekStart, -7);
    const prevWeekLastDay = addDays(prevWeekStart, 6);
    return !isPastDate(prevWeekLastDay);
  };

  const handlePrevWeek = () => {
    if (canGoToPrevWeek()) {
      setWeekStart(addDays(weekStart, -7));
    }
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const onSubmit = (data: DateTimeFormData) => {
    // Ensure date is a Date object before storing
    const dateTimeData = {
      date: data.date instanceof Date ? data.date : new Date(data.date),
      timeSlot: data.timeSlot,
    };
    setDateTime(dateTimeData);
    router.push("/booking/details");
  };

  const expectedSlotsForPicker = selectedDate
    ? getExpectedBookingTimeSlots(selectedDate, selectedPlan)
    : [];

  const hasAnySameDaySlotNotYetStarted =
    !!selectedDate &&
    expectedSlotsForPicker.length > 0 &&
    filterSlotsEligibleForBookingDay(
      expectedSlotsForPicker.map((time) => ({ time, available: true })),
      selectedDate
    ).length > 0;

  const allSameDaySlotsHaveStarted =
    !!selectedDate &&
    expectedSlotsForPicker.length > 0 &&
    !hasAnySameDaySlotNotYetStarted &&
    !loadingSlots &&
    isSameBookingCalendarDay(selectedDate, new Date());

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buchung 3/5 – Datum & Uhrzeit</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Calendar Week Navigator */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevWeek}
              disabled={!canGoToPrevWeek()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2 overflow-x-auto">
              {weekDays.map((day) => {
                const isSelected =
                  selectedDate &&
                  format(selectedDate, "yyyy-MM-dd") ===
                    format(day, "yyyy-MM-dd");
                const isPast = isPastDate(day);
                const closed = !isBookingDaySelectable(day, selectedPlan);
                const disabledPick = isPast || closed;
                const dayLabel = format(day, "EEE", { locale: de });
                const dateLabel = format(day, "d");

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => !disabledPick && setSelectedDate(day)}
                    disabled={disabledPick}
                    className={cn(
                      "flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-colors min-w-[60px]",
                      isSelected
                        ? "border-enex-primary bg-enex-primary text-white"
                        : disabledPick
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                          : "border-gray-200 hover:border-enex-primary"
                    )}
                  >
                    <span className="text-xs font-medium">{dayLabel}</span>
                    <span className="text-lg font-bold">{dateLabel}</span>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Uhrzeit wählen{" "}
            {!selectedDate && "(zuerst ein Datum wählen)"}
          </label>
          {loadingSlots ? (
            <div className="text-center py-4 text-gray-500">Wird geladen…</div>
          ) : selectedDate && expectedSlotsForPicker.length === 0 ? (
            <div className="text-center py-4 text-gray-600 text-sm">
              An diesem Tag ist keine Buchung möglich (geschlossen).
            </div>
          ) : allSameDaySlotsHaveStarted ? (
            <div className="text-center py-4 text-gray-700 text-sm leading-relaxed">
              Für den heutigen Tag beginnen keine Zeitfenster mehr in der Zukunft.
              Bitte wählen Sie einen anderen Buchungstag.
            </div>
          ) : availableSlots.length > 0 ? (
            <div
              className={cn(
                "grid gap-3",
                availableSlots.length === 1
                  ? "grid-cols-1 max-w-sm"
                  : "grid-cols-1 sm:grid-cols-2"
              )}
            >
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isDisabled = !slot.available || !selectedDate;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => !isDisabled && setSelectedTime(slot.time)}
                    disabled={isDisabled}
                    className={cn(
                      "p-3 rounded-lg border-2 font-medium transition-colors",
                      isSelected &&
                        slot.available &&
                        selectedDate &&
                        "border-enex-primary bg-enex-primary text-white",
                      !isSelected &&
                        slot.available &&
                        selectedDate &&
                        "border-gray-200 hover:border-enex-primary",
                      isDisabled &&
                        "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {slot.time} {!slot.available && "(belegt)"}
                    {!selectedDate && slot.available && " (Datum wählen)"}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Bitte wählen Sie ein Datum
            </div>
          )}
          {errors.timeSlot && (
            <p className="text-red-500 text-sm mt-2">
              {errors.timeSlot.message}
            </p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Zurück
          </Button>
          <Button
            type="submit"
            disabled={!selectedDate || !selectedTime}
            className="flex-1 bg-enex-primary hover:bg-enex-hover text-white disabled:opacity-50"
          >
            Weiter
          </Button>
        </div>
      </form>
    </Card>
  );
}
