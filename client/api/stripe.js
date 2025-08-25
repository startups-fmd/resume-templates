const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const {
  createOrRetrieveCustomer,
  createCheckoutSession,
  createDynamicCheckoutSession,
  createBillingPortalSession,
  verifyWebhookSignature,
  getSubscription,
  cancelSubscription
} = require('../config/stripe');

const router = express.Router();

// Dynamic pricing configuration
const DYNAMIC_PRICING = {
  'pay-per-use': {
    USD: { amount: 500, currency: 'usd' }, // $5.00
    EUR: { amount: 325, currency: 'eur' }, // €3.25
    CAD: { amount: 500, currency: 'cad' }  // C$5.00
  },
  'pro': {
    USD: { amount: 575, currency: 'usd' }, // $5.75
    EUR: { amount: 500, currency: 'eur' }, // €5.00
    CAD: { amount: 795, currency: 'cad' }  // C$7.95
  }
};

// @route   POST /api/stripe/create-checkout-session
// @desc    Create a Stripe checkout session for subscription
// @access  Private
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan, currency = 'USD' } = req.body;

    if (!plan || !DYNAMIC_PRICING[plan]) {
      return res.status(400).json({ 
        message: 'Invalid plan. Please select pay-per-use or pro.' 
      });
    }

    if (!DYNAMIC_PRICING[plan][currency]) {
      return res.status(400).json({ 
        message: `Currency ${currency} not supported for plan ${plan}.` 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or retrieve Stripe customer
    const customer = await createOrRetrieveCustomer(user);

    // Update user with Stripe customer ID if not already set
    if (!user.subscription.stripeCustomerId) {
      user.subscription.stripeCustomerId = customer.id;
      await user.save();
    }

    // Get pricing configuration for this plan and currency
    const pricingConfig = DYNAMIC_PRICING[plan][currency];
    
    // Create checkout session with dynamic pricing
    const session = await createDynamicCheckoutSession(
      customer.id,
      plan,
      pricingConfig,
      `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.CLIENT_URL}/subscription/canceled`
    );

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// @route   POST /api/stripe/create-portal-session
// @desc    Create a Stripe billing portal session
// @access  Private
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.subscription.stripeCustomerId) {
      return res.status(400).json({ 
        message: 'No active subscription found' 
      });
    }

    // Create billing portal session
    const session = await createBillingPortalSession(
      user.subscription.stripeCustomerId,
      `${process.env.CLIENT_URL}/account`
    );

    res.json({ url: session.url });

  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ message: 'Failed to create portal session' });
  }
});

// @route   POST /api/stripe/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = verifyWebhookSignature(req.body, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ message: 'Webhook handler failed' });
  }
});

// @route   GET /api/stripe/subscription-status
// @desc    Get current subscription status
// @access  Private
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let subscription = null;
    if (user.subscription.stripeSubscriptionId) {
      try {
        subscription = await getSubscription(user.subscription.stripeSubscriptionId);
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error);
      }
    }

    res.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      stripeSubscription: subscription
    });

  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ message: 'Failed to get subscription status' });
  }
});

// @route   POST /api/stripe/cancel-subscription
// @desc    Cancel current subscription
// @access  Private
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ 
        message: 'No active subscription to cancel' 
      });
    }

    // Cancel subscription in Stripe
    await cancelSubscription(user.subscription.stripeSubscriptionId);

    // Update user subscription
    user.subscription.plan = 'free';
    user.subscription.status = 'canceled';
    user.subscription.stripeSubscriptionId = null;
    user.subscription.stripePriceId = null;
    user.subscription.currentPeriodEnd = null;
    await user.save();

    res.json({ 
      message: 'Subscription canceled successfully',
      plan: 'free'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
});

// Webhook handlers
async function handleCheckoutSessionCompleted(session) {
  try {
    const user = await User.findOne({ 
      'subscription.stripeCustomerId': session.customer 
    });

    if (!user) {
      console.error('User not found for customer:', session.customer);
      return;
    }

    // Update user subscription details
    user.subscription.status = 'active';
    
    // Determine plan based on session metadata
    const planName = session.metadata?.plan;
    const currency = session.metadata?.currency;
    
    if (planName === 'pay-per-use') {
      // For pay-per-use, add credits to the user's usage
      user.subscription.plan = 'free'; // Keep as free, but add credits
      // Reset usage for the pay-per-use purchase
      user.subscription.usage.coverLetters = Math.max(0, user.subscription.usage.coverLetters - 5);
      console.log(`Added 5 cover letter credits to user: ${user.email}`);
    } else if (planName === 'pro') {
      // For pro subscription
      user.subscription.plan = 'pro';
      user.subscription.stripeSubscriptionId = session.subscription;
      user.subscription.stripePriceId = session.line_items?.data[0]?.price?.id;
      
      // Set subscription period end
      if (session.subscription) {
        const subscription = await getSubscription(session.subscription);
        if (subscription) {
          user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        }
      }
      console.log(`Pro subscription activated for user: ${user.email} in ${currency}`);
    }

    await user.save();
    console.log(`Subscription activated for user: ${user.email}`);

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    const user = await User.findOne({ 
      'subscription.stripeCustomerId': subscription.customer 
    });

    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }

    // Update subscription details
    user.subscription.stripeSubscriptionId = subscription.id;
    user.subscription.status = subscription.status;
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    if (subscription.items && subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      user.subscription.stripePriceId = priceId;
      
      if (priceId === STRIPE_PRICE_IDS.pro) {
        user.subscription.plan = 'pro';
      } else if (priceId === STRIPE_PRICE_IDS.enterprise) {
        user.subscription.plan = 'enterprise';
      }
    }

    await user.save();
    console.log(`Subscription created for user: ${user.email}`);

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const user = await User.findOne({ 
      'subscription.stripeSubscriptionId': subscription.id 
    });

    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }

    // Update subscription status and period
    user.subscription.status = subscription.status;
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // If subscription is canceled, revert to free plan
    if (subscription.status === 'canceled') {
      user.subscription.plan = 'free';
      user.subscription.stripeSubscriptionId = null;
      user.subscription.stripePriceId = null;
    }

    await user.save();
    console.log(`Subscription updated for user: ${user.email}`);

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const user = await User.findOne({ 
      'subscription.stripeSubscriptionId': subscription.id 
    });

    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }

    // Revert to free plan
    user.subscription.plan = 'free';
    user.subscription.status = 'canceled';
    user.subscription.stripeSubscriptionId = null;
    user.subscription.stripePriceId = null;
    user.subscription.currentPeriodEnd = null;

    await user.save();
    console.log(`Subscription deleted for user: ${user.email}`);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const user = await User.findOne({ 
      'subscription.stripeCustomerId': invoice.customer 
    });

    if (!user) {
      console.error('User not found for invoice:', invoice.id);
      return;
    }

    // Update subscription status
    user.subscription.status = 'active';
    await user.save();
    console.log(`Payment succeeded for user: ${user.email}`);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const user = await User.findOne({ 
      'subscription.stripeCustomerId': invoice.customer 
    });

    if (!user) {
      console.error('User not found for invoice:', invoice.id);
      return;
    }

    // Update subscription status
    user.subscription.status = 'past_due';
    await user.save();
    console.log(`Payment failed for user: ${user.email}`);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

module.exports = router;
