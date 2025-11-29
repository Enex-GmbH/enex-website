"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Package, Clock, Euro, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUserBookings } from "@/lib/actions";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import type { bookings } from "@/lib/db/schema";
import type { AddOn } from "@/store/booking-store";

type Booking = typeof bookings.$inferSelect;

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    setLoading(true);
    getUserBookings(session.user.email)
      .then((result) => {
        if (result.success && result.bookings) {
          setBookings(result.bookings);
          setError(null);
        } else {
          setError(result.message || "Fehler beim Laden der Buchungen");
          setBookings([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError("Fehler beim Laden der Buchungen");
        setLoading(false);
      });
  }, [session, status, router]);

  const formatBookingDate = (dateStr: string): string => {
    try {
      const date = parse(dateStr, "yyyy-MM-dd", new Date());
      return format(date, "PPP", { locale: de });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "confirmed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 flex items-center gap-1`}>
            <CheckCircle2 className="w-4 h-4" />
            Bestätigt
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Ausstehend
          </span>
        );
      case "cancelled":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800 flex items-center gap-1`}>
            <XCircle className="w-4 h-4" />
            Storniert
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Card className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mein Konto</h1>
        <p className="text-gray-600 mb-8">Verwalten Sie Ihre Buchungen</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-enex-primary mb-4" />
            <p className="text-gray-600">Buchungen werden geladen...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => {
                setLoading(true);
                getUserBookings(userEmail)
                  .then((result) => {
                    if (result.success && result.bookings) {
                      setBookings(result.bookings);
                      setError(null);
                    } else {
                      setError(result.message || "Fehler beim Laden der Buchungen");
                    }
                    setLoading(false);
                  })
                  .catch((err) => {
                    console.error("Error fetching bookings:", err);
                    setError("Fehler beim Laden der Buchungen");
                    setLoading(false);
                  });
              }}
            >
              Erneut versuchen
            </Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Sie haben noch keine Buchungen.</p>
            <Link href="/">
              <Button className="bg-enex-primary hover:bg-enex-hover text-white">
                Neue Buchung erstellen
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Meine Buchungen ({bookings.length})
            </h2>
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header with Reference and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Buchung #{booking.reference}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Erstellt am {format(new Date(booking.createdAt || new Date()), "PPP", { locale: de })}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Date & Time */}
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Datum & Uhrzeit</p>
                          <p className="font-medium">
                            {formatBookingDate(booking.date)} - {booking.time}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <p className="font-medium">
                            {booking.address}, {booking.postalCode}
                          </p>
                        </div>
                      </div>

                      {/* Package */}
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Paket</p>
                          <p className="font-medium capitalize">
                            {booking.plan} - {booking.carType}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-start gap-3">
                        <Euro className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Gesamtpreis</p>
                          <p className="font-medium">
                            {booking.currency === "EUR" ? "€" : ""}
                            {booking.totalPrice}
                            {booking.currency === "EUR" ? "" : ` ${booking.currency}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Add-ons */}
                    {booking.addons && Array.isArray(booking.addons) && booking.addons.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm text-gray-500 mb-1">Add-ons:</p>
                        <div className="flex flex-wrap gap-2">
                          {(booking.addons as AddOn[]).map((addon, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                            >
                              {addon.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coupon */}
                    {booking.couponCode && (
                      <div className="pt-2">
                        <p className="text-sm text-gray-500">
                          Kupon: <span className="font-medium text-green-600">{booking.couponCode}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:min-w-[150px]">
                    <Link href={`/booking/confirmation?reference=${booking.reference}`}>
                      <Button variant="outline" className="w-full">
                        Details anzeigen
                      </Button>
                    </Link>
                    {booking.status === "pending" && (
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                        Stornieren
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
