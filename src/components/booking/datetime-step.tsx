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
import { format, addDays, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

const timeSlots = ["09:30", "11:00", "13:00", "15:00", "17:00"];

// Mock availability data (in real app, fetch from backend)
const getTimeSlotAvailability = (date: Date, slot: string) => {
  // Simulate some slots being unavailable
  const dateStr = format(date, "yyyy-MM-dd");
  const unavailable = [`${dateStr}-11:00`, `${dateStr}-15:00`];
  return !unavailable.includes(`${dateStr}-${slot}`);
};

export default function DateTimeStep() {
  const router = useRouter();
  const { dateTime, setDateTime, isStepComplete } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateTime?.date
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    dateTime?.timeSlot
  );
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DateTimeFormData>({
    resolver: zodResolver(dateTimeSchema),
    defaultValues: dateTime || undefined,
  });

  useEffect(() => {
    if (!isStepComplete(2)) {
      router.push("/booking/package");
    }
  }, [isStepComplete, router]);

  useEffect(() => {
    if (selectedDate) {
      setValue("date", selectedDate);
    }
  }, [selectedDate, setValue]);

  useEffect(() => {
    if (selectedTime) {
      setValue("timeSlot", selectedTime);
    }
  }, [selectedTime, setValue]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const onSubmit = (data: DateTimeFormData) => {
    setDateTime(data);
    router.push("/booking/details");
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rezervasyon 3/5 - Tarih/Saat</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Calendar Week Navigator */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevWeek}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2 overflow-x-auto">
              {weekDays.map((day) => {
                const isSelected =
                  selectedDate &&
                  format(selectedDate, "yyyy-MM-dd") ===
                    format(day, "yyyy-MM-dd");
                const dayLabel = format(day, "EEE", { locale: de });
                const dateLabel = format(day, "d");

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-colors min-w-[60px]",
                      isSelected
                        ? "border-enex-primary bg-enex-primary text-white"
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
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium mb-3">
              Saat Seçimi
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {timeSlots.map((slot) => {
                const isAvailable = getTimeSlotAvailability(selectedDate, slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => isAvailable && setSelectedTime(slot)}
                    disabled={!isAvailable}
                    className={cn(
                      "p-3 rounded-lg border-2 font-medium transition-colors",
                      isSelected &&
                        isAvailable &&
                        "border-enex-primary bg-enex-primary text-white",
                      !isSelected &&
                        isAvailable &&
                        "border-gray-200 hover:border-enex-primary",
                      !isAvailable &&
                        "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {slot} {!isAvailable && "(disabled)"}
                    {isAvailable && !isSelected && "(aktif)"}
                  </button>
                );
              })}
            </div>
            {errors.timeSlot && (
              <p className="text-red-500 text-sm mt-2">
                {errors.timeSlot.message}
              </p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Geri
          </Button>
          <Button
            type="submit"
            disabled={!selectedDate || !selectedTime}
            className="flex-1 bg-enex-primary hover:bg-enex-hover text-white disabled:opacity-50"
          >
            Devam
          </Button>
        </div>
      </form>
    </Card>
  );
}
