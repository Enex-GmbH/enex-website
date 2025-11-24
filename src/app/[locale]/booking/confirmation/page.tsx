"use client";

import { useBookingStore } from "@/store/booking-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function ConfirmationPage() {
  const router = useRouter();
  const {
    location,
    package: pkg,
    dateTime,
    contactDetails,
    resetBooking,
    getTotalPrice,
  } = useBookingStore();
  const totalPrice = getTotalPrice();

  const bookingReference = `ENX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const handleAddToCalendar = () => {
    if (!dateTime) return;

    const event = {
      title: "ENEX Fahrzeugpflege Service",
      description: `Paket: ${pkg?.selectedPlan}\nFahrzeugtyp: ${pkg?.carType}\nAdresse: ${location?.address}`,
      start: dateTime.date,
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
    link.download = "enex-booking.ics";
    link.click();
  };

  const handleManageBooking = () => {
    // Navigate to booking management (to be implemented)
    router.push("/");
  };

  const handleNewBooking = () => {
    resetBooking();
    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Randevunuz onaylandı!
          </h1>
          <p className="text-gray-600">
            Rezervasyon numaranız:{" "}
            <span className="font-semibold">{bookingReference}</span>
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="font-semibold text-lg mb-4">
              Özet: Tarih/Saat, Adres, Paket, Toplam (KDV dahil)
            </h2>

            <div className="space-y-3 text-sm">
              {dateTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih/Saat:</span>
                  <span className="font-medium">
                    {format(dateTime.date, "PPP", { locale: de })} -{" "}
                    {dateTime.timeSlot}
                  </span>
                </div>
              )}

              {location && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Adres:</span>
                  <span className="font-medium">{location.address}</span>
                </div>
              )}

              {pkg && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paket:</span>
                    <span className="font-medium capitalize">
                      {pkg.selectedPlan}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Fahrzeugtyp:</span>
                    <span className="font-medium">{pkg.carType}</span>
                  </div>

                  {pkg.addOns.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Add-ons:</span>
                      <span className="font-medium">
                        {pkg.addOns.map((a) => a.name).join(", ")}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOPLAM (KDV dahil):</span>
                  <span>
                    €{totalPrice.eur} / {totalPrice.dkr}kr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {contactDetails && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Kontaktdaten</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Name:</span>{" "}
                  {contactDetails.firstName} {contactDetails.lastName}
                </p>
                <p>
                  <span className="text-gray-600">E-Mail:</span>{" "}
                  {contactDetails.email}
                </p>
                <p>
                  <span className="text-gray-600">Telefon:</span>{" "}
                  {contactDetails.phone}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleAddToCalendar}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Takvime ekle (.ics)
          </Button>

          <Button
            onClick={handleManageBooking}
            variant="outline"
            className="flex-1"
          >
            Rezervasyonu yönet
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Hazırlık:</strong> park alanı, priz, değerli eşyalarınızı
            alınız.
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
