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
import { Input } from "../ui/input";
import { useState, useEffect, useCallback, useMemo } from "react";
import { CalendarDays, CarFront, MapPin, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { de } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useBookingStore, CarType } from "@/store/booking-store";
import { getFullyBookedDates } from "@/lib/actions/getFullyBookedDates";

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
  const { setPackage, setDateTime, setLocation, location, package: pkg, dateTime } = useBookingStore();
  
  // Initialize date from store if available
  const getInitialDate = (): Date | undefined => {
    if (dateTime?.date) {
      const storedDate = dateTime.date instanceof Date
        ? dateTime.date
        : new Date(dateTime.date);
      return storedDate;
    }
    return undefined;
  };
  
  const [postalCode, setPostalCode] = useState(location?.postalCode || "");
  const [carType, setCarType] = useState(pkg?.carType || "");
  const [date, setDate] = useState<Date | undefined>(getInitialDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);

  // Sync date state with store when it changes
  useEffect(() => {
    if (dateTime?.date) {
      const storedDate = dateTime.date instanceof Date
        ? dateTime.date
        : new Date(dateTime.date);
      // Only update if different to avoid unnecessary re-renders
      if (!date || format(date, "yyyy-MM-dd") !== format(storedDate, "yyyy-MM-dd")) {
        setDate(storedDate);
      }
    }
  }, [dateTime?.date]);

  // Fetch fully booked dates on component mount
  useEffect(() => {
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(addMonths(new Date(), 1));

    setIsLoadingBookedDates(true);
    getFullyBookedDates(startDate, endDate)
      .then((bookedDates) => {
        setFullyBookedDates(bookedDates);
        setIsLoadingBookedDates(false);
      })
      .catch((error) => {
        console.error("Error fetching fully booked dates:", error);
        setFullyBookedDates([]);
        setIsLoadingBookedDates(false);
      });
  }, []); // Only on mount

  // Fetch when calendar opens or month changes
  useEffect(() => {
    if (!isCalendarOpen) return;

    const startDate = startOfMonth(calendarMonth);
    const endDate = endOfMonth(addMonths(calendarMonth, 1));

    setIsLoadingBookedDates(true);
    getFullyBookedDates(startDate, endDate)
      .then((bookedDates) => {
        setFullyBookedDates(bookedDates);
        setIsLoadingBookedDates(false);
      })
      .catch((error) => {
        console.error("Error fetching fully booked dates:", error);
        setFullyBookedDates([]);
        setIsLoadingBookedDates(false);
      });
  }, [isCalendarOpen, calendarMonth]);

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

      // Disable fully booked dates
      const dateStr = format(date, "yyyy-MM-dd");
      return fullyBookedDates.includes(dateStr);
    },
    [fullyBookedDates]
  );

  const handleSearch = () => {
    // Pre-fill postal code in location store if provided
    // (Car type and date are already saved immediately when selected)
    if (postalCode && postalCode.length >= 5) {
      // Determine zone based on postal code (simplified logic)
      const code = parseInt(postalCode);
      const zone = code >= 10000 && code <= 14999 ? "inside" : "outside";
      const tollFeeEur = zone === "outside" ? 9 : 0;
      
      setLocation({
        postalCode: postalCode,
        address: "", // Will be filled in location step
        zone: zone,
        tollFeeEur: tollFeeEur,
        tollFeeDkr: 0,
        hasWater: location?.hasWater || false,
        hasElectricity: location?.hasElectricity || false,
      });
    }

    // Navigate to booking flow
    router.push("/booking/location");
  };

  return (
    <section>
      <div className="container mx-auto">
        <HeroBlob />
        <div className="container mx-auto flex flex-col lg:flex-row justify-center gap-15">
          <div className="pt-24">
            <h1 className="font-semibold leading-[1.1] text-balance text-[clamp(2rem,5vw+1rem,3.5rem)] tracking-tight">
              Sauber. Smart. Mühelos.
            </h1>
            <p className="mt-4 text-balance text-[clamp(1rem,2vw+0.25rem,1.25rem)] text-gray-600">
              Erlebe die nächste Generation der Autopflege – überall, wo du bist.
            </p>

            {/* SEARCH AREA */}
            <div className="mt-8 flex flex-col gap-3 rounded-md border border-border bg-background/60 p-4 backdrop-blur-lg shadow-sm">
              {/* Location - PLZ Input */}
              <div className="flex items-center gap-2 w-full">
                <MapPin className="h-6 w-6 text-enex-primary" />
                <Input
                  type="text"
                  placeholder="PLZ (z.B. 10115)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full !h-12"
                  maxLength={5}
                />
              </div>

              {/* Car type */}
              <div className="flex items-center gap-2 w-full">
                <CarFront className="h-6 w-6 text-enex-primary" />
                <Select
                  value={carType} 
                  onValueChange={(value) => {
                    setCarType(value);
                    // Immediately save to store when car type is selected
                    setPackage({
                      carType: value as CarType,
                      selectedPlan: pkg?.selectedPlan || "basic", // Keep existing plan or default
                      addOns: pkg?.addOns || [],
                    });
                  }}
                >
                  <SelectTrigger className="w-full !h-12 !bg-white !text-gray-900">
                    <SelectValue placeholder="Fahrzeugtyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Hatchback">Hatchback</SelectItem>
                    <SelectItem value="Coupe">Coupe</SelectItem>
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
                  <PopoverContent className="w-auto p-0 !bg-white" align="start">
                    {isLoadingBookedDates && fullyBookedDates.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500 min-w-[300px]">
                        Yükleniyor...
                      </div>
                    ) : (
                      <Calendar
                        key={`calendar-${fullyBookedDates.length}`} // Force re-render when booked dates change
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          // Only allow selection if date is not disabled
                          if (selectedDate && !isDateDisabled(selectedDate)) {
                            setDate(selectedDate);
                            // Immediately save to store when date is selected
                            setDateTime({
                              date: selectedDate,
                              timeSlot: dateTime?.timeSlot || "09:30", // Keep existing time slot or default
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
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="mt-2 md:mt-0 h-12 flex items-center gap-2 text-white rounded-b-sm bg-enex-primary hover:bg-enex-hover"
              >
                <Search className="w-4 h-4" />
                Suchen
              </Button>
            </div>
            {/* SEARCH AREA */}
          </div>
          <div>
            <Image
              src="/images/home/hero.png"
              alt="hero"
              width={1334}
              height={1370}
              className="h-auto lg:max-w-[600px] w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
