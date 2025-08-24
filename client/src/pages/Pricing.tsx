import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, CreditCard, Globe, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../contexts/StripeContext';
import toast from 'react-hot-toast';

type Currency = 'USD' | 'EUR' | 'CAD';

const Pricing: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { createCheckoutSession, loading } = useStripe();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);

  // Function to detect currency based on IP location
  const detectCurrencyFromLocation = async () => {
    try {
      setIsDetectingLocation(true);
      
      // Using ipapi.co for geolocation (free service)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data && data.country_code) {
        const countryCode = data.country_code.toLowerCase();
        
        // Map country codes to currencies
        const currencyMap: { [key: string]: Currency } = {
          // European Union countries
          'at': 'EUR', 'be': 'EUR', 'cy': 'EUR', 'ee': 'EUR', 'fi': 'EUR',
          'fr': 'EUR', 'de': 'EUR', 'gr': 'EUR', 'ie': 'EUR', 'it': 'EUR',
          'lv': 'EUR', 'lt': 'EUR', 'lu': 'EUR', 'mt': 'EUR', 'nl': 'EUR',
          'pt': 'EUR', 'sk': 'EUR', 'si': 'EUR', 'es': 'EUR',
          
          // Canada
          'ca': 'CAD',
          
          // Default to USD for other countries including US
          'us': 'USD'
        };
        
        const detectedCurrency = currencyMap[countryCode] || 'USD';
        setSelectedCurrency(detectedCurrency);
        
        console.log(`Location detected: ${data.country} (${countryCode}), Currency set to: ${detectedCurrency}`);
      }
    } catch (error) {
      console.warn('Failed to detect location, defaulting to USD:', error);
      setSelectedCurrency('USD');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Detect currency on component mount
  useEffect(() => {
    detectCurrencyFromLocation();
  }, []);

  const pricingData = {
    USD: {
      payPerUse: { price: 5, symbol: '$' },
      pro: { price: 5.75, symbol: '$' }
    },
    EUR: {
      payPerUse: { price: 3.25, symbol: '€' },
      pro: { price: 5, symbol: '€' }
    },
    CAD: {
      payPerUse: { price: 5, symbol: 'C$' },
      pro: { price: 7.95, symbol: 'C$' }
    }
  };

  const plans = [
    {
      name: t('pricing.free.title'),
      price: '0',
      priceSymbol: '$',
      period: t('pricing.free.period'),
      features: t('pricing.free.features', { returnObjects: true }) as string[],
      popular: false,
      planId: 'free'
    },
    {
      name: t('pricing.payPerUse.title'),
      price: pricingData[selectedCurrency].payPerUse.price.toString(),
      priceSymbol: pricingData[selectedCurrency].payPerUse.symbol,
      period: t('pricing.payPerUse.period'),
      features: t('pricing.payPerUse.features', { returnObjects: true }) as string[],
      popular: false,
      planId: 'pay-per-use'
    },
    {
      name: t('pricing.pro.title'),
      price: pricingData[selectedCurrency].pro.price.toString(),
      priceSymbol: pricingData[selectedCurrency].pro.symbol,
      period: t('pricing.pro.period'),
      features: t('pricing.pro.features', { returnObjects: true }) as string[],
      popular: true,
      planId: 'pro'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to subscribe to a plan');
      return;
    }

    if (planId === 'free') {
      toast.success('Free plan is already active!');
      return;
    }

    try {
      await createCheckoutSession(planId, selectedCurrency);
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('pricing.subtitle')}
          </p>
          
          {/* Currency Selector */}
          <div className="flex flex-col items-center space-y-2 mb-8">
            <div className="flex items-center space-x-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 font-medium">
                {isDetectingLocation ? 'Detecting your location...' : t('pricing.currencySelector')}:
              </span>
              {isDetectingLocation && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              )}
            </div>
            <div className="flex space-x-2">
              {(['USD', 'EUR', 'CAD'] as Currency[]).map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  disabled={isDetectingLocation}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                    selectedCurrency === currency
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
            {!isDetectingLocation && (
              <p className="text-xs text-gray-500">
                Currency auto-detected based on your location. You can change it manually above.
              </p>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-primary-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  {t('pricing.pro.popular')}
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.priceSymbol}{plan.price}
                </span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-primary-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleSubscribe(plan.planId)}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {plan.planId !== 'free' && <CreditCard className="w-4 h-4" />}
                    <span>{t('pricing.getStarted')}</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">
                Secure Payment Processing
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              All payments are processed securely through Stripe, a PCI DSS Level 1 certified payment processor. 
              Your payment information is encrypted and never stored on our servers.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span>PCI DSS compliant</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
