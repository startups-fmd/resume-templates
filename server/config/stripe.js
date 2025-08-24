const stripe = require('stripe');

// Initialize Stripe with the secret key
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Webhook endpoint secret for verifying webhook signatures
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Verify webhook signature
const verifyWebhookSignature = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

// Create or retrieve customer
const createOrRetrieveCustomer = async (user) => {
  try {
    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      return await stripeInstance.customers.retrieve(user.stripeCustomerId);
    }

    // Create new customer
    const customer = await stripeInstance.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id.toString()
      }
    });

    return customer;
  } catch (error) {
    console.error('Error creating/retrieving Stripe customer:', error);
    throw error;
  }
};

// Create subscription
const createSubscription = async (customerId, priceId) => {
  try {
    const subscription = await stripeInstance.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
};

// Cancel subscription
const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripeInstance.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    throw error;
  }
};

// Get subscription
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    throw error;
  }
};

// Create checkout session
const createCheckoutSession = async (customerId, priceId, successUrl, cancelUrl) => {
  try {
    const session = await stripeInstance.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create dynamic checkout session with inline pricing
const createDynamicCheckoutSession = async (customerId, planName, pricingConfig, successUrl, cancelUrl) => {
  try {
    const isOneTime = planName === 'pay-per-use';
    
    const session = await stripeInstance.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pricingConfig.currency,
            unit_amount: pricingConfig.amount,
            product_data: {
              name: planName === 'pay-per-use' ? '5 Cover Letters' : 'MotivAI Pro - Unlimited Monthly',
              description: planName === 'pay-per-use' 
                ? 'Generate 5 cover letters with AI assistance'
                : 'Unlimited cover letters, resume analysis, and job search assistance'
            },
            ...(isOneTime ? {} : {
              recurring: {
                interval: 'month'
              }
            })
          },
          quantity: 1,
        },
      ],
      mode: isOneTime ? 'payment' : 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        plan: planName,
        currency: pricingConfig.currency.toUpperCase()
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating dynamic checkout session:', error);
    throw error;
  }
};

// Create billing portal session
const createBillingPortalSession = async (customerId, returnUrl) => {
  try {
    const session = await stripeInstance.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
};

module.exports = {
  stripeInstance,
  verifyWebhookSignature,
  createOrRetrieveCustomer,
  createSubscription,
  cancelSubscription,
  getSubscription,
  createCheckoutSession,
  createDynamicCheckoutSession,
  createBillingPortalSession,
};
