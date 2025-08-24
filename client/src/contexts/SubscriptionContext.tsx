import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: 'free' | 'pay-per-use' | 'pro';
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one-time';
  features: string[];
  limits: {
    coverLetters: number;
    jobSearches: number;
    resumeAnalyses: number;
  };
}

interface Usage {
  coverLetters: number;
  jobSearches: number;
  resumeAnalyses: number;
}

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan | null;
  usage: Usage;
  loading: boolean;
  upgradePlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkUsage: () => Promise<void>;
  canUseFeature: (feature: keyof Usage) => boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'free',
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
    id: 'pay-per-use',
    name: 'pay-per-use',
    price: 5,
    currency: 'USD',
    interval: 'one-time',
    features: [
      '5 cover letters',
      'Basic resume tips',
      '5 job search queries',
      'Standard templates',
      'No monthly commitment'
    ],
    limits: {
      coverLetters: 5,
      jobSearches: 5,
      resumeAnalyses: 1
    }
  },
  {
    id: 'pro',
    name: 'pro',
    price: 5.75,
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
    }
  }
];

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<Usage>({
    coverLetters: 0,
    jobSearches: 0,
    resumeAnalyses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.name === user.subscription.plan);
      setCurrentPlan(plan || SUBSCRIPTION_PLANS[0]);
      // Map server usage data to our interface
      const serverUsage = user.subscription.usage || {};
      setUsage({
        coverLetters: serverUsage.coverLetters || 0,
        jobSearches: serverUsage.jobSearches || 0,
        resumeAnalyses: (serverUsage as any).resumeAnalysis || (serverUsage as any).resumeAnalyses || 0
      });
    } else {
      setCurrentPlan(SUBSCRIPTION_PLANS[0]);
      setUsage({ coverLetters: 0, jobSearches: 0, resumeAnalyses: 0 });
    }
    setLoading(false);
  }, [user]);

  const upgradePlan = async (planId: string) => {
    try {
      const response = await axios.post('/api/subscription/upgrade', { planId });
      const { user: updatedUser } = response.data;
      
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (plan) {
        setCurrentPlan(plan);
        // Map server usage data to our interface
        const serverUsage = updatedUser.subscription.usage || {};
        setUsage({
          coverLetters: serverUsage.coverLetters || 0,
          jobSearches: serverUsage.jobSearches || 0,
          resumeAnalyses: (serverUsage as any).resumeAnalysis || (serverUsage as any).resumeAnalyses || 0
        });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Upgrade failed');
    }
  };

  const cancelSubscription = async () => {
    try {
      await axios.post('/api/subscription/cancel');
      setCurrentPlan(SUBSCRIPTION_PLANS[0]);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const checkUsage = async () => {
    try {
      const response = await axios.get('/api/subscription/usage');
      setUsage(response.data.usage);
    } catch (error: any) {
      console.error('Failed to check usage:', error);
    }
  };

  const canUseFeature = (feature: keyof Usage): boolean => {
    if (!currentPlan) return false;
    
    const limit = currentPlan.limits[feature];
    const currentUsage = usage[feature];
    
    // -1 means unlimited
    return limit === -1 || currentUsage < limit;
  };

  const value = {
    currentPlan,
    usage,
    loading,
    upgradePlan,
    cancelSubscription,
    checkUsage,
    canUseFeature,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
