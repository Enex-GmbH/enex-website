"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { CalendarDays, CarFront, MapPin, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const HeroBlob = () => {
    return (
        <div className="absolute inset-x-0 top-10 md:top-20 xl:top-40 -z-10 flex min-h-0 overflow-hidden pl-20 py-24">
            {/* Red blob */}
            <span className="block h-72 w-72 rounded-full bg-[#ef233c] opacity-10 mix-blend-multiply blur-3xl lg:h-96 lg:w-96" />

            {/* Teal blob */}
            <span className="mt-40 -ml-20 block h-72 w-72 rounded-full bg-[#04868b] opacity-10 mix-blend-multiply blur-3xl lg:h-96 lg:w-96 animate-delay-2000" />
        </div>
    )
}

function Hero() {
    const t = useTranslations("HOME.hero");
    const [selectedPlace, setSelectedPlace] = useState("");
    const [carType, setCarType] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    return (
        <section>
            <div className="container mx-auto">
                <HeroBlob />
                <div className="container mx-auto flex flex-col lg:flex-row justify-center gap-15">
                    <div className="pt-24">
                        <h1 className="font-semibold leading-[1.1] text-balance text-[clamp(2rem,5vw+1rem,3.5rem)] tracking-tight">
                            {t("title")}
                        </h1>
                        <p className="mt-4 text-balance text-[clamp(1rem,2vw+0.25rem,1.25rem)] text-gray-600">
                            {t("description")}
                        </p>

                        {/* SEARCH AREA */}
                        <div className="mt-8 flex flex-col gap-3 rounded-md border border-border bg-background/60 p-4 backdrop-blur-lg shadow-sm">
                            {/* Location */}
                            <div className="flex items-center gap-2 w-full">
                                <MapPin className="h-6 w-6 text-enex-primary" />
                                <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                                    <SelectTrigger className="w-full !h-12">
                                        <SelectValue placeholder={t("location")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Berlin">Berlin</SelectItem>
                                        <SelectItem value="Hamburg">Hamburg</SelectItem>
                                        <SelectItem value="Munich">München</SelectItem>
                                        <SelectItem value="Cologne">Köln</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Car type */}
                            <div className="flex items-center gap-2 w-full">
                                <CarFront className="h-6 w-6 text-enex-primary" />
                                <Select value={carType} onValueChange={setCarType}>
                                    <SelectTrigger className="w-full !h-12">
                                        <SelectValue placeholder={t("carType")} />
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
                                            className="w-[calc(100%-32px)] !h-12 justify-start text-left font-normal text-gray-700"
                                        >
                                            {date ? format(date, "PPP", { locale: de }) : t("date")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(selectedDate) => {
                                                setDate(selectedDate);
                                                setIsCalendarOpen(false);
                                            }}
                                            locale={de}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Search Button */}
                            <Button className="mt-2 md:mt-0 h-12 flex items-center gap-2 text-white rounded-b-sm bg-enex-primary hover:bg-enex-hover">
                                <Search className="w-4 h-4" />
                                {t("search")}
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
    )
}

export default Hero;
