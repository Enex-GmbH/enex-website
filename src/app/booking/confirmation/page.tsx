"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar, Download, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { getBookingByReference } from "@/lib/actions";
import type { bookings } from "@/lib/db/schema";
import type { AddOn } from "@/store/booking-store";
import {
  bookingStatusLabelDe,
  carTypeLabelDe,
} from "@/lib/ui-labels-de";

type Booking = typeof bookings.$inferSelect;

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const bookingReferenceParam = searchParams.get("reference");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking details from database
  useEffect(() => {
    if (!bookingReferenceParam) {
      setError("Buchungsreferenz nicht gefunden");
      setLoading(false);
      return;
    }

    setLoading(true);
    getBookingByReference(bookingReferenceParam)
      .then((result) => {
        if (result.success && result.booking) {
          setBooking(result.booking);
          setError(null);
        } else {
          setError(result.message || "Buchung nicht gefunden");
          setBooking(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching booking:", err);
        setError("Fehler beim Laden der Buchung");
        setLoading(false);
      });
  }, [bookingReferenceParam]);

  const handleAddToCalendar = () => {
    if (!booking) return;

    // Parse date from string format (YYYY-MM-DD)
    const bookingDate = parse(booking.date, "yyyy-MM-dd", new Date());
    // Parse time and combine with date
    const [hours, minutes] = booking.time.split(":").map(Number);
    const eventDateTime = new Date(bookingDate);
    eventDateTime.setHours(hours, minutes, 0, 0);

    const event = {
      title: "ENEX Fahrzeugpflege Service",
      description: `Paket: ${booking.plan}\nFahrzeugtyp: ${booking.carType}\nAdresse: ${booking.address}\nReferenz: ${booking.reference}`,
      start: eventDateTime,
      duration: [4, "hours"],
    };

    // Create ICS file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
DTSTART:${format(event.start, "yyyyMMdd'T'HHmmss")}
DURATION:PT4H
END:VEVENT
END:VCALENDAR`;

    // Download ICS file
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `enex-booking-${booking.reference}.ics`;
    link.click();
  };

  const handleManageBooking = () => {
    // Navigate to account page where user can manage bookings
    router.push("/account");
  };

  const handleNewBooking = () => {
    router.push("/");
  };

  // Format date for display
  const formatBookingDate = (dateStr: string): string => {
    try {
      const date = parse(dateStr, "yyyy-MM-dd", new Date());
      return format(date, "PPP", { locale: de });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-enex-primary mb-4" />
            <p className="text-gray-600">Buchung wird geladen…</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Buchung nicht gefunden
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "Buchung nicht gefunden"}
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-enex-primary hover:bg-enex-hover text-white"
            >
              Zur Startseite
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ihre Buchung ist bestätigt!
          </h1>
          <p className="text-gray-600">
            Buchungsnummer:{" "}
            <span className="font-semibold">{booking.reference}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Status:{" "}
            <span className="font-medium">
              {bookingStatusLabelDe(booking.status)}
            </span>
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-semibold text-lg mb-4">
              Übersicht: Datum, Adresse, Paket, Gesamt (inkl. MwSt.)
            </h2>

            <div className="space-y-3 text-sm">
              {/* Date & Time */}
              <div className="flex justify-between">
                <span className="text-gray-600">Datum & Uhrzeit:</span>
                <span className="font-medium">
                  {formatBookingDate(booking.date)} - {booking.time}
                </span>
              </div>

              {/* Address */}
              <div className="flex justify-between">
                <span className="text-gray-600">Adresse:</span>
                <span className="font-medium text-right max-w-[60%]">
                  {booking.address}
                </span>
              </div>

              {/* Postal Code */}
              <div className="flex justify-between">
                <span className="text-gray-600">Postleitzahl:</span>
                <span className="font-medium">{booking.postalCode}</span>
              </div>

              {/* Package */}
              <div className="flex justify-between">
                <span className="text-gray-600">Paket:</span>
                <span className="font-medium capitalize">
                  {booking.plan}
                </span>
              </div>

              {/* Car Type */}
              <div className="flex justify-between">
                <span className="text-gray-600">Fahrzeugtyp:</span>
                <span className="font-medium">
                  {carTypeLabelDe(booking.carType)}
                </span>
              </div>

              {/* Add-ons */}
              {booking.addons &&
                Array.isArray(booking.addons) &&
                booking.addons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zusatzoptionen:</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {(booking.addons as AddOn[])
                        .map((a) => a.name)
                        .join(", ")}
                    </span>
                  </div>
                )}

              {/* Toll Fee */}
              {booking.tollFee && booking.tollFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Anfahrtspauschale:</span>
                  <span className="font-medium">
                    {booking.isInsideZone ? "0€" : `${booking.tollFee}€`}
                  </span>
                </div>
              )}

              {/* Utilities */}
              {(booking.waterAvailable || booking.electricityAvailable) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Verfügbare Services:</span>
                  <span className="font-medium">
                    {[
                      booking.waterAvailable && "Wasser",
                      booking.electricityAvailable && "Strom",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}

              {/* Coupon Code */}
              {booking.couponCode && (
                <div className="flex justify-between text-green-600">
                  <span>Gutscheincode:</span>
                  <span className="font-medium">{booking.couponCode}</span>
                </div>
              )}

              {/* Total Price */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Gesamt ({booking.currency}):</span>
                  <span>
                    {booking.currency === "EUR" ? "€" : ""}
                    {booking.totalPrice}
                    {booking.currency === "EUR" ? "" : ` ${booking.currency}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Kontaktdaten</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Name:</span>{" "}
                {booking.customerFirstName} {booking.customerLastName}
              </p>
              <p>
                <span className="text-gray-600">E-Mail:</span>{" "}
                {booking.customerEmail}
              </p>
              <p>
                <span className="text-gray-600">Telefon:</span>{" "}
                {booking.customerPhone}
              </p>
              {booking.licensePlate && (
                <p>
                  <span className="text-gray-600">Kennzeichen:</span>{" "}
                  {booking.licensePlate}
                </p>
              )}
              {booking.carMake && (
                <p>
                  <span className="text-gray-600">Fahrzeug:</span>{" "}
                  {booking.carMake}
                </p>
              )}
              {booking.parkingNotes && (
                <p>
                  <span className="text-gray-600">Parknotiz:</span>{" "}
                  {booking.parkingNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleAddToCalendar}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Zum Kalender hinzufügen (.ics)
          </Button>

          {session?.user && (
            <Button
              onClick={handleManageBooking}
              variant="outline"
              className="flex-1"
            >
              Buchung verwalten
            </Button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Vorbereitung:</strong> Stellplatz freihalten, Strom prüfen,
            Wertgegenstände aus dem Fahrzeug nehmen.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={handleNewBooking}
            className="bg-enex-primary hover:bg-enex-hover text-white"
          >
            Neue Buchung starten
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-enex-primary mb-4" />
              <p className="text-gray-600">Buchung wird geladen…</p>
            </div>
          </Card>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
