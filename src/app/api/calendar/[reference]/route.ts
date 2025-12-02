import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { format, parse } from "date-fns";
import type { AddOn } from "@/store/booking-store";

type Booking = typeof bookings.$inferSelect;

function generateICSFile(booking: Booking): string {
    // Parse date and time
    const bookingDate = parse(booking.date, "yyyy-MM-dd", new Date());
    const [hours, minutes] = booking.time.split(":").map(Number);
    const eventStart = new Date(bookingDate);
    eventStart.setHours(hours, minutes, 0, 0);
    
    // Event duration: 4 hours
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
    const addonsList = addons.length > 0 
        ? addons.map(addon => addon.name).join(", ")
        : "Keine";

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

export async function GET(
    request: NextRequest,
    { params }: { params: { reference: string } }
) {
    try {
        const reference = params.reference.replace(".ics", "");
        const franchiseId = 1; // TODO: Get from headers if needed

        const [booking] = await db
            .select()
            .from(bookings)
            .where(
                and(
                    eq(bookings.reference, reference),
                    eq(bookings.franchiseId, franchiseId)
                )
            )
            .limit(1);

        if (!booking) {
            return new NextResponse("Booking not found", { status: 404 });
        }

        const icsContent = generateICSFile(booking);

        return new NextResponse(icsContent, {
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="enex-booking-${reference}.ics"`,
            },
        });
    } catch (error) {
        console.error("Error generating calendar file:", error);
        return new NextResponse("Error generating calendar file", { status: 500 });
    }
}

