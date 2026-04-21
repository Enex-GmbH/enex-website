/**
 * Phase 2 — Stripe (not implemented)
 *
 * When you add card payments:
 * 1. `npm install stripe`
 * 2. Env: `STRIPE_SECRET_KEY`, and optionally `STRIPE_WEBHOOK_SECRET` for webhooks
 * 3. In `createPaymentIntent.ts`: call `stripe.paymentIntents.create(...)` with metadata
 *    `{ bookingId, bookingReference }`
 * 4. In `confirmBooking.ts`: retrieve the PaymentIntent server-side and require
 *    `status === "succeeded"` before confirming (or confirm from a webhook handler)
 * 5. Replace placeholder IDs stored on `bookings.stripePaymentIntentId` / `payments`
 *
 * This file is intentionally documentation-only — safe to delete once Stripe is integrated.
 */
export {};
