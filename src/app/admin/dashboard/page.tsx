"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Package,
  Euro,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Edit,
  Trash2,
  Ban,
  Eye,
  RefreshCw,
  Bell,
  Users,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
} from "@/lib/actions";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import type { bookings } from "@/lib/db/schema";
import type { AddOn } from "@/store/booking-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Booking = typeof bookings.$inferSelect;

const STORAGE_KEY = "admin_dashboard_last_viewed_timestamp";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingBooking, setEditingBooking] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Booking>>({});
  const [deletingBooking, setDeletingBooking] = useState<number | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<number | null>(
    null
  );
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const lastViewedTimestampRef = useRef<string | null>(null);
  const previousBookingIdsRef = useRef<Set<number>>(new Set());

  // Initialize last viewed timestamp from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        lastViewedTimestampRef.current = stored;
      } else {
        // First time viewing - set to current time
        const now = new Date().toISOString();
        lastViewedTimestampRef.current = now;
        localStorage.setItem(STORAGE_KEY, now);
      }
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/account");
      return;
    }
  }, [session, status, router]);

  // React Query hook for fetching bookings with polling
  const {
    data: bookingsData,
    isLoading: loading,
    error: queryError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin", "bookings", statusFilter, searchTerm],
    queryFn: async () => {
      const result = await getAllBookings({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm ? searchTerm : undefined,
      });

      if (result.success && result.bookings) {
        return result.bookings;
      } else {
        throw new Error(result.message || "Fehler beim Laden der Buchungen");
      }
    },
    enabled: !!session?.user && session.user.role === "admin",
    refetchInterval: 300000, // Poll every 5 minutes
    refetchOnWindowFocus: true,
    staleTime: 60000, // Consider data stale after 1 minute
  });

  const bookings = bookingsData || [];
  const error = queryError ? (queryError as Error).message : null;

  // Detect new bookings
  useEffect(() => {
    if (!bookings.length) return;

    const currentBookingIds = new Set(bookings.map((b) => b.id));
    const lastViewed = lastViewedTimestampRef.current
      ? new Date(lastViewedTimestampRef.current)
      : null;

    if (lastViewed) {
      // Count bookings created after last viewed timestamp
      const newBookings = bookings.filter((booking) => {
        const createdAt = booking.createdAt
          ? new Date(booking.createdAt)
          : null;
        return createdAt && createdAt > lastViewed;
      });

      setNewBookingsCount(newBookings.length);
    } else {
      // Compare with previous booking IDs to detect new ones
      const newIds = Array.from(currentBookingIds).filter(
        (id) => !previousBookingIdsRef.current.has(id)
      );
      setNewBookingsCount(newIds.length);
    }

    // Update previous booking IDs
    previousBookingIdsRef.current = currentBookingIds;
  }, [bookings]);

  const handleSearch = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "bookings", statusFilter, searchTerm],
    });
  }, [queryClient, statusFilter, searchTerm]);

  const handleManualRefresh = useCallback(() => {
    // Clear new bookings badge
    setNewBookingsCount(0);
    // Update last viewed timestamp
    const now = new Date().toISOString();
    lastViewedTimestampRef.current = now;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, now);
    }
    // Refetch bookings
    refetch();
  }, [refetch]);

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking.id);
    setEditForm({
      date: booking.date,
      time: booking.time,
      status: booking.status,
      address: booking.address,
      postalCode: booking.postalCode,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      customerFirstName: booking.customerFirstName,
      customerLastName: booking.customerLastName,
      totalPrice: booking.totalPrice,
      parkingNotes: booking.parkingNotes || undefined,
    });
  };

  const handleSaveEdit = async (bookingId: number) => {
    try {
      const result = await updateBooking(bookingId, {
        date: editForm.date,
        time: editForm.time,
        status: editForm.status,
        address: editForm.address,
        postalCode: editForm.postalCode,
        customerEmail: editForm.customerEmail,
        customerPhone: editForm.customerPhone,
        customerFirstName: editForm.customerFirstName,
        customerLastName: editForm.customerLastName,
        totalPrice: editForm.totalPrice,
        notes: editForm.parkingNotes || undefined,
      });

      if (result.success) {
        setEditingBooking(null);
        queryClient.invalidateQueries({
          queryKey: ["admin", "bookings"],
        });
      } else {
        alert(result.message || "Fehler beim Aktualisieren");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Fehler beim Aktualisieren");
    }
  };

  const handleDelete = async (bookingId: number) => {
    if (!confirm("Sind Sie sicher, dass Sie diese Buchung löschen möchten?")) {
      return;
    }

    setDeletingBooking(bookingId);
    try {
      const result = await deleteBooking(bookingId);
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "bookings"],
        });
      } else {
        alert(result.message || "Fehler beim Löschen");
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Fehler beim Löschen");
    } finally {
      setDeletingBooking(null);
    }
  };

  const handleCancel = async (bookingId: number) => {
    const reason = prompt("Grund für die Stornierung (optional):");
    setCancellingBooking(bookingId);
    try {
      const result = await cancelBooking(bookingId, reason || undefined);
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "bookings"],
        });
      } else {
        alert(result.message || "Fehler beim Stornieren");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Fehler beim Stornieren");
    } finally {
      setCancellingBooking(null);
    }
  };

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
          <span
            className={`${baseClasses} bg-green-100 text-green-800 flex items-center gap-1`}
          >
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
          <span
            className={`${baseClasses} bg-red-100 text-red-800 flex items-center gap-1`}
          >
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

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                {newBookingsCount > 0 && (
                  <span className="relative">
                    <span className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold animate-pulse">
                      <Bell className="w-4 h-4" />
                      {newBookingsCount} neue Buchung
                      {newBookingsCount !== 1 ? "en" : ""}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">Verwalten Sie alle Buchungen</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isRefetching}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              Aktualisieren
            </Button>
            <Link href="/admin/users">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Benutzer
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="outline">Zurück zum Konto</Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Gesamt</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Bestätigt</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmed}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Ausstehend</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Storniert</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Suche nach Referenz, E-Mail, Name oder Adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Suchen
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-enex-primary mb-4" />
          <p className="text-gray-600">Buchungen werden geladen...</p>
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => refetch()}>Erneut versuchen</Button>
          </div>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="p-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Keine Buchungen gefunden.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              {editingBooking === booking.id ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Buchung #{booking.reference} bearbeiten
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Datum</label>
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Uhrzeit</label>
                      <Input
                        type="time"
                        value={editForm.time}
                        onChange={(e) =>
                          setEditForm({ ...editForm, time: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) =>
                          setEditForm({ ...editForm, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Ausstehend</SelectItem>
                          <SelectItem value="confirmed">Bestätigt</SelectItem>
                          <SelectItem value="cancelled">Storniert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Gesamtpreis (Cent)
                      </label>
                      <Input
                        type="number"
                        value={editForm.totalPrice}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            totalPrice: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Vorname</label>
                      <Input
                        value={editForm.customerFirstName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customerFirstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Nachname</label>
                      <Input
                        value={editForm.customerLastName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customerLastName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">E-Mail</label>
                      <Input
                        type="email"
                        value={editForm.customerEmail}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customerEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Telefon</label>
                      <Input
                        value={editForm.customerPhone}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            customerPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Adresse</label>
                      <Input
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Postleitzahl
                      </label>
                      <Input
                        value={editForm.postalCode}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Notizen</label>
                      <Input
                        value={editForm.parkingNotes || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            parkingNotes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleSaveEdit(booking.id)}
                      className="bg-enex-primary hover:bg-enex-hover text-white"
                    >
                      Speichern
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingBooking(null)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Buchung #{booking.reference}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Erstellt am{" "}
                            {format(
                              new Date(booking.createdAt || new Date()),
                              "PPP",
                              { locale: de }
                            )}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Datum & Uhrzeit
                            </p>
                            <p className="font-medium">
                              {formatBookingDate(booking.date)} - {booking.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Adresse</p>
                            <p className="font-medium">
                              {booking.address}, {booking.postalCode}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Paket</p>
                            <p className="font-medium capitalize">
                              {booking.plan} - {booking.carType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Euro className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Gesamtpreis</p>
                            <p className="font-medium">
                              {booking.currency === "EUR" ? "€" : ""}
                              {booking.totalPrice}
                              {booking.currency === "EUR"
                                ? ""
                                : ` ${booking.currency}`}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Kunde</p>
                          <p className="font-medium">
                            {booking.customerFirstName}{" "}
                            {booking.customerLastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.customerEmail}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.customerPhone}
                          </p>
                        </div>
                      </div>

                      {booking.addons &&
                        Array.isArray(booking.addons) &&
                        booking.addons.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm text-gray-500 mb-1">
                              Add-ons:
                            </p>
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
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-[200px]">
                      <Link
                        href={`/booking/confirmation?reference=${booking.reference}`}
                      >
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEdit(booking)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Bearbeiten
                      </Button>
                      {booking.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          className="w-full text-orange-600 hover:text-orange-700"
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingBooking === booking.id}
                        >
                          {cancellingBooking === booking.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Ban className="w-4 h-4 mr-2" />
                          )}
                          Stornieren
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(booking.id)}
                        disabled={deletingBooking === booking.id}
                      >
                        {deletingBooking === booking.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Löschen
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
