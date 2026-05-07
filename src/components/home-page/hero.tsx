"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PostalCodeSelect } from "../ui/postal-code-select";
import { useState, useEffect, useCallback, useRef } from "react";
import { CalendarDays, CarFront, MapPin, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { de } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  useBookingStore,
  CarType,
  normalizeCarType,
} from "@/store/booking-store";
import { getFullyBookedDates } from "@/lib/actions/getFullyBookedDates";
import { cn } from "@/lib/utils";
import { isInsideServiceZone } from "@/lib/data/postal-codes";
import { motion } from "motion/react";
import {
  BOOKING_SLOTS_WEEKDAY,
  BOOKING_SLOT_EXCLUSIVE_WEEKDAY,
  getDefaultBookingTimeSlotForDate,
  getExpectedBookingTimeSlots,
  isBookingDaySelectable,
} from "@/lib/booking-time-slots";

const HeroBlob = () => {
  return (
    <div className="absolute inset-x-0 top-10 md:top-20 xl:top-40 -z-10 flex min-h-0 overflow-hidden pl-20 py-24">
      {/* Red blob */}
      <span className="block h-72 w-72 rounded-full bg-[#ef233c] opacity-10 mix-blend-multiply blur-3xl lg:h-96 lg:w-96" />

      {/* Teal blob */}
      <span className="mt-40 -ml-20 block h-72 w-72 rounded-full bg-[#04868b] opacity-10 mix-blend-multiply blur-3xl lg:h-96 lg:w-96 animate-delay-2000" />
    </div>
  );
};

function Hero() {
  const router = useRouter();
  const { setDateTime, location, package: pkg, dateTime } = useBookingStore();
  const heroPlan = pkg?.selectedPlan ?? "basic";

  // Initialize date from store if available
  const getInitialDate = (): Date | undefined => {
    if (dateTime?.date) {
      const storedDate =
        dateTime.date instanceof Date ? dateTime.date : new Date(dateTime.date);
      return storedDate;
    }
    return undefined;
  };

  const [postalCode, setPostalCode] = useState(location?.postalCode || "");
  const [carType, setCarType] = useState<CarType>(() =>
    normalizeCarType(pkg?.carType)
  );
  const [date, setDate] = useState<Date | undefined>(getInitialDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);

  // Sync date state with store when it changes
  useEffect(() => {
    if (dateTime?.date) {
      const storedDate =
        dateTime.date instanceof Date ? dateTime.date : new Date(dateTime.date);
      // Only update if different to avoid unnecessary re-renders
      if (
        !date ||
        format(date, "yyyy-MM-dd") !== format(storedDate, "yyyy-MM-dd")
      ) {
        setDate(storedDate);
      }
    }
  }, [dateTime?.date]);

  useEffect(() => {
    if (pkg?.carType == null) return;
    const next = normalizeCarType(pkg.carType);
    setCarType((prev) => (prev === next ? prev : next));
  }, [pkg?.carType]);

  /** Nach Session-Reset (z. B. Startseite) lokalen Hero-State leeren, sonst bleiben PLZ/Datum/Car sichtbar. */
  const prevHadBookingSlice = useRef<boolean | null>(null);
  useEffect(() => {
    const hasSlice = !!(location || pkg || dateTime);
    if (prevHadBookingSlice.current === null) {
      prevHadBookingSlice.current = hasSlice;
      return;
    }
    if (!hasSlice && prevHadBookingSlice.current) {
      setPostalCode("");
      setCarType(normalizeCarType(undefined));
      setDate(undefined);
    }
    prevHadBookingSlice.current = hasSlice;
  }, [location, pkg, dateTime]);

  // Ein Request pro Kalender-Öffnung bzw. Monatswechsel (kein Prefetch auf der Startseite).
  useEffect(() => {
    if (!isCalendarOpen) return;

    const startDate = startOfMonth(calendarMonth);
    const endDate = endOfMonth(addMonths(calendarMonth, 1));

    let cancelled = false;
    setIsLoadingBookedDates(true);
    getFullyBookedDates(startDate, endDate, heroPlan)
      .then((bookedDates) => {
        if (!cancelled) {
          setFullyBookedDates(bookedDates);
          setIsLoadingBookedDates(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching fully booked dates:", error);
        if (!cancelled) {
          setFullyBookedDates([]);
          setIsLoadingBookedDates(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isCalendarOpen, calendarMonth, heroPlan]);

  // Function to check if a date is disabled (fully booked or in the past)
  // Use useCallback to ensure the function reference is stable and reactive
  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      // Disable past dates
      if (checkDate < today) {
        return true;
      }

      if (!isBookingDaySelectable(checkDate, heroPlan)) {
        return true;
      }

      // Disable fully booked dates
      const dateStr = format(date, "yyyy-MM-dd");
      return fullyBookedDates.includes(dateStr);
    },
    [fullyBookedDates, heroPlan]
  );

  const handleSearch = () => {
    // Pre-fill store as draft; reset wizard commit flags like the Buchung-Schritte.
    useBookingStore.setState(() => {
      const base = {
        package: {
          carType,
          selectedPlan: pkg?.selectedPlan ?? "basic",
          addOns: pkg?.addOns ?? [],
        },
        packageStepCommitted: false,
      } as const;

      if (postalCode && postalCode.length >= 5) {
        const zone = isInsideServiceZone(postalCode) ? "inside" : "outside";
        return {
          ...base,
          location: {
            postalCode,
            address: "",
            zone,
            tollFeeEur: zone === "outside" ? 9 : 0,
            hasWater: location?.hasWater || false,
            hasElectricity: location?.hasElectricity || false,
          },
          locationStepCommitted: false,
        };
      }

      return base;
    });

    router.push("/booking/location");
  };

  const headingText = "Sauber. Smart. Mühelos.";
  const headingWords = headingText.split(" ");

  const descriptionText =
    "Erlebe die nächste Generation der Autopflege – überall, wo du bist.";
  const descriptionWords = descriptionText.split(" ");

  return (
    <section>
      <div className="container mx-auto">
        <HeroBlob />
        <div className="container mx-auto flex flex-col lg:flex-row justify-center gap-15">
          <div className="pt-24">
            <h1 className="flex flex-wrap gap-x-[0.35em] font-semibold leading-[1.1] text-balance text-[clamp(2rem,5vw+1rem,3.5rem)] tracking-tight">
              {headingWords.map((word: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <p className="mt-4 flex flex-wrap gap-x-[0.35em] text-balance text-[clamp(1rem,2vw+0.25rem,1.25rem)] text-gray-600">
              {descriptionWords.map((word: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: headingWords.length * 0.1 + index * 0.05 + 0.2,
                    ease: "easeOut",
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </p>

            {/* SEARCH AREA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay:
                  headingWords.length * 0.1 +
                  descriptionWords.length * 0.05 +
                  0.4,
                ease: "easeOut",
              }}
              className="mt-8 flex flex-col gap-3 rounded-md border border-border bg-background/60 p-4 backdrop-blur-lg shadow-sm"
            >
              {/* Location - PLZ Select */}
              <div className="flex items-center gap-2 w-full">
                <MapPin className="h-6 w-6 text-enex-primary shrink-0" />
                <PostalCodeSelect
                  value={postalCode}
                  onValueChange={(value) => setPostalCode(value)}
                  placeholder="PLZ auswählen"
                  className="w-full"
                />
              </div>

              {/* Car type */}
              <div className="flex items-center gap-2 w-full">
                <CarFront className="h-6 w-6 text-enex-primary" />
                <Select
                  value={carType}
                  onValueChange={(value) => {
                    const v = value as CarType;
                    setCarType(v);
                    useBookingStore.setState({
                      package: {
                        carType: v,
                        selectedPlan: pkg?.selectedPlan || "basic",
                        addOns: pkg?.addOns || [],
                      },
                      packageStepCommitted: false,
                    });
                  }}
                >
                  <SelectTrigger className="w-full !h-12 !bg-white !text-gray-900">
                    <SelectValue placeholder="Fahrzeugklasse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kleinwagen">Kleinwagen</SelectItem>
                    <SelectItem value="standardwagen">Standardwagen</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-2 w-full">
                <CalendarDays className="h-6 w-6 min-w-6 text-enex-primary" />
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[calc(100%-32px)] !h-12 justify-start text-left font-normal text-gray-900 !bg-white"
                    >
                      {date ? format(date, "PPP", { locale: de }) : "Datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 !bg-white"
                    align="start"
                  >
                    <div className="relative min-w-[300px]">
                      {isLoadingBookedDates && (
                        <div className="absolute inset-x-0 top-0 z-10 flex justify-center border-b border-gray-100 bg-white/95 py-1.5 text-xs text-gray-500">
                          Verfügbarkeit wird geladen…
                        </div>
                      )}
                      <Calendar
                        key={format(calendarMonth, "yyyy-MM")}
                        className={cn(
                          isLoadingBookedDates && "pt-8 opacity-90"
                        )}
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          if (
                            selectedDate &&
                            !isDateDisabled(selectedDate)
                          ) {
                            setDate(selectedDate);
                            const slotsForDay = getExpectedBookingTimeSlots(
                              selectedDate,
                              heroPlan
                            );
                            const prior = dateTime?.timeSlot;
                            const usePrior =
                              !!prior &&
                              slotsForDay.some((s) => s === prior);
                            setDateTime({
                              date: selectedDate,
                              timeSlot:
                                usePrior
                                  ? prior
                                  : getDefaultBookingTimeSlotForDate(
                                      selectedDate,
                                      heroPlan
                                    ) ??
                                    (heroPlan === "exclusive"
                                      ? BOOKING_SLOT_EXCLUSIVE_WEEKDAY
                                      : BOOKING_SLOTS_WEEKDAY[0]),
                            });
                            setIsCalendarOpen(false);
                          }
                        }}
                        onMonthChange={(month) => {
                          setCalendarMonth(month);
                        }}
                        disabled={isDateDisabled}
                        locale={de}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                type="button"
                onClick={handleSearch}
                className="mt-2 flex h-12 items-center gap-2 rounded-lg bg-gray-900 text-white hover:bg-black md:mt-0"
              >
                <Search className="h-4 w-4" strokeWidth={2} />
                Suchen
              </Button>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay:
                headingWords.length * 0.1 +
                descriptionWords.length * 0.05 +
                0.3,
              ease: "easeOut",
            }}
          >
            <Image
              src="/images/home/hero.png"
              alt="Professionelle Fahrzeugpflege"
              width={1334}
              height={1370}
              className="h-auto lg:max-w-[600px] w-full"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
