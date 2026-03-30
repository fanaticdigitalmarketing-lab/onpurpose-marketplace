const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create a customer
  async createCustomer(email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          platform: 'onpurpose'
        }
      });
      return customer;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  // Create Stripe Connect account for hosts
  async createConnectAccount(email, country = 'US') {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: 'individual',
        metadata: {
          platform: 'onpurpose'
        }
      });
      return account;
    } catch (error) {
      throw new Error(`Failed to create Connect account: ${error.message}`);
    }
  }

  // Create account link for onboarding
  async createAccountLink(accountId, refreshUrl, returnUrl) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding'
      });
      return accountLink;
    } catch (error) {
      throw new Error(`Failed to create account link: ${error.message}`);
    }
  }

  // Create payment intent with platform fee
  async createPaymentIntent(amount, hostAccountId, platformFeeAmount, currency = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        application_fee_amount: Math.round(platformFeeAmount * 100),
        transfer_data: {
          destination: hostAccountId,
        },
        metadata: {
          platform: 'onpurpose'
        }
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });
      return refund;
    } catch (error) {
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  // Get account details
  async getAccount(accountId) {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      throw new Error(`Failed to get account: ${error.message}`);
    }
  }

  // Handle webhook events
  async handleWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }
}

module.exports = new StripeService();
