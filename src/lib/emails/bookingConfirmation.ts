import { resend } from "./client";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import type { bookings } from "@/lib/db/schema";
import type { AddOn } from "@/store/booking-store";

type Booking = typeof bookings.$inferSelect;

/**
 * Generate ICS (iCalendar) file content for the booking
 */
function generateICSFile(booking: Booking): string {
  // Parse date and time
  const bookingDate = parse(booking.date, "yyyy-MM-dd", new Date());
  const [hours, minutes] = booking.time.split(":").map(Number);
  const eventStart = new Date(bookingDate);
  eventStart.setHours(hours, minutes, 0, 0);

  // Event duration: 4 hours (standard service duration)
  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventEnd.getHours() + 4);

  // Format dates for ICS (YYYYMMDDTHHmmss)
  const formatICSDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  // Escape text for ICS format
  const escapeICS = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const addons = (booking.addons as AddOn[] | null) || [];
  const addonsList =
    addons.length > 0 ? addons.map((addon) => addon.name).join(", ") : "Keine";

  const description = `ENEX Fahrzeugpflege Service
Buchungsnummer: ${booking.reference}
Paket: ${booking.plan} - ${booking.carType}
Add-ons: ${addonsList}
Adresse: ${booking.address}, ${booking.postalCode}
${booking.licensePlate ? `Kennzeichen: ${booking.licensePlate}` : ""}
${booking.carMake ? `Fahrzeugmarke: ${booking.carMake}` : ""}
${booking.parkingNotes ? `Parkhinweise: ${booking.parkingNotes}` : ""}

Bei Fragen kontaktieren Sie uns bitte.`;

  const location = `${booking.address}, ${booking.postalCode}`;
  const summary = `ENEX Fahrzeugpflege - ${booking.reference}`;

  // Generate unique ID for the event
  const uid = `enex-booking-${booking.reference}-${booking.id}@${process.env.NEXTAUTH_URL?.replace(/https?:\/\//, "") || "enex.de"}`;

  // ICS file content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ENEX Fahrzeugpflege//Booking System//DE
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(eventStart)}
DTEND:${formatICSDate(eventEnd)}
SUMMARY:${escapeICS(summary)}
DESCRIPTION:${escapeICS(description)}
LOCATION:${escapeICS(location)}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Erinnerung: ENEX Fahrzeugpflege Service in 1 Stunde
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

export async function sendBookingConfirmationEmail(
  booking: Booking
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

  const addons = (booking.addons as AddOn[] | null) || [];
  const addonsList =
    addons.length > 0
      ? addons.map((addon) => `• ${addon.name}`).join("<br>")
      : "Keine";

  const bookingUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/booking/confirmation?reference=${booking.reference}`;

  // Generate calendar links (like Calendly)
  const bookingDate = parse(booking.date, "yyyy-MM-dd", new Date());
  const [hours, minutes] = booking.time.split(":").map(Number);
  const eventStart = new Date(bookingDate);
  eventStart.setHours(hours, minutes, 0, 0);

  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventEnd.getHours() + 4);

  // Format dates for calendar URLs (ISO 8601)
  const formatCalendarDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const startDate = formatCalendarDate(eventStart);
  const endDate = formatCalendarDate(eventEnd);

  // Use existing addons and addonsList, but create a comma-separated version for calendar
  const addonsListForCalendar =
    addons.length > 0 ? addons.map((addon) => addon.name).join(", ") : "Keine";

  const eventTitle = encodeURIComponent(
    `ENEX Fahrzeugpflege - ${booking.reference}`
  );
  const eventDescription = encodeURIComponent(
    `ENEX Fahrzeugpflege Service\n\n` +
      `Buchungsnummer: ${booking.reference}\n` +
      `Paket: ${booking.plan} - ${booking.carType}\n` +
      `Add-ons: ${addonsListForCalendar}\n` +
      `${booking.licensePlate ? `Kennzeichen: ${booking.licensePlate}\n` : ""}` +
      `${booking.carMake ? `Fahrzeugmarke: ${booking.carMake}\n` : ""}` +
      `${booking.parkingNotes ? `Parkhinweise: ${booking.parkingNotes}\n` : ""}\n` +
      `Bei Fragen kontaktieren Sie uns bitte.`
  );
  const eventLocation = encodeURIComponent(
    `${booking.address}, ${booking.postalCode}`
  );

  // Google Calendar link
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${eventDescription}&location=${eventLocation}`;

  // Outlook Calendar link
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventTitle}&startdt=${startDate}&enddt=${endDate}&body=${eventDescription}&location=${eventLocation}`;

  // Yahoo Calendar link
  const yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${eventTitle}&st=${startDate}&dur=${encodeURIComponent("0400")}&desc=${eventDescription}&in_loc=${eventLocation}`;

  // Apple Calendar (webcal) - uses webcal:// protocol to subscribe to calendar
  const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /^https?:\/\//,
    ""
  );
  const appleCalendarUrl = `webcal://${baseUrl}/api/calendar/${booking.reference}.ics`;

  // Generate ICS calendar file (still attached as fallback)
  const icsContent = generateICSFile(booking);
  const icsBuffer = Buffer.from(icsContent, "utf-8");

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: booking.customerEmail,
      subject: `Buchungsbestätigung - ${booking.reference}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Buchungsbestätigung</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
                        <h1 style="color: #000; margin-top: 0;">Buchungsbestätigung</h1>
                        <p>Vielen Dank für Ihre Buchung! Ihre Reservierung wurde erfolgreich bestätigt.</p>
                        
                        <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #000;">
                            <h2 style="margin-top: 0; color: #000;">Buchungsdetails</h2>
                            
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
                                    <td style="padding: 8px 0;">${booking.address}<br>${booking.postalCode}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Paket:</td>
                                    <td style="padding: 8px 0; text-transform: capitalize;">${booking.plan} - ${booking.carType}</td>
                                </tr>
                                ${
                                  addons.length > 0
                                    ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Add-ons:</td>
                                    <td style="padding: 8px 0;">${addonsList}</td>
                                </tr>
                                `
                                    : ""
                                }
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Gesamtpreis:</td>
                                    <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #000;">
                                        ${formatPrice(booking.totalPrice, booking.currency)}
                                    </td>
                                </tr>
                                ${
                                  booking.couponCode
                                    ? `
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Gutscheincode:</td>
                                    <td style="padding: 8px 0; color: #006400;">${booking.couponCode}</td>
                                </tr>
                                `
                                    : ""
                                }
                            </table>
                        </div>

                        <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #000;">Kontaktdaten</h3>
                            <p style="margin: 5px 0;">
                                <strong>Name:</strong> ${booking.customerFirstName} ${booking.customerLastName}<br>
                                <strong>E-Mail:</strong> ${booking.customerEmail}<br>
                                <strong>Telefon:</strong> ${booking.customerPhone}
                            </p>
                            ${booking.licensePlate ? `<p style="margin: 5px 0;"><strong>Kennzeichen:</strong> ${booking.licensePlate}</p>` : ""}
                            ${booking.carMake ? `<p style="margin: 5px 0;"><strong>Fahrzeugmarke:</strong> ${booking.carMake}</p>` : ""}
                            ${booking.parkingNotes ? `<p style="margin: 5px 0;"><strong>Parkhinweise:</strong> ${booking.parkingNotes}</p>` : ""}
                        </div>

                        ${
                          booking.isInsideZone
                            ? ""
                            : `
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="margin: 0;"><strong>Hinweis:</strong> Ihre Adresse liegt außerhalb der Standardzone. Es wurde eine Mautgebühr von ${formatPrice(booking.tollFee || 0, booking.currency)} hinzugefügt.</p>
                        </div>
                        `
                        }

                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${bookingUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-bottom: 15px;">
                                Buchungsdetails anzeigen
                            </a>
                        </div>

                        <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; border: 2px solid #000;">
                            <h3 style="margin-top: 0; color: #000; text-align: center;">📅 Zum Kalender hinzufügen</h3>
                            <p style="text-align: center; color: #666; margin-bottom: 15px;">Klicken Sie auf einen der Links, um den Termin direkt zu Ihrem Kalender hinzuzufügen:</p>
                            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                                <a href="${googleCalendarUrl}" target="_blank" style="background-color: #4285f4; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; width: 200px; text-align: center;">
                                    Google Kalender
                                </a>
                                <a href="${outlookCalendarUrl}" target="_blank" style="background-color: #0078d4; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; width: 200px; text-align: center;">
                                    Outlook Kalender
                                </a>
                                <a href="${yahooCalendarUrl}" target="_blank" style="background-color: #6001d2; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; width: 200px; text-align: center;">
                                    Yahoo Kalender
                                </a>
                                <a href="${appleCalendarUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; width: 200px; text-align: center;">
                                    Apple Kalender
                                </a>
                            </div>
                        </div>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                            <p>Bei Fragen zu Ihrer Buchung können Sie uns jederzeit kontaktieren.</p>
                            <p style="margin-top: 20px;">
                                Mit freundlichen Grüßen,<br>
                                <strong>ENEX Fahrzeugpflege</strong>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
      attachments: [
        {
          filename: `enex-booking-${booking.reference}.ics`,
          content: icsBuffer,
          contentType: "text/calendar",
        },
      ],
    });

    if (error) {
      console.error("Error sending booking confirmation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
