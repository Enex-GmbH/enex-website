"use server";

/**
 * Create a Stripe payment intent
 * @param amount - Amount in cents (e.g., 6000 for €60.00)
 * @param currency - Currency code (e.g., "eur" or "dkk")
 * @param bookingReference - The booking reference number
 * @param customerEmail - Customer email address
 * @returns Payment intent client secret or error
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  bookingReference: string,
  customerEmail: string
): Promise<{
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  message?: string;
}> {
  try {
    // TODO: Install Stripe SDK: npm install stripe
    // import Stripe from "stripe";
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: "2024-11-20.acacia",
    // });

    // TODO: Create payment intent with Stripe
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount, // Amount in cents
    //   currency: currency.toLowerCase(),
    //   metadata: {
    //     bookingReference,
    //     customerEmail,
    //   },
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    // });

    // For now, return mock data
    // Remove this mock implementation once Stripe is integrated
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
    const mockPaymentIntentId = `pi_mock_${Date.now()}`;

    return {
      success: true,
      clientSecret: mockClientSecret,
      paymentIntentId: mockPaymentIntentId,
    };

    // Uncomment when Stripe is integrated:
    // return {
    //   success: true,
    //   clientSecret: paymentIntent.client_secret!,
    //   paymentIntentId: paymentIntent.id,
    // };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create payment intent",
    };
  }
}

