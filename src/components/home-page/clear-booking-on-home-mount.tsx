"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/store/booking-store";

/**
 * Startseite = neue Buchung: gespeicherte Session (Paket, Add-ons, Ort, Datum)
 * leeren, damit keine alten Zusatzleistungen oder Preise mitgeschleppt werden.
 */
export function ClearBookingOnHomeMount() {
  const resetBooking = useBookingStore((s) => s.resetBooking);

  useEffect(() => {
    const reset = () => {
      resetBooking();
    };

    const { persist } = useBookingStore;
    if (persist.hasHydrated()) {
      reset();
      return;
    }

    const unsub = persist.onFinishHydration(() => {
      reset();
    });
    return unsub;
  }, [resetBooking]);

  return null;
}
