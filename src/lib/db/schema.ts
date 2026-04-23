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
import { relations } from "drizzle-orm";
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
   COUPONS (global codes)
---------------------------------------- */
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // 'percentage' | 'fixed'
  discountValue: integer("discount_value").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ----------------------------------------
   APP SETTINGS (singleton row id = 1)
---------------------------------------- */
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey(),
  maintenanceEnabled: boolean("maintenance_enabled")
    .notNull()
    .default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ----------------------------------------
   BOOKINGS
---------------------------------------- */
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),

  franchiseId: integer("franchise_id")
    .notNull()
    .references(() => franchises.id),

  /** Set for logged-in customers so "Meine Buchungen" matches the account, not just contact email. */
  userId: integer("user_id").references(() => users.id),

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
  addons: jsonb("addons").$type<AddOn[]>().default([]), // full AddOn objects

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
  franchiseId: integer("franchise_id")
    .notNull()
    .references(() => franchises.id),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", {
    length: 255,
  }).notNull(),
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
  franchiseId: integer("franchise_id")
    .notNull()
    .references(() => franchises.id),
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
  franchiseId: integer("franchise_id")
    .notNull()
    .references(() => franchises.id),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  fromStatus: varchar("from_status", { length: 20 }),
  toStatus: varchar("to_status", { length: 20 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

/* ----------------------------------------
   AUTHENTICATION TABLES
---------------------------------------- */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 40 }),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' or 'admin'
  deactivated: boolean("deactivated").notNull().default(false), // Account deactivation status
  deletedAt: timestamp("deleted_at"), // For soft delete
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires").notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for NextAuth
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  passwordResetTokens: many(passwordResetTokens),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
);
