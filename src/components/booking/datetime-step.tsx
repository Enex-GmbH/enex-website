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
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getAvailableTimeSlots } from "@/lib/actions/getAvailableTimeSlots";

const defaultTimeSlots = ["09:30", "11:00", "13:00", "15:00", "17:00"];

export default function DateTimeStep() {
  const router = useRouter();
  const { dateTime, setDateTime, isStepComplete } = useBookingStore();

  // Initialize selectedDate: use stored date, or default to today
  // If stored date is in the past, reset to today
  const getInitialDate = (): Date => {
    const today = startOfDay(new Date());
    if (dateTime?.date) {
      const storedDate =
        dateTime.date instanceof Date ? dateTime.date : new Date(dateTime.date);
      // If stored date is in the past, use today instead
      if (isBefore(startOfDay(storedDate), today)) {
        return new Date();
      }
      return storedDate;
    }
    return new Date(); // Default to today
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    getInitialDate()
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    dateTime?.timeSlot
  );

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

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      getAvailableTimeSlots(selectedDate)
        .then((slots) => {
          // Ensure we always have slots to display
          if (slots.length > 0) {
            setAvailableSlots(slots);
          } else {
            // Fallback to default slots if empty
            setAvailableSlots(
              defaultTimeSlots.map((time) => ({ time, available: true }))
            );
          }
          setLoadingSlots(false);
        })
        .catch((error) => {
          console.error("Error fetching time slots:", error);
          // Fallback to all slots as available
          setAvailableSlots(
            defaultTimeSlots.map((time) => ({ time, available: true }))
          );
          setLoadingSlots(false);
        });
    } else {
      // When no date is selected, show default slots as available
      // This allows users to see what slots are available before selecting a date
      setAvailableSlots(
        defaultTimeSlots.map((time) => ({ time, available: false }))
      );
    }
  }, [selectedDate]);

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
                const dayLabel = format(day, "EEE", { locale: de });
                const dateLabel = format(day, "d");

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => !isPast && setSelectedDate(day)}
                    disabled={isPast}
                    className={cn(
                      "flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-colors min-w-[60px]",
                      isSelected
                        ? "border-enex-primary bg-enex-primary text-white"
                        : isPast
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
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
