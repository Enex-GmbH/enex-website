import { z } from "zod";

// Step 1: Location Schema
export const locationSchema = z.object({
  postalCode: z
    .string()
    .min(5, "Bitte geben Sie eine gültige Postleitzahl ein"),
  address: z.string().min(5, "Bitte geben Sie eine vollständige Adresse ein").optional(), // Temporarily optional - field is hidden
  zone: z.enum(["inside", "outside"]),
  hasWater: z.boolean(),
  hasElectricity: z.boolean(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

// Step 2: Package Schema
export const packageSchema = z.object({
  carType: z.enum(["kleinwagen", "standardwagen", "suv"]),
  selectedPlan: z.enum(["basic", "premium", "exclusive"]),
  addOns: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        priceEur: z.number(),
        durationMinutes: z.number(),
      })
    )
    .default([]),
});

export type PackageFormData = z.infer<typeof packageSchema>;

// Step 3: Date/Time Schema
export const dateTimeSchema = z.object({
  date: z
    .date({
      error: (issue) => issue.input === undefined ? "Bitte wählen Sie ein Datum" : "Ungültiges Datum",
    })
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: "Sie können kein Datum in der Vergangenheit auswählen",
      }
    ),
  timeSlot: z.string().min(1, "Bitte wählen Sie eine Uhrzeit"),
});

export type DateTimeFormData = z.infer<typeof dateTimeSchema>;

// Step 4: Contact Details Schema
export const contactDetailsSchema = z.object({
  firstName: z.string().min(2, "Vorname ist erforderlich"),
  lastName: z.string().min(2, "Nachname ist erforderlich"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  phone: z.string().min(10, "Bitte geben Sie eine gültige Telefonnummer ein"),
  licensePlate: z.string().optional(),
  carMake: z.string().optional(),
  parkingNote: z.string().optional(),
});

export type ContactDetailsFormData = z.infer<typeof contactDetailsSchema>;

// Step 5: Payment Schema
export const paymentSchema = z.object({
  couponCode: z.string().optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "Bitte bestätigen Sie, dass Sie die AGB gelesen und akzeptieren.",
  }),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message:
      "Bitte bestätigen Sie, dass Sie die Datenschutzerklärung zur Kenntnis genommen haben.",
  }),
  agreedToService: z.boolean().refine((val) => val === true, {
    message:
      "Bitte stimmen Sie der vorzeitigen Leistungserbringung zu, oder wählen Sie einen späteren Termin.",
  }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;