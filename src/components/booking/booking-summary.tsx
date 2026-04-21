"use client";

import { useBookingStore } from "@/store/booking-store";
import { Card } from "@/components/ui/card";
import { MapPin, Car, Calendar, Euro } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { carTypeLabelDe } from "@/lib/ui-labels-de";

export default function BookingSummary() {
  const { location, package: pkg, dateTime, getTotalPrice } = useBookingStore();
  const totalPrice = getTotalPrice();

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-4">Zusammenfassung</h2>

      <div className="space-y-4">
        {/* Package */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Car className="w-4 h-4" />
            <span>Paket:</span>
          </div>
          <p className="font-medium capitalize">{pkg?.selectedPlan || "-"}</p>
        </div>

        {/* Add-ons */}
        {pkg && pkg.addOns.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Zusatzoptionen:</div>
            <ul className="space-y-1">
              {pkg.addOns.map((addOn) => (
                <li key={addOn.id} className="text-sm font-medium">
                  {addOn.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Toll Fee */}
        {location && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Anfahrtspauschale:</div>
            <p className="font-medium">
              {location.zone === "inside"
                ? "0€"
                : `${location.tollFeeEur}€`}
            </p>
          </div>
        )}

        {/* Vehicle Type */}
        {pkg && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Fahrzeug:</div>
            <p className="font-medium">{carTypeLabelDe(pkg.carType)}</p>
          </div>
        )}

        {/* Location */}
        {location && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <MapPin className="w-4 h-4" />
              <span>Adresse:</span>
            </div>
            <p className="font-medium text-sm">{location.address}</p>
          </div>
        )}

        {/* Date & Time */}
        {dateTime && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Datum & Uhrzeit:</span>
            </div>
            <p className="font-medium text-sm">
              {format(dateTime.date, "PPP", { locale: de })}
              <br />
              {dateTime.timeSlot}
            </p>
          </div>
        )}

        {/* Total Price */}
        {(pkg || location) && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Euro className="w-4 h-4" />
              <span>Gesamt (inkl. MwSt.):</span>
            </div>
            <p className="text-xl font-bold text-enex-primary">
              €{totalPrice.eur}
            </p>
          </div>
        )}
      </div>

      {!pkg && !location && !dateTime && (
        <p className="text-sm text-gray-500 text-center py-4">
          Bitte füllen Sie das Formular aus, um Ihre Buchung abzuschließen.
        </p>
      )}
    </Card>
  );
}
