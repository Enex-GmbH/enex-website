import type { CarType } from "@/store/booking-store";

const CAR_TYPE_LABEL_DE: Record<CarType, string> = {
  kleinwagen: "Kleinwagen",
  standardwagen: "Standardwagen",
  suv: "SUV",
};

/** Alte gespeicherte Werte vor Umstellung auf PDF-Klassen. */
const LEGACY_CAR_TYPE_LABEL: Record<string, string> = {
  Sedan: "Standardwagen",
  Hatchback: "Kleinwagen",
  Coupe: "Standardwagen",
  SUV: "SUV",
};

/** Anzeigename für Fahrzeugklasse (PDF: Kleinwagen / Standardwagen / SUV). */
export function carTypeLabelDe(type: string): string {
  if (type in CAR_TYPE_LABEL_DE) {
    return CAR_TYPE_LABEL_DE[type as CarType];
  }
  return LEGACY_CAR_TYPE_LABEL[type] ?? type;
}

const BOOKING_STATUS_DE: Record<string, string> = {
  confirmed: "Bestätigt",
  pending: "Ausstehend",
  cancelled: "Storniert",
};

export function bookingStatusLabelDe(status: string): string {
  return BOOKING_STATUS_DE[status] ?? status;
}
