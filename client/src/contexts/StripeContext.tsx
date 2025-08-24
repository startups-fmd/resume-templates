import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface StripeContextType {
  stripe: Stripe | null;
  loading: boolean;
  createCheckoutSession: (plan: string, currency?: string) => Promise<void>;
  createPortalSession: () => Promise<void>;
  getSubscriptionStatus: () => Promise<any>;
  cancelSubscription: () => Promise<void>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
          console.error('Stripe publishable key not found. Please check your environment variables.');
          toast.error('Payment system not configured. Please contact support.');
          setLoading(false);
          return;
        }
        
        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        toast.error('Failed to initialize payment system');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  const createCheckoutSession = async (plan: string, currency?: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan, currency })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  const createPortalSession = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }

    } catch (error: any) {
      console.error('Error creating portal session:', error);
      toast.error(error.message || 'Failed to access billing portal');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get subscription status');
      }

      return data;

    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      toast.error(error.message || 'Failed to get subscription status');
      return null;
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      toast.success('Subscription canceled successfully');
      return data;

    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: StripeContextType = {
    stripe,
    loading,
    createCheckoutSession,
    createPortalSession,
    getSubscriptionStatus,
    cancelSubscription
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};
