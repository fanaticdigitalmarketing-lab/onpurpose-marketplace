/**
 * Stripe Service
 * Payment processing with Stripe
 * © 2025 OnPurpose Inc. All rights reserved.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLATFORM_FEE_PERCENT = 15; // 15% platform fee

const stripeService = {
  // Create payment intent
  createPaymentIntent: async (amount, currency = 'usd') => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true
        }
      });
      
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Create checkout session
  createCheckoutSession: async (bookingData, customerEmail) => {
    try {
      const { service, provider, customer, booking } = bookingData;
      
      const platformFee = (service.price * PLATFORM_FEE_PERCENT) / 100;
      const providerAmount = service.price - platformFee;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: service.title,
                description: service.description,
                images: service.image ? [service.image] : []
              },
              unit_amount: Math.round(service.price * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/dashboard.html?payment=success&booking=${booking.id}`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard.html?payment=cancelled`,
        metadata: {
          bookingId: booking.id,
          customerId: customer.id,
          providerId: provider.id,
          serviceId: service.id
        }
      });
      
      return {
        success: true,
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Stripe createCheckoutSession error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Retrieve session
  retrieveSession: async (sessionId) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Stripe retrieveSession error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Create connected account for provider
  createConnectedAccount: async (email) => {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });
      
      return {
        success: true,
        accountId: account.id
      };
    } catch (error) {
      console.error('Stripe createConnectedAccount error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Create account link for onboarding
  createAccountLink: async (accountId) => {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.FRONTEND_URL}/provider.html?stripe=refresh`,
        return_url: `${process.env.FRONTEND_URL}/provider.html?stripe=success`,
        type: 'account_onboarding'
      });
      
      return {
        success: true,
        url: accountLink.url
      };
    } catch (error) {
      console.error('Stripe createAccountLink error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Transfer to provider
  transferToProvider: async (amount, accountId, bookingId) => {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: accountId,
        transfer_group: `booking_${bookingId}`
      });
      
      return {
        success: true,
        transferId: transfer.id
      };
    } catch (error) {
      console.error('Stripe transferToProvider error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Handle webhook events
  handleWebhook: async (payload, signature) => {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      return {
        success: true,
        event
      };
    } catch (error) {
      console.error('Stripe webhook error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Calculate platform fee
  calculateFees: (amount) => {
    const platformFee = (amount * PLATFORM_FEE_PERCENT) / 100;
    const providerAmount = amount - platformFee;
    
    return {
      total: amount,
      platformFee: parseFloat(platformFee.toFixed(2)),
      providerAmount: parseFloat(providerAmount.toFixed(2)),
      feePercent: PLATFORM_FEE_PERCENT
    };
  }
};

module.exports = stripeService;
