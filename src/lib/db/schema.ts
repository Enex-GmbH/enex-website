// src/lib/db/schema.ts
import {
    pgTable,
    serial,
    text,
    varchar,
    integer,
    timestamp,
    boolean,
    jsonb,
} from "drizzle-orm/pg-core";
import type { AddOn } from "@/store/booking-store";

/* ----------------------------------------
   FRANCHISES
---------------------------------------- */
export const franchises = pgTable("franchises", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    currency: varchar("currency", { length: 5 }).default("EUR"),
    timezone: varchar("timezone", { length: 50 }).default("Europe/Berlin"),
    createdAt: timestamp("created_at").defaultNow(),
});

/* ----------------------------------------
   BOOKINGS
---------------------------------------- */
export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),

    franchiseId: integer("franchise_id").notNull().references(() => franchises.id),

    reference: varchar("reference", { length: 20 }).notNull().unique(),

    // Location
    postalCode: varchar("postal_code", { length: 10 }).notNull(),
    address: text("address").notNull(),
    isInsideZone: boolean("is_inside_zone").notNull(),
    tollFee: integer("toll_fee").default(0),

    waterAvailable: boolean("water_available").default(false),
    electricityAvailable: boolean("electricity_available").default(false),

    // Package
    carType: varchar("car_type", { length: 20 }).notNull(),
    plan: varchar("plan", { length: 20 }).notNull(),
    addons: jsonb("addons").$type<AddOn[]>().default([]),  // full AddOn objects

    // DateTime
    date: varchar("date", { length: 20 }).notNull(),
    time: varchar("time", { length: 10 }).notNull(),

    // Customer
    customerFirstName: varchar("customer_first_name", { length: 80 }).notNull(),
    customerLastName: varchar("customer_last_name", { length: 80 }).notNull(),
    customerEmail: varchar("customer_email", { length: 120 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 40 }).notNull(),

    licensePlate: varchar("license_plate", { length: 20 }),
    carMake: varchar("car_make", { length: 50 }),
    parkingNotes: text("parking_notes"),

    // Legal agreements
    agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
    agreedToPrivacy: boolean("agreed_to_privacy").notNull().default(false),
    agreedToService: boolean("agreed_to_service").notNull().default(false),

    // Payment
    couponCode: varchar("coupon_code", { length: 50 }),
    totalPrice: integer("total_price").notNull(),
    currency: varchar("currency", { length: 5 }).notNull().default("EUR"),

    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),

    status: varchar("status", { length: 20 }).notNull().default("pending"),

    createdAt: timestamp("created_at").defaultNow(),
});

/* ----------------------------------------
   PAYMENTS
---------------------------------------- */
export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),
    franchiseId: integer("franchise_id").notNull().references(() => franchises.id),
    bookingId: integer("booking_id").notNull().references(() => bookings.id),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull(),
    amount: integer("amount").notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    currency: varchar("currency", { length: 5 }).default("EUR"),
    createdAt: timestamp("created_at").defaultNow(),
});

/* ----------------------------------------
   TIME SLOTS
---------------------------------------- */
export const timeSlots = pgTable("time_slots", {
    id: serial("id").primaryKey(),
    franchiseId: integer("franchise_id").notNull().references(() => franchises.id),
    date: varchar("date", { length: 20 }).notNull(),
    time: varchar("time", { length: 10 }).notNull(),
    isBooked: boolean("is_booked").default(false),
    bookingId: integer("booking_id").references(() => bookings.id),
});

/* ----------------------------------------
   EVENT LOGS
---------------------------------------- */
export const bookingEvents = pgTable("booking_events", {
    id: serial("id").primaryKey(),
    franchiseId: integer("franchise_id").notNull().references(() => franchises.id),
    bookingId: integer("booking_id").notNull().references(() => bookings.id),
    fromStatus: varchar("from_status", { length: 20 }),
    toStatus: varchar("to_status", { length: 20 }),
    timestamp: timestamp("timestamp").defaultNow(),
});
