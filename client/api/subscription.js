const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/subscription/usage
// @desc    Get user's current usage
// @access  Private
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      usage: user.subscription.usage,
      limits: user.subscription.limits,
      plan: user.subscription.plan,
      status: user.subscription.status
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscription/upgrade
// @desc    Upgrade user's subscription plan
// @access  Private
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Define plan limits
    const planLimits = {
      'pay-per-use': {
        plan: 'pay-per-use',
        limits: {
          coverLetters: 5,
          jobSearches: 5,
          resumeAnalyses: 1
        }
      },
      pro: {
        plan: 'pro',
        limits: {
          coverLetters: -1, // unlimited
          jobSearches: -1, // unlimited
          resumeAnalyses: 10
        }
      }
    };

    const newPlan = planLimits[planId];
    if (!newPlan) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }

    // Update user's subscription
    user.subscription.plan = newPlan.plan;
    user.subscription.limits = newPlan.limits;
    user.subscription.status = 'active';

    await user.save();

    // Return updated user data
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      subscription: user.subscription,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Subscription upgraded successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscription/cancel
// @desc    Cancel user's subscription
// @access  Private
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset to free plan
    user.subscription.plan = 'free';
    user.subscription.status = 'cancelled';
    user.subscription.limits = {
      coverLetters: 3,
      jobSearches: 5,
      resumeAnalyses: 1
    };

    await user.save();

    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      subscription: user.subscription,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Subscription cancelled successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscription/plans
// @desc    Get available subscription plans
// @access  Private
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          '3 cover letters per month',
          'Basic resume tips',
          '5 job search queries',
          'Standard templates'
        ],
        limits: {
          coverLetters: 3,
          jobSearches: 5,
          resumeAnalyses: 1
        }
      },
      {
        id: 'pro',
        name: 'Pro',
                 price: 7.95,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited cover letters',
          'Advanced resume analysis',
          'Unlimited job searches',
          'Premium templates',
          'Priority support',
          'Export to PDF'
        ],
        limits: {
          coverLetters: -1, // unlimited
          jobSearches: -1, // unlimited
          resumeAnalyses: 10
        },
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 29.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Pro',
          'Team collaboration',
          'Custom branding',
          'API access',
          'Dedicated support',
          'Analytics dashboard'
        ],
        limits: {
          coverLetters: -1, // unlimited
          jobSearches: -1, // unlimited
          resumeAnalyses: -1 // unlimited
        }
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
