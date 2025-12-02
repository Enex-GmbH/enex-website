import { resend } from "./client";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import type { bookings } from "@/lib/db/schema";
import type { AddOn } from "@/store/booking-store";

type Booking = typeof bookings.$inferSelect;

interface BookingChanges {
  date?: { old: string; new: string };
  time?: { old: string; new: string };
  status?: { old: string; new: string };
  address?: { old: string; new: string };
  postalCode?: { old: string; new: string };
  totalPrice?: { old: number; new: number };
  customerEmail?: { old: string; new: string };
  customerPhone?: { old: string; new: string };
  customerFirstName?: { old: string; new: string };
  customerLastName?: { old: string; new: string };
  notes?: { old: string | null; new: string };
}

/**
 * Get status label in German
 */
function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Ausstehend";
    case "confirmed":
      return "Bestätigt";
    case "cancelled":
      return "Storniert";
    default:
      return status;
  }
}

/**
 * Send booking update notification email to customer
 */
export async function sendBookingUpdateEmail(
  booking: Booking,
  changes: BookingChanges
): Promise<{ success: boolean; error?: string }> {
  const formatBookingDate = (dateStr: string): string => {
    try {
      const date = parse(dateStr, "yyyy-MM-dd", new Date());
      return format(date, "PPP", { locale: de });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number, currency: string): string => {
    if (currency === "EUR") {
      return `€${price.toFixed(2)}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  };

  const bookingUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/booking/confirmation?reference=${booking.reference}`;

  // Build changes list
  const changesList: string[] = [];

  if (changes.date) {
    changesList.push(
      `<tr>
        <td style="padding: 8px 0; font-weight: bold;">Datum:</td>
        <td style="padding: 8px 0;">
          <span style="text-decoration: line-through; color: #999;">${formatBookingDate(changes.date.old)}</span>
          <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${formatBookingDate(changes.date.new)}</span>
        </td>
      </tr>`
    );
  }

  if (changes.time) {
    changesList.push(
      `<tr>
        <td style="padding: 8px 0; font-weight: bold;">Uhrzeit:</td>
        <td style="padding: 8px 0;">
          <span style="text-decoration: line-through; color: #999;">${changes.time.old} Uhr</span>
          <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${changes.time.new} Uhr</span>
        </td>
      </tr>`
    );
  }

  if (changes.status) {
    changesList.push(
      `<tr>
        <td style="padding: 8px 0; font-weight: bold;">Status:</td>
        <td style="padding: 8px 0;">
          <span style="text-decoration: line-through; color: #999;">${getStatusLabel(changes.status.old)}</span>
          <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${getStatusLabel(changes.status.new)}</span>
        </td>
      </tr>`
    );
  }

  if (changes.address || changes.postalCode) {
    const oldAddress = changes.address?.old || booking.address;
    const newAddress = changes.address?.new || booking.address;
    const oldPostal = changes.postalCode?.old || booking.postalCode;
    const newPostal = changes.postalCode?.new || booking.postalCode;

    if (oldAddress !== newAddress || oldPostal !== newPostal) {
      changesList.push(
        `<tr>
          <td style="padding: 8px 0; font-weight: bold;">Adresse:</td>
          <td style="padding: 8px 0;">
            <span style="text-decoration: line-through; color: #999;">${oldAddress}, ${oldPostal}</span>
            <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${newAddress}, ${newPostal}</span>
          </td>
        </tr>`
      );
    }
  }

  if (changes.totalPrice) {
    changesList.push(
      `<tr>
        <td style="padding: 8px 0; font-weight: bold;">Gesamtpreis:</td>
        <td style="padding: 8px 0;">
          <span style="text-decoration: line-through; color: #999;">${formatPrice(changes.totalPrice.old, booking.currency)}</span>
          <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${formatPrice(changes.totalPrice.new, booking.currency)}</span>
        </td>
      </tr>`
    );
  }

  if (changes.customerEmail) {
    changesList.push(
      `<tr>
        <td style="padding: 8px 0; font-weight: bold;">E-Mail:</td>
        <td style="padding: 8px 0;">
          <span style="text-decoration: line-through; color: #999;">${changes.customerEmail.old}</span>
          <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${changes.customerEmail.new}</span>
        </td>
      </tr>`
    );
  }

  if (changes.customerPhone) {
    changesList.push(
      `<tr>
        <td style="padding: 8px 0; font-weight: bold;">Telefon:</td>
        <td style="padding: 8px 0;">
          <span style="text-decoration: line-through; color: #999;">${changes.customerPhone.old}</span>
          <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${changes.customerPhone.new}</span>
        </td>
      </tr>`
    );
  }

  if (changes.customerFirstName || changes.customerLastName) {
    const oldName = `${changes.customerFirstName?.old || booking.customerFirstName} ${changes.customerLastName?.old || booking.customerLastName}`;
    const newName = `${changes.customerFirstName?.new || booking.customerFirstName} ${changes.customerLastName?.new || booking.customerLastName}`;

    if (oldName !== newName) {
      changesList.push(
        `<tr>
          <td style="padding: 8px 0; font-weight: bold;">Name:</td>
          <td style="padding: 8px 0;">
            <span style="text-decoration: line-through; color: #999;">${oldName}</span>
            <span style="color: #006400; font-weight: bold; margin-left: 8px;">→ ${newName}</span>
          </td>
        </tr>`
      );
    }
  }

  if (changes.notes) {
    const oldNotes = changes.notes.old || "Keine";
    const newNotes = changes.notes.new || "Keine";

    if (oldNotes !== newNotes) {
      changesList.push(
        `<tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Notizen:</td>
          <td style="padding: 8px 0;">
            <div style="text-decoration: line-through; color: #999;">${oldNotes}</div>
            <div style="color: #006400; font-weight: bold; margin-top: 4px;">→ ${newNotes}</div>
          </td>
        </tr>`
      );
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: booking.customerEmail,
      subject: `Buchungsänderung - ${booking.reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Buchungsänderung</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
            <h1 style="color: #000; margin-top: 0;">Buchungsänderung</h1>
            <p>Ihre Buchung wurde aktualisiert. Nachfolgend finden Sie die Änderungen:</p>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #006400;">
              <h2 style="margin-top: 0; color: #000;">Buchungsnummer: ${booking.reference}</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                ${changesList.join("")}
              </table>
            </div>

            <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #000;">Aktuelle Buchungsdetails</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Datum & Uhrzeit:</td>
                  <td style="padding: 8px 0;">${formatBookingDate(booking.date)} um ${booking.time} Uhr</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Adresse:</td>
                  <td style="padding: 8px 0;">${booking.address}, ${booking.postalCode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0;">${getStatusLabel(booking.status)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Gesamtpreis:</td>
                  <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #000;">
                    ${formatPrice(booking.totalPrice, booking.currency)}
                  </td>
                </tr>
              </table>
            </div>

            <div style="margin: 30px 0; text-align: center;">
              <a href="${bookingUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Aktuelle Buchungsdetails anzeigen
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              <p>Bei Fragen zu den Änderungen können Sie uns jederzeit kontaktieren.</p>
              <p style="margin-top: 20px;">
                Mit freundlichen Grüßen,<br>
                <strong>ENEX Fahrzeugpflege</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending booking update email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending booking update email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send booking cancellation email to customer
 */
export async function sendBookingCancellationEmail(
  booking: Booking,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const formatBookingDate = (dateStr: string): string => {
    try {
      const date = parse(dateStr, "yyyy-MM-dd", new Date());
      return format(date, "PPP", { locale: de });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number, currency: string): string => {
    if (currency === "EUR") {
      return `€${price.toFixed(2)}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  };

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: booking.customerEmail,
      subject: `Buchungsstornierung - ${booking.reference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Buchungsstornierung</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
            <h1 style="color: #d32f2f; margin-top: 0;">Buchungsstornierung</h1>
            <p>Leider müssen wir Ihnen mitteilen, dass Ihre Buchung storniert wurde.</p>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #d32f2f;">
              <h2 style="margin-top: 0; color: #000;">Stornierte Buchung</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Buchungsnummer:</td>
                  <td style="padding: 8px 0;">${booking.reference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Datum & Uhrzeit:</td>
                  <td style="padding: 8px 0;">${formatBookingDate(booking.date)} um ${booking.time} Uhr</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Adresse:</td>
                  <td style="padding: 8px 0;">${booking.address}, ${booking.postalCode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Gesamtpreis:</td>
                  <td style="padding: 8px 0;">${formatPrice(booking.totalPrice, booking.currency)}</td>
                </tr>
                ${
                  reason
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Grund:</td>
                  <td style="padding: 8px 0;">${reason}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>Wichtig:</strong> Falls Sie bereits eine Zahlung geleistet haben, wird Ihnen der Betrag automatisch zurückerstattet. Die Rückerstattung kann 5-10 Werktage dauern.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              <p>Bei Fragen zur Stornierung können Sie uns jederzeit kontaktieren.</p>
              <p style="margin-top: 20px;">
                Mit freundlichen Grüßen,<br>
                <strong>ENEX Fahrzeugpflege</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending booking cancellation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending booking cancellation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
