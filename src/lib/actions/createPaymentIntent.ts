"use server";

/**
 * Phase 1: no payment provider — returns a placeholder so the booking UI flow stays stable.
 * Phase 2: implement Stripe PaymentIntents here (see `src/lib/payments/phase2-stripe-notes.ts`).
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  bookingReference: string,
  customerEmail: string,
  bookingId?: number
): Promise<{
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  message?: string;
}> {
  void amount;
  void currency;
  void customerEmail;
  void bookingId;

  return {
    success: true,
    clientSecret: undefined,
    paymentIntentId: `phase1_${bookingReference}`,
  };
}
